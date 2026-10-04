# SPDX-License-Identifier: AGPL-3.0-only
"""Run: uv run --with playwright python data/catalogo.browser.test.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse, parse_qs
import json
import os

from playwright.sync_api import sync_playwright, expect


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


root = Path(__file__).resolve().parent.parent
catalog = json.loads((root / "data/catalogo-v1.json").read_text())
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=root))
Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}"
chrome = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
requests = []


def respond(route):
    url = urlparse(route.request.url)
    table = url.path.rsplit("/", 1)[-1]
    query = parse_qs(url.query)
    assert query["order"] == ["nombre.asc"]
    expected = "id,nombre,sugerida" if table == "emociones" else "id,nombre"
    assert query["select"] == [expected]
    assert route.request.headers["apikey"] == "test-public-key"
    assert route.request.headers["authorization"] == "Bearer test-public-key"
    requests.append(table)
    # Endpoint fixtures come from the delivered seeds; no production fallback.
    route.fulfill(json=sorted(catalog[table], key=lambda row: row["nombre"]))


try:
    with sync_playwright() as p:
        browser = p.chromium.launch(**({"executable_path": chrome} if Path(chrome).exists() else {}))
        page = browser.new_page(viewport={"width": 390, "height": 844}, service_workers="block", reduced_motion="reduce")
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.route("**/prototype/config.js", lambda route: route.fulfill(
            content_type="text/javascript",
            body=f'export const catalog = {{url: "{base}/catalog-test", anonKey: "test-public-key"}};',
        ))
        page.route("**/catalog-test/rest/v1/**", respond)
        page.goto(f"{base}/prototype/")
        page.get_by_role("button", name="Empezar registro").click()
        page.get_by_label("Tarde").check()
        page.get_by_role("button", name="Siguiente").click()
        page.locator("#mood-range").fill("2")
        page.locator("#mood-range").dispatch_event("input")
        page.get_by_role("button", name="Siguiente").click()
        expect(page.locator("#quick-options button")).to_have_count(6)
        assert set(page.locator("#quick-options button").all_text_contents()) == {
            row["nombre"] for row in catalog["emociones"] if row["sugerida"]
        }
        # A lower mood does not hide Alegría or alter the suggestion set.
        page.get_by_role("button", name="Ver todas las emociones").click()
        expect(page.locator("#emotion-results button")).to_have_count(21)
        assert set(page.locator("#emotion-results button").all_text_contents()) == {
            row["nombre"] for row in catalog["emociones"]
        }
        page.get_by_role("button", name="No sé cómo nombrarlo", exact=True).click()
        alternative = next(row["id"] for row in catalog["emociones"] if row["nombre"] == "No sé cómo nombrarlo")
        page.get_by_role("button", name="Siguiente").click()
        expect(page.locator("#factor-options button")).to_have_count(15)
        assert set(page.locator("#factor-options button").all_text_contents()) == {
            row["nombre"] for row in catalog["factores_vida"]
        }
        draft = page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1'))")
        assert draft["factors"] == []
        page.get_by_role("button", name="Familia", exact=True).click()
        page.get_by_role("button", name="Otro factor", exact=True).click()
        selected_ids = {row["id"] for row in catalog["factores_vida"] if row["nombre"] in {"Familia", "Otro factor"}}
        draft = page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1'))")
        assert draft["emotionId"] == alternative and draft["mood"] == 2
        assert set(draft["factors"]) == selected_ids
        page.reload()
        expect(page.get_by_role("button", name="Familia", exact=True)).to_have_attribute("aria-pressed", "true")
        expect(page.get_by_role("button", name="Otro factor", exact=True)).to_have_attribute("aria-pressed", "true")
        page.get_by_role("button", name="Familia", exact=True).click()
        page.get_by_role("button", name="Otro factor", exact=True).click()
        assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).factors") == []
        assert set(requests) == {"emociones", "factores_vida"}
        assert not errors, errors
        browser.close()
        print("Catálogo: REST, seis sugerencias, 21 respuestas, 15 factores, UUID y recarga correctos")
finally:
    server.shutdown()
    server.server_close()
