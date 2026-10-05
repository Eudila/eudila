# SPDX-License-Identifier: AGPL-3.0-only
"""BRAND_BASE_URL=http://127.0.0.1:3130 uv run --with playwright python app/brand/brand.test.py"""
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


project = Path(__file__).resolve().parents[2]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=project))
Thread(target=server.serve_forever, daemon=True).start()
prototype = f"http://127.0.0.1:{server.server_port}/prototype/"
base = os.environ.get("BRAND_BASE_URL", "http://127.0.0.1:3130").rstrip("/")
artifacts = Path(os.environ["BRAND_ARTIFACT_DIR"]) if os.environ.get("BRAND_ARTIFACT_DIR") else None
if artifacts:
    artifacts.mkdir(parents=True, exist_ok=True)
results = {}
track = """window.introStarts=0;
const animate=Element.prototype.animate;
Element.prototype.animate=function(...args) {
  const animation=animate.apply(this,args);
  if(this.matches('.home-orb')) {
    window.introStarts++;
    window.introAnimation=animation;
    if(window.pauseIntro) animation.pause();
  }
  return animation;
};"""
normalize = r"""e => {
  const ids=[...e.querySelectorAll('[id]')].map(n=>n.id);
  function clean(value) {
    ids.forEach((id,i)=>value=value.split(id).join('shared-'+i));
    return /^-?\d*\.?\d+$/.test(value) ? String(Number(value)) : value;
  }
  function tree(node) {
    const attrs=[...node.attributes].map(a=>[a.name,
      a.name==='style' ? Array.from(node.style).sort().map(k=>[k,node.style.getPropertyValue(k).trim()]) : clean(a.value)]);
    return {tag:node.tagName,attrs:attrs.sort(([a],[b])=>a.localeCompare(b)),children:[...node.children].map(tree)};
  }
  return [...e.children].map(tree);
}"""
styles = """e => {
  const s=getComputedStyle(e);
  return {color:s.color,background:s.backgroundColor,radius:s.borderRadius,
    weight:s.fontWeight,outline:s.outlineColor};
}"""

def contrast(first, second):
    def lum(rgb):
        return sum((c / 255 / 12.92 if c / 255 <= .04045 else ((c / 255 + .055) / 1.055) ** 2.4) * weight for c, weight in zip(rgb, [.2126, .7152, .0722]))
    low, high = sorted([lum(first), lum(second)])
    return (high + .05) / (low + .05)

color_pair = """e=>{
  const s=getComputedStyle(e), c=document.createElement('canvas').getContext('2d');
  return [s.color,s.backgroundColor].map(v=>{c.clearRect(0,0,1,1);c.fillStyle=v;c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data].slice(0,3)});
}"""

