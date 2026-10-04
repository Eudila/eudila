# SPDX-License-Identifier: AGPL-3.0-only
"""Run after npm run build: uv run --with playwright python app/ayuda/ayuda.test.py"""
from pathlib import Path
from time import monotonic, sleep
from urllib.request import urlopen, Request
from urllib.error import HTTPError
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import os
import socket
import subprocess
import tempfile
import threading

from playwright.sync_api import sync_playwright, expect

project = Path(__file__).resolve().parents[2]
documented_copy = (project / "docs/content/ayuda.md").read_text().split("```text\n", 1)[1].split("```", 1)[0]
subprocess.run(["node", str(project / "app/ayuda/worker.test.mjs")], check=True)
server = None
proxy = None
base = os.environ.get("HELP_BASE_URL", "").rstrip("/")
if not base:
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    base = f"http://127.0.0.1:{port}"
    server = subprocess.Popen(
        ["node", str(project / "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", str(port)],
        cwd=project,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT,
    )

class SlowHelpProxy(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def do_GET(self):
        if self.path.startswith("/ayuda?") and self.headers.get("RSC") == "1":
            sleep(4)
        headers = {k: v for k, v in self.headers.items() if k.lower() not in ["host", "accept-encoding", "connection"]}
        try:
            response = urlopen(Request(base + self.path, headers=headers), timeout=10)
        except HTTPError as error:
            response = error
        with response:
            data = response.read()
            self.send_response(response.status)
            for name, value in response.headers.items():
                if name.lower() not in ["transfer-encoding", "connection", "content-length"]:
                    self.send_header(name, value)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)


try:
    deadline = monotonic() + 30
    while True:
        try:
            with urlopen(base + "/", timeout=1) as response:
                assert response.status == 200
            break
        except OSError:
            assert monotonic() < deadline, "El build de producción no respondió"
            assert server is None or server.poll() is None, "Ejecutá npm run build primero"
            sleep(.1)

    with sync_playwright() as p:
        chrome = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        browser = p.chromium.launch(**({"executable_path": chrome} if Path(chrome).exists() else {}))
        context = browser.new_context(reduced_motion="reduce", viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.goto(base + "/help-sw.js")
        page.evaluate("async () => { await caches.open('other-app'); await caches.open('eudila-help-v0'); }")
        page.goto(base + "/registro/tipo", wait_until="networkidle")
        page.wait_for_function("navigator.serviceWorker.controller !== null", timeout=10000)
        # La primera visita es al registro: Ayuda ya debe estar preparada.
        page.wait_for_function("caches.open('eudila-help-v1').then(c => c.match('/ayuda')).then(Boolean)")
        assert page.evaluate("caches.keys().then(xs => xs.includes('other-app') && !xs.includes('eudila-help-v0'))")
        page.get_by_role("radio", name="Tarde", exact=True).check()
        page.get_by_role("button", name="Siguiente", exact=True).click()
        page.get_by_role("slider").press("End")
        draft = page.evaluate("sessionStorage.getItem('eudila-draft-v1')")
        context.set_offline(True)
        page.get_by_role("link", name="Ayuda ahora", exact=True).click()
        page.wait_for_url(base + "/ayuda")
        expect(page.get_by_role("heading", name="Ayuda ahora", exact=True)).to_be_visible()
        assert " ".join(page.locator("#contenido").inner_text().split()) == " ".join(documented_copy.split()), "La pantalla difiere del texto presentado para revisión"
        phones = ["tel:135", "tel:08003451435", "tel:08009990091"]
        assert page.locator('a[href^="tel:"]').evaluate_all("xs => xs.map(x => x.getAttribute('href'))") == phones
        assert page.evaluate("sessionStorage.getItem('eudila-draft-v1')") == draft
        assert page.locator("script").count() == 0, "La copia offline no debe necesitar hidratación"
        page.reload(wait_until="load")
        expect(page.get_by_role("link", name="Llamar al 135")).to_be_visible()
        assert page.locator(".app-shell").evaluate("x => getComputedStyle(x).display") == "grid", "Faltan estilos offline"
        page.evaluate("document.fonts.ready")
        assert page.evaluate("Array.from(document.fonts).some(f => f.family.toLowerCase().includes('figtree') && f.status === 'loaded')")
        page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-67-ayuda-offline.png"))
        for href in phones:
            phone = page.locator(f'a[href="{href}"]')
            phone.focus()
            assert phone.evaluate("x => x === document.activeElement")
            assert phone.evaluate("x => parseFloat(getComputedStyle(x).outlineWidth)") > 0
        for width in [320, 390, 1280]:
            page.set_viewport_size({"width": width, "height": 844})
            page.evaluate("document.documentElement.style.fontSize = '200%'")
            assert page.evaluate("document.documentElement.scrollWidth === innerWidth"), width
        another = context.new_page()
        assert another.goto(base + "/ayuda?origen=registro", wait_until="load").status == 200
        expect(another.get_by_role("link", name="Llamar al 0800 345 1435")).to_be_visible()
        another.close()
        keys = page.evaluate("caches.open('eudila-help-v1').then(c => c.keys()).then(xs => xs.map(x => new URL(x.url).pathname))")
        assert "/ayuda" in keys
        assert any(x.endswith(".css") for x in keys), keys
        assert all(x == "/ayuda" or (x.startswith("/_next/static/") and x.endswith((".css", ".woff2", ".woff", ".ttf"))) for x in keys), keys
        context.set_offline(False)
        # Una apertura posterior renueva HTML y recursos, sin acumular builds.
        page.evaluate("async () => { const c = await caches.open('eudila-help-v1'); await c.put('/ayuda', new Response('Viejo')); await c.put('/_next/static/old.css', new Response('viejo')); navigator.serviceWorker.controller.postMessage('refresh-help'); }")
        page.wait_for_function("caches.open('eudila-help-v1').then(c => c.match('/ayuda')).then(r => r.text()).then(t => t.includes('tel:135'))")
        page.wait_for_function("caches.open('eudila-help-v1').then(c => c.match('/_next/static/old.css')).then(r => !r)")
        routes = ["/", "/hoy", "/calendario", "/tokens", "/registro/tipo", "/registro/animo", "/registro/emocion", "/no-existe"]
        for route in routes:
            page.goto(base + route, wait_until="networkidle")
            page.get_by_role("link", name="Ayuda ahora", exact=True).click()
            page.wait_for_url(base + "/ayuda")
            expect(page.get_by_role("heading", name="Ayuda ahora", exact=True)).to_be_visible()
        page.goto(base + "/registro/animo", wait_until="networkidle")
        expect(page.get_by_role("slider")).to_have_value("7")
        context.close()
        denied = browser.new_context()
        denied.add_init_script("navigator.serviceWorker.register = () => Promise.reject(new DOMException('Blocked', 'SecurityError'));")
        denied_page = denied.new_page()
        denied_page.goto(base + "/registro/tipo", wait_until="networkidle")
        denied_page.get_by_role("link", name="Ayuda ahora", exact=True).click()
        expect(denied_page.get_by_role("link", name="Llamar al 135")).to_be_visible()
        denied.close()
        # Una red lenta sigue siendo online: no debe descartar estado en memoria.
        proxy = ThreadingHTTPServer(("127.0.0.1", 0), SlowHelpProxy)
        proxy.daemon_threads = True
        threading.Thread(target=proxy.serve_forever, daemon=True).start()
        slow_base = f"http://127.0.0.1:{proxy.server_port}"
        slow = browser.new_context()
        slow.add_init_script("Object.defineProperty(window, 'sessionStorage', {get(){throw new DOMException('Blocked', 'SecurityError');}})")
        slow_page = slow.new_page()
        slow_page.goto(slow_base + "/registro/tipo", wait_until="networkidle")
        slow_page.wait_for_function("navigator.serviceWorker.controller !== null")
        slow_page.get_by_role("radio", name="Tarde", exact=True).check()
        slow_page.get_by_role("button", name="Siguiente", exact=True).click()
        slow_page.get_by_role("slider").press("End")
        slow_page.evaluate("window.draftDocument = true")
        slow_page.get_by_role("link", name="Ayuda ahora", exact=True).click()
        expect(slow_page.get_by_role("heading", name="Ayuda ahora", exact=True)).to_be_visible(timeout=10000)
        assert slow_page.evaluate("window.draftDocument === true"), "La red lenta no debe forzar otra página"
        slow_page.get_by_role("link", name="Registrar", exact=True).click()
        slow_page.get_by_role("link", name="Empezar registro", exact=True).click()
        expect(slow_page.get_by_role("radio", name="Tarde", exact=True)).to_be_checked()
        slow_page.get_by_role("button", name="Siguiente", exact=True).click()
        expect(slow_page.get_by_role("slider")).to_have_value("7")
        slow.close()
        browser.close()
        print("ANI-67: acceso global en un toque, teléfonos, teclado, recarga y nueva pestaña offline, estilos, reflujo y borrador correctos; caché sin datos personales.")
        print("ANI-67: red lenta conserva el borrador en memoria con Storage bloqueado.")
finally:
    if proxy:
        proxy.shutdown()
        proxy.server_close()
    if server:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()
