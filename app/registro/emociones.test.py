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
seeds = json.loads((project / "data/catalogo-v1.json").read_text())
with socket.socket() as listener:
    listener.bind(("127.0.0.1", 0))
    port = listener.getsockname()[1]
base = f"http://127.0.0.1:{port}"
with tempfile.TemporaryFile() as log:
    server = subprocess.Popen(
        ["node", "node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", str(port)],
        cwd=project, stdout=log, stderr=subprocess.STDOUT,
        env={**os.environ, "NEXT_TELEMETRY_DISABLED": "1", "NEXT_PUBLIC_FRONTEND_PREVIEW": "false", "NEXT_PUBLIC_CATALOG_URL": "https://catalog.invalid", "NEXT_PUBLIC_CATALOG_ANON_KEY": "public-test-key"},
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
            page = browser.new_page(viewport={"width": 390, "height": 844})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            # Filas de ANI-96 exclusivamente como respuestas REST interceptadas.
            rows = sorted(seeds["emociones"], key=lambda row: row["nombre"])
            response = {"status": 200, "rows": rows}
            held_requests = []
            def catalog(route):
                assert route.request.headers["apikey"] == "public-test-key"
                assert route.request.headers["authorization"] == "Bearer public-test-key"
                if "/rest/v1/factores_vida?" in route.request.url:
                    route.fulfill(status=200, content_type="application/json", body=json.dumps(seeds["factores_vida"]), headers={"access-control-allow-origin": "*"})
                    return
                assert "/rest/v1/emociones?" in route.request.url
                assert "select=id,nombre,sugerida" in route.request.url
                assert "order=nombre.asc" in route.request.url
                if response.get("hold"):
                    held_requests.append(route)
                    return
                route.fulfill(status=response["status"], content_type="application/json", body=json.dumps(response["rows"]), headers={"access-control-allow-origin": "*"})
            page.route("https://catalog.invalid/**", catalog)
            page.goto(base + "/registro/tipo")
            page.get_by_role("radio", name="Tarde", exact=True).check()
            page.get_by_role("button", name="Siguiente", exact=True).click()
            page.get_by_role("slider").fill("2")
            page.get_by_role("link", name="Siguiente", exact=True).click()
            quick = page.get_by_role("group", name="Emociones sugeridas")
            expect(quick.get_by_role("button")).to_have_count(6)
            assert set(quick.get_by_role("button").all_text_contents()) == {row["nombre"] for row in rows if row["sugerida"]}
            quick.get_by_role("button", name="Alegría", exact=True).click()
            expect(quick.get_by_role("button", name="Alegría", exact=True)).to_have_attribute("aria-pressed", "true")
            opener = page.get_by_role("button", name="Ver todas las emociones")
            opener.focus()
            page.keyboard.press("Enter")
            dialog = page.get_by_role("dialog", name="Todas las emociones")
            search = page.get_by_role("searchbox", name="Buscar emoción")
            expect(search).to_be_focused()
            expect(dialog.locator('button[aria-pressed]')).to_have_count(21)
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
            search.fill("ALEGRIA")
            expect(dialog.locator('button[aria-pressed]')).to_have_count(1)
            expect(dialog.locator('button[aria-pressed]')).to_have_text("Alegría")
            search.fill("no se")
            search.focus()
            page.keyboard.press("Tab")
            page.keyboard.press("Enter")
            expect(dialog).not_to_be_visible()
            expect(opener).to_be_focused()
            chosen = next(row for row in rows if row["nombre"] == "No sé cómo nombrarlo")
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + chosen["nombre"])
            for name in ["Otra emoción", "Prefiero no indicarlo", "No sé cómo nombrarlo"]:
                opener.click()
                page.get_by_role("button", name=name, exact=True).click()
                expected = next(row["id"] for row in rows if row["nombre"] == name)
                assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") == expected
                expect(page.get_by_role("link", name="Siguiente", exact=True)).to_be_visible()
            page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-64-selector.png"))
            opener.click()
            page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-64-lista.png"))
            page.keyboard.press("Escape")
            page.reload()
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + chosen["nombre"])
            page.get_by_role("link", name="Ayuda ahora").click()
            page.wait_for_url(base + "/ayuda")
            page.go_back()
            page.wait_for_url(base + "/registro/emocion")
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + chosen["nombre"])
            page.get_by_role("link", name="Siguiente", exact=True).click()
            page.wait_for_url(base + "/registro/factores")
            expect(page.get_by_role("checkbox")).to_have_count(15)
            page.get_by_role("link", name="Revisar registro").click()
            expect(page.get_by_role("status").filter(has_text="El guardado en tu cuenta")).to_contain_text("El guardado en tu cuenta todavía no está habilitado")
            assert page.get_by_role("button", name="Guardar en vista previa").count() == 0
            assert page.evaluate("sessionStorage.getItem('eudila-preview-records-v1')") is None
            page.goto(base + "/exportar")
            expect(page.locator("main")).to_contain_text("Todavía no hay datos de cuenta para exportar")
            assert page.get_by_role("button", name="Descargar JSON").count() == 0
            page.goto(base + "/registro/factores")
            page.get_by_role("link", name="Volver", exact=True).click()
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + chosen["nombre"])
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
            expect(quick.get_by_role("button")).to_have_count(1)
            expect(page.get_by_role("status").filter(has_text="habías elegido")).to_contain_text("ya no está disponible")
            assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") == chosen["id"]
            expect(page.get_by_role("link", name="Siguiente", exact=True)).to_have_count(0)
            response.update(rows=rows)
            blocked = browser.new_context()
            blocked.add_init_script("Object.defineProperty(window, 'sessionStorage', {get(){throw new DOMException('Blocked', 'SecurityError');}})")
            blocked_page = blocked.new_page()
            blocked_page.route("https://catalog.invalid/**", catalog)
            blocked_page.goto(base + "/registro/emocion")
            blocked_page.get_by_role("button", name="Calma", exact=True).click()
            expect(blocked_page.get_by_role("status").filter(has_text="no podemos conservarlo")).to_be_visible()
            blocked_page.get_by_role("link", name="Ayuda ahora", exact=True).click()
            blocked_page.wait_for_url(base + "/ayuda")
            blocked_page.go_back()
            blocked_page.wait_for_url(base + "/registro/emocion")
            expect(blocked_page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: Calma")
            blocked.close()
            # Una respuesta que nunca llega debe salir de carga y permitir reintentar.
            response.update(hold=True)
            stalled = browser.new_page()
            stalled.add_init_script("sessionStorage.setItem('eudila-draft-v1', " + json.dumps(page.evaluate("sessionStorage.getItem('eudila-draft-v1')")) + ");")
            stalled.route("https://catalog.invalid/**", catalog)
            stalled.goto(base + "/registro/emocion")
            expect(stalled.get_by_role("status").filter(has_text="Cargando emociones")).to_be_visible()
            expect(stalled.get_by_role("status").filter(has_text="No se pudo cargar")).to_be_visible(timeout=12000)
            assert held_requests
            assert stalled.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") == chosen["id"]
            for held in held_requests:
                held.abort()
            response.pop("hold")
            stalled.get_by_role("button", name="Volver a intentar").click()
            expect(stalled.get_by_role("group", name="Emociones sugeridas").get_by_role("button")).to_have_count(6)
            expect(stalled.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + chosen["nombre"])
            stalled.close()
            assert not errors, errors
            # Sin variables, no hay catálogo de respaldo ni peticiones externas.
            server.terminate()
            server.wait(timeout=10)
            unconfigured_env = {**os.environ, "NEXT_TELEMETRY_DISABLED": "1", "NEXT_PUBLIC_FRONTEND_PREVIEW": "false"}
            for variable in ["NEXT_PUBLIC_CATALOG_URL", "NEXT_PUBLIC_CATALOG_ANON_KEY"]:
                unconfigured_env[variable] = ""
            server = subprocess.Popen(
                ["node", "node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", str(port)],
                cwd=project, stdout=log, stderr=subprocess.STDOUT, env=unconfigured_env,
            )
            deadline = monotonic() + 60
            while True:
                try:
                    urlopen(base + "/registro/emocion", timeout=1).close()
                    break
                except OSError:
                    assert monotonic() < deadline and server.poll() is None
                    sleep(.2)
            unconfigured = browser.new_page()
            external = []
            unconfigured.on("request", lambda request: external.append(request.url) if not request.url.startswith(base) else None)
            unconfigured.goto(base + "/registro/emocion")
            expect(unconfigured.get_by_role("status").filter(has_text="todavía no está disponible")).to_be_visible()
            expect(unconfigured.get_by_role("group", name="Emociones sugeridas")).to_have_count(0)
            expect(unconfigured.get_by_role("link", name="Siguiente", exact=True)).to_have_count(0)
            assert not external, external
            unconfigured.close()
            browser.close()
            print("ANI-64: REST, seis sugerencias, 21 opciones, alternativas/UUID, búsqueda sin tildes, teclado/foco, recarga, Ayuda, responsive, errores/reintento, storage bloqueado y ausencia de configuración correctos")
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
