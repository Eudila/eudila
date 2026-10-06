# SPDX-License-Identifier: AGPL-3.0-only
"""Shared visual system must preserve prototype navigation and accessible actions."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import os

from playwright.sync_api import sync_playwright, expect


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


project = Path(__file__).resolve().parents[1]
catalog = json.loads((project / "data/catalogo-v1.json").read_text())
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=project))
Thread(target=server.serve_forever, daemon=True).start()
root = f"http://127.0.0.1:{server.server_port}"
base = root + "/prototype/"
try:
    with sync_playwright() as p:
        for engine in os.environ.get("PROTOTYPE_ENGINES", "chromium,webkit,firefox").split(","):
            chrome = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
            browser = getattr(p, engine).launch(**({"executable_path": str(chrome)} if engine == "chromium" and chrome.exists() else {}))
            page = browser.new_page(reduced_motion="reduce", service_workers="block", viewport={"width": 390, "height": 844})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.route("**/prototype/config.js", lambda route: route.fulfill(content_type="text/javascript", body=f"export const catalog={{url:{json.dumps(root)},anonKey:'public-test'}};"))
            page.route(root + "/rest/v1/*", lambda route: route.fulfill(content_type="application/json", body=json.dumps(catalog["emociones" if "/emociones?" in route.request.url else "factores_vida"])))
            page.goto(base, wait_until="networkidle")
            page.get_by_role("button", name="Empezar registro").click()
            if os.environ.get("VISUAL_FLOW_CHECK", "all") != "flow":
                action = page.get_by_role("button", name="Siguiente")
                assert action.bounding_box()["height"] >= 50, (engine, "CTA tipo perdió variante/tamaño", action.bounding_box())
                assert action.evaluate("e=>e.matches('.action.action-primary')")
            page.get_by_label("Tarde").check()
            page.get_by_role("button", name="Siguiente").click()
            page.get_by_role("slider").fill("5.25")
            if os.environ.get("VISUAL_FLOW_CHECK", "all") != "flow":
                page.get_by_role("button", name="Volver", exact=True).click()
                page.get_by_role("button", name="Siguiente").click()
                assert page.get_by_role("slider").input_value() == "5.25", "La posición flotante se pierde al navegar"
            page.get_by_role("button", name="Siguiente").click()
            assert not errors, errors
            expect(page.get_by_role("heading", name="¿Qué emoción describe mejor lo que sentís?")).to_be_visible()
            page.get_by_role("button", name="Ver todas las emociones", exact=True).click()
            search = page.get_by_role("searchbox")
            palette = search.evaluate("e => {const s=getComputedStyle(e);return {ink:s.color,bg:s.backgroundColor}}")
            assert palette['bg'] != 'rgb(255, 255, 255)', (engine, 'Campo de búsqueda sigue claro', palette)
            page.get_by_role("button", name="Cerrar lista", exact=True).click()
            page.get_by_role("button", name="Calma", exact=True).click()
            action = page.get_by_role("button", name="Siguiente")
            assert action.bounding_box()["height"] >= 50
            action.click()
            expect(page.get_by_role("heading", name="¿Qué factores influyeron hoy?")).to_be_visible()
            page.get_by_role("button", name="Volver", exact=True).click()
            assert "Calma" in page.locator("#selected-emotion").inner_text()
            page.get_by_role("button", name="Volver", exact=True).click()
            expect(page.get_by_role("slider")).to_have_value("5.25")
            assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).mood") == 5
            page.reload(wait_until="networkidle")
            expect(page.get_by_role("slider")).to_have_value("5")
            page.get_by_role("button", name="Cerrar registro").click()
            dialog = page.get_by_role("dialog", name="¿Descartar este registro?")
            for label in ["Seguir registrando", "Descartar"]:
                assert dialog.get_by_role("button", name=label, exact=True).bounding_box()["height"] >= 44
            dialog.get_by_role("button", name="Descartar", exact=True).click()
            page.get_by_role("button", name="Empezar registro").click()
            page.get_by_label("Tarde").check()
            page.get_by_role("button", name="Siguiente").click()
            expect(page.get_by_role("slider")).to_have_value("4")
            assert not errors, errors
            browser.close()
            print(f"PASS {engine}: acciones, posición continua/navegación, emoción/factores, recarga entera y descarte", flush=True)
finally:
    server.shutdown()
    server.server_close()
