# SPDX-License-Identifier: AGPL-3.0-only
"""ACTIONS_BASE_URL=http://127.0.0.1:3117 uv run --with playwright --with pillow python app/design-actions.test.py

Run against Next.js with NEXT_PUBLIC_FRONTEND_PREVIEW=true. Optional
ACTIONS_ARTIFACT_DIR stores screenshots and measured contrast/reflow results.
"""
from pathlib import Path
import json
import os

from playwright.sync_api import sync_playwright, expect

base = os.environ.get('ACTIONS_BASE_URL', 'http://127.0.0.1:3117').rstrip('/')
artifacts = Path(os.environ['ACTIONS_ARTIFACT_DIR']) if os.environ.get('ACTIONS_ARTIFACT_DIR') else None
if artifacts:
    artifacts.mkdir(parents=True, exist_ok=True)
accents = ['#892fc9', '#5b4ce1', '#209ae7', '#2ec0bc', '#77cb47', '#fe9613', '#ff4a4b']
results = {'moods': [], 'reflow': [], 'routes': []}


def rgb(value):
    return list(bytes.fromhex(value.lstrip('#')))


def contrast(a, b):
    def luminance(color):
        linear = [c / 255 / 12.92 if c / 255 <= .04045 else ((c / 255 + .055) / 1.055) ** 2.4 for c in color]
        return sum(c * w for c, w in zip(linear, [.2126, .7152, .0722]))
    low, high = sorted([luminance(a), luminance(b)])
    return (high + .05) / (low + .05)


def appearance(element):
    return element.evaluate('''e => {
        const s = getComputedStyle(e), rect = e.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        const colors = [s.color, s.backgroundColor].map(color => {
            ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
            return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
        });
        return {ink: colors[0], bg: colors[1], opacity: s.opacity,
            height: rect.height, radius: s.borderTopLeftRadius,
            outline: s.outlineStyle, outlineWidth: parseFloat(s.outlineWidth),
            decoration: s.textDecorationLine, shadow: s.boxShadow,
            animation: s.animationName, transition: s.transitionDuration};
    }''')


def legible(element):
    style = appearance(element)
    ratio = contrast(style['ink'], style['bg'])
    assert ratio >= 4.5, (element.text_content(), style, ratio)
    assert style['opacity'] == '1', style
    return round(ratio, 2)


def action_rgb(page):
    return page.evaluate('''() => {
        const c = document.createElement('canvas'); c.width = c.height = 1;
        const ctx = c.getContext('2d');
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-action');
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
    }''')


