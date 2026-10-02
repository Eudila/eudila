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

from playwright.sync_api import sync_playwright


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
        # El scaffold todavía no define favicon; comprobar los errores de la app.
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" and not message.location["url"].endswith("/favicon.ico") else None)
        assert page.goto(base + "/tokens", wait_until="networkidle").status == 200
        assert page.title() == "Identidad visual · eudila"
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

        assert not errors, errors
        page.set_viewport_size({"width": 1280, "height": 900})
        page.screenshot(path=str(Path(tempfile.gettempdir()) / "eudila-ani-52-tokens.png"), full_page=True)
        browser.close()
        print(f"ANI-52: {len(defined)} tokens cubiertos, 15 pares AA (mínimo {min(ratios):.2f}:1), tema compartido, teclado y 16 combinaciones responsive correctos.")
finally:
    if server:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()
