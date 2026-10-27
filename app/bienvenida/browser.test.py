# SPDX-License-Identifier: AGPL-3.0-only
"""WELCOME_BASE_URL=http://127.0.0.1:3117 uv run --with playwright python app/bienvenida/browser.test.py"""
from pathlib import Path
from time import monotonic
import os
from playwright.sync_api import sync_playwright, expect

base = os.environ.get('WELCOME_BASE_URL', 'http://127.0.0.1:3117').rstrip('/')
artifacts = Path(os.environ['WELCOME_ARTIFACT_DIR']) if os.environ.get('WELCOME_ARTIFACT_DIR') else None
if artifacts:
    artifacts.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    chrome = Path(os.environ.get('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'))
    browser = p.chromium.launch(**({'executable_path': str(chrome)} if chrome.exists() else {}))
    context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto(base + '/bienvenida')
    choices = page.locator('.auth-gateway .action')
    expect(choices).to_have_count(3)
    expect(page.locator('main input')).to_have_count(0)
    expect(page.locator('.intro')).to_have_count(0)
    expect(page.get_by_role('link', name='Ayuda ahora')).to_be_visible()
    expect(page.get_by_role('heading', name='Un momento para vos.')).to_be_visible()
    assert choices.all_text_contents() == ['Continuar con Google', 'Ingresar', 'Registrarse']
    for width in [320, 390, 1440]:
        page.set_viewport_size({'width': width, 'height': 844})
        for zoom in [100, 200]:
            page.evaluate('(zoom) => document.documentElement.style.fontSize = zoom + "%"', zoom)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth && document.querySelector("main").scrollWidth <= document.querySelector("main").clientWidth'), (width, zoom)
            boxes = [choice.bounding_box() for choice in choices.all()]
            assert all(box['height'] >= 50 and abs(box['x'] - boxes[0]['x']) < 1 and abs(box['width'] - boxes[0]['width']) < 1 for box in boxes), boxes
    page.evaluate('document.documentElement.style.fontSize = "100%"')
    page.set_viewport_size({'width': 390, 'height': 844})
    position = page.locator('.auth-gateway').bounding_box()
    assert position['y'] + position['height'] / 2 < 844 / 2, position
    if artifacts:
        page.screenshot(path=str(artifacts / 'bienvenida-390.png'))
    page.get_by_role('link', name='Ingresar', exact=True).click()
    expect(page.get_by_label('Email', exact=True)).to_be_visible()
    expect(page.get_by_label('Contraseña', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='Continuar con Google')).to_have_count(0)
    page.get_by_role('link', name='Volver al inicio').click()
    expect(choices).to_have_count(3)
    page.get_by_role('link', name='Registrarse', exact=True).click()
    expect(page).to_have_url(base + '/crear-cuenta')
    expect(page.get_by_label('Email', exact=True)).to_be_visible()
    expect(page.get_by_label('Contraseña', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='Continuar con Google')).to_have_count(0)
    context.close()

    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto(base + '/bienvenida')
    expect(page.locator('.intro')).to_have_attribute('data-playing', '')
    expect(page.locator('.auth-gateway')).to_have_attribute('inert', '')
    page.get_by_role('button', name='Saltar la presentación').click()
    expect(page.locator('.intro')).to_have_count(0)
    expect(page.get_by_role('heading', name='Un momento para vos.')).to_be_focused()
    assert any(cookie['name'] == 'eudila-intro' for cookie in context.cookies())
    page.reload()
    expect(page.locator('.intro')).to_have_count(0)
    context.clear_cookies()
    page.reload()
    expect(page.locator('.intro')).to_have_attribute('data-playing', '')
    page.keyboard.press('Escape')
    expect(page.locator('.intro')).to_have_count(0)
    context.clear_cookies()
    page.reload()
    started = monotonic()
    expect(page.locator('.intro')).to_have_attribute('data-playing', '')
    expect(page.locator('.intro')).to_have_count(0, timeout=20000)
    assert monotonic() - started >= 12, 'La apertura debe conservar el cierre más pausado.'
    expect(page.get_by_role('link', name='Ingresar', exact=True)).to_be_visible()
    expect(page.get_by_role('heading', name='Un momento para vos.')).to_be_focused()
    assert not errors, errors
    browser.close()
print('PASS: apertura completa/saltar/Esc, cookie, foco, movimiento reducido, tres opciones sin datos, ingreso/alta y seis casos de reflujo.')
