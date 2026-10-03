# SPDX-License-Identifier: AGPL-3.0-only
"""Generar artefactos de ANI-82 desde un build real servido localmente.

TECHWEEK_BASE_URL=http://localhost:3068 uv run --with playwright --with qrcode --with pillow --with opencv-python-headless --with pypdf python docs/techweek/preparar.py
Requiere ffmpeg y Chrome (o Chromium de Playwright). No escribe datos de demo en la app.
"""
from pathlib import Path
from time import monotonic
import json
import os
import subprocess
import tempfile

import cv2
import qrcode
from pypdf import PdfReader
from playwright.sync_api import sync_playwright, expect

out = Path(__file__).resolve().parent
base = os.environ.get("TECHWEEK_BASE_URL", "http://localhost:3068").rstrip("/")
repo = "https://github.com/Eudila/eudila"
qrcode.make(repo).save(out / "qr-repo.png")
assert cv2.QRCodeDetector().detectAndDecode(cv2.imread(str(out / "qr-repo.png")))[0] == repo

with tempfile.TemporaryDirectory() as video_dir, sync_playwright() as p:
    chrome = os.environ.get("CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    browser = p.chromium.launch(**({"executable_path": chrome} if Path(chrome).exists() else {}))
    context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, reduced_motion="reduce", record_video_dir=video_dir, record_video_size={"width": 390, "height": 844})
    page = context.new_page()
    video = page.video
    started = monotonic()
    page.set_content('<html lang="es"><body style="margin:0;padding:30px;font:22px/1.5 sans-serif;color:#1d1d1f;background:#fbfbfd"><h1>eudila</h1><p>Prototipo real · 03/10/2026</p><p>Tipo, ánimo, borrador y ayuda.</p><p>Catálogo aprobado, guardado e historial pendientes.</p></body></html>')
    page.wait_for_timeout(5000)
    page.goto(base + "/", wait_until="networkidle")
    page.screenshot(path=str(out / "inicio.png"))
    page.wait_for_timeout(5000)
    page.get_by_role("link", name="Empezar registro").click()
    page.wait_for_url(base + "/registro/tipo")
    page.get_by_role("radio", name="Mañana", exact=True).check()
    page.wait_for_timeout(5000)
    page.get_by_role("button", name="Siguiente", exact=True).click()
    page.wait_for_url(base + "/registro/animo")
    expect(page.locator("#mood-range")).to_have_value("4")
    page.screenshot(path=str(out / "animo.png"))
    page.wait_for_timeout(5000)
    page.locator("#mood-range").focus()
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(3000)
    page.keyboard.press("ArrowLeft")
    page.get_by_role("link", name="Siguiente", exact=True).click()
    page.wait_for_url(base + "/registro/emocion")
    expect(page.get_by_role("status")).to_contain_text("todavía no está disponible")
    page.screenshot(path=str(out / "emocion-pendiente.png"))
    page.wait_for_timeout(6000)
    page.get_by_role("link", name="Volver", exact=True).click()
    page.wait_for_url(base + "/registro/animo")
    expect(page.locator("#mood-range")).to_have_value("4")
    page.wait_for_timeout(4000)
    page.get_by_role("link", name="Ayuda ahora").click()
    page.wait_for_url(base + "/ayuda")
    expect(page.locator('a[href="tel:135"]')).to_have_count(1)
    page.screenshot(path=str(out / "ayuda.png"))
    page.wait_for_timeout(8000)
    page.locator("#contenido").evaluate("e => e.scrollTop = e.scrollHeight")
    page.wait_for_timeout(5000)
    page.go_back()
    page.wait_for_url(base + "/registro/animo")
    expect(page.locator("#mood-range")).to_have_value("4")
    page.wait_for_timeout(max(0, int((61 - (monotonic() - started)) * 1000)))
    context.close()
    # MP4 H.264 compatible con reproducción local en teléfonos.
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video.path(), "-t", "60", "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-r", "25", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out / "demo-60s.mp4")], check=True)
    page = browser.new_page()
    page.goto((out / "one-pager.html").as_uri(), wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    assert page.locator("img").evaluate_all("es => es.every(e => e.complete && e.naturalWidth > 0)")
    page.pdf(path=str(out / "one-pager-borrador.pdf"), format="A4", print_background=True, prefer_css_page_size=True)
    browser.close()

pdf = PdfReader(out / "one-pager-borrador.pdf")
assert len(pdf.pages) == 1, len(pdf.pages)
assert abs(float(pdf.pages[0].mediabox.width) - 595.28) < 2
assert abs(float(pdf.pages[0].mediabox.height) - 841.89) < 2
assert "landing" in pdf.pages[0].extract_text().lower()
probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(out / "demo-60s.mp4")]))
assert abs(float(probe["format"]["duration"]) - 60) <= .1
assert probe["streams"][0]["codec_name"] == "h264"
assert probe["streams"][0]["pix_fmt"] == "yuv420p"
print("Material: PDF A4 de una página, QR correcto, cuatro capturas reales y MP4 H.264 de 60 s")
