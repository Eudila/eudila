# SPDX-License-Identifier: AGPL-3.0-only
"""After preview build: uv run --with playwright python app/analisis/browser.test.py.
ANALYSIS_PREVIEW=false starts dev with preview/catalog explicitly disabled.
"""
from datetime import datetime, timedelta, timezone
from pathlib import Path
from time import monotonic, sleep
from urllib.request import urlopen
import json
import os
import socket
import subprocess
import tempfile

from playwright.sync_api import sync_playwright, expect

project = Path(__file__).resolve().parents[2]
seeds = json.loads((project / 'data/catalogo-v1.json').read_text())
factors = seeds['factores_vida'][:4]
emotion = next(e for e in seeds['emociones'] if e['nombre'] == 'Calma')
key = 'eudila-preview-records-v1'
preview = os.environ.get('ANALYSIS_PREVIEW', 'true') != 'false'
base = os.environ.get('ANALYSIS_BASE_URL')
artifacts = Path(os.environ['ANALYSIS_ARTIFACT_DIR']) if os.environ.get('ANALYSIS_ARTIFACT_DIR') else None
if artifacts:
    artifacts.mkdir(parents=True, exist_ok=True)
server = None
log = tempfile.TemporaryFile()
now = datetime(2026, 10, 4, 18, tzinfo=timezone.utc)
today = now.date().isoformat()

def record(number, days_ago=0, mood=4, chosen=None, hour=12, source='preview'):
    date = (now - timedelta(days=days_ago)).replace(hour=hour, minute=0, second=0)
    return {'id': f'analysis-{number}', 'recordedAt': date.isoformat(timespec='milliseconds').replace('+00:00', 'Z'), 'type': 'libre', 'mood': mood, 'emotion': {'id': emotion['id'], 'nombre': emotion['nombre']}, 'factors': chosen if chosen is not None else [factors[0]], 'source': source}

rich = []
for days_ago in range(8):
    for at, hour in enumerate([12, 14]):
        chosen = [factors[0], factors[1]] if days_ago <= 1 else [factors[0]]
        rich.append(record(f'{days_ago}-{at}', days_ago, ((days_ago + at) % 7) + 1, chosen, hour, 'example' if days_ago == 7 else 'preview'))
rich.extend([record('old16', 16, 3), record('old60', 60, 2, [factors[2]]), record('no-factor', 61, 6, []), record('future', 0, 7, [factors[3]], 19)])
# La etiqueta del mismo UUID cambia: debe conservar una sola agrupación.
rich[1]['factors'] = [{**factors[0], 'nombre': 'Factor renombrado'}, factors[1]]

