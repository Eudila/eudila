# SPDX-License-Identifier: AGPL-3.0-only
"""Production: uv run --with playwright --with pypdf python app/frontend.test.py"""
from pathlib import Path
from time import monotonic, sleep
from urllib.request import urlopen
import csv
import io
import json
import os
import socket
import subprocess
import tempfile

from playwright.sync_api import sync_playwright, expect
from pypdf import PdfReader

project = Path(__file__).resolve().parents[1]
key = 'eudila-preview-records-v1'
artifacts = Path(os.environ['FRONTEND_ARTIFACT_DIR']) if os.environ.get('FRONTEND_ARTIFACT_DIR') else None
if artifacts:
    artifacts.mkdir(parents=True, exist_ok=True)
base = os.environ.get('FRONTEND_BASE_URL')
server = None
log = tempfile.TemporaryFile()
if not base:
    with socket.socket() as listener:
        listener.bind(('127.0.0.1', 0))
        port = listener.getsockname()[1]
    base = f'http://127.0.0.1:{port}'
    server = subprocess.Popen(['node', 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', str(port)], cwd=project, stdout=log, stderr=subprocess.STDOUT)
try:
    deadline = monotonic() + 60
    while True:
        try:
            urlopen(base + '/hoy', timeout=1).close()
            break
        except OSError:
            assert monotonic() < deadline and (server is None or server.poll() is None)
            sleep(.2)
    with sync_playwright() as p:
        chrome = os.environ.get('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        browser = p.chromium.launch(**({'executable_path': chrome} if Path(chrome).exists() else {}))
        context = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='America/Argentina/Buenos_Aires')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base + '/hoy')
        expect(page.locator('[data-frontend-preview]')).to_be_visible()
        assert page.evaluate(f'sessionStorage.getItem({json.dumps(key)})') is None
        page.goto(base + '/exportar')
        assert page.get_by_role('button', name='Descargar JSON', exact=True).count() == 0 or not page.get_by_role('button', name='Descargar JSON', exact=True).is_enabled()

        def draft(moment, mood, emotion, factors):
            page.goto(base + '/registro/tipo')
            page.get_by_role('radio', name=moment, exact=True).check()
            page.get_by_role('button', name='Siguiente', exact=True).click()
            page.get_by_role('slider').fill(str(mood))
            page.get_by_role('link', name='Siguiente', exact=True).click()
            if emotion == 'Calma':
                page.get_by_role('button', name=emotion, exact=True).click()
            else:
                page.get_by_role('button', name='Ver todas las emociones').click()
                page.get_by_role('button', name=emotion, exact=True).click()
            page.get_by_role('link', name='Siguiente', exact=True).click()
            expect(page.get_by_role('checkbox')).to_have_count(15)
            for factor in factors:
                page.get_by_role('checkbox', name=factor, exact=True).check()
                page.get_by_role('checkbox', name=factor, exact=True).uncheck()
                page.get_by_role('checkbox', name=factor, exact=True).check()
            page.get_by_role('link', name='Revisar registro').click()
            expect(page.get_by_role('heading', name='Revisá tu registro')).to_be_visible()

        draft('Tarde', 2, 'Calma', [])
        expect(page.locator('main')).to_contain_text('Sin factores')
        page.get_by_role('button', name='Guardar en vista previa').click()
        page.wait_for_url(base + '/hoy')
        records = page.evaluate(f'JSON.parse(sessionStorage.getItem({json.dumps(key)}))')
        assert len(records) == 1 and records[0]['mood'] == 2 and records[0]['factors'] == []
        assert page.evaluate("sessionStorage.getItem('eudila-draft-v1')") is None

        draft('Registro libre', 7, 'No sé cómo nombrarlo', ['Familia', 'Otro factor'])
        page.get_by_role('link', name='Cambiar ánimo', exact=True).click()
        page.get_by_role('slider').fill('5')
        page.get_by_role('link', name='Siguiente', exact=True).click()
        page.get_by_role('link', name='Siguiente', exact=True).click()
        expect(page.get_by_role('checkbox', name='Familia', exact=True)).to_be_checked()
        page.get_by_role('link', name='Revisar registro').click()
        page.evaluate("""() => {
            window.originalSet = Storage.prototype.setItem;
            Storage.prototype.setItem = function(k, v) {
                if (k === 'eudila-preview-records-v1') { window.failedRecord = JSON.parse(v).at(-1); throw new DOMException('Quota', 'QuotaExceededError'); }
                return window.originalSet.call(this, k, v);
            };
        }""")
        page.get_by_role('button', name='Guardar en vista previa').click()
        expect(page.locator('main').get_by_role('alert')).to_contain_text('Tu borrador se conserva')
        assert page.evaluate(f'JSON.parse(sessionStorage.getItem({json.dumps(key)})).length') == 1
        pending_id = page.evaluate('window.failedRecord.id')
        assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).mood") == 5
        page.evaluate('() => { Storage.prototype.setItem = window.originalSet; }')
        page.get_by_role('button', name='Reintentar guardado').click()
        page.wait_for_url(base + '/hoy')
        page.reload()
        expect(page.locator('main')).to_contain_text('No sé cómo nombrarlo')
        records = page.evaluate(f'JSON.parse(sessionStorage.getItem({json.dumps(key)}))')
        assert len(records) == 2 and records[1]['id'] == pending_id
        assert records[1]['mood'] == 5 and len(records[1]['factors']) == 2
        assert all(record['source'] == 'preview' for record in records)
        if artifacts:
            page.screenshot(path=str(artifacts / 'eudila-frontend-hoy.png'))

        today = page.evaluate("new Date().toLocaleDateString('sv-SE')")
        page.goto(base + '/calendario')
        day_link = page.locator(f'a[href="/calendario/{today}"]')
        expect(day_link).to_be_visible()
        if artifacts:
            page.screenshot(path=str(artifacts / 'eudila-frontend-calendario.png'))
        assert '4' in day_link.get_attribute('aria-label'), day_link.get_attribute('aria-label')
        day_link.focus()
        page.keyboard.press('Enter')
        expect(page.locator('main')).to_contain_text('Calma')
        expect(page.locator('main')).to_contain_text('Familia')
        assert page.request.get(base + '/calendario/2026-02-30').status == 404
        assert page.get_by_role('link', name='Día siguiente', exact=True).count() == 0
        page.get_by_role('link', name='Día anterior', exact=True).click()
        expect(page.locator('main')).to_contain_text('No hay registros de este día')
        page.get_by_role('link', name='Día siguiente', exact=True).click()
        page.get_by_role('link', name='Volver al calendario', exact=True).click()
        page.wait_for_url(base + '/calendario?mes=' + today[:7])
        assert page.get_by_role('link', name='Mes siguiente', exact=True).count() == 0
        page.get_by_role('link', name='Mes anterior', exact=True).click()
        expect(page.get_by_role('link', name='Mes siguiente', exact=True)).to_be_visible()
        page.get_by_role('link', name='Mes siguiente', exact=True).click()
        page.goto(base + '/calendario?mes=invalid')
        expect(page.get_by_role('heading', name='Calendario', exact=True)).to_be_visible()
        page.goto(base + '/calendario/2099-12-31')
        expect(page.locator('main')).to_contain_text('Fecha no disponible')

        page.goto(base + '/exportar')
        for extension, label in [('json', 'Descargar JSON'), ('csv', 'Descargar CSV')]:
            with page.expect_download() as download_event:
                page.get_by_role('button', name=label, exact=True).click()
            download = download_event.value
            raw = Path(download.path()).read_bytes()
            assert download.suggested_filename.endswith('.' + extension)
            if extension == 'json':
                assert json.loads(raw) == records
            else:
                assert raw.startswith(b'\xef\xbb\xbf')
                rows = list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
                assert len(rows) == 2 and rows[1]['id'] == pending_id
                assert rows[1]['emocion'] == 'No sé cómo nombrarlo'
                assert len(json.loads(rows[1]['factor_ids'])) == 2
        if artifacts:
            page.screenshot(path=str(artifacts / 'eudila-frontend-exportar.png'))
        page.evaluate('window.print = () => { window.didPrint = true; }')
        page.get_by_role('button', name='Imprimir / guardar PDF', exact=True).click()
        assert page.evaluate('window.didPrint')
        with tempfile.TemporaryDirectory() as temp:
            pdf = Path(temp) / 'informe.pdf'
            page.pdf(path=str(pdf), format='A4', print_background=True)
            if artifacts:
                (artifacts / pdf.name).write_bytes(pdf.read_bytes())
            reader = PdfReader(pdf)
            text = '\n'.join(p.extract_text() for p in reader.pages)
            for expected in ['Calma', 'No sé cómo nombrarlo', 'Familia']:
                assert expected in text, (expected, text)
            assert all(abs(float(p.mediabox.width) - 595.28) < 2 for p in reader.pages)

        for route in ['/hoy', '/calendario', '/calendario/' + today, '/exportar', '/registro/confirmacion']:
            page.goto(base + route)
            for width in [320, 390, 520]:
                page.set_viewport_size({'width': width, 'height': 844})
                for percent in [100, 200]:
                    page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width, percent)
                    assert page.locator('main').evaluate('e => e.scrollWidth <= e.clientWidth'), (route, width, percent, 'main')
            page.evaluate("document.documentElement.style.fontSize = '100%'")

        examples_context = browser.new_context(timezone_id='America/Argentina/Buenos_Aires', viewport={'width': 390, 'height': 844})
        sample = examples_context.new_page()
        sample.goto(base + '/hoy')
        sample.get_by_role('button', name='Cargar ejemplos ficticios', exact=True).click()
        expect(sample.locator('main')).to_contain_text('Ejemplo ficticio')
        assert sample.get_by_role('button', name='Cargar ejemplos ficticios', exact=True).count() == 0
        example_records = sample.evaluate(f'JSON.parse(sessionStorage.getItem({json.dumps(key)}))')
        assert len(example_records) == 4 and all(r['source'] == 'example' for r in example_records)
        sample.goto(base + '/exportar')
        expect(sample.get_by_role('status')).to_have_text('3 registros en el período.')
        sample.get_by_label('Período del informe').select_option('all')
        expect(sample.get_by_role('status')).to_have_text('4 registros en el período.')
        # Muchas filas prueban paginación real sin recortar al alto del shell.
        many = [{**example_records[0], 'id': f'pagination-{i}', 'emotion': {**example_records[0]['emotion'], 'nombre': f'Calma registro {i}'}} for i in range(60)]
        sample.evaluate('(records) => sessionStorage.setItem("eudila-preview-records-v1", JSON.stringify(records))', many)
        sample.reload()
        expect(sample.get_by_role('status')).to_have_text('60 registros en el período.')
        with tempfile.TemporaryDirectory() as temp:
            pdf = Path(temp) / 'multipagina.pdf'
            sample.pdf(path=str(pdf), format='A4', print_background=False)
            if artifacts:
                (artifacts / pdf.name).write_bytes(pdf.read_bytes())
            reader = PdfReader(pdf)
            text = '\n'.join(p.extract_text() for p in reader.pages)
            assert len(reader.pages) > 3
            for i in range(60):
                assert f'Calma registro {i}' in text
            assert 'No representa el historial de una cuenta' in ' '.join(text.split()), text
            assert 'Ayuda ahora' not in text and 'Exportar historial' not in text
        examples_context.close()

        corrupt = browser.new_context()
        corrupt.add_init_script("sessionStorage.setItem('eudila-preview-records-v1', '{invalid');")
        broken = corrupt.new_page()
        broken.goto(base + '/exportar')
        expect(broken.locator('main')).to_contain_text('Conservamos los datos originales')
        assert broken.evaluate(f'sessionStorage.getItem({json.dumps(key)})') == '{invalid'
        assert broken.get_by_role('button', name='Descargar JSON', exact=True).count() == 0 or not broken.get_by_role('button', name='Descargar JSON', exact=True).is_enabled()
        corrupt.close()
        assert not errors, errors
        browser.close()
    print('Frontend: registro, edición, guardado/reintento, calendario, descargas CSV/JSON, PDF, corrupción y reflujo verificados.')
finally:
    if server:
        server.terminate()
        server.wait(timeout=10)
    log.close()
