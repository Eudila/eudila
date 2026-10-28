# SPDX-License-Identifier: AGPL-3.0-only
"""uv run --with playwright python app/historial/account.test.py — solo Docker local."""
import json
import os
import subprocess
import uuid
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[4]
status = json.loads(subprocess.check_output([str(root / 'node_modules/.bin/supabase'), '--workdir', 'app', 'status', '-o', 'json'], cwd=root, stderr=subprocess.DEVNULL))
api = status['API_URL']
base = os.environ.get('AUTH_BASE_URL', 'http://127.0.0.1:3119')
assert all(urlparse(url).hostname in ['127.0.0.1', 'localhost'] for url in [api, base]), 'Solo servicios locales.'
anon, admin = status['ANON_KEY'], status['SERVICE_ROLE_KEY']
password = 'Registros-local-2026!'
users = []


def request(path, method='GET', data=None, token=None, key=anon, prefer=None):
    headers = {'Content-Type': 'application/json', 'apikey': key, 'Authorization': 'Bearer ' + (token or key)}
    if prefer:
        headers['Prefer'] = prefer
    req = Request(api + path, method=method, headers=headers, data=json.dumps(data).encode() if data is not None else None)
    try:
        with urlopen(req, timeout=20) as response:
            body = response.read().decode()
            return response.status, json.loads(body) if body else None
    except HTTPError as error:
        body = error.read().decode()
        return error.code, json.loads(body) if body else None


def login(page, email):
    page.goto(base + '/ingresar')
    page.get_by_label('Email', exact=True).fill(email)
    page.get_by_label('Contraseña', exact=True).fill(password)
    page.get_by_role('button', name='Ingresar', exact=True).click()
    expect(page).to_have_url(base + '/registro/tipo')