def capture(page, name):
    if artifacts:
        page.screenshot(path=str(artifacts / f'{name}.png'))


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
    slider = page.get_by_role('slider')
    action = page.get_by_role('link', name='Siguiente', exact=True)
    for level, accent in enumerate(accents, 1):
        slider.fill(str(level))
        page.mouse.move(1, 1)
        page.evaluate('document.activeElement?.blur()')
        style = appearance(action)
        assert style['bg'] == rgb(accent), ('mood accent', level, style['bg'], rgb(accent))
        assert style['ink'] == rgb('#ffffff' if level < 3 else '#1d1d1f'), ('mood ink', level, style)
        assert style['height'] >= 50 and (style['radius'] == '50%' or float(style['radius'].rstrip('px')) >= style['height'] / 2), style
        capture(page, f'mood-{level}')
        measurements = {'level': level, 'accent': accent, 'default': legible(action)}
        action.hover()
        assert 'underline' in appearance(action)['decoration']
        measurements['hover'] = legible(action)
        if level == 4:
            capture(page, 'mood-hover')
        slider.focus()
        page.keyboard.press('Tab')
        expect(action).to_be_focused()
        assert appearance(action)['outline'] == 'solid' and appearance(action)['outlineWidth'] >= 3, appearance(action)
        measurements['focus'] = legible(action)
        if level == 4:
            capture(page, 'mood-focus')
        page.mouse.down()
        assert appearance(action)['shadow'] != 'none'
        measurements['active'] = legible(action)
        if level == 4:
            capture(page, 'mood-active')
        # Release outside the link to avoid activating navigation.
        page.mouse.move(1, 1)
        page.mouse.up()
        results['moods'].append(measurements)
    slider.focus()
    page.keyboard.press('ArrowLeft')
    expect(slider).to_have_value('6')
    assert '6 de 7' in slider.get_attribute('aria-valuetext')
    action.focus()
    page.keyboard.press('Enter')
    page.wait_for_url(base + '/registro/emocion')
    expect(page.locator('main')).to_contain_text('Ánimo: Agradable')

    for route, role, name in [('/', 'link', 'Empezar registro'), ('/ingresar', 'button', 'Ingresar'),
                              ('/crear-cuenta', 'button', 'Crear cuenta'), ('/hoy', 'link', 'Registrar cómo me siento')]:
        page.goto(base + route)
        action = page.get_by_role(role, name=name, exact=True)
        style = appearance(action)
        assert style['height'] >= 50
        assert float(style['radius'].rstrip('px')) >= style['height'] / 2, (route, style)
        assert style['bg'] == action_rgb(page), ('institutional action changed', route, style)
        results['routes'].append({'route': route, 'contrast': legible(action)})
        capture(page, 'route-' + (route.strip('/') or 'home'))
    assert appearance(page.get_by_role('link', name='Ayuda ahora', exact=True))['height'] >= 44

    page.goto(base + '/registro/tipo')
    page.evaluate("sessionStorage.removeItem('eudila-draft-v1')")
    page.reload()
    disabled = page.get_by_role('button', name='Siguiente', exact=True)
    expect(disabled).to_be_disabled()
    legible(disabled)
    capture(page, 'disabled-primary')
    choice = page.get_by_role('radio', name='Registro libre', exact=True)
    assert choice.locator('..').evaluate('e => parseFloat(getComputedStyle(e).borderRadius)') == 14
    choice.check()
    expect(disabled).to_be_enabled()
    legible(disabled)
    page.goto(base + '/registro/confirmacion')
    expect(page.get_by_role('button', name='Guardar en vista previa')).to_be_disabled()
    legible(page.get_by_role('button', name='Guardar en vista previa'))
    page.goto(base + '/exportar')
    secondary = page.get_by_role('button', name='Descargar CSV', exact=True)
    expect(secondary).to_be_disabled()
    legible(secondary)
    capture(page, 'disabled-secondary')
    page.goto(base + '/ingresar')
    assert page.get_by_label('Email', exact=True).evaluate('e => parseFloat(getComputedStyle(e).borderRadius)') == 14
    page.goto(base + '/cuenta')
    account_action = page.get_by_role('button', name='Cerrar sesión', exact=True)
    expect(account_action).to_be_disabled()
    legible(account_action)
    assert appearance(account_action)['height'] >= 50

    # Hold the existing frame boundary to inspect actual saving, not a gallery mock.
    page.goto(base + '/registro/emocion')
    page.get_by_role('button', name='Calma', exact=True).click()
    page.get_by_role('link', name='Siguiente', exact=True).click()
    page.get_by_role('link', name='Revisar registro', exact=True).click()
    page.set_viewport_size({'width': 390, 'height': 568})
    page.evaluate("document.documentElement.style.fontSize = '200%'")
    save = page.get_by_role('button', name='Guardar en vista previa', exact=True)
    save.scroll_into_view_if_needed()
    before = save.bounding_box()
    page.evaluate('''() => {
        window.actionOriginalFrame = window.requestAnimationFrame;
        window.actionHeldFrames = [];
        window.requestAnimationFrame = cb => { window.actionHeldFrames.push(cb); return 0; };
    }''')
    save.click()
    saving = page.get_by_role('button', name='Guardando…', exact=True)
    expect(saving).to_have_attribute('aria-busy', 'true')
    expect(saving).to_be_disabled()
    after = saving.bounding_box()
    assert abs(before['height'] - after['height']) < 1 and abs(before['width'] - after['width']) < 1, ('loading layout jump', before, after)
    legible(saving)
    capture(page, 'saving-390-200')
    page.evaluate('''() => {
        window.actionOriginalSet = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
            if (key === 'eudila-preview-records-v1') throw new DOMException('Quota', 'QuotaExceededError');
            return window.actionOriginalSet.call(this, key, value);
        };
    }''')
    page.evaluate('''() => {
        window.requestAnimationFrame = window.actionOriginalFrame;
        window.actionHeldFrames.forEach(cb => requestAnimationFrame(cb));
    }''')
    retry = page.get_by_role('button', name='Reintentar guardado', exact=True)
    expect(retry).to_be_enabled()
    page.set_viewport_size({'width': 470, 'height': 568})
    retry.scroll_into_view_if_needed()
    before_retry = retry.bounding_box()
    page.evaluate('''() => {
        Storage.prototype.setItem = window.actionOriginalSet;
        window.actionHeldFrames = [];
        window.requestAnimationFrame = cb => { window.actionHeldFrames.push(cb); return 0; };
    }''')
    retry.click()
    saving = page.get_by_role('button', name='Guardando…', exact=True)
    expect(saving).to_be_disabled()
    after_retry = saving.bounding_box()
    assert abs(before_retry['height'] - after_retry['height']) < 1, ('retry layout jump', before_retry, after_retry)
    results['saving'] = {'width': 390, 'textPercent': 200, 'beforeHeight': before['height'], 'busyHeight': after['height'],
                         'retryWidth': 470, 'retryBeforeHeight': before_retry['height'], 'retryBusyHeight': after_retry['height']}
    capture(page, 'retry-470-200')
    page.evaluate('''() => {
        window.requestAnimationFrame = window.actionOriginalFrame;
        window.actionHeldFrames.forEach(cb => requestAnimationFrame(cb));
    }''')
    page.wait_for_url(base + '/hoy')
    records = page.evaluate("JSON.parse(sessionStorage.getItem('eudila-preview-records-v1'))")
    assert len(records) == 1 and records[0]['emotion']['nombre'] == 'Calma'
    page.evaluate("document.documentElement.style.fontSize = '100%'")
    page.set_viewport_size({'width': 390, 'height': 844})

    page.goto(base + '/tokens')
    for level in range(1, 8):
        sample = page.locator(f'[data-action-example="{level}"]')
        disabled = sample.get_by_role('button', name='Siguiente', exact=True)
        expect(disabled).to_be_disabled()
        results['moods'][level - 1]['disabled'] = legible(disabled)
        if artifacts:
            sample.scroll_into_view_if_needed()
            sample.screenshot(path=str(artifacts / f'variants-mood-{level}.png'))
    busy = page.get_by_role('button', name='Guardando…', exact=True)
    expect(busy).to_have_attribute('aria-busy', 'true')
    legible(busy)
    if artifacts:
        examples = page.locator('section[aria-labelledby="actions-title"] > div').first
        examples.scroll_into_view_if_needed()
        examples.screenshot(path=str(artifacts / 'base-variants.png'))

    for route in ['/', '/registro/tipo', '/registro/animo', '/registro/confirmacion', '/ingresar', '/crear-cuenta', '/cuenta', '/hoy', '/exportar']:
        page.goto(base + route)
        for width in [320, 390, 520]:
            page.set_viewport_size({'width': width, 'height': 568})
            for percent in [100, 200]:
                page.evaluate(f"document.documentElement.style.fontSize = '{percent}%'")
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width, percent)
                assert page.locator('main').evaluate('e => e.scrollWidth <= e.clientWidth'), (route, width, percent, 'main')
                if route in ['/registro/tipo', '/registro/animo']:
                    next_action = page.get_by_role('button' if route.endswith('tipo') else 'link', name='Siguiente', exact=True)
                    assert next_action.evaluate('e => { const r = document.createRange(); r.selectNodeContents(e); return r.getClientRects().length; }') == 1, (route, width, percent, 'word split')
                results['reflow'].append({'route': route, 'width': width, 'textPercent': percent})
        page.evaluate("document.documentElement.style.fontSize = '100%'")
    page.emulate_media(reduced_motion='reduce')
    page.set_viewport_size({'width': 320, 'height': 568})
    page.goto(base + '/registro/animo')
    page.evaluate("document.documentElement.style.fontSize = '200%'")
    page.get_by_role('slider').fill('1')
    action = page.get_by_role('link', name='Siguiente', exact=True)
    assert appearance(action)['bg'] == rgb(accents[0])
    assert appearance(action)['animation'] == 'none' and appearance(action)['transition'] == '0s'
    action.scroll_into_view_if_needed()
    capture(page, 'reflow-320-200-reduced')
    expect(page.get_by_role('link', name='Ayuda ahora', exact=True)).to_be_visible()
    assert not errors, errors
    browser.close()

