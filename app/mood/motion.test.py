# SPDX-License-Identifier: AGPL-3.0-only
"""MOTION_BASE_URL=http://127.0.0.1:3118 uv run --with playwright python app/mood/motion.test.py"""
from pathlib import Path
import json
import os
import re

from playwright.sync_api import sync_playwright, expect

base = os.environ.get('MOTION_BASE_URL', 'http://127.0.0.1:3118').rstrip('/')
artifacts = Path(os.environ['MOTION_ARTIFACT_DIR']) if os.environ.get('MOTION_ARTIFACT_DIR') else None
if artifacts:
    artifacts.mkdir(parents=True, exist_ok=True)
engines = os.environ.get('MOTION_ENGINES', 'chromium').split(',')
results = {}

with sync_playwright() as p:
    for engine in engines:
        browser_type = getattr(p, engine)
        chrome = Path(os.environ.get('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'))
        browser = browser_type.launch(**({'executable_path': str(chrome)} if engine == 'chromium' and chrome.exists() else {}))
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='no-preference',
                                      **({'record_video_dir': str(artifacts / engine), 'record_video_size': {'width': 390, 'height': 844}} if artifacts else {}))
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(base + '/registro/animo')
        slider = page.get_by_role('slider')
        expect(slider).to_be_visible()
        shell = page.locator('.app-shell')
        assert page.locator('.orb-breath').count() == 1, 'falta renderer animado del video'
        assert page.locator('.orb-layer').count() == 5
        assert page.locator('.mood-orb radialGradient').count() >= 3
        centers = page.locator('.mood-orb').evaluate('''svg => {
            const p = new DOMPoint(110,110), center = p.matrixTransform(svg.querySelector('.orb-core').getCTM());
            return [...svg.querySelectorAll('.orb-layer')].map(path => {const q=p.matrixTransform(path.getCTM()); return Math.hypot(q.x-center.x,q.y-center.y);});
        }''')
        assert max(centers) < .1, ('capas Neutral fuera de centro', centers)
        neutral = page.locator('.orb-breath').evaluate('e => getComputedStyle(e).transform')
        page.wait_for_timeout(450)
        assert page.locator('.orb-breath').evaluate('e => getComputedStyle(e).transform') != neutral, 'respiración estática'
        durations = page.locator('.orb-turn').evaluate_all('es => es.map(e => getComputedStyle(e).animationDuration)')
        assert len(durations) == 5 and all(abs(float(d[:-1]) - 125.6637) < .01 for d in durations)
        assert page.locator('.orb-turn').evaluate_all('es => es.map(e => getComputedStyle(e).animationDirection)') == ['normal', 'reverse', 'normal', 'reverse', 'normal']
        breath_bounds = page.locator('.orb-breath').evaluate('''async e => {
            const a=e.getAnimations()[0]; a.pause(); await a.ready;
            const values=[]; for(const time of [1000,3000]) {a.currentTime=time; values.push(new DOMMatrix(getComputedStyle(e).transform).a);}
            a.play(); return values;
        }''')
        assert abs(breath_bounds[0]-1.018)<.001 and abs(breath_bounds[1]-.982)<.001, breath_bounds
        particle_durations = page.locator('.orb-particle').evaluate_all('es=>es.map(e=>parseFloat(getComputedStyle(e).animationDuration))')
        assert min(particle_durations) >= 2.5 and max(particle_durations) <= 6
        expect(shell).to_have_attribute('data-mood-transition', 'idle')
        assert page.locator('[data-particle-family="dots"]').evaluate('e => getComputedStyle(e).opacity') == '0'
        assert page.locator('[data-particle-family="sparks"]').evaluate('e => getComputedStyle(e).opacity') == '0'

        # Capture two settled geometries independently, then compare each observed
        # property's progress while the actual animation runs.
        page.emulate_media(reduced_motion='reduce')
        expect(shell).to_have_attribute('data-motion', 'reduced')
        slider.fill('1')
        expect(shell).to_have_attribute('data-mood', '1')
        expect(shell).to_have_attribute('data-mood-transition', 'idle')
        target_points = [float(n) for n in re.findall(r'-?\d+\.?\d*', page.locator('[data-orb-shape]').first.get_attribute('d'))]
        slider.fill('4')
        expect(shell).to_have_attribute('data-mood', '4')
        expect(shell).to_have_attribute('data-mood-transition', 'idle')
        start_points = [float(n) for n in re.findall(r'-?\d+\.?\d*', page.locator('[data-orb-shape]').first.get_attribute('d'))]
        assert start_points != target_points
        page.emulate_media(reduced_motion='no-preference')
        expect(shell).to_have_attribute('data-motion', 'running')
        # Observe frames across the actual running transition, including AA inks.
        page.evaluate('''() => {
            window.motionFrames = []; const start = performance.now();
            window.transitionEvents = [];
            const root=document.querySelector('.app-shell');
            window.motionObserver = new MutationObserver(()=>window.transitionEvents.push({t:performance.now()-start, mood:root.dataset.mood, state:root.dataset.moodTransition}));
            window.motionObserver.observe(root,{attributes:true,attributeFilter:['data-mood','data-mood-transition']});
            function sample() {
                const shell = document.querySelector('.app-shell'), action = document.querySelector('.mood-screen .action-primary');
                const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1; const c = canvas.getContext('2d');
                function rgb(color) { c.clearRect(0,0,1,1); c.fillStyle=color; c.fillRect(0,0,1,1); return [...c.getImageData(0,0,1,1).data].slice(0,3); }
                const s = getComputedStyle(action);
                window.motionFrames.push({t:performance.now()-start, bg:rgb(s.backgroundColor), ink:rgb(s.color),
                    ambient:rgb(getComputedStyle(shell).getPropertyValue('--mood-ambient')), orb:rgb(getComputedStyle(document.querySelector('.mood-orb')).color),
                    gradient:getComputedStyle(shell).backgroundImage, d:document.querySelector('[data-orb-shape]').getAttribute('d'), status:shell.dataset.moodTransition});
                if (performance.now()-start < 950) requestAnimationFrame(sample);
            } requestAnimationFrame(sample);
        }''')
        slider.fill('1')
        expect(slider).to_have_attribute('aria-valuetext', 'Muy desagradable, 1 de 7')
        expect(shell).to_have_attribute('data-mood-transition', 'running')
        page.wait_for_timeout(180)
        during = page.locator('[data-orb-shape]').first.get_attribute('d')
        # Input remains usable during morph and restarting begins from visible geometry.
        slider.fill('7')
        after = page.locator('[data-orb-shape]').first.get_attribute('d')
        before_points = [float(n) for n in re.findall(r'-?\d+\.?\d*', during)]
        after_points = [float(n) for n in re.findall(r'-?\d+\.?\d*', after)]
        assert len(before_points) == len(after_points) and max(abs(a-b) for a,b in zip(before_points,after_points)) < 10, 'morph salta al cambiar destino'
        expect(shell).to_have_attribute('data-mood-transition', 'idle', timeout=2000)
        page.wait_for_timeout(300)
        frames = page.evaluate('window.motionFrames')
        assert len(frames) > 10
        assert len({f['gradient'] for f in frames}) > 4 and len({f['d'] for f in frames}) > 4
        def lum(rgb):
            return sum((c/255/12.92 if c/255 <= .04045 else ((c/255+.055)/1.055)**2.4)*w for c,w in zip(rgb,[.2126,.7152,.0722]))
        ratios = [(max(lum(f['bg']),lum(f['ink']))+.05)/(min(lum(f['bg']),lum(f['ink']))+.05) for f in frames]
        assert min(ratios) >= 4.5, min(ratios)
        times = page.evaluate('window.transitionEvents')
        first_start = next(t['t'] for t in times if t['mood']=='1' and t['state']=='running')
        start_time = next(t['t'] for t in times if t['mood']=='7' and t['state']=='running')
        end_time = next(t['t'] for t in times if t['mood']=='7' and t['state']=='idle')
        measured_duration = end_time - start_time
        assert 550 <= measured_duration <= 950, ('duración distinta de 600ms', measured_duration)
        def progress(current, start, end):
            delta = [b-a for a,b in zip(start,end)]
            return sum((v-a)*d for v,a,d in zip(current,start,delta)) / sum(d*d for d in delta)
        coordinated = []
        for f in [f for f in frames if 30 < f['t'] - first_start < 150]:
            points = [float(n) for n in re.findall(r'-?\d+\.?\d*', f['d'])]
            shape_progress = progress(points, start_points, target_points)
            observed = [progress(f['bg'], [46,192,188], [137,47,201]),
                        progress(f['ambient'], [15,86,84], [50,19,77]),
                        progress(f['orb'], [95,211,208], [168,69,218])]
            coordinated.append(max(abs(p-shape_progress) for p in observed))
        assert len(coordinated) >= 3 and max(coordinated) < .02, ('propiedades desincronizadas', coordinated)
        assert page.locator('[data-particle-family="sparks"]').evaluate('e => getComputedStyle(e).opacity') == '1'
        assert page.locator('[data-particle-family="dots"]').evaluate('e => getComputedStyle(e).opacity') == '0'
        if artifacts:
            page.screenshot(path=str(artifacts / f'{engine}-pleasant.png'))

        # The visibility handler receives the same signal as a background tab;
        # synthetic visibility lets all engines exercise pause/resume deterministically.
        page.evaluate('''() => { window.syntheticHidden = true;
            Object.defineProperty(document, 'hidden', {configurable:true, get:() => window.syntheticHidden});
            document.dispatchEvent(new Event('visibilitychange'));
        }''')
        expect(shell).to_have_attribute('data-motion', 'paused')
        page.locator('.orb-turn').evaluate_all('es => Promise.all(es.flatMap(e=>e.getAnimations().map(a=>a.ready))).then(()=>true)')
        frozen = page.locator('.orb-turn').first.evaluate('e => getComputedStyle(e).transform')
        page.wait_for_timeout(180)
        assert frozen == page.locator('.orb-turn').first.evaluate('e => getComputedStyle(e).transform')
        assert all(state == 'paused' for state in page.locator('.orb-particle').evaluate_all('es=>es.map(e=>getComputedStyle(e).animationPlayState)'))
        page.evaluate('''() => {window.syntheticHidden=false; document.dispatchEvent(new Event('visibilitychange'));}''')
        expect(shell).to_have_attribute('data-motion', 'running')

        page.emulate_media(reduced_motion='reduce')
        expect(shell).to_have_attribute('data-motion', 'reduced')
        slider.fill('2')
        expect(shell).to_have_attribute('data-mood-transition', 'idle')
        assert all(name == 'none' for name in page.locator('.orb-breath, .orb-turn, .orb-particle').evaluate_all('es=>es.map(e=>getComputedStyle(e).animationName)'))
        slider.focus()
        page.keyboard.press('Home')
        expect(slider).to_have_value('1')
        page.keyboard.press('End')
        expect(slider).to_have_value('7')
        page.keyboard.press('ArrowLeft')
        expect(slider).to_have_value('6')
        styles = slider.evaluate('''e => {const s = getComputedStyle(e); return {appearance:s.appearance, height:e.getBoundingClientRect().height};}''')
        assert styles['appearance'] == 'none' and styles['height'] >= 44
        rect = slider.bounding_box()
        page.mouse.click(rect['x'] + rect['width'] / 2, rect['y'] + rect['height'] / 2)
        expect(slider).to_have_value('4')
        page.mouse.move(rect['x'] + rect['width']/2, rect['y'] + rect['height']/2)
        page.mouse.down()
        page.mouse.move(rect['x']+rect['width']-15, rect['y']+rect['height']/2, steps=10)
        page.mouse.up()
        expect(slider).to_have_value('7')
        slider.fill('4')
        if artifacts:
            page.screenshot(path=str(artifacts / f'{engine}-neutral.png'))
        page.emulate_media(reduced_motion='no-preference')
        slider.fill('1')
        page.get_by_role('link', name='Ayuda ahora', exact=True).click()
        page.wait_for_url(base + '/ayuda')
        assert shell.get_attribute('data-motion') is None
        assert page.locator('.orb-breath').count() == 0
        page.go_back()
        expect(slider).to_have_value('1')
        page.reload()
        expect(slider).to_have_value('1')
        expect(shell).to_have_attribute('data-mood-transition', 'idle')
        assert not errors, errors
        results[engine] = {'frames': len(frames), 'minimum_transition_contrast': round(min(ratios), 2), 'transition_ms': round(measured_duration, 1), 'maximum_progress_difference': round(max(coordinated),4), 'breath_scale_bounds': breath_bounds, 'visibility_handler': 'synthetic hidden/visibilitychange', 'keyboard_and_pointer': 'pass'}
        context.close()
        if artifacts:
            Path(page.video.path()).replace(artifacts / f'{engine}-motion.webm')
        reflow_context = browser.new_context(reduced_motion='reduce')
        reflow_page = reflow_context.new_page()
        reflow_page.goto(base + '/registro/animo')
        reflow_slider = reflow_page.get_by_role('slider')
        expect(reflow_slider).to_be_visible()
        reflow_page.evaluate("document.documentElement.style.fontSize='200%'")
        reflow_cases = 0
        for width in [320,390,520]:
            for height in [844,470]:
                reflow_page.set_viewport_size({'width':width,'height':height})
                for level in range(1,8):
                    reflow_slider.fill(str(level))
                    expect(reflow_page.locator('.app-shell')).to_have_attribute('data-mood',str(level))
                    assert reflow_page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), (engine,width,height,level)
                    for control in [reflow_slider,reflow_page.locator('.mood-screen > .action-primary')]:
                        control.scroll_into_view_if_needed()
                        box=control.bounding_box()
                        assert box and box['width']>0 and box['height']>=44 and box['y']>=-1 and box['y']+box['height']<=height+1, (engine,width,height,level,box)
                    reflow_cases += 1
        results[engine]['reflow_at_200_percent'] = reflow_cases
        reflow_context.close()
        if engine != 'firefox':
            touch_context = browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
            touch_page = touch_context.new_page()
            touch_page.goto(base + '/registro/animo')
            touch_slider = touch_page.get_by_role('slider')
            expect(touch_slider).to_be_visible()
            touch_slider.fill('1')
            box = touch_slider.bounding_box()
            touch_page.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2)
            expect(touch_slider).to_have_value('4')
            results[engine]['touch'] = 'tap in browser touch context'
            touch_context.close()
        browser.close()
if artifacts:
    (artifacts / 'motion-measurements.json').write_text(json.dumps(results, indent=2) + '\n')
print('PASS: material, ciclos, transición/retargeting, AA por frame, partículas, pausa/reduced motion, slider/teclado y navegación:', ', '.join(results))
