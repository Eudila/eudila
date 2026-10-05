# SPDX-License-Identifier: AGPL-3.0-only
"""Run: uv run --with playwright python prototype/splash.test.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os

from playwright.sync_api import sync_playwright


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=Path(__file__).resolve().parents[1]))
Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/prototype/"
chrome = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
track_intro = """window.introStarts = 0;
const animate = Element.prototype.animate;
Element.prototype.animate = function(...args) {
  const animation = animate.apply(this, args);
  if (this.matches('.home-orb')) {
    window.introStarts++;
    window.introAnimation = animation;
    if (window.pauseIntro) animation.pause();
  }
  return animation;
};"""

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(**({"executable_path": chrome} if Path(chrome).exists() else {}))

        def open_home(reduced_motion="no-preference", pause=True, setup=""):
            page = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion=reduced_motion, service_workers="block")
            page.add_init_script(track_intro + f"window.pauseIntro = {str(pause).lower()};" + setup)
            page.goto(base)
            page.locator(".home-orb").wait_for()
            return page

        def assert_static(page):
            page.locator(".home-orb").wait_for()
            page.wait_for_function("document.querySelector('.home-orb').getAnimations({subtree:true}).length === 0")
            assert page.locator(".home-orb").evaluate("e => getComputedStyle(e).opacity") == "1"

        # Pausing only in the driver makes checks deterministic while keeping native animations.
        page = open_home()
        assert page.evaluate("introStarts") == 1
        assert 0 < page.evaluate("introAnimation.effect.getTiming().duration") < 2000
        assert page.get_by_role("button", name="Empezar registro").is_enabled()
        assert page.get_by_role("link", name="Ayuda ahora").is_visible()
        page.locator(".home-orb").click()
        assert_static(page)
        page.get_by_role("button", name="Empezar registro").click()
        assert page.url.endswith("#/registro/tipo")
        page.get_by_label("Tarde").check()
        page.get_by_role("button", name="Siguiente").click()
        assert page.url.endswith("#/registro/animo")
        page.go_back()
        page.get_by_role("button", name="Cerrar registro").click()
        page.get_by_role("button", name="Descartar", exact=True).click()
        assert_static(page)
        assert page.evaluate("introStarts") == 1
        page.get_by_role("link", name="Ayuda ahora").click()
        page.get_by_role("heading", name="Ayuda ahora").wait_for()
        page.go_back()
        assert_static(page)
        page.reload()
        assert_static(page)
        assert page.evaluate("introStarts") == 0
        page.close()

        page = open_home()
        page.keyboard.press("Tab")
        assert_static(page)
        assert page.evaluate("document.activeElement.id") == "home-link"
        page.close()

        page = open_home()
        page.get_by_role("button", name="Empezar registro").click()
        assert page.url.endswith("#/registro/tipo")
        assert page.evaluate("introAnimation.playState") == "idle"
        page.close()

        page = open_home()
        page.get_by_role("link", name="Ayuda ahora").click()
        page.get_by_role("heading", name="Ayuda ahora").wait_for()
        page.close()

        page = open_home(pause=False)
        page.wait_for_function("introAnimation.playState === 'idle'", timeout=1900)
        assert_static(page)
        page.close()

        page = open_home(reduced_motion="reduce")
        assert page.evaluate("introStarts") == 0
        assert_static(page)
        before = page.locator(".home-orb svg").evaluate("e => e.getBoundingClientRect().toJSON()")
        page.wait_for_timeout(700)
        assert before == page.locator(".home-orb svg").evaluate("e => e.getBoundingClientRect().toJSON()")
        page.close()

        page = open_home()
        page.emulate_media(reduced_motion="reduce")
        assert_static(page)
        page.close()

        page = open_home(setup="Object.defineProperty(window, 'sessionStorage', {get(){throw new DOMException('Blocked', 'SecurityError')}});")
        assert page.evaluate("introStarts") == 0
        assert_static(page)
        page.get_by_role("button", name="Empezar registro").click()
        assert page.url.endswith("#/registro/tipo")
        page.close()

        page = browser.new_page(service_workers="block")
        page.add_init_script(track_intro)
        page.goto(base + "#/registro/animo")
        page.get_by_role("slider", name="Estado de ánimo").wait_for()
        assert page.evaluate("introStarts") == 0
        page.get_by_role("button", name="Cerrar registro").click()
        page.get_by_role("button", name="Descartar", exact=True).click()
        assert_static(page)
        assert page.evaluate("introStarts") == 0
        page.close()

        page = browser.new_page(service_workers="block")
        page.add_init_script(track_intro)
        page.goto(base + "ayuda.html")
        page.get_by_role("link", name="Volver a eudila", exact=True).click()
        assert_static(page)
        assert page.evaluate("introStarts") == 0, "La visita directa a Ayuda no consumió la entrada"
        page.close()

        for width, height in [(320, 568), (390, 844), (520, 900)]:
            for text_size in [100, 200]:
                page = open_home(reduced_motion="reduce")
                page.set_viewport_size({"width": width, "height": height})
                page.evaluate(f"document.documentElement.style.fontSize = '{text_size}%'")
                assert page.evaluate("document.documentElement.scrollWidth === innerWidth"), (width, text_size)
                assert page.get_by_role("button", name="Empezar registro").is_visible()
                page.close()

        # La escala compartida también debe estar disponible al arrancar sin red.
        offline_context = browser.new_context(reduced_motion="reduce")
        offline_page = offline_context.new_page()
        offline_page.goto(base)
        offline_page.evaluate("navigator.serviceWorker.ready")
        offline_page.wait_for_function("navigator.serviceWorker.controller !== null")
        assert offline_page.evaluate("caches.match(new URL('moods.js', location.href)).then(Boolean)"), "Falta moods.js en la caché offline"
        offline_context.set_offline(True)
        offline_page.reload()
        offline_page.get_by_role("button", name="Empezar registro").click()
        offline_page.get_by_label("Tarde").check()
        offline_page.get_by_role("button", name="Siguiente").click()
        offline_page.get_by_role("slider", name="Estado de ánimo").press("End")
        assert offline_page.locator("#mood-label").inner_text() == "Muy agradable"
        offline_page.get_by_role("link", name="Ayuda ahora").click()
        offline_page.get_by_role("heading", name="Ayuda ahora").wait_for()
        offline_context.close()
        browser.close()
        print("ANI-69: entrada, salto, sesión, navegación, reduced-motion y reflujo correctos")
finally:
    server.shutdown()
    server.server_close()
