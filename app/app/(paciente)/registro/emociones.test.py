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

project = next(p for p in Path(__file__).resolve().parents if (p / "next.config.mjs").exists())
seeds = json.loads((project.parent / "packages/domain/catalog/catalogo-v1.json").read_text())
paths = json.loads((project.parent / "packages/domain/catalog/rueda-emociones.json").read_text())
names = {row["id"]: row["nombre"] for row in seeds["emociones"]}
artifacts = project.parent / "docs/design/evidence/rueda-emociones-2026-10-27"
artifacts.mkdir(parents=True, exist_ok=True)
with socket.socket() as listener:
    listener.bind(("127.0.0.1", 0))
    port = listener.getsockname()[1]
base = f"http://127.0.0.1:{port}"
with tempfile.TemporaryFile() as log:
    server = subprocess.Popen(
        ["node", str(project.parent / "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", str(port)],
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
            page.get_by_role("slider").fill("1")
            page.get_by_role("link", name="Siguiente", exact=True).click()
            quick = page.get_by_role("group", name="Emociones sugeridas")
            expect(quick.get_by_role("button")).to_have_count(3)
            assert quick.get_by_role("button").all_text_contents() == ["Tristeza", "Enfado", "Miedo"]
            page.get_by_role("button", name="Ver todas las emociones").click()
            page.get_by_role("searchbox").fill("alegr")
            expect(page.get_by_role("dialog").get_by_role("status")).to_have_text("No hay resultados para esa búsqueda.")
            page.keyboard.press("Escape")
            page.get_by_role("link", name="Cambiar ánimo", exact=True).click()
            page.get_by_role("slider").fill("4")
            page.get_by_role("link", name="Siguiente", exact=True).click()
            expect(quick.get_by_role("button")).to_have_count(6)
            for width, height in [(320, 568), (390, 844), (520, 900)]:
                page.set_viewport_size({"width": width, "height": height})
                page.locator("main").evaluate("e => e.scrollTop = 0")
                quick.evaluate("async e => Promise.all(e.getAnimations({subtree: true}).map(animation => animation.finished))")
                bounds = quick.get_by_role("button").evaluate_all("items => items.map(e => {const r = e.getBoundingClientRect(), main = e.closest('main').getBoundingClientRect(); return {top: r.top, bottom: r.bottom, mainTop: main.top, mainBottom: main.bottom};})")
                assert all(item["top"] >= item["mainTop"] and item["bottom"] <= item["mainBottom"] and item["bottom"] - item["top"] >= 44 for item in bounds), f"Sugerencias visibles y táctiles a {width}px: {bounds}"
            page.set_viewport_size({"width": 390, "height": 844})
            page.emulate_media(reduced_motion="reduce")
            page.screenshot(path=str(artifacts / "familias.png"), animations="disabled")
            # Las 36 ramas llegan al sentimiento exterior solo por elección explícita.
            for family_id, emotion_id, feeling_id in paths:
                family, emotion, feeling = [names[key] for key in [family_id, emotion_id, feeling_id]]
                quick.get_by_role("button", name=family, exact=True).click()
                related = page.get_by_role("group", name="Emociones relacionadas")
                expect(related.get_by_role("button")).to_have_count(18 if family in ["Calma", "Felicidad", "Fuerza"] else 6)
                expect(page.get_by_role("link", name="Siguiente", exact=True)).to_have_count(0)
                expect(page.get_by_role("heading", level=2)).to_be_focused()
                if emotion == "Preocupado":
                    page.screenshot(path=str(artifacts / "emociones.png"), animations="disabled")
                related.get_by_role("button", name=emotion, exact=True).click()
                assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") == emotion_id
                final = page.get_by_role("group", name="Sentimientos relacionados")
                expect(final.get_by_role("button")).to_have_text([names[route[2]] for route in paths if route[0] == family_id])
                expect(page.get_by_role("link", name="Siguiente", exact=True)).to_have_count(0)
                if feeling == "Excluido":
                    page.screenshot(path=str(artifacts / "sentimiento.png"), animations="disabled")
                final.get_by_role("button", name=feeling, exact=True).click()
                expect(final.get_by_role("button", name=feeling, exact=True)).to_have_attribute("aria-pressed", "true")
                assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") == feeling_id
                expect(page.get_by_role("link", name="Siguiente", exact=True)).to_be_visible()
                page.get_by_role("button", name="Cambiar " + family, exact=True).click()
                assert page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1')).emotionId") is None
            # Restauración del nivel, corrección del matiz y conservación al cambiar ánimo.
            for name in ["Miedo", "Preocupado", "Excluido"]:
                page.get_by_role("button", name=name, exact=True).click()
            page.reload()
            expect(page.get_by_role("navigation", name="Tu recorrido emocional")).to_contain_text("Excluido")
            page.get_by_role("button", name="Cambiar Excluido", exact=True).click()
            expect(page.get_by_role("link", name="Siguiente", exact=True)).to_have_count(0)
            page.get_by_role("button", name="Excluido", exact=True).click()
            page.get_by_role("link", name="Cambiar ánimo", exact=True).click()
            page.get_by_role("slider").fill("6")
            page.get_by_role("link", name="Siguiente", exact=True).click()
            expect(page.get_by_role("navigation", name="Tu recorrido emocional")).to_have_count(0)
            expect(quick.get_by_role("button")).to_have_text(["Calma", "Felicidad", "Fuerza"])
            page.get_by_role("link", name="Cambiar ánimo", exact=True).click()
            page.get_by_role("slider").fill("4")
            page.get_by_role("link", name="Siguiente", exact=True).click()
            for name in ["Miedo", "Preocupado", "Excluido"]:
                page.get_by_role("button", name=name, exact=True).click()
            primary = page.get_by_role("link", name="Siguiente", exact=True)
            assert primary.evaluate("e => e.getBoundingClientRect().height >= 50 && parseFloat(getComputedStyle(e).borderRadius) >= e.getBoundingClientRect().height / 2")
            primary.click()
            page.get_by_role("link", name="Revisar registro", exact=True).click()
            expect(page.locator("dl")).to_contain_text("Miedo → Preocupado → Excluido")
            page.screenshot(path=str(artifacts / "revision.png"), animations="disabled")
            page.get_by_role("link", name="Cambiar emoción", exact=True).click()
            # Reflujo también con las tres etiquetas de la rueda visibles.
            for width in [320, 390]:
                for percent in [100, 200]:
                    page.set_viewport_size({"width": width, "height": 844})
                    page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                    assert page.locator("main").evaluate("e => e.scrollWidth <= e.clientWidth")
            page.evaluate("document.documentElement.style.fontSize = '100%'")
            page.set_viewport_size({"width": 390, "height": 844})
            opener = page.get_by_role("button", name="Ver todas las emociones")
            opener.focus()
            page.keyboard.press("Enter")
            dialog = page.get_by_role("dialog", name="Todas las emociones")
            search = page.get_by_role("searchbox", name="Buscar emoción")
            expect(search).to_be_focused()
            assert dialog.get_by_role("heading").evaluate("e => getComputedStyle(e).fontFamily.toLowerCase().includes('figtree') && getComputedStyle(e).fontWeight === '700'"), "El título debe usar Figtree Bold"
            expect(dialog.locator('button[aria-pressed]')).to_have_count(81)
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
            search.fill("EXCLUIDO")
            expect(dialog.locator('button[aria-pressed]')).to_have_count(1)
            expect(dialog.locator('button[aria-pressed]')).to_have_text("Excluido")
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
            expect(page.get_by_role("status").filter(has_text="Ingresá a tu cuenta")).to_contain_text("Ingresá a tu cuenta para guardar el registro")
            assert page.get_by_role("button", name="Guardar en vista previa").count() == 0
            assert page.evaluate("sessionStorage.getItem('eudila-preview-records-v1')") is None
            page.goto(base + "/exportar")
            expect(page.locator("main")).to_contain_text("Ingresá a tu cuenta para exportar tus registros")
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
            expect(quick.get_by_role("button")).to_have_count(0)
            expect(page.get_by_role("status").filter(has_text="Faltan opciones")).to_be_visible()
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
                ["node", str(project.parent / "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", str(port)],
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
            print("Rueda: 36 ramas, 96 opciones, filtro por ánimo, niveles/volver/recarga, revisión, REST, alternativas/UUID, búsqueda, teclado/foco, reflujo, errores/reintento, catálogo parcial, storage bloqueado y ausencia de configuración correctos")
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
