# SPDX-License-Identifier: AGPL-3.0-only
"""Con variables públicas exportadas: uv run --with playwright python app/registro/emociones.live.test.py"""
from pathlib import Path
from time import monotonic, sleep
from urllib.parse import urlparse
from urllib.request import urlopen
import json
import os
import socket
import subprocess
import tempfile

from playwright.sync_api import sync_playwright, expect

project = Path(__file__).resolve().parents[2]
catalog_url = os.environ.get("NEXT_PUBLIC_CATALOG_URL", "").rstrip("/")
catalog_key = os.environ.get("NEXT_PUBLIC_CATALOG_ANON_KEY", "")
assert catalog_url and catalog_key, "Faltan URL y clave pública del catálogo real; no se usan fixtures."
assert urlparse(catalog_url).scheme in {"http", "https"}
expected = json.loads((project / "data/catalogo-v1.json").read_text())["emociones"]
with socket.socket() as listener:
    listener.bind(("127.0.0.1", 0))
    port = listener.getsockname()[1]
base = f"http://127.0.0.1:{port}"
with tempfile.TemporaryFile() as log:
    server = subprocess.Popen(
        ["node", "node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", str(port)],
        cwd=project, stdout=log, stderr=subprocess.STDOUT,
        env={**os.environ, "NEXT_TELEMETRY_DISABLED": "1", "NEXT_PUBLIC_FRONTEND_PREVIEW": "false"},
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
            context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            # La respuesta viene de la base: ninguna ruta interceptada ni servidor de fixtures.
            with page.expect_response(lambda response: response.url.startswith(catalog_url + "/rest/v1/emociones?")) as request:
                page.goto(base + "/registro/emocion")
            response = request.value
            assert response.ok, f"El catálogo real respondió HTTP {response.status}"
            assert response.request.method == "GET"
            actual = response.json()
            assert sorted(actual, key=lambda row: row["id"]) == sorted(expected, key=lambda row: row["id"]), "La base no coincide con el catálogo ANI-96"
            quick = page.get_by_role("group", name="Emociones sugeridas")
            expect(quick.get_by_role("button")).to_have_count(6)
            assert set(quick.get_by_role("button").all_text_contents()) == {row["nombre"] for row in actual if row["sugerida"]}
            choice = quick.get_by_role("button", name="Alegría", exact=True)
            choice.focus()
            page.keyboard.press("Enter")
            expect(choice).to_be_focused()
            expect(choice).to_have_attribute("aria-pressed", "true")
            opener = page.get_by_role("button", name="Ver todas las emociones")
            opener.focus()
            page.keyboard.press("Enter")
            dialog = page.get_by_role("dialog", name="Todas las emociones")
            search = page.get_by_role("searchbox", name="Buscar emoción")
            expect(search).to_be_focused()
            expect(dialog.locator("button[aria-pressed]")).to_have_count(21)
            for key in ["Tab", "Shift+Tab"]:
                for _ in range(25):
                    page.keyboard.press(key)
                    assert dialog.evaluate("e => e.contains(document.activeElement) || document.activeElement === document.body")
            search.fill("ALEGRIA")
            expect(dialog.locator("button[aria-pressed]")).to_have_text("Alegría")
            page.keyboard.press("Escape")
            expect(dialog).not_to_be_visible()
            expect(opener).to_be_focused()
            for name in ["Otra emoción", "No sé cómo nombrarlo", "Prefiero no indicarlo"]:
                opener.focus()
                page.keyboard.press("Enter")
                search.fill(name)
                page.keyboard.press("Tab")
                page.keyboard.press("Enter")
                expect(dialog).not_to_be_visible()
                expect(opener).to_be_focused()
                selected = next(row for row in actual if row["nombre"] == name)
                assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") == selected["id"]
                expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: " + name)
            page.reload()
            expect(page.get_by_role("status").filter(has_text="Elegiste:")).to_have_text("Elegiste: Prefiero no indicarlo")
            for width, height in [(320, 568), (390, 844), (520, 900)]:
                for percent in [100, 200]:
                    page.set_viewport_size({"width": width, "height": height})
                    page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                    assert page.evaluate("document.documentElement.scrollWidth === innerWidth")
                    if width == 320 and percent == 200:
                        page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-64-real-selector-320-200.png"))
                    opener.click()
                    assert dialog.evaluate("e => e.scrollWidth <= e.clientWidth")
                    if width == 320 and percent == 200:
                        page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-64-real-lista-320-200.png"))
                    page.get_by_role("button", name="Cerrar lista").click()
            page.set_viewport_size({"width": 390, "height": 844})
            page.evaluate("document.documentElement.style.fontSize = '100%'")
            page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-64-real-selector.png"))
            opener.click()
            page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-64-real-lista.png"))
            page.keyboard.press("Escape")
            page.get_by_role("link", name="Siguiente", exact=True).click()
            page.wait_for_url(base + "/registro/factores")
            assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") == selected["id"]
            assert not errors, errors
            browser.close()
            print(f"ANI-64 real ({catalog_url}): REST GET, catálogo 21/6, chips, alternativas/UUID, búsqueda, teclado/foco/Escape, recarga y reflujo correctos; no se escribieron registros.")
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()