try:
    sessions = []
    for _ in range(2):
        email = 'records-' + uuid.uuid4().hex[:12] + '@example.com'
        code, user = request('/auth/v1/admin/users', 'POST', {'email': email, 'password': password, 'email_confirm': True}, key=admin)
        assert code in [200, 201], (code, user)
        users.append(user)
        code, session = request('/auth/v1/token?grant_type=password', 'POST', {'email': email, 'password': password})
        assert code == 200
        sessions.append(session)
    token, other_token = [s['access_token'] for s in sessions]
    owner = users[0]['id']
    emotions = request('/rest/v1/emociones?select=*')[1]
    factors = request('/rest/v1/factores_vida?select=*')[1]
    payload = {'p_user_id': owner, 'p_id': str(uuid.uuid4()), 'p_recorded_at': '2026-10-27T12:00:00.000Z', 'p_type': 'libre', 'p_mood': 4, 'p_emotion_id': emotions[0]['id'], 'p_factor_ids': [f['id'] for f in factors[:2]]}
    code, result = request('/rest/v1/rpc/guardar_registro', 'POST', payload, token)
    assert code in [200, 204], ('Guardar registro y factores', code, result)
    assert request('/rest/v1/rpc/guardar_registro', 'POST', payload, token)[0] in [200, 204]
    assert len(request('/rest/v1/registros?select=*', token=token)[1]) == 1
    assert len(request('/rest/v1/registro_factores?select=*', token=token)[1]) == 2
    for table in ['registros', 'registro_factores']:
        assert request('/rest/v1/' + table + '?select=*', token=other_token) == (200, [])
        assert request('/rest/v1/' + table + '?select=*')[0] in [401, 403]
        code, result = request('/rest/v1/' + table + '?record_id=eq.' + payload['p_id'] if table == 'registro_factores' else '/rest/v1/registros?id=eq.' + payload['p_id'], 'PATCH', {'id': str(uuid.uuid4())} if table == 'registros' else {'factor_id': factors[2]['id']}, token)
        assert code in [401, 403], (table, 'update', code, result)
        code, result = request('/rest/v1/' + table + ('?id=eq.' if table == 'registros' else '?record_id=eq.') + payload['p_id'], 'DELETE', token=token)
        assert code in [401, 403], (table, 'delete', code, result)
    assert request('/rest/v1/rpc/guardar_registro', 'POST', payload)[0] in [401, 403]
    assert request('/rest/v1/rpc/guardar_registro', 'POST', payload, other_token)[0] == 403
    assert request('/rest/v1/rpc/guardar_registro', 'POST', {**payload, 'p_user_id': users[1]['id']}, other_token)[0] == 403
    row = {'id': str(uuid.uuid4()), 'user_id': owner, 'recorded_at': payload['p_recorded_at'], 'type': 'libre', 'mood': 4, 'emotion_id': emotions[0]['id']}
    assert request('/rest/v1/registros', 'POST', row, other_token)[0] == 403
    assert request('/rest/v1/registro_factores', 'POST', {'record_id': payload['p_id'], 'factor_id': factors[2]['id']}, other_token)[0] == 403
    for invalid in [
        {'p_mood': 0}, {'p_mood': 8}, {'p_type': 'otro'},
        {'p_emotion_id': str(uuid.uuid4())},
        {'p_factor_ids': [factors[0]['id'], str(uuid.uuid4())]},
        {'p_factor_ids': [factors[0]['id'], factors[0]['id']]},
        {'p_factor_ids': None}, {'p_recorded_at': 'infinity'},
    ]:
        bad = {**payload, 'p_id': str(uuid.uuid4()), **invalid}
        code, result = request('/rest/v1/rpc/guardar_registro', 'POST', bad, token)
        assert code == 400 or code == 409, (invalid, code, result)
        assert request('/rest/v1/registros?id=eq.' + bad['p_id'], token=token) == (200, []), 'Rollback completo'

    with sync_playwright() as p:
        chrome = os.environ.get('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        browser = p.chromium.launch(**({'executable_path': chrome} if Path(chrome).exists() else {}))
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        login(page, users[0]['email'])
        page.get_by_role('radio', name='Registro libre', exact=True).check()
        page.get_by_role('button', name='Siguiente', exact=True).click()
        page.get_by_role('slider').fill('6')
        page.get_by_role('link', name='Siguiente', exact=True).click()
        page.get_by_role('button', name='Calma', exact=True).click()
        page.get_by_role('link', name='Siguiente', exact=True).click()
        for factor in factors[:2]:
            page.get_by_role('checkbox', name=factor['nombre'], exact=True).check()
        page.get_by_role('link', name='Revisar registro').click()
        save = page.get_by_role('button', name='Guardar registro', exact=True)
        expect(save).to_be_enabled()
        artifacts = root / 'docs/design/evidence/registros-cuenta-2026-10-27'
        artifacts.mkdir(parents=True, exist_ok=True)
        for width in [320, 390]:
            page.set_viewport_size({'width': width, 'height': 844})
            page.evaluate("document.documentElement.style.fontSize = '200%'")
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            expect(page.get_by_role('link', name='Ayuda ahora')).to_be_visible()
        page.evaluate("document.documentElement.style.fontSize = ''")
        page.wait_for_function('Array.from(document.querySelectorAll(".stagger > *")).every(e => Number(getComputedStyle(e).opacity) === 1)')
        page.screenshot(path=str(artifacts / 'confirmacion.png'), full_page=True)
        # Un fallo real de transporte conserva borrador y permite reintentar.
        page.route(api + '/rest/v1/rpc/guardar_registro', lambda route: route.abort())
        save.click()
        expect(page.locator('main').get_by_role('alert')).to_contain_text('No pudimos guardar')
        assert page.evaluate('JSON.parse(sessionStorage.getItem("eudila-draft-v1")).mood') == 6
        page.unroute(api + '/rest/v1/rpc/guardar_registro')
        # Simular respuesta perdida después de que PostgreSQL haya confirmado.
        def lose_response(route):
            response = route.fetch()
            assert response.ok
            route.abort()
        page.route(api + '/rest/v1/rpc/guardar_registro', lose_response)
        page.get_by_role('button', name='Reintentar guardado', exact=True).click()
        expect(page.locator('main').get_by_role('alert')).to_contain_text('No pudimos guardar')
        assert len(request('/rest/v1/registros?select=*', token=token)[1]) == 2
        page.unroute(api + '/rest/v1/rpc/guardar_registro')
        page.reload()
        page.get_by_role('button', name='Guardar registro', exact=True).click()
        expect(page).to_have_url(base + '/hoy')
        expect(page.get_by_role('status')).to_contain_text('Guardamos tu registro.')
        assert page.evaluate('sessionStorage.getItem("eudila-draft-v1")') is None
        assert page.evaluate('sessionStorage.getItem("eudila-preview-records-v1")') is None
        assert page.evaluate('sessionStorage.getItem("eudila-pending-record-v1")') is None
        assert len(request('/rest/v1/registros?select=*', token=token)[1]) == 2
        page.reload()
        expect(page.locator('main')).to_contain_text('Calma')
        page.screenshot(path=str(artifacts / 'hoy.png'), full_page=True)
        sibling = context.new_page()
        sibling.goto(base + '/hoy')
        expect(sibling.locator('main')).to_contain_text('Calma')
        for route in ['/calendario', '/evolucion', '/factores', '/exportar']:
            page.goto(base + route)
            expect(page.locator('main')).not_to_contain_text('todavía no está disponible')
            expect(page.locator('main')).not_to_contain_text('vista previa')
        expect(page.get_by_role('button', name='Descargar JSON')).to_be_enabled()
        with page.expect_download() as download:
            page.get_by_role('button', name='Descargar JSON').click()
        exported = json.loads(Path(download.value.path()).read_text())
        assert len(exported) == 2
        assert all(record['source'] == 'account' for record in exported)
        page.screenshot(path=str(artifacts / 'exportar.png'), full_page=True)
        # Fallo de lectura nunca se presenta como historial vacío.
        page.route(api + '/rest/v1/registros?**', lambda route: route.abort())
        page.reload()
        expect(page.locator('main').get_by_role('alert')).to_contain_text('No pudimos leer', timeout=20000)
        page.unroute(api + '/rest/v1/registros?**')
        page.get_by_role('button', name='Reintentar lectura').click()
        expect(page.get_by_role('button', name='Descargar JSON')).to_be_enabled()
        # Más filas que el límite REST (1000); la exportación no trunca.
        bulk = [{**row, 'id': str(uuid.uuid4())} for _ in range(1001)]
        assert request('/rest/v1/registros', 'POST', bulk, token)[0] == 201
        page.reload()
        expect(page.locator('main')).to_contain_text('1003 registros')
        with page.expect_download() as download:
            page.get_by_role('button', name='Descargar JSON').click()
        exported = json.loads(Path(download.value.path()).read_text())
        assert len(exported) == 1003
        # Otro navegador, misma cuenta: sin depender de sessionStorage.
        fresh = browser.new_context(reduced_motion='reduce')
        other_page = fresh.new_page()
        login(other_page, users[0]['email'])
        other_page.goto(base + '/exportar')
        expect(other_page.locator('main')).to_contain_text('1003 registros')
        page.goto(base + '/cuenta')
        page.evaluate('sessionStorage.setItem("eudila-pending-record-v1", "intento-de-la-cuenta-anterior")')
        page.get_by_role('button', name='Cerrar sesión', exact=True).click()
        expect(page).to_have_url(base + '/bienvenida')
        assert page.evaluate('sessionStorage.getItem("eudila-pending-record-v1")') is None
        login(page, users[1]['email'])
        page.goto(base + '/hoy')
        expect(page.locator('main')).to_contain_text('Todavía no hay registros de hoy')
        expect(page.get_by_role('button', name='Cargar ejemplos')).to_have_count(0)
        page.goto(base + '/exportar')
        expect(page.get_by_role('button', name='Descargar JSON')).to_be_disabled()
        assert not errors, errors
        browser.close()
    print('PASS: transacción, validaciones, RLS entre cuentas/anon, reintentos idempotentes, borrador ante fallos, persistencia entre recargas/navegadores, consumidores y exportación >1000 registros.')
finally:
    for user in users:
        assert request('/auth/v1/admin/users/' + user['id'], 'DELETE', key=admin)[0] == 200
    if users and request('/rest/v1/registros?select=id&limit=1', key=admin)[0] == 200:
        assert request('/rest/v1/registros?user_id=eq.' + users[0]['id'], key=admin) == (200, [])
