# SPDX-License-Identifier: AGPL-3.0-only
"""MOOD_BASE_URL=http://127.0.0.1:3118 uv run --with playwright python app/design-mood.test.py

Use a preview build. MOOD_ARTIFACT_DIR optionally stores screenshots/measurements.
"""
from pathlib import Path
import json
import os
import re

from playwright.sync_api import sync_playwright, expect

base = os.environ.get('MOOD_BASE_URL', 'http://127.0.0.1:3118').rstrip('/')
artifacts = Path(os.environ['MOOD_ARTIFACT_DIR']) if os.environ.get('MOOD_ARTIFACT_DIR') else None
if artifacts:
    artifacts.mkdir(parents=True, exist_ok=True)
results = {'moods': [], 'reflow': []}
ambients = ['#32134d', '#26235b', '#123f60', '#0f5654', '#285b25', '#6c3b0b', '#712127']


def contrast(a, b):
    def lum(rgb):
        values = [c / 255 / 12.92 if c / 255 <= .04045 else ((c / 255 + .055) / 1.055) ** 2.4 for c in rgb]
        return sum(v * w for v, w in zip(values, [.2126, .7152, .0722]))
    low, high = sorted([lum(a), lum(b)])
    return (high + .05) / (low + .05)


def capture(page, name):
    if artifacts:
        page.screenshot(path=str(artifacts / f'{name}.png'))


def readable_surface(element):
    colors = element.evaluate('''e => {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
        const c = canvas.getContext('2d');
        function rgb(color) {c.clearRect(0,0,1,1); c.fillStyle=color; c.fillRect(0,0,1,1); return [...c.getImageData(0,0,1,1).data].slice(0,3);}
        return {bg: rgb(getComputedStyle(e).backgroundColor),
            ink: [...e.querySelectorAll('h2, p, button')].map(n => ({name:n.textContent, color:rgb(getComputedStyle(n).color), bg:getComputedStyle(n).backgroundColor}))};
    }''')
    # Filled primary actions have their own checked pair; transparent controls
    # and prose must remain readable against this neutral surface.
    for ink in colors['ink']:
        if ink['bg'] in ['rgba(0, 0, 0, 0)', 'transparent']:
            assert contrast(ink['color'], colors['bg']) >= 4.5, (ink, colors['bg'])


