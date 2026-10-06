# SPDX-License-Identifier: AGPL-3.0-only
"""Dark canvas, recognizable navigation and app icon, tested on actual routes."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('DARK_BASE_URL', 'http://127.0.0.1:3132').rstrip('/')
OUT = Path(os.environ.get('DARK_ARTIFACT_DIR', '/tmp/eudila-dark'))
OUT.mkdir(parents=True, exist_ok=True)
ENGINES = os.environ.get('DARK_ENGINES', 'chromium,webkit,firefox').split(',')

# Resolve actual painted text/control colors through a canvas. Neutral gradient
# is sampled separately by screenshot, including the top (brightest) position.
COLORS = '''e => {
 const s=getComputedStyle(e), c=document.createElement('canvas');c.width=c.height=1;
 const ctx=c.getContext('2d');
 function rgb(v){ctx.clearRect(0,0,1,1);ctx.fillStyle=v;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data]}
 return {ink:rgb(s.color),bg:rgb(s.backgroundColor),border:rgb(s.borderColor),scheme:s.colorScheme};
}'''

def luminance(rgb):
    linear=[v/255/12.92 if v/255<=.04045 else ((v/255+.055)/1.055)**2.4 for v in rgb[:3]]
    return sum(v*w for v,w in zip(linear,[.2126,.7152,.0722]))

def contrast(a,b):
    lo,hi=sorted([luminance(a),luminance(b)])
    return (hi+.05)/(lo+.05)

with sync_playwright() as p:
    results=[]
    for engine in ENGINES:
        browser=getattr(p,engine).launch(**({'executable_path':os.environ.get('CHROME_BIN','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')} if engine=='chromium' else {}))
        page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
        errors=[]
        page.on('pageerror', lambda error: errors.append(str(error)))
        ratios=[]
        reflows=0
        routes=['/','/hoy','/calendario','/ingresar','/crear-cuenta','/cuenta','/registro/tipo','/registro/emocion','/registro/factores','/registro/confirmacion','/evolucion','/factores','/exportar','/ayuda','/tokens']
        for route in routes:
            assert page.goto(BASE+route,wait_until='networkidle').status==200
            assert page.locator('html').evaluate('e=>getComputedStyle(e).colorScheme')=='dark', 'El lienzo sigue claro'
            # Read top and bottom pixels of the actual viewport background.
            from PIL import Image
            import io
            shot=Image.open(io.BytesIO(page.screenshot()))
            surfaces=[shot.getpixel((2,2)),shot.getpixel((2,840))]
            assert max(map(luminance,surfaces))<.06, (route,surfaces)
            for element in page.locator('h1, p.text-muted, .app-tab, .action, .control-choice, .auth-field input, select, input[type=search]').all():
                if not element.is_visible(): continue
                style=element.evaluate(COLORS)
                backgrounds=[style['bg']] if style['bg'][3]==255 else surfaces
                for bg in backgrounds:
                    ratio=contrast(style['ink'],bg)
                    assert ratio>=4.5, (route,element.inner_text(),style,bg,ratio)
                    ratios.append(ratio)
                if element.evaluate('e=>e.matches("input:not([type=radio]), select, .control-choice")'):
                    assert contrast(style['border'],surfaces[0])>=3, (route,'campo sin borde visible',style)
            nav=page.get_by_role('navigation',name='Secciones',exact=True)
            if route not in ['/ingresar','/crear-cuenta','/cuenta']:
                assert nav.get_by_role('link').all_text_contents()==['Registrar','Hoy','Calendario']
                for label in ['Registrar','Hoy','Calendario']:
                    link=nav.get_by_role('link',name=label,exact=True)
                    assert link.locator('svg[aria-hidden=true]').count()==1
                    assert link.locator('svg').evaluate('e=>getComputedStyle(e).width')=='24px'
            icon=page.locator('.app-brand img')
            assert icon.count()==1 and icon.get_attribute('alt')==''
            assert icon.evaluate('e=>e.complete && e.naturalWidth>0')
            page.get_by_role('link',name='Ayuda ahora',exact=True).focus()
            assert page.locator(':focus').evaluate('e=>parseFloat(getComputedStyle(e).outlineWidth)')>=2
            if route in ['/','/hoy','/calendario','/ingresar','/registro/tipo','/ayuda','/tokens']:
                for width in [320,390,520]:
                    for height in [844,470]:
                        for zoom in [100,200]:
                            page.set_viewport_size({'width':width,'height':height})
                            page.evaluate(f'document.documentElement.style.fontSize="{zoom}%"')
                            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (route,width,height,zoom)
                            assert page.locator('main').evaluate('e=>e.clientHeight>40 && e.scrollWidth<=e.clientWidth'), (route,width,height,zoom,'contenido recortado')
                            for control in [page.get_by_role('link',name='Ayuda ahora',exact=True), *nav.get_by_role('link').all()]:
                                control.scroll_into_view_if_needed()
                                box=control.bounding_box()
                                assert box['height']>=44 and box['width']>=44
                                assert control.evaluate('e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}'), (route,width,height,zoom,'tap bloqueado')
                            reflows+=1
                page.set_viewport_size({'width':390,'height':844})
                page.evaluate('document.documentElement.style.fontSize="100%"')
            if route in ['/','/hoy','/calendario','/ingresar','/registro/tipo','/ayuda','/tokens']:
                page.screenshot(path=str(OUT/f'{engine}-{route.strip("/").replace("/","-") or "home"}.png'))
        assert page.locator('link[rel=icon]').count()>0
        assert page.locator('link[rel=apple-touch-icon]').count()==1
        assert page.locator('meta[name=theme-color]').count()==1
        manifest=page.request.get(BASE+'/manifest.json').json()
        assert {i['sizes'] for i in manifest['icons']} >= {'192x192','512x512'}
        for image in manifest['icons']:
            response=page.request.get(BASE+image['src'])
            assert response.ok
            assert Image.open(io.BytesIO(response.body())).size==tuple(map(int,image['sizes'].split('x')))
        page.goto(BASE+'/registro/tipo',wait_until='networkidle')
        page.get_by_role('radio',name='Registro libre').check()
        selected=page.locator('label:has(input:checked)').evaluate(COLORS)
        assert contrast(selected['ink'],selected['bg'])>=4.5
        page.get_by_role('button',name='Siguiente',exact=True).click()
        page.wait_for_url(BASE+'/registro/animo')
        slider=page.get_by_role('slider')
        assert slider.get_attribute('step')=='any'
        slider.fill('5.25')
        assert slider.input_value()=='5.25'
        page.screenshot(path=str(OUT/f'{engine}-mood.png'))
        page.goto(BASE+'/exportar',wait_until='networkidle')
        page.emulate_media(media='print')
        assert page.locator('.app-shell').evaluate(COLORS)['bg'][:3]==[255,255,255]
        assert page.locator('.app-navigation').evaluate('e=>getComputedStyle(e).display')=='none'
        assert not errors,errors
        results.append({'engine':engine,'version':browser.version,'routes':len(routes),'reflows':reflows,'minTextContrast':min(ratios),'errors':errors})
        browser.close()
    (OUT/'measurements.json').write_text(json.dumps(results,indent=2)+'\n')
    print(json.dumps(results,indent=2),flush=True)
