# SPDX-License-Identifier: AGPL-3.0-only
"""uv run --with playwright python app/registro/emociones.test.py"""
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
with socket.socket() as listener:
    listener.bind(("127.0.0.1", 0))
    port = listener.getsockname()[1]
base = f"http://127.0.0.1:{port}"
with tempfile.TemporaryFile() as log:
    server = subprocess.Popen(
        ["node", "node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", str(port)],
        cwd=project, stdout=log, stderr=subprocess.STDOUT,
        env={**os.environ, "NEXT_TELEMETRY_DISABLED": "1", "NEXT_PUBLIC_CATALOG_URL": "https://catalog.invalid", "NEXT_PUBLIC_CATALOG_ANON_KEY": "public-test-key"},
    )
    try:
        deadline = monotonic() + 60
        while True:
            try:
                urlopen(base + "/registro/emocion", timeout=1).close()
                break
            except OSError:
                assert monotonic() < deadline and server.poll() is None
                sleep(.2)
        with sync_playwright() as p:
            chrome = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
            browser = p.chromium.launch(**({"executable_path": chrome} if Path(chrome).exists() else {}))
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            # Etiquetas ficticias únicamente en esta prueba, sin catálogo público.
            rows = [
                {"id": "test-1", "nombre": "Etiqueta A de prueba", "sugerida": True},
                {"id": "test-2", "nombre": "Etiqueta B de prueba", "sugerida": True},
                {"id": "test-3", "nombre": "Etiqueta C de prueba", "sugerida": False},
            ]
            response = {"status": 200, "rows": rows}
            def catalog(route):
                assert route.request.headers["apikey"] == "public-test-key"
                assert "select=id,nombre,sugerida" in route.request.url
                route.fulfill(status=response["status"], content_type="application/json", body=json.dumps(response["rows"]), headers={"access-control-allow-origin": "*"})
            page.route("https://catalog.invalid/**", catalog)
            page.goto(base + "/registro/emocion")
            quick = page.get_by_role("group", name="Emociones sugeridas")
            expect(quick.get_by_role("button")).to_have_count(2)
            quick.get_by_role("button", name=rows[0]["nombre"]).click()
            expect(quick.get_by_role("button", name=rows[0]["nombre"])).to_have_attribute("aria-pressed", "true")
            opener = page.get_by_role("button", name="Ver todas las emociones")
            opener.focus()
            page.keyboard.press("Enter")
            dialog = page.get_by_role("dialog", name="Todas las emociones")
            search = page.get_by_role("searchbox", name="Buscar emoción")
            expect(search).to_be_focused()
            for _ in range(12):
                page.keyboard.press("Tab")
                # Chrome permite pasar por su barra; ningún control de fondo recibe foco.
                assert dialog.evaluate("e => e.contains(document.activeElement) || document.activeElement === document.body")
            for _ in range(12):
                page.keyboard.press("Shift+Tab")
                # Chrome permite pasar por su barra; ningún control de fondo recibe foco.
                assert dialog.evaluate("e => e.contains(document.activeElement) || document.activeElement === document.body")
            search.focus()
            opener.focus()
            expect(search).to_be_focused()
            search.fill("no existe")
            expect(dialog.get_by_role("status")).to_have_text("No hay resultados para esa búsqueda.")
            page.keyboard.press("Escape")
            expect(dialog).not_to_be_visible()
            expect(opener).to_be_focused()
            opener.click()
            expect(search).to_have_value("")
            search.fill("C de prueba")
            search.focus()
            page.keyboard.press("Tab")
            page.keyboard.press("Enter")
            expect(dialog).not_to_be_visible()
            expect(opener).to_be_focused()
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + rows[2]["nombre"])
            page.reload()
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + rows[2]["nombre"])
            page.get_by_role("link", name="Ayuda ahora").click()
            page.wait_for_url(base + "/ayuda")
            page.go_back()
            page.wait_for_url(base + "/registro/emocion")
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + rows[2]["nombre"])
            page.get_by_role("link", name="Siguiente", exact=True).click()
            page.wait_for_url(base + "/registro/factores")
            expect(page.get_by_role("status")).to_contain_text("Este registro aún no se guardó.")
            page.get_by_role("link", name="Volver", exact=True).click()
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + rows[2]["nombre"])
            # Reflujo y diálogo con texto aumentado, sin recortar controles.
            for width, height in [(320, 568), (390, 844), (520, 900)]:
                for percent in [100, 200]:
                    page.set_viewport_size({"width": width, "height": height})
                    page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                    assert page.evaluate("document.documentElement.scrollWidth === innerWidth")
                    opener.click()
                    assert dialog.evaluate("e => e.scrollWidth <= e.clientWidth")
                    page.get_by_role("button", name="Cerrar lista").click()
            page.evaluate("document.documentElement.style.fontSize = '100%'")
            # Error, reintento, vacío e identificador restaurado fuera del catálogo.
            response.update(status=503)
            page.reload()
            expect(page.get_by_role("status")).to_contain_text("No se pudo cargar")
            response.update(status=200, rows=[])
            page.get_by_role("button", name="Volver a intentar").click()
            expect(page.get_by_role("status")).to_contain_text("El catálogo está vacío")
            response.update(rows=[{"id": {}, "nombre": "Inválido", "sugerida": True}])
            page.get_by_role("button", name="Volver a intentar").click()
            expect(page.get_by_role("status")).to_contain_text("No se pudo cargar")
            response.update(rows=rows[:2])
            page.get_by_role("button", name="Volver a intentar").click()
            expect(quick.get_by_role("button")).to_have_count(2)
            expect(page.get_by_role("link", name="Siguiente", exact=True)).to_have_count(0)
            assert not errors, errors
            browser.close()
            print("Emociones: selección, teclado/foco, persistencia, ayuda, responsive y reintentos correctos")
    except Exception:
        log.seek(0)
        print(log.read().decode()[-5000:])
        raise
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()