if artifacts:
    from PIL import Image, ImageDraw
    sheet = Image.new('RGB', (390 * 4, 884 * 2), '#ffffff')
    for i in range(7):
        with Image.open(artifacts / f'mood-{i + 1}.png') as screenshot:
            x, y = (i % 4) * 390, (i // 4) * 884
            sheet.paste(screenshot.convert('RGB'), (x, y + 40))
            ImageDraw.Draw(sheet).text((x + 16, y + 12), f'{i + 1}/7 - {accents[i]}', fill='#1d1d1f')
    sheet.save(artifacts / 'seven-moods.png')
    # Compose actual component captures; a full section screenshot is clipped by main's scrollport.
    with Image.open(artifacts / 'base-variants.png') as base_image:
        captures = [Image.open(artifacts / f'variants-mood-{i}.png').convert('RGB') for i in range(1, 8)]
        cell_width = max(im.width for im in captures)
        cell_height = max(im.height for im in captures)
        gallery = Image.new('RGB', (cell_width * 2 + 48, base_image.height + cell_height * 4 + 152), '#fbfbfd')
        draw = ImageDraw.Draw(gallery)
        draw.text((16, 16), 'Next.js - variantes, disabled y loading', fill='#1d1d1f')
        gallery.paste(base_image.convert('RGB'), (16, 48))
        for i, capture_image in enumerate(captures):
            gallery.paste(capture_image, (16 + (i % 2) * (cell_width + 16), base_image.height + 80 + (i // 2) * (cell_height + 16)))
        gallery.save(artifacts / 'variants-and-disabled.png')
    (artifacts / 'measurements.json').write_text(json.dumps(results, indent=2) + '\n')
print(f"Acciones: 7 pares AA, hover/focus/active/disabled, teclado, variantes, loading y {len(results['reflow'])} casos de reflujo verificados.")
