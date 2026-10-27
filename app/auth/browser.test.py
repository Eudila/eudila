# SPDX-License-Identifier: AGPL-3.0-only
"""Auth real contra Docker local. No intercepta APIs ni envía correos externos."""
import html
import json
import os
import re
import subprocess
import time
import uuid
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[2]
status = json.loads(subprocess.check_output([str(root / 'node_modules/.bin/supabase'), 'status', '-o', 'json'], cwd=root, stderr=subprocess.DEVNULL))
api = status['API_URL']
mail = status.get('MAILPIT_URL', status.get('INBUCKET_URL'))
base = os.environ.get('AUTH_BASE_URL', 'http://127.0.0.1:3000')
assert all(urlparse(url).hostname in ['localhost', '127.0.0.1'] for url in [api, mail, base]), 'Solo se permite probar servicios locales.'
anon = status['ANON_KEY']
admin = status['SERVICE_ROLE_KEY']
email = 'onboarding-' + uuid.uuid4().hex[:12] + '@example.com'
other_email = 'isolation-' + uuid.uuid4().hex[:12] + '@example.com'
password = 'Prueba-local-2026!'
new_password = 'Otra-clave-local-2026!'
artifacts = Path(os.environ.get('AUTH_ARTIFACT_DIR', '/tmp/eudila-auth-onboarding'))
artifacts.mkdir(parents=True, exist_ok=True)


def request(url, method='GET', data=None, key=None, token=None, prefer=None):
    headers = {'Content-Type': 'application/json'}
    if key:
        headers.update(apikey=key, Authorization='Bearer ' + (token or key))
    if prefer:
        headers['Prefer'] = prefer
    req = Request(url, method=method, headers=headers, data=json.dumps(data).encode() if data is not None else None)
    try:
        with urlopen(req, timeout=15) as response:
            body = response.read().decode()
            return response.status, json.loads(body) if body else None
    except HTTPError as error:
        body = error.read().decode()
        return error.code, json.loads(body) if body else None


def email_link(recipient, kind):
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        _, inbox = request(mail + '/api/v1/messages')
        for item in inbox['messages']:
            if not any(to['Address'] == recipient for to in item['To']):
                continue
            _, message = request(mail + '/api/v1/message/' + item['ID'])
            links = re.findall(r'href="([^"]+)"', message['HTML'])
            for link in links:
                link = html.unescape(link)
                if 'type=' + kind in link:
                    assert link.startswith(base + '/auth/callback?'), link
                    return link
        time.sleep(.2)
    raise AssertionError('No llegó el correo local: ' + kind)


def login(page, email_value=email, password_value=password):
    page.goto(base + '/ingresar')
    page.get_by_label('Email', exact=True).fill(email_value)
    page.get_by_label('Contraseña', exact=True).fill(password_value)
    page.get_by_role('button', name='Ingresar', exact=True).click()


def reflow(page, routes):
    for route in routes:
        for width in [320, 390, 520]:
            page.set_viewport_size({'width': width, 'height': 844})
            page.goto(base + route)
            page.evaluate("document.documentElement.style.fontSize = '200%'")
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width)
            assert page.evaluate('document.querySelector("main").scrollWidth <= document.querySelector("main").clientWidth'), (route, width, 'main overflow')
            expect(page.get_by_role('link', name='Ayuda ahora')).to_be_visible()
        page.evaluate("document.documentElement.style.fontSize = ''")
    page.set_viewport_size({'width': 390, 'height': 844})


