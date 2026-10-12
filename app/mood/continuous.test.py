# SPDX-License-Identifier: AGPL-3.0-only
"""Observe actual native dragging and the entire transition through Algo agradable."""
import os,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

base=os.environ.get('MOTION_BASE_URL','http://127.0.0.1:3118').rstrip('/')
artifacts=Path(os.environ['CONTINUOUS_ARTIFACT_DIR']) if os.environ.get('CONTINUOUS_ARTIFACT_DIR') else None
results={}
with sync_playwright() as p:
    for engine in os.environ.get('MOTION_ENGINES','chromium').split(','):
        chrome=Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        browser=getattr(p,engine).launch(**({'executable_path':str(chrome)} if engine=='chromium' and chrome.exists() else {}))
        if artifacts: artifacts.mkdir(parents=True,exist_ok=True)
        context=browser.new_context(viewport={'width':390,'height':844},**({'record_video_dir':str(artifacts/engine),'record_video_size':{'width':390,'height':844}} if artifacts else {}))
        page=context.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(base+'/registro/animo')
        slider=page.get_by_role('slider');shell=page.locator('.app-shell')
        expect(slider).to_be_visible()
        assert slider.get_attribute('step')=='any','la barra sigue deteniéndose en siete puntos'
        box=slider.bounding_box();span=box['width']-30;start=box['x']+15;y=box['y']+box['height']/2
        def move(position):
            page.mouse.move(start+(position-1)/6*span,y)
            page.wait_for_timeout(25)
        page.mouse.move(start,y);page.mouse.down()
        samples=[]
        for i in range(61):
            position=1+i/10
            move(position)
            sample=slider.evaluate('''e=>{
                const root=document.querySelector('.app-shell'),a=document.querySelector('.mood-screen > .action-primary');
                const c=document.createElement('canvas').getContext('2d');
                function rgb(color){c.clearRect(0,0,1,1);c.fillStyle=color;c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data].slice(0,3);}
                return {value:Number(e.value),position:Number(root.dataset.moodPosition),accent:rgb(getComputedStyle(a).backgroundColor),ink:rgb(getComputedStyle(a).color),path:document.querySelector('.orb-layer').getAttribute('d')};
            }''')
            assert abs(sample['value']-position)<.035,(engine,position,sample['value'])
            assert abs(sample['position']-sample['value'])<1e-6
            samples.append(sample)
        assert len({s['value'] for s in samples})>50
        assert sum(abs(s['value']-round(s['value']))>.01 for s in samples)>45
        assert len({tuple(s['accent']) for s in samples})>50
        assert len({s['path'] for s in samples})>50
        def lum(rgb):
            return sum((c/255/12.92 if c/255<=.04045 else ((c/255+.055)/1.055)**2.4)*w for c,w in zip(rgb,[.2126,.7152,.0722]))
        contrasts=[(max(lum(s['accent']),lum(s['ink']))+.05)/(min(lum(s['accent']),lum(s['ink']))+.05) for s in samples]
        assert min(contrasts)>=4.5,min(contrasts)
        move(4.25)
        assert all(s=='running' for s in page.locator('.orb-particle').evaluate_all('es=>es.map(e=>getComputedStyle(e).animationPlayState)')), 'los destellos se congelan en posiciones intermedias cercanas a Neutral'
        # Reverse through the entire pleasant/organic/neutral transition.
        for i in range(31):
            position=7-i/10;move(position)
            if artifacts and engine=='chromium' and i in [10,15,20,25,30]:
                page.screenshot(path=str(artifacts/f'transition-{position:.1f}.png'))
        move(5.25);page.mouse.up()
        held=float(slider.input_value())
        assert abs(held-5.25)<.035
        expect(shell).to_have_attribute('data-mood','5')
        expect(shell).to_have_attribute('data-mood-transition','idle')
        page.wait_for_timeout(700)
        assert float(slider.input_value())==held,'snap al soltar'
        expected=[round(119+(254-119)*(held-5)),round(203+(150-203)*(held-5)),round(71+(19-71)*(held-5))]
        actual=slider.evaluate("e=>getComputedStyle(document.querySelector('.mood-screen > .action-primary')).backgroundColor")
        assert all(str(n) in actual for n in expected),(actual,expected)
        before=page.locator('.orb-layer').first.get_attribute('d')
        page.wait_for_timeout(250)
        assert page.locator('.orb-layer').first.get_attribute('d')!=before,'falta deformación orgánica durante permanencia'
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
        expect(shell).to_have_attribute('data-motion','paused')
        frozen=page.locator('.orb-layer').first.get_attribute('d')
        page.wait_for_timeout(150)
        assert page.locator('.orb-layer').first.get_attribute('d')==frozen
        page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
        expect(shell).to_have_attribute('data-motion','running')
        # Live reduced motion stops contour deformation; dragging remains direct.
        page.emulate_media(reduced_motion='reduce')
        expect(shell).to_have_attribute('data-motion','reduced')
        frozen=page.locator('.orb-layer').first.get_attribute('d')
        page.wait_for_timeout(150)
        assert page.locator('.orb-layer').first.get_attribute('d')==frozen
        slider.focus();page.keyboard.press('ArrowLeft');expect(slider).to_have_value('5')
        page.keyboard.press('ArrowRight');expect(slider).to_have_value('6')
        page.keyboard.press('Home');expect(slider).to_have_value('1')
        page.keyboard.press('End');expect(slider).to_have_value('7')
        page.emulate_media(reduced_motion='no-preference')
        slider.fill('5')
        expect(shell).to_have_attribute('data-mood-transition','idle',timeout=2000)
        page.get_by_role('link',name='Siguiente',exact=True).click()
        page.wait_for_url(base+'/registro/emocion')
        assert shell.get_attribute('data-motion') is None
        page.go_back();expect(slider).to_have_value('5')
        page.reload();expect(slider).to_have_value('5')
        saved=page.evaluate("JSON.parse(sessionStorage.getItem('eudila-draft-v1'))")
        assert saved['mood']==5 and isinstance(saved['mood'],int)
        assert not errors,errors
        results[engine]={'positions':len({s['value'] for s in samples}),'minimum_contrast':min(contrasts),'retained_position':held,'integer_draft':saved['mood']}
        context.close()
        if artifacts:
            Path(page.video.path()).replace(artifacts/f'{engine}-continuous.webm')
            (artifacts/engine).rmdir()
        if engine!='firefox':
            touch=browser.new_context(viewport={'width':390,'height':844},has_touch=True)
            touch_page=touch.new_page();touch_page.goto(base+'/registro/animo')
            touch_slider=touch_page.get_by_role('slider');expect(touch_slider).to_be_visible()
            rect=touch_slider.bounding_box()
            touch_page.touchscreen.tap(rect['x']+15+(5.25-1)/6*(rect['width']-30),rect['y']+rect['height']/2)
            expect(touch_page.locator('.app-shell')).to_have_attribute('data-mood','5')
            value=float(touch_slider.input_value());assert abs(value-5.25)<.035,value
            results[engine]['touch_position']=value
            touch.close()
        browser.close()
if artifacts:(artifacts/'measurements.json').write_text(json.dumps(results,indent=2)+'\n')
print('PASS: arrastre continuo, morph/color sin retraso, Algo agradable orgánico, sin snap, reduced motion, teclado/persistencia:',json.dumps(results))
