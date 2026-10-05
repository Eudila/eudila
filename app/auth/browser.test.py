# SPDX-License-Identifier: AGPL-3.0-only
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

base = os.environ.get('AUTH_BASE_URL', 'http://127.0.0.1:3100')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(base + '/ingresar')
    expect(page.get_by_role('heading', name='Ingresá a eudila')).to_be_visible()
    expect(page.get_by_role('navigation', name='Secciones')).to_have_count(0)
    requests = []
    page.on('request', lambda r: requests.append(r) if r.method == 'POST' else None)
    page.get_by_role('button', name='Ingresar', exact=True).click()
    expect(page.get_by_text('Ingresá tu email.')).to_be_visible()
    expect(page.get_by_label('Email', exact=True)).to_be_focused()
    page.get_by_label('Email', exact=True).fill('persona@example.com')
    page.get_by_label('Contraseña', exact=True).fill('clave-de-prueba')
    page.get_by_role('button', name='Mostrar contraseña').click()
    expect(page.get_by_label('Contraseña', exact=True)).to_have_attribute('type', 'text')
    page.get_by_role('button', name='Ocultar contraseña').click()
    page.get_by_role('button', name='Ingresar', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('todavía no está disponible')
    expect(page.get_by_label('Contraseña', exact=True)).to_have_value('')
    expect(page.get_by_label('Email', exact=True)).to_have_value('persona@example.com')
    page.get_by_role('link', name='Crear cuenta', exact=True).click()
    expect(page.get_by_role('heading', name='Creá tu cuenta')).to_be_visible()
    expect(page.get_by_role('textbox')).to_have_count(2)
    page.get_by_label('Email', exact=True).fill('persona@example.com')
    page.get_by_label('Contraseña', exact=True).fill('una-clave')
    page.get_by_role('button', name='Crear cuenta', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('No creamos una cuenta')
    page.goto(base + '/cuenta')
    expect(page.get_by_role('button', name='Cerrar sesión')).to_be_disabled()
    expect(page.get_by_role('link', name='Ayuda ahora')).to_be_visible()
    assert not requests
    for route in ['/ingresar', '/crear-cuenta', '/cuenta']:
        for width in [320, 390, 520, 1280]:
            page.set_viewport_size({'width': width, 'height': 844})
            page.goto(base + route)
            page.evaluate("document.documentElement.style.fontSize = '200%'")
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width)
            expect(page.get_by_role('link', name='Ayuda ahora')).to_be_visible()
        page.evaluate("document.documentElement.style.fontSize = ''")
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(base + '/ingresar')
    page.screenshot(path='/tmp/eudila-auth-mobile.png', full_page=True)
    page.set_viewport_size({'width': 1280, 'height': 900})
    page.screenshot(path='/tmp/eudila-auth-desktop.png', full_page=True)
    assert not errors, errors
    browser.close()
print('Auth frontend: validación, navegación, cero POST, cuenta y reflujo OK')
