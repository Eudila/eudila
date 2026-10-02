# SPDX-License-Identifier: AGPL-3.0-only
"""Run: uv run --with playwright python app/tokens/tokens.test.py"""
from pathlib import Path
from time import monotonic, sleep
from urllib.request import urlopen
import os
import re
import socket
import subprocess
import tempfile

from playwright.sync_api import sync_playwright, expect


project = Path(__file__).resolve().parents[2]
css = (project / "app/globals.css").read_text()
defined = set(re.findall(r"^\s*(--[\w-]+)\s*:", css, re.MULTILINE))
for component in (project / "app").rglob("*.tsx"):
    source = component.read_text()
    assert not re.search(r"#[\da-fA-F]{3,8}\b", source), component
    for classes in re.findall(r'className="([^"]+)"', source):
        assert not re.search(r"\[[^\]]*\d(?:px|rem|em|ch)", classes), component
    assert not re.search(r"(?:width|height|fontSize|borderRadius)\s*:\s*(?:\d|[\"']\d+(?:px|rem|em|ch))", source), component

base = os.environ.get("TOKENS_BASE_URL", "").rstrip("/")
server = None
if not base:
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    base = f"http://127.0.0.1:{port}"
    server = subprocess.Popen(
        ["node", str(project / "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", str(port)],
        cwd=project,
        env={**os.environ, "NEXT_TELEMETRY_DISABLED": "1"},
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT,
    )


def luminance(rgb):
    linear = [c / 255 / 12.92 if c / 255 <= .04045 else ((c / 255 + .055) / 1.055) ** 2.4 for c in rgb]
    return sum(c * weight for c, weight in zip(linear, [.2126, .7152, .0722]))


def contrast(first, second):
    low, high = sorted([luminance(first), luminance(second)])
    return (high + .05) / (low + .05)


def colors(element):
    return element.evaluate("""e => {
      const style = getComputedStyle(e);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      return [style.color, style.backgroundColor].map(color => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
      });
    }""")


try:
    deadline = monotonic() + 45
    while True:
        try:
            with urlopen(base + "/tokens", timeout=1) as response:
                assert response.status == 200
            break
        except OSError:
            assert monotonic() < deadline, "Next.js no respondió en 45 segundos"
            assert server is None or server.poll() is None, "Next.js terminó antes de responder"
            sleep(.1)

    with sync_playwright() as p:
        chrome = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        browser = p.chromium.launch(**({"executable_path": chrome} if Path(chrome).exists() else {}))
        page = browser.new_page(reduced_motion="reduce")
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        # El destino inexistente se prueba abajo; el scaffold no tiene favicon.
        expected_404 = {base + path for path in ["/favicon.ico", "/no-existe", "/registro/no-existe"]}
        page.on("console", lambda message: errors.append((message.text, message.location["url"])) if message.type == "error" and not (message.text.startswith("Failed to load resource: the server responded with a status of 404") and message.location["url"] in expected_404) else None)
        assert page.goto(base + "/tokens", wait_until="networkidle").status == 200
        assert page.title() == "Identidad visual · eudila"
        assert "viewport-fit=cover" in page.locator('meta[name="viewport"]').get_attribute("content")
        nav = page.get_by_role("navigation", name="Secciones")
        assert nav.get_by_role("link").all_text_contents() == ["Registrar", "Hoy", "Calendario"]
        page.evaluate("document.fonts.ready")
        assert "figtree" in page.get_by_role("heading", level=1).evaluate("e => getComputedStyle(e).fontFamily").lower()
        shown = set(page.locator("[data-token]").evaluate_all("elements => elements.map(e => e.dataset.token)"))
        assert shown == defined, {"missing": sorted(defined - shown), "unknown": sorted(shown - defined)}
        assert page.locator("[data-contrast]").count() == 15
        ratios = []
        for sample in page.locator("[data-contrast]").all():
            foreground, background = colors(sample)
            ratio = contrast(foreground, background)
            assert ratio >= 4.5, (sample.inner_text(), ratio)
            ratios.append(ratio)
        foreground, background = colors(page.locator("html"))
        assert contrast(foreground, background) >= 4.5
        muted = page.locator("header p.text-muted")
        assert contrast(colors(muted)[0], background) >= 4.5
        page.locator("#contenido").focus()
        page.keyboard.press("Tab")
        link = page.get_by_role("link", name="Volver al inicio")
        assert link.evaluate("e => e === document.activeElement")
        assert link.evaluate("e => parseFloat(getComputedStyle(e).outlineWidth)") > 0
        assert link.bounding_box()["height"] >= 44
        page.keyboard.press("Enter")
        page.wait_for_url(base + "/")
        assert page.get_by_role("heading", name="¿Cómo te sentís ahora?").is_visible()
        assert page.get_by_role("heading", level=1).evaluate("e => getComputedStyle(e).fontSize") == "28px"

        for route in ["/", "/tokens"]:
            assert page.goto(base + route, wait_until="networkidle").status == 200
            original = page.locator("html").evaluate("e => getComputedStyle(e).getPropertyValue('--color-action')")
            page.evaluate("document.documentElement.style.setProperty('--color-primary', 'var(--color-mood-1)')")
            changed = page.locator("html").evaluate("e => getComputedStyle(e).getPropertyValue('--color-action')")
            assert original != changed, route
            if route == "/tokens":
                assert page.locator('[data-token="--color-primary"] > div').evaluate("e => getComputedStyle(e).backgroundColor") == "rgb(137, 47, 201)"
                assert contrast(*colors(page.locator("a[data-contrast]"))) >= 4.5
            page.evaluate("document.documentElement.style.removeProperty('--color-primary')")
            for width, height in [(320, 568), (390, 844), (520, 900), (1280, 900)]:
                for percent in [100, 200]:
                    page.set_viewport_size({"width": width, "height": height})
                    page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                    assert page.evaluate("document.documentElement.scrollWidth === innerWidth"), (route, width, percent)
                    assert page.get_by_role("heading", level=1).is_visible()
            page.evaluate("document.documentElement.style.fontSize = '100%'")

        # Navegación por mouse y teclado, historia y selección accesible.
        for label, route in [("Hoy", "/hoy"), ("Calendario", "/calendario"), ("Registrar", "/")]:
            link = nav.get_by_role("link", name=label, exact=True)
            link.click()
            page.wait_for_url(base + route)
            expect(link).to_have_attribute("aria-current", "page")
            assert nav.locator('[aria-current="page"]').count() == 1
        page.go_back()
        page.wait_for_url(base + "/calendario")
        expect(nav.get_by_role("link", name="Calendario")).to_have_attribute("aria-current", "page")
        page.go_forward()
        page.wait_for_url(base + "/")
        for label, route in [("Hoy", "/hoy"), ("Calendario", "/calendario"), ("Registrar", "/")]:
            nav.get_by_role("link", name="Registrar", exact=True).focus()
            for _ in range(["Registrar", "Hoy", "Calendario"].index(label)):
                page.keyboard.press("Tab")
            link = nav.get_by_role("link", name=label, exact=True)
            assert link.evaluate("e => e === document.activeElement")
            assert link.evaluate("e => parseFloat(getComputedStyle(e).outlineWidth)") > 0
            page.keyboard.press("Enter")
            page.wait_for_url(base + route)
            expect(link).to_have_attribute("aria-current", "page")

        # Todas las rutas comparten shell, incluidas errores y futuros pasos.
        routes = ["/", "/hoy", "/calendario", "/ayuda", "/tokens", "/registro/tipo", "/registro/animo", "/registro/emocion", "/no-existe"]
        for route in routes:
            status = 404 if route == "/no-existe" else 200
            assert page.goto(base + route, wait_until="networkidle").status == status
            main = page.locator("#contenido")
            assert page.get_by_role("main").count() == 1
            assert page.get_by_role("heading", level=1).count() == 1
            assert nav.get_by_role("link").count() == 3
            selected = {"/": "Registrar", "/hoy": "Hoy", "/calendario": "Calendario"}.get(route)
            if selected:
                expect(nav.get_by_role("link", name=selected, exact=True)).to_have_attribute("aria-current", "page")
            elif route.startswith("/registro/"):
                expect(nav.get_by_role("link", name="Registrar", exact=True)).to_have_attribute("aria-current", "page")
            else:
                assert nav.locator('[aria-current="page"]').count() == 0
            help_link = page.get_by_role("link", name="Ayuda ahora", exact=True)
            for width, height in [(320, 568), (390, 844), (520, 900), (1280, 900), (844, 390)]:
                for percent in [100, 200]:
                    page.set_viewport_size({"width": width, "height": height})
                    page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                    assert page.evaluate("document.documentElement.scrollWidth === innerWidth && document.documentElement.scrollHeight <= innerHeight"), (route, width, percent)
                    assert main.evaluate("e => e.scrollWidth <= e.clientWidth"), (route, width, percent)
                    assert main.bounding_box()["height"] > 0
                    for control in [help_link, *nav.get_by_role("link").all()]:
                        box = control.bounding_box()
                        assert box["height"] >= 44 and box["width"] >= 44, (route, box)
                        assert box["y"] >= 0 and box["y"] + box["height"] <= height, (route, width, percent, box)
                        assert control.evaluate("e => { const r = e.getBoundingClientRect(); return e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }"), (route, width, percent, "control tapado")
                    before = [help_link.bounding_box(), nav.bounding_box()]
                    main.evaluate("e => e.scrollTop = e.scrollHeight")
                    assert [help_link.bounding_box(), nav.bounding_box()] == before
                    assert main.evaluate("e => e.scrollTop + e.clientHeight >= e.scrollHeight - 1")
            page.evaluate("document.documentElement.style.fontSize = '100%'")
            help_link.click()
            page.wait_for_url(base + "/ayuda")
            expect(page.get_by_role("heading", name="Ayuda ahora", exact=True)).to_be_visible()
            assert page.reload(wait_until="networkidle").status == 200
            assert page.locator('a[href^="tel:"]').evaluate_all("links => links.map(a => a.getAttribute('href'))") == ["tel:135", "tel:08003451435", "tel:08009990091"]

        page.goto(base + "/", wait_until="networkidle")
        page.set_viewport_size({"width": 390, "height": 844})
        insets = page.add_style_tag(content=".app-shell {padding-inline: 20px} .app-header {padding-top: 44px} .app-navigation {padding-bottom: 34px}")
        assert page.get_by_role("link", name="Ayuda ahora", exact=True).bounding_box()["y"] >= 44
        assert nav.bounding_box()["y"] + nav.bounding_box()["height"] == 844
        main_box = page.locator("#contenido").bounding_box()
        assert main_box["height"] > 0 and main_box["y"] + main_box["height"] <= nav.bounding_box()["y"]
        insets.evaluate("e => e.remove()")
        assert page.get_by_role("link", name="Ayuda ahora", exact=True).evaluate("e => { const r = e.getBoundingClientRect(); return e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }")
        page.keyboard.press("Tab")
        skip = page.get_by_role("link", name="Ir al contenido")
        assert skip.evaluate("e => e === document.activeElement")
        page.keyboard.press("Enter")
        assert page.locator("#contenido").evaluate("e => e === document.activeElement")
        page.get_by_role("heading", level=1).click()
        page.goto(base + "/tokens", wait_until="networkidle")
        page.set_viewport_size({"width": 1280, "height": 900})
        shell = page.locator(".app-shell").bounding_box()
        assert shell["width"] == 520 and shell["x"] == (1280 - 520) / 2
        page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-52-tokens.png"), full_page=True)
        # Capturar desde un contexto limpio después de la secuencia de zoom e insets.
        static_page = browser.new_page(java_script_enabled=False, viewport={"width": 390, "height": 844})
        assert static_page.goto(base + "/hoy").status == 200
        static_page.get_by_role("link", name="Ayuda ahora", exact=True).click()
        static_page.wait_for_url(base + "/ayuda")
        assert static_page.locator('a[href="tel:135"]').count() == 1
        static_page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-61-ayuda.png"))
        static_page.get_by_role("navigation").get_by_role("link", name="Registrar", exact=True).click()
        static_page.wait_for_url(base + "/")
        static_page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-61-layout.png"))
        static_page.close()
        # ANI-63: controles nativos y un único borrador entre pasos y Ayuda.
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(base + "/", wait_until="networkidle")
        page.get_by_role("link", name="Empezar registro").click()
        page.wait_for_url(base + "/registro/tipo")
        expect(page.get_by_role("button", name="Siguiente", exact=True)).to_be_disabled()
        labels = ["Mañana", "Tarde", "Noche", "Registro libre"]
        assert page.get_by_role("radio").count() == 4
        for label in labels:
            radio = page.get_by_role("radio", name=label, exact=True)
            radio.click()
            expect(radio).to_be_checked()
        page.get_by_role("radio", name="Mañana", exact=True).focus()
        page.keyboard.press("Space")
        for label in labels[1:] + labels[:1]:
            page.keyboard.press("ArrowRight")
            expect(page.get_by_role("radio", name=label, exact=True)).to_be_checked()
        page.keyboard.press("Tab")
        expect(page.get_by_role("button", name="Siguiente", exact=True)).to_be_focused()
        page.keyboard.press("Enter")
        page.wait_for_url(base + "/registro/animo")
        expect(page.get_by_role("heading", level=1)).to_be_focused()
        slider = page.get_by_role("slider", name="Estado de ánimo")
        expect(slider).to_have_value("4")
        box = slider.bounding_box()
        slider.click(position={"x": box["width"] - 2, "y": box["height"] / 2})
        expect(slider).to_have_value("7")
        slider.press("Home")
        moods = ["Muy desagradable", "Desagradable", "Algo desagradable", "Neutral", "Algo agradable", "Agradable", "Muy agradable"]
        shapes, accents = [], []
        for value, label in enumerate(moods, 1):
            expect(slider).to_have_value(str(value))
            expect(slider).to_have_attribute("aria-valuetext", f"{label}, {value} de 7")
            expect(page.get_by_role("status")).to_have_text(label)
            shapes.append(page.locator("section svg path").first.get_attribute("d"))
            accents.append(page.locator("section svg").evaluate("e => getComputedStyle(e).color"))
            slider.press("ArrowRight")
        expect(slider).to_have_value("7")
        assert len(set(shapes)) == len(set(accents)) == 7
        slider.press("Home")
        slider.press("ArrowLeft")
        expect(slider).to_have_value("1")
        slider.press("End")
        slider.press("ArrowLeft")
        expect(slider).to_have_value("6")
        assert slider.evaluate("e => parseFloat(getComputedStyle(e).outlineWidth)") > 0
        for width, height in [(320, 568), (390, 844), (844, 390), (1280, 900)]:
            for percent in [100, 200]:
                page.set_viewport_size({"width": width, "height": height})
                page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                assert page.locator("#contenido").evaluate("e => e.scrollWidth <= e.clientWidth"), (width, percent)
                slider.scroll_into_view_if_needed()
                assert slider.bounding_box()["height"] >= 44
        page.evaluate("document.documentElement.style.fontSize = '100%'")
        page.set_viewport_size({"width": 390, "height": 844})
        page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-63-animo.png"))
        page.get_by_role("link", name="Siguiente", exact=True).click()
        page.wait_for_url(base + "/registro/emocion")
        expect(page.get_by_role("status")).to_contain_text("El catálogo de emociones todavía no está disponible")
        page.go_back()
        page.wait_for_url(base + "/registro/animo")
        expect(slider).to_have_value("6")
        page.reload(wait_until="networkidle")
        expect(slider).to_have_value("6")
        page.get_by_role("link", name="Ayuda ahora", exact=True).click()
        page.wait_for_url(base + "/ayuda")
        page.go_back()
        page.wait_for_url(base + "/registro/animo")
        expect(slider).to_have_value("6")
        page.get_by_role("link", name="Volver", exact=True).click()
        page.wait_for_url(base + "/registro/tipo")
        expect(page.get_by_role("radio", name="Mañana", exact=True)).to_be_checked()
        page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-63-tipo.png"))
        page.get_by_role("radio", name="Noche", exact=True).click()
        page.get_by_role("button", name="Volver", exact=True).click()
        page.keyboard.press("Escape")
        expect(page.get_by_role("button", name="Volver", exact=True)).to_be_focused()
        page.get_by_role("button", name="Siguiente", exact=True).click()
        page.wait_for_url(base + "/registro/animo")
        expect(slider).to_have_value("6")
        page.go_back()
        page.wait_for_url(base + "/registro/tipo")
        expect(page.get_by_role("radio", name="Noche", exact=True)).to_be_checked()
        page.go_forward()
        page.wait_for_url(base + "/registro/animo")
        expect(slider).to_have_value("6")
        page.get_by_role("button", name="Cerrar registro").click()
        expect(page.get_by_role("dialog")).to_be_visible()
        expect(page.get_by_role("button", name="Seguir registrando")).to_be_focused()
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).not_to_be_visible()
        expect(page.get_by_role("button", name="Cerrar registro")).to_be_focused()
        expect(slider).to_have_value("6")
        page.get_by_role("button", name="Cerrar registro").click()
        page.get_by_role("button", name="Descartar registro").click()
        page.wait_for_url(base + "/")
        assert page.evaluate("sessionStorage.getItem('eudila-draft-v1')") is None
        page.get_by_role("link", name="Empezar registro").click()
        page.wait_for_url(base + "/registro/tipo")
        expect(page.get_by_role("button", name="Siguiente", exact=True)).to_be_disabled()
        # Entradas directas y restauración validada, conservando campos de pasos posteriores.
        page.evaluate("sessionStorage.setItem('eudila-draft-v1', JSON.stringify({type:'tarde',mood:5,emotionId:'e1',factors:['f1']}))")
        page.goto(base + "/registro/animo", wait_until="networkidle")
        expect(slider).to_have_value("5")
        slider.press("ArrowLeft")
        stored = page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1'))")
        assert stored == {"type": "tarde", "mood": 4, "emotionId": "e1", "factors": ["f1"]}
        page.evaluate("sessionStorage.setItem('eudila-draft-v1', '{invalid')")
        page.reload(wait_until="networkidle")
        expect(slider).to_have_value("4")
        page.evaluate("sessionStorage.setItem('eudila-draft-v1', JSON.stringify({type:'fake',mood:99,factors:[]}))")
        page.reload(wait_until="networkidle")
        expect(slider).to_have_value("4")
        assert page.goto(base + "/registro/no-existe", wait_until="networkidle").status == 404
        blocked_context = browser.new_context()
        blocked_context.add_init_script("for (const method of ['getItem','setItem','removeItem']) Storage.prototype[method] = () => { throw new DOMException('Blocked', 'SecurityError'); };")
        blocked = blocked_context.new_page()
        blocked.on("pageerror", lambda error: errors.append(str(error)))
        blocked.goto(base + "/registro/tipo", wait_until="networkidle")
        expect(blocked.get_by_role("status")).to_contain_text("no podemos conservarlo")
        blocked.get_by_role("radio", name="Registro libre", exact=True).click()
        blocked.get_by_role("button", name="Siguiente", exact=True).click()
        blocked.wait_for_url(base + "/registro/animo")
        blocked.get_by_role("slider").press("End")
        blocked.get_by_role("link", name="Ayuda ahora", exact=True).click()
        blocked.wait_for_url(base + "/ayuda")
        blocked.go_back()
        blocked.wait_for_url(base + "/registro/animo")
        expect(blocked.get_by_role("slider")).to_have_value("7")
        blocked.get_by_role("button", name="Cerrar registro").click()
        blocked.get_by_role("button", name="Descartar registro").click()
        blocked.wait_for_url(base + "/")
        blocked_context.close()
        assert not errors, errors
        browser.close()
        print(f"ANI-52: {len(defined)} tokens cubiertos, 15 pares AA (mínimo {min(ratios):.2f}:1), tema compartido, teclado y 16 combinaciones responsive correctos.")
        print("ANI-61: 3 secciones, mouse/teclado, historia, ayuda en 9 rutas y 90 combinaciones responsive correctos.")
        print("ANI-63: cuatro tipos, siete ánimos, mouse/teclado, semántica accesible, rutas, recarga, ayuda, descarte y almacenamiento bloqueado correctos.")
finally:
    if server:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()