try:
    with sync_playwright() as p:
        chrome = os.environ.get('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        browser = p.chromium.launch(executable_path=chrome if Path(chrome).exists() else None)
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base + '/')
        expect(page).to_have_url(base + '/bienvenida')
        page.screenshot(path=str(artifacts / 'bienvenida.png'), full_page=True)
        # Adoptar un borrador anónimo anterior a auth no debe borrarlo al abrir la app.
        page.evaluate("sessionStorage.removeItem('eudila-draft-owner'); sessionStorage.setItem('eudila-draft-v1', JSON.stringify({type:'tarde',mood:4,emotionId:null,factors:[]}))")
        page.reload()
        page.wait_for_function("sessionStorage.getItem('eudila-draft-owner') === 'guest'")
        assert page.evaluate("sessionStorage.getItem('eudila-draft-v1')") is not None
        for route in ['/cuenta', '/empezar', '/actualizar-clave', '/hoy', '/registro/tipo']:
            page.goto(base + route)
            expect(page).to_have_url(base + '/ingresar')
        page.goto(base + '/ayuda')
        expect(page.get_by_role('heading', level=1)).to_be_visible()
        reflow(page, ['/bienvenida', '/ingresar', '/crear-cuenta', '/recuperar'])
        page.goto(base + '/bienvenida')
        _, auth_settings = request(api + '/auth/v1/settings', key=anon)
        if not auth_settings['external']['google']:
            expect(page.get_by_role('button', name='Continuar con Google')).to_be_disabled()
        page.get_by_role('link', name='Registrarse', exact=True).click()
        expect(page.get_by_role('navigation', name='Secciones')).to_have_count(0)
        page.get_by_role('button', name='Crear cuenta', exact=True).click()
        expect(page.get_by_label('Email', exact=True)).to_be_focused()
        page.get_by_label('Email', exact=True).fill(email)
        page.get_by_label('Contraseña', exact=True).fill('corta')
        page.get_by_role('button', name='Crear cuenta', exact=True).click()
        expect(page.get_by_text('Usá al menos 8 caracteres.')).to_be_visible()
        expect(page.get_by_label('Contraseña', exact=True)).to_be_focused()
        page.get_by_label('Contraseña', exact=True).fill(password)
        page.get_by_role('button', name='Mostrar contraseña').click()
        expect(page.get_by_label('Contraseña', exact=True)).to_have_attribute('type', 'text')
        page.get_by_role('button', name='Ocultar contraseña').click()
        page.get_by_role('button', name='Crear cuenta', exact=True).click()
        expect(page.get_by_role('heading', name='Revisá tu email')).to_be_visible(timeout=15000)
        confirmation_link = email_link(email, 'signup')
        page.screenshot(path=str(artifacts / 'confirmacion.png'), full_page=True)
        # La cuenta sin confirmar no puede iniciar sesión. Se puede reenviar.
        login(page)
        expect(page.get_by_role('status')).to_contain_text('Te falta confirmar')
        time.sleep(2.1)  # Respetar auth.email.max_frequency del servidor real.
        page.get_by_role('button', name='Reenviar confirmación').click()
        expect(page.get_by_role('status')).to_contain_text('vas a recibir')
        # Auth puede reutilizar el mismo token durante su vigencia.
        confirmation_link = email_link(email, 'signup')
        # Confirmación en otro navegador: no depende de sessionStorage ni de PKCE de email.
        verified = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        confirmed_page = verified.new_page()
        confirmed_page.goto(confirmation_link)
        expect(confirmed_page).to_have_url(base + '/registro/tipo')
        page = confirmed_page
        page.on('pageerror', lambda error: errors.append(str(error)))
        expect(page.get_by_role('radio', name='Registro libre', exact=True)).to_be_visible()
        expect(page.get_by_label('Nombre o apodo')).to_have_count(0)
        for route in ['/ingresar', '/crear-cuenta']:
            page.goto(base + route)
            expect(page).to_have_url(base + '/registro/tipo')
        page.goto(base + '/')
        expect(page.get_by_role('link', name='Mi cuenta')).to_be_visible()
        page.get_by_role('link', name='Mi cuenta').click()
        page.get_by_role('link', name='Personalizar mi cuenta').click()
        page.get_by_label('Nombre o apodo').fill('Sol')
        page.get_by_role('button', name='Continuar', exact=True).click()
        expect(page.get_by_role('heading', name='Este espacio va a tu ritmo.')).to_be_visible()
        page.screenshot(path=str(artifacts / 'onboarding.png'), full_page=True)
        page.get_by_role('button', name='Empezar', exact=True).click()
        expect(page).to_have_url(base + '/', timeout=15000)
        page.reload()
        expect(page.get_by_role('link', name='Mi cuenta')).to_be_visible()
        page.get_by_role('link', name='Mi cuenta').click()
        expect(page.get_by_text('Sol', exact=True)).to_be_visible()
        expect(page.get_by_text(email, exact=True)).to_be_visible()
        page.screenshot(path=str(artifacts / 'cuenta.png'), full_page=True)
        response = page.reload()
        assert 'no-store' in response.headers.get('cache-control', '')
        sibling = verified.new_page()
        sibling.goto(base + '/cuenta')
        expect(sibling.get_by_text(email, exact=True)).to_be_visible()
        forged = browser.new_context()
        for cookie in verified.cookies():
            if 'auth-token' in cookie['name']:
                cookie['value'] = 'not-a-session'
                forged.add_cookies([cookie])
        forged_page = forged.new_page()
        forged_page.goto(base + '/cuenta')
        expect(forged_page).to_have_url(base + '/ingresar')
        forged.close()
        # Verificación real de la fila y aislamiento, sin confiar en la UI.
        code, session = request(api + '/auth/v1/token?grant_type=password', 'POST', {'email': email, 'password': password}, anon)
        assert code == 200
        uid = session['user']['id']
        code, rows = request(api + '/rest/v1/profiles?select=*', key=anon, token=session['access_token'])
        assert code == 200 and len(rows) == 1 and rows[0]['id'] == uid and rows[0]['display_name'] == 'Sol' and rows[0]['onboarding_completed_at']
        code, second = request(api + '/auth/v1/admin/users', 'POST', {'email': other_email, 'password': password, 'email_confirm': True}, admin)
        assert code in [200, 201]
        _, second_session = request(api + '/auth/v1/token?grant_type=password', 'POST', {'email': other_email, 'password': password}, anon)
        token2 = second_session['access_token']
        assert request(api + '/rest/v1/profiles?select=*', key=anon, token=token2) == (200, [])
        code, _ = request(api + '/rest/v1/profiles', 'POST', {'id': uid, 'display_name': 'Intruso'}, anon, token2)
        assert code == 403
        code, rows = request(api + '/rest/v1/profiles?id=eq.' + uid, 'PATCH', {'display_name': 'Intruso'}, anon, token2, 'return=representation')
        assert code == 200 and rows == []
        code, _ = request(api + '/rest/v1/profiles', key=anon)
        assert code in [401, 403]
        code, _ = request(api + '/rest/v1/profiles?id=eq.' + uid, 'PATCH', {'display_name': 'x' * 61}, anon, session['access_token'])
        assert code == 400
        assert len(request(api + '/rest/v1/emociones?select=*', key=anon)[1]) == 21
        assert len(request(api + '/rest/v1/factores_vida?select=*', key=anon)[1]) == 15
        reflow(page, ['/cuenta', '/actualizar-clave'])
        page.goto(base + '/cuenta')
        page.evaluate("sessionStorage.setItem('eudila-draft-v1', JSON.stringify({type:'tarde',mood:7,emotionId:null,factors:[]}))")
        page.get_by_role('button', name='Cerrar sesión', exact=True).click()
        expect(page).to_have_url(base + '/bienvenida')
        assert page.evaluate("sessionStorage.getItem('eudila-draft-v1')") is None
        expect(sibling).to_have_url(base + '/bienvenida')
        sibling.close()
        page.goto(base + '/cuenta')
        expect(page).to_have_url(base + '/ingresar')
        login(page, password_value='equivocada')
        expect(page.get_by_role('status')).to_contain_text('no coinciden')
        login(page)
        expect(page).to_have_url(base + '/registro/tipo', timeout=15000)
        page.goto(base + '/cuenta')
        page.get_by_role('button', name='Cerrar sesión', exact=True).click()
        expect(page).to_have_url(base + '/bienvenida')
        page.goto(base + '/recuperar')
        page.get_by_label('Email', exact=True).fill(email)
        page.get_by_role('button', name='Enviar enlace').click()
        expect(page.get_by_role('heading', name='Revisá tu email')).to_be_visible()
        recovery_link = email_link(email, 'recovery')
        page.goto(recovery_link)
        expect(page).to_have_url(base + '/actualizar-clave')
        page.get_by_label('Nueva contraseña', exact=True).fill(new_password)
        page.get_by_label('Repetí la contraseña', exact=True).fill('otra')
        page.get_by_role('button', name='Guardar contraseña').click()
        expect(page.get_by_text('Las contraseñas no coinciden.')).to_be_visible()
        page.get_by_label('Repetí la contraseña', exact=True).fill(new_password)
        page.get_by_role('button', name='Guardar contraseña').click()
        expect(page).to_have_url(base + '/cuenta?clave=actualizada', timeout=15000)
        expect(page.get_by_role('status')).to_contain_text('se actualizó')
        page.get_by_role('button', name='Cerrar sesión', exact=True).click()
        expect(page).to_have_url(base + '/bienvenida')
        login(page)
        expect(page.get_by_role('status')).to_contain_text('no coinciden')
        login(page, password_value=new_password)
        expect(page).to_have_url(base + '/registro/tipo', timeout=15000)
        page.goto(base + '/cuenta')
        page.get_by_role('button', name='Cerrar sesión', exact=True).click()
        expect(page).to_have_url(base + '/bienvenida')
        for bad_link in [recovery_link, confirmation_link, base + '/auth/callback?code=invalid&next=https://example.com', base + '/auth/callback?token_hash=invalid&type=recovery']:
            page.goto(bad_link)
            expect(page).to_have_url(base + '/ingresar?error=enlace')
            expect(page.get_by_role('status')).to_contain_text('El enlace venció')
        # Una cuenta sin nombre entra al registro sin completar personalización.
        login(page, other_email)
        expect(page).to_have_url(base + '/registro/tipo', timeout=15000)
        expect(page.get_by_label('Nombre o apodo')).to_have_count(0)
        page.goto(base + '/')
        expect(page.get_by_role('link', name='Mi cuenta')).to_be_visible()
        page.goto(base + '/cuenta')
        expect(page.get_by_text('Sol', exact=True)).to_have_count(0)
        expect(page.get_by_text(other_email, exact=True)).to_be_visible()
        assert not errors, errors
        browser.close()
    print('PASS: bienvenida → alta/confirmación o ingreso → registro, personalización opcional desde cuenta, sesión/recarga/logout, recuperación, enlaces inválidos, aislamiento RLS, cookies falsas, logout entre pestañas, catálogos, teclado/foco y 18 casos de reflujo.')
finally:
    # Limpiar únicamente cuentas sintéticas de esta ejecución, incluso si falla antes de obtener su ID.
    _, users = request(api + '/auth/v1/admin/users?per_page=1000', key=admin)
    for user in users.get('users', []):
        if user['email'] in [email, other_email]:
            code, _ = request(api + '/auth/v1/admin/users/' + user['id'], 'DELETE', key=admin)
            assert code == 200, 'No pudimos limpiar la cuenta de prueba.'