try:
    if not base:
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', 0))
            port = listener.getsockname()[1]
        base = f'http://127.0.0.1:{port}'
        environment = {**os.environ, 'NEXT_TELEMETRY_DISABLED': '1'}
        if not preview:
            environment.update(NEXT_PUBLIC_FRONTEND_PREVIEW='false', NEXT_PUBLIC_CATALOG_URL='', NEXT_PUBLIC_CATALOG_ANON_KEY='')
        server = subprocess.Popen(['node', 'node_modules/next/dist/bin/next', 'start' if preview else 'dev', '--hostname', '127.0.0.1', '--port', str(port)], cwd=project, env=environment, stdout=log, stderr=subprocess.STDOUT)
    deadline = monotonic() + 60
    while True:
        try:
            urlopen(base + '/evolucion', timeout=1).close()
            break
        except OSError:
            assert monotonic() < deadline and (server is None or server.poll() is None)
            sleep(.2)
    with sync_playwright() as p:
        chrome = os.environ.get('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        browser = p.chromium.launch(**({'executable_path': chrome} if Path(chrome).exists() else {}))
        context = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='America/Argentina/Buenos_Aires')
        page = context.new_page()
        page.clock.install(time=now)
        errors = []
        requests = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        context.on('request', lambda request: requests.append(request))
        page.goto(base + '/evolucion')
        main = page.locator('main')
        if not preview:
            for route in ['/evolucion', '/factores', '/factores/' + factors[0]['id']]:
                page.goto(base + route)
                expect(main).to_contain_text('El historial de tu cuenta todavía no está disponible')
                expect(main.locator('svg[role="img"]')).to_have_count(0)
            assert not errors, errors
            browser.close()
            print('ANI-73/74: sin preview no hay análisis de una cuenta ficticia.')
        else:
            expect(main).to_contain_text('registros')
            expect(main.locator('svg[role="img"]')).to_have_count(0)
            page.goto(base + '/factores')
            expect(main).to_contain_text('factores')

            def seed(records, route='/evolucion?rango=30'):
                page.goto(base + route)
                page.evaluate('(value) => sessionStorage.setItem("eudila-preview-records-v1", JSON.stringify(value))', records)
                page.reload()
                expect(page.get_by_label('Rango de tiempo')).to_be_visible()

            sparse = [record('sparse1', 0, 2), record('sparse2', 0, 4), record('sparse3', 1, 7)]
            for count in [1, 2, 3]:
                seed(sparse[:count])
                expect(main.locator('[data-series-segment]')).to_have_count(0)
                expect(main.locator('circle[data-day]')).to_have_count(1 if count <= 2 else 2)
            data_table = page.get_by_role('table', name='Datos por día', exact=True)
            row = data_table.locator('tr').filter(has=page.locator(f'a[href="/calendario/{today}"]'))
            expect(row).to_contain_text('Promedio 3,0 de 7')
            expect(row).to_contain_text('2 registros')
            seed(rich)
            expect(main.locator('circle[data-day]')).to_have_count(9)
            expect(main.locator('[data-series-segment]')).to_have_count(7)
            # Ningún segmento puede saltar una fecha sin registro.
            for segment in main.locator('[data-series-segment]').all():
                assert segment.get_attribute('data-from') and segment.get_attribute('data-to')
                start = datetime.fromisoformat(segment.get_attribute('data-from'))
                end = datetime.fromisoformat(segment.get_attribute('data-to'))
                assert (end - start).days == 1
            selector = page.get_by_label('Rango de tiempo')
            selector.select_option('7')
            page.wait_for_url(base + '/evolucion?rango=7')
            expect(selector).to_have_value('7')
            expect(main.locator('circle[data-day]')).to_have_count(7)
            expect(main.locator('[data-series-segment]')).to_have_count(6)
            selector.select_option('90')
            page.wait_for_url(base + '/evolucion?rango=90')
            expect(main.locator('circle[data-day]')).to_have_count(11)
            expect(main.locator('[data-series-segment]')).to_have_count(8)
            page.go_back()
            expect(selector).to_have_value('7')
            page.go_forward()
            expect(selector).to_have_value('90')
            if artifacts:
                main.locator('svg[role="img"]').scroll_into_view_if_needed()
                page.screenshot(path=str(artifacts / 'eudila-ani-73-evolucion.png'))
            page.get_by_role('navigation', name='Explorar registros').get_by_role('link', name='Factores de vida', exact=True).click()
            page.wait_for_url(base + '/factores?rango=90')
            expect(selector).to_have_value('90')
            factor_links = main.locator('a[href^="/factores/"]')
            expect(factor_links).to_have_count(3)
            expect(main).to_contain_text('Factor renombrado')
            expect(main).not_to_contain_text(factors[3]['nombre'])
            if artifacts:
                factor_links.first.scroll_into_view_if_needed()
                page.screenshot(path=str(artifacts / 'eudila-ani-74-factores.png'))
            selected = main.locator(f'a[href="/factores/{factors[0]["id"]}?rango=90"]')
            group = main.locator('li').filter(has=page.locator(f'a[href="/factores/{factors[0]["id"]}?rango=90"]'))
            expect(group).to_contain_text('17 registros con este factor')
            distribution = [0] * 7
            for r in rich:
                if r['recordedAt'] <= now.isoformat(timespec='milliseconds').replace('+00:00', 'Z') and any(f['id'] == factors[0]['id'] for f in r['factors']):
                    distribution[r['mood'] - 1] += 1
            assert group.locator('dd').all_text_contents() == [str(n) for n in distribution]
            expect(main).to_contain_text('1 registro sin factores elegidos')
            selected.focus()
            page.keyboard.press('Enter')
            page.wait_for_url(base + '/factores/' + factors[0]['id'] + '?rango=90')
            expect(page.get_by_role('heading', level=1)).to_have_text('Factor renombrado')
            expect(main.locator('[data-series-segment]')).to_have_count(7)
            expect(page.get_by_role('table', name='Datos por día', exact=True)).to_be_visible()
            expect(main).to_contain_text('Calma')
            expect(main).to_contain_text('Ejemplo')
            if artifacts:
                main.locator('svg[role="img"]').scroll_into_view_if_needed()
                page.screenshot(path=str(artifacts / 'eudila-ani-74-detalle.png'))
            selector.select_option('7')
            page.wait_for_url(base + '/factores/' + factors[0]['id'] + '?rango=7')
            page.get_by_role('link', name='Volver a factores', exact=True).click()
            page.wait_for_url(base + '/factores?rango=7')
            expect(main.locator('a[href^="/factores/"]')).to_have_count(2)
            page.goto(base + '/factores/' + factors[1]['id'] + '?rango=7')
            expect(main.locator('[data-series-segment]')).to_have_count(0)
            expect(main.locator('circle[data-day]')).to_have_count(2)
            page.goto(base + '/factores/' + factors[2]['id'] + '?rango=7')
            expect(page.get_by_role('heading', level=1)).to_have_text(factors[2]['nombre'])
            expect(main.locator('circle[data-day]')).to_have_count(0)
            expect(main).to_contain_text('registros')
            assert page.request.get(base + '/factores/not-an-id').status == 404
            page.goto(base + '/factores/00000000-0000-4000-8000-000000000001')
            expect(main).to_contain_text('Factor no disponible')
            page.goto(base + '/evolucion?rango=invalid')
            expect(selector).to_have_value('30')
            # Medianoche UTC pertenece al día anterior en Buenos Aires.
            midnight = record('midnight', 0, 3)
            midnight['recordedAt'] = '2026-10-04T01:00:00.000Z'
            seed([midnight])
            expect(main.locator('circle[data-day]')).to_have_attribute('data-day', '2026-10-03')
            seed(rich)
            before = page.evaluate('sessionStorage.getItem("eudila-preview-records-v1")')
            for route in ['/hoy', '/calendario']:
                page.goto(base + route)
                expect(page.get_by_role('link', name='Ver evolución', exact=True)).to_be_visible()
                expect(page.get_by_role('link', name='Ver factores de vida', exact=True)).to_be_visible()
            page.get_by_role('link', name='Ver evolución', exact=True).click()
            page.wait_for_url(base + '/evolucion')
            for route in ['/evolucion?rango=90', '/factores?rango=90', '/factores/' + factors[0]['id'] + '?rango=90']:
                page.goto(base + route)
                for width, height in [(320,568), (390,844), (520,900)]:
                    page.set_viewport_size({'width': width, 'height': height})
                    for percent in [100,200]:
                        page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route,width,percent)
                        assert main.evaluate('e => e.scrollWidth <= e.clientWidth'), (route,width,percent,'main')
                        main_height = main.bounding_box()['height']
                        assert main_height >= 100, (route,width,percent,'main height', main_height)
                        help_link = page.get_by_role('link', name='Ayuda ahora', exact=True)
                        help_box = help_link.bounding_box()
                        assert help_box['y'] >= 0 and help_box['y'] + help_box['height'] <= height
                        for target in [help_link, *page.locator('.app-tab').all()]:
                            box = target.bounding_box()
                            assert box['height'] >= 44 and box['width'] >= 44, (route,width,percent,box)
                            assert box['y'] >= 0 and box['y'] + box['height'] <= height, box
                        toggle = page.get_by_role('button', name='Vista previa · En esta pestaña', exact=True)
                        toggle.focus()
                        page.keyboard.press('Enter')
                        notice = page.get_by_role('note', name='Sobre la vista previa', exact=True)
                        expect(notice).to_be_visible()
                        notice_box = notice.bounding_box()
                        assert notice_box['x'] >= 0 and notice_box['x'] + notice_box['width'] <= width
                        assert notice_box['y'] >= 0 and notice_box['y'] + notice_box['height'] <= height
                        assert main.bounding_box()['height'] == main_height
                        expect(notice).to_contain_text('Al cerrarla, se pierden')
                        page.keyboard.press('Escape')
                        expect(notice).not_to_be_visible()
                        expect(toggle).to_be_focused()
                    page.evaluate("document.documentElement.style.fontSize = '100%'")
            assert page.evaluate('sessionStorage.getItem("eudila-preview-records-v1")') == before
            page.goto(base + '/exportar')
            page.get_by_role('button', name='Vista previa · En esta pestaña', exact=True).click()
            notice = page.get_by_role('note', name='Sobre la vista previa', exact=True)
            expect(notice).to_be_visible()
            page.emulate_media(media='print')
            expect(notice).not_to_be_visible()
            page.emulate_media(media='screen')
            page.get_by_role('button', name='Cerrar aviso de vista previa', exact=True).click()
            expect(notice).not_to_be_visible()
            page.get_by_role('link', name='Ayuda ahora', exact=True).click()
            page.wait_for_url(base + '/ayuda')
            expect(page.get_by_role('heading', name='Ayuda ahora', exact=True)).to_be_visible()
            assert page.evaluate('sessionStorage.getItem("eudila-preview-records-v1")') == before
            page.goto(base + '/evolucion')
            page.evaluate('sessionStorage.setItem("eudila-preview-records-v1", "{invalid")')
            page.reload()
            expect(main).to_contain_text('Conservamos los datos originales')
            expect(main.locator('svg[role="img"]')).to_have_count(0)
            assert page.evaluate('sessionStorage.getItem("eudila-preview-records-v1")') == '{invalid'
            page.evaluate('sessionStorage.setItem("eudila-preview-records-v1", "[]")')
            page.get_by_role('button', name='Volver a intentar', exact=True).click()
            expect(main.get_by_role('alert')).to_have_count(0)
            assert not errors, errors
            assert all(r.url.startswith(base + '/') for r in requests), [r.url for r in requests if not r.url.startswith(base + '/')]
            assert not [r for r in requests if r.method != 'GET'], [(r.url,r.method) for r in requests if r.method != 'GET']
            browser.close()
            print('ANI-73/74: rangos, datos/segmentos, factores/UUID, detalle, sparse/vacío, fechas locales, teclado, reflujo, corrupción y navegación verificados.')
finally:
    if server:
        server.terminate()
        server.wait(timeout=10)
    log.close()