try:
    with sync_playwright() as p:
        for engine in os.environ.get("BRAND_ENGINES", "chromium,webkit,firefox").split(","):
            chrome = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
            browser = getattr(p, engine).launch(**({"executable_path": str(chrome)} if engine == "chromium" and chrome.exists() else {}))
            findings = {"entry": {}, "parity": [], "reflow": []}
            errors = []

            def home(reduced="no-preference", pause=True, setup="", route="/"):
                page = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion=reduced)
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.add_init_script(track + f"window.pauseIntro={str(pause).lower()};" + setup)
                page.goto(base + route, wait_until="networkidle")
                return page

            def static(page):
                page.wait_for_function("document.querySelector('.home-orb').getAnimations({subtree:true}).length===0")
                assert page.locator(".home-orb").evaluate("e=>getComputedStyle(e).opacity") == "1"

            if os.environ.get("BRAND_CHECK", "all") != "parity":
                page = home()
                assert page.locator(".home-orb").count() == 1, "Next.js / todavía no tiene símbolo de marca"
                assert page.evaluate("introStarts") == 1
                duration = page.evaluate("introAnimation.effect.getTiming().duration")
                assert duration == 600
                assert page.get_by_role("link", name="Empezar registro").is_visible()
                assert page.get_by_role("link", name="Ayuda ahora").is_visible()
                assert page.locator(".home-orb svg").get_attribute("aria-hidden") == "true"
                assert page.locator(".home-orb svg radialGradient").count() == 3
                assert page.locator(".home-orb .orb-particle").count() == 0
                findings["entry"]["action_contrast"] = contrast(*page.get_by_role("link", name="Empezar registro").evaluate(color_pair))
                assert findings["entry"]["action_contrast"] >= 4.5
                page.keyboard.press("Tab")
                static(page)
                assert page.locator(":focus-visible").count() == 1
                page.get_by_role("link", name="Ayuda ahora").click()
                page.wait_for_url(base + "/ayuda")
                page.go_back()
                static(page)
                assert page.evaluate("introStarts") == 1
                page.reload(wait_until="networkidle")
                static(page)
                assert page.evaluate("introStarts") == 0
                page.close()

                page = home()
                page.get_by_role("link", name="Empezar registro").click()
                page.wait_for_url(base + "/registro/tipo")
                assert page.evaluate("introAnimation.playState") == "idle"
                page.close()

                for reduced, setup in [
                    ("reduce", ""),
                    ("no-preference", "Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}});"),
                    ("no-preference", "Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});"),
                ]:
                    page = home(reduced=reduced, setup=setup)
                    assert page.evaluate("introStarts") == 0
                    static(page)
                    page.get_by_role("link", name="Empezar registro").click()
                    page.wait_for_url(base + "/registro/tipo")
                    page.close()

                for change in ["media", "hidden", "pointer"]:
                    page = home()
                    if change == "media":
                        page.emulate_media(reduced_motion="reduce")
                    elif change == "hidden":
                        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
                    else:
                        page.locator(".home-orb").click()
                    static(page)
                    page.close()

                page = home(pause=False)
                static(page)
                findings["entry"].update({"duration_ms": duration, "once_per_session": True, "skip": ["pointer", "keyboard", "navigation", "visibility", "reduced-motion"], "no_block": True})
                page.close()

                # Arriving through a different route consumes the first visit too.
                page = home(route="/ayuda")
                page.get_by_role("navigation", name="Secciones").get_by_role("link", name="Registrar", exact=True).click()
                page.wait_for_url(base + "/")
                static(page)
                assert page.evaluate("introStarts") == 0
                page.close()

                page = browser.new_page(java_script_enabled=False, viewport={"width": 390, "height": 844})
                page.goto(base + "/")
                assert page.locator(".home-orb .orb-core").count() == 1
                page.get_by_role("link", name="Empezar registro").click()
                assert page.url.endswith("/registro/tipo")
                page.get_by_role("link", name="Ayuda ahora").click()
                assert page.url.endswith("/ayuda")
                page.close()

                for width in [320, 390, 520]:
                    for height in [844, 470]:
                        for percent in [100, 200]:
                            page = home(reduced="reduce")
                            page.set_viewport_size({"width": width, "height": height})
                            page.evaluate(f"document.documentElement.style.fontSize='{percent}%'")
                            assert page.evaluate("document.documentElement.scrollWidth===innerWidth"), (engine, width, percent)
                            for label in ["Empezar registro", "Ayuda ahora"]:
                                target = page.get_by_role("link", name=label)
                                target.scroll_into_view_if_needed()
                                assert target.bounding_box()["height"] >= 44
                            assert page.locator(".home-orb").bounding_box()["width"] == 104
                            findings["reflow"].append([width, height, percent])
                            if artifacts and height == 844 and (width == 390 and percent == 100 or width == 320 and percent == 200):
                                page.locator(".home-orb").scroll_into_view_if_needed()
                                page.screenshot(path=str(artifacts / f"home-{engine}-{width}-{percent}.png"), full_page=True)
                            page.close()

            if os.environ.get("BRAND_CHECK", "all") != "intro":
                next_page = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
                proto_page = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce", service_workers="block")
                for page in [next_page, proto_page]:
                    page.on("pageerror", lambda error: errors.append(str(error)))
                next_page.goto(base + "/registro/animo")
                proto_page.goto(prototype + "#/registro/animo")
                next_slider = next_page.get_by_role("slider")
                proto_slider = proto_page.get_by_role("slider")
                expect(next_slider).to_be_visible()
                expect(proto_slider).to_be_visible()
                assert proto_slider.get_attribute("step") == "any", "El prototipo aún cuantiza el slider en siete puntos"
                for position in [1, 2, 3, 4, 4.25, 4.8, 5, 5.25, 6, 7]:
                    next_slider.fill(str(position))
                    proto_slider.fill(str(position))
                    # Observe the painted state; Chromium resolves SVG currentColor
                    # from inherited custom properties during the next paint.
                    for page in [next_page, proto_page]:
                        page.evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))")
                    left = next_page.locator(".mood-orb")
                    right = proto_page.locator(".mood-orb")
                    assert left.evaluate(normalize) == right.evaluate(normalize), (engine, position, "renderers distintos")
                    next_color = left.evaluate("e=>getComputedStyle(e).color")
                    proto_color = right.evaluate("e=>getComputedStyle(e).color")
                    assert next_color == proto_color, (engine, position, next_color, proto_color)
                    a = next_page.locator(".mood-screen > .action-primary")
                    b = proto_page.locator(".mood-screen .action-primary")
                    assert a.evaluate(styles) == b.evaluate(styles), (engine, position, "variantes distintas")
                    ratio = contrast(*a.evaluate(color_pair))
                    assert ratio >= 4.5
                    assert next_slider.get_attribute("aria-valuetext") == proto_slider.get_attribute("aria-valuetext")
                    assert next_slider.evaluate("e=>getComputedStyle(e,'::-webkit-slider-thumb').backgroundColor") == proto_slider.evaluate("e=>getComputedStyle(e,'::-webkit-slider-thumb').backgroundColor")
                    palette = left.evaluate("e=>Array.from({length:7},(_,i)=>getComputedStyle(e).getPropertyValue('--color-mood-'+(i+1)).trim())")
                    assert palette == right.evaluate("e=>Array.from({length:7},(_,i)=>getComputedStyle(e).getPropertyValue('--color-mood-'+(i+1)).trim())")
                    findings["parity"].append({"position": position, "material_and_geometry": True, "action": a.evaluate(styles), "contrast": ratio, "palette": palette})
                    if artifacts and engine == "chromium" and position == int(position):
                        next_page.screenshot(path=str(artifacts / f"next-{engine}-{position}.png"), full_page=True)
                        proto_page.screenshot(path=str(artifacts / f"prototype-{engine}-{position}.png"), full_page=True)

                # Animations keep their cycles and nodes while an uninterrupted drag crosses states.
                for page in [next_page, proto_page]:
                    page.emulate_media(reduced_motion="no-preference")
                    turns = page.locator(".orb-turn")
                    assert turns.count() == 5
                    assert all(abs(float(t[:-1]) - 125.663706) < .01 for t in turns.evaluate_all("es=>es.map(e=>getComputedStyle(e).animationDuration)"))
                    assert turns.evaluate_all("es=>es.map(e=>getComputedStyle(e).animationDirection)") == ["normal", "reverse", "normal", "reverse", "normal"]
                    slider = page.get_by_role("slider")
                    slider.press("Home")
                    expect(slider).to_have_value("1")
                    slider.press("End")
                    expect(slider).to_have_value("7")
                    page.wait_for_function("document.querySelector('.app-shell').dataset.moodTransition==='idle'")
                    page.evaluate("window.firstOrbLayer=document.querySelector('.orb-layer');window.firstOrbRotation=document.querySelector('.orb-turn').getAnimations()[0]")
                    box = slider.bounding_box()
                    start = box["x"] + 15
                    y = box["y"] + box["height"] / 2
                    page.mouse.move(start, y)
                    page.mouse.down()
                    positions = []
                    for i in range(31):
                        page.mouse.move(start + i / 30 * (box["width"] - 30), y)
                        page.wait_for_timeout(20)
                        positions.append(float(slider.input_value()))
                    page.mouse.up()
                    assert len(set(positions)) > 25
                    assert page.evaluate("firstOrbLayer===document.querySelector('.orb-layer')&&firstOrbRotation===document.querySelector('.orb-turn').getAnimations()[0]"), "Se recrean nodos/rotación al arrastrar"
                    slider.fill("5")
                    page.wait_for_timeout(700)
                    before = page.locator(".orb-layer").first.get_attribute("d")
                    page.wait_for_timeout(250)
                    assert page.locator(".orb-layer").first.get_attribute("d") != before
                    page.emulate_media(reduced_motion="reduce")
                    page.wait_for_function("document.querySelector('.app-shell').dataset.motion==='reduced'")
                    assert turns.evaluate_all("es=>es.map(e=>getComputedStyle(e).animationName)") == ["none"] * 5
                next_page.close()
                proto_page.close()

                # Compact is the same material, without the scene's particles or cycles.
                page = home(reduced="reduce")
                proto_page = browser.new_page(reduced_motion="reduce", service_workers="block")
                proto_page.goto(prototype)
                assert page.locator(".home-orb svg").evaluate(normalize) == proto_page.locator(".home-orb svg").evaluate(normalize)
                assert page.locator(".home-orb .orb-turn").evaluate_all("es=>es.map(e=>getComputedStyle(e).animationName)") == ["none"] * 5
                page.close()
                proto_page.close()

                # Real Next.js history uses the compact variant at 24 and 48px.
                context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="no-preference")
                context.add_init_script("""sessionStorage.setItem('eudila-preview-records-v1', JSON.stringify(Array.from({length:7},(_,i)=>({
                    id:'brand-'+i,recordedAt:new Date().toISOString(),type:'libre',mood:i+1,
                    emotion:{id:'brand-calm',nombre:'Calma'},factors:[],source:'preview'
                }))));""")
                page = context.new_page()
                page.goto(base + "/hoy")
                expect(page.get_by_role("heading", name="Registros del día")).to_be_visible()
                compact = page.locator('section[aria-labelledby="records-title"] .orb-scene')
                assert compact.count() == 7
                for orb in compact.all():
                    assert orb.locator("radialGradient").count() == 3
                    assert orb.locator(".orb-layer").count() == 5
                    assert orb.locator(".orb-core").get_attribute("r") == "12"
                    assert orb.get_attribute("data-animated") is None
                    assert orb.locator("filter, .orb-particle").count() == 0
                    assert orb.bounding_box()["width"] >= 24
                    assert orb.evaluate("e=>e.getAnimations({subtree:true}).length") == 0
                assert page.locator(".app-shell").get_attribute("data-mood") is None
                findings["compact"] = {"seven_levels": True, "minimum_px": 24, "same_material": True, "static": True, "neutral_history": True}
                if artifacts and engine == "chromium":
                    page.screenshot(path=str(artifacts / "history-compact-chromium.png"), full_page=True)
                context.close()

            assert not errors, (engine, errors)
            results[engine] = findings
            browser.close()
            print(f"PASS {engine}: entrada, {len(findings['reflow'])} reflows, {len(findings['parity'])} posiciones de paridad, compacto", flush=True)
    if artifacts:
        (artifacts / "measurements.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print("ANI-115/118: comprobaciones de marca completas")
finally:
    server.shutdown()
    server.server_close()