with sync_playwright() as p:
    chrome = Path(os.environ.get('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'))
    browser = p.chromium.launch(**({'executable_path': str(chrome)} if chrome.exists() else {}))
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base + '/registro/tipo')
    page.get_by_role('radio', name='Registro libre', exact=True).check()
    page.get_by_role('button', name='Siguiente', exact=True).click()
    page.wait_for_url(base + '/registro/animo')
    shell = page.locator('.app-shell')
    slider = page.get_by_role('slider')
    action = page.get_by_role('link', name='Siguiente', exact=True)
    for level, ambient in enumerate(ambients, 1):
        slider.fill(str(level))
        expect(shell).to_have_attribute('data-mood-transition', 'idle')
        expect(slider).to_have_attribute('aria-valuetext', re.compile(f'{level} de 7'))
        gradient = shell.evaluate('e => getComputedStyle(e).backgroundImage')
        assert gradient.startswith('linear-gradient('), ('mood ambient absent', gradient)
        styles = shell.evaluate(r'''e => {
            const s = getComputedStyle(e), canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1; const c = canvas.getContext('2d');
            function rgb(color) {c.clearRect(0,0,1,1); c.fillStyle = color; c.fillRect(0,0,1,1); return [...c.getImageData(0,0,1,1).data].slice(0,3);}
            const ambient = s.getPropertyValue('--mood-ambient');
            const stops = [...s.backgroundImage.matchAll(/(rgb\([^)]*\)|color\([^)]*\))\s+([0-9.]+)%/g)];
            return {stops: stops.map(m => rgb(m[1])), positions: stops.map(m => Number(m[2])), expectedMiddle: rgb(`color-mix(in srgb, ${ambient} 72%, #1d1d1f)`),
                text: [...e.querySelectorAll('h1, .mood-state, .mood-secondary, .app-tab, .app-preview-toggle, .mood-navigation-control')].map(n => ({name: n.textContent, ink: rgb(getComputedStyle(n).color)})),
                bands: [...e.querySelectorAll('.app-header, .app-navigation, .app-preview-toggle')].map(n => getComputedStyle(n).backgroundColor)};
        }''')
        assert styles['positions'] == [0, 56, 100], styles
        assert styles['stops'][0] == list(bytes.fromhex(ambient[1:])), styles
        assert styles['stops'][1] == styles['expectedMiddle'] and styles['stops'][2] == [7, 20, 22], styles
        assert all(band in ['rgba(0, 0, 0, 0)', 'transparent'] for band in styles['bands']), styles
        ratios = [contrast(t['ink'], stop) for t in styles['text'] for stop in styles['stops']]
        assert min(ratios) >= 4.5, (level, styles, ratios)
        expect(page.get_by_role('link', name='Ayuda ahora', exact=True)).to_be_visible()
        expect(page.get_by_role('button', name='Cerrar registro')).to_be_visible()
        expect(page.get_by_role('link', name='Volver', exact=True)).to_be_visible()
        assert page.get_by_role('heading', level=1).evaluate('e => getComputedStyle(e).textAlign') == 'center'
        for control in page.locator('.mood-navigation-control').all():
            rect = control.bounding_box()
            assert rect['width'] >= 44 and rect['height'] >= 44, rect
        assert page.locator('.mood-orb').evaluate('e => {const r=e.getBoundingClientRect(); return Math.abs(r.width-r.height)<1}')
        results['moods'].append({'level': level, 'gradient': gradient, 'minimum_text_contrast': round(min(ratios), 2)})
        capture(page, f'mood-{level}')

    slider.focus()
    page.keyboard.press('Home')
    expect(slider).to_have_value('1')
    page.keyboard.press('End')
    expect(slider).to_have_value('7')
    page.keyboard.press('ArrowLeft')
    expect(slider).to_have_value('6')
    page.reload()
    expect(slider).to_have_value('6')
    expect(shell).to_have_attribute('data-mood', '6')
    page.get_by_role('button', name='Vista previa', exact=False).click()
    expect(page.get_by_role('heading', name='Sobre la vista previa')).to_be_visible()
    expect(page.get_by_text('Los registros se conservan solo en esta pestaña.', exact=False)).to_be_visible()
    readable_surface(page.locator('.preview-notice'))
    capture(page, 'preview-popover')
    page.get_by_role('button', name='Cerrar aviso de vista previa').click()
    page.get_by_role('button', name='Cerrar registro').click()
    expect(page.get_by_role('dialog')).to_be_visible()
    readable_surface(page.get_by_role('dialog'))
    capture(page, 'close-dialog')
    page.get_by_role('button', name='Seguir registrando').click()
    expect(slider).to_have_value('6')

    # Navigation restores the neutral dark canvas while retaining the emotional draft.
    for name, path in [('Ayuda ahora', '/ayuda'), ('Hoy', '/hoy'), ('Calendario', '/calendario')]:
        page.get_by_role('link', name=name, exact=True).click()
        page.wait_for_url(base + path)
        assert shell.get_attribute('data-mood') is None
        assert 'linear-gradient' in shell.evaluate('e => getComputedStyle(e).backgroundImage')
        page.go_back()
        expect(slider).to_have_value('6')
        expect(shell).to_have_attribute('data-mood', '6')
    page.get_by_role('link', name='Volver', exact=True).focus()
    page.keyboard.press('Enter')
    page.wait_for_url(base + '/registro/tipo')
    assert shell.get_attribute('data-mood') is None
    assert 'linear-gradient' in shell.evaluate('e => getComputedStyle(e).backgroundImage')
    page.get_by_role('button', name='Siguiente', exact=True).click()
    slider.focus()
    page.keyboard.press('Tab')
    expect(action).to_be_focused()
    capture(page, 'keyboard-focus')
    page.keyboard.press('Enter')
    page.wait_for_url(base + '/registro/emocion')
    assert shell.get_attribute('data-mood') is None
    assert 'linear-gradient' in shell.evaluate('e => getComputedStyle(e).backgroundImage')
    page.go_back()

    for width in [320, 390, 520]:
        for zoom in [100, 200]:
            for height in [844, 470]:
                page.set_viewport_size({'width': width, 'height': height})
                page.evaluate('(z) => document.documentElement.style.fontSize = z + "%"', zoom)
                page.emulate_media(reduced_motion='reduce')
                for level in range(1, 8):
                    slider.fill(str(level))
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, zoom, height)
                    assert page.locator('main').evaluate('e => e.scrollWidth <= e.clientWidth'), (width, zoom, height)
                    back = page.get_by_role('link', name='Volver', exact=True).bounding_box()
                    close = page.get_by_role('button', name='Cerrar registro').bounding_box()
                    assert abs(back['y'] - close['y']) < 1 and close['x'] > back['x'], ('navigation row split', width, zoom, back, close)
                    for locator in [page.get_by_role('heading', level=1), slider, action, page.get_by_role('button', name='Cerrar registro')]:
                        locator.scroll_into_view_if_needed()
                        rect = locator.bounding_box()
                        assert rect['x'] >= -1 and rect['x'] + rect['width'] <= width + 1, (width, zoom, rect)
                        assert rect['y'] >= -1 and rect['y'] + rect['height'] <= height + 1, ('control clipped vertically', width, zoom, height, rect)
                    help_link = page.get_by_role('link', name='Ayuda ahora', exact=True)
                    help_link.scroll_into_view_if_needed()
                    assert help_link.bounding_box()['y'] >= -1, (width, zoom, height, help_link.bounding_box())
                    results['reflow'].append({'width': width, 'text_percent': zoom, 'height': height, 'mood': level})
                if zoom == 200:
                    capture(page, f'reflow-{width}-{height}-200-reduced')
                    action.scroll_into_view_if_needed()
                    capture(page, f'reflow-{width}-{height}-200-action')

    # A storage error remains legible on the mood background.
    page.set_viewport_size({'width': 390, 'height': 844})
    page.evaluate('document.documentElement.style.fontSize = "100%"')
    page.evaluate('''() => { Storage.prototype.setItem = () => {throw new DOMException('blocked', 'SecurityError')}; }''')
    slider.fill('4')
    expect(page.get_by_text('El borrador sigue en esta pantalla', exact=False)).to_be_visible()
    capture(page, 'storage-blocked')
    page.get_by_role('button', name='Cerrar registro').click()
    page.get_by_role('button', name='Descartar registro').click()
    page.wait_for_url(base + '/')
    assert shell.get_attribute('data-mood') is None
    assert 'linear-gradient' in shell.evaluate('e => getComputedStyle(e).backgroundImage')
    assert page.evaluate("sessionStorage.getItem('eudila-draft-v1')") is None
    assert not errors, errors
    browser.close()

if artifacts:
    (artifacts / 'measurements.json').write_text(json.dumps(results, indent=2) + '\n')
print(f"PASS: 7 ambients, contrast, navigation/draft/dialog/help, keyboard, {len(results['reflow'])} reflow cases, reduced motion, storage failure")
