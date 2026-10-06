# SPDX-License-Identifier: AGPL-3.0-only
"""Check the painted app symbol's actual diameter, not its nested SVG box."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os
from playwright.sync_api import sync_playwright
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
root=Path(__file__).resolve().parents[2]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=root))
Thread(target=server.serve_forever,daemon=True).start()
try:
    with sync_playwright() as p:
        for engine in os.environ.get('ICON_ENGINES','chromium,webkit,firefox').split(','):
            browser=getattr(p,engine).launch(**({'executable_path':os.environ.get('CHROME_BIN','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')} if engine=='chromium' else {}))
            page=browser.new_page()
            page.goto(f'http://127.0.0.1:{server.server_port}/app/icon.svg',wait_until='load')
            bounds=page.locator('.orb-layer').first.evaluate('''path => {
                const box=path.getBBox(),matrix=path.getScreenCTM(),canvas=path.ownerDocument.documentElement.getBoundingClientRect();
                const a=new DOMPoint(box.x,box.y).matrixTransform(matrix),b=new DOMPoint(box.x+box.width,box.y+box.height).matrixTransform(matrix);
                return {diameter:(b.x-a.x)/canvas.width, centerX:((a.x+b.x)/2-canvas.x)/canvas.width, centerY:((a.y+b.y)/2-canvas.y)/canvas.height};
            }''')
            assert abs(bounds['diameter']-.64)<.001, (engine,'Neutral no ocupa 64%',bounds)
            assert abs(bounds['centerX']-.5)<.001 and abs(bounds['centerY']-.5)<.001, bounds
            assert page.locator('.orb-layer').count()==5
            assert page.locator('.orb-core').count()==1
            assert page.locator('filter, .orb-particle, [data-animated]').count()==0
            browser.close()
            print(f'PASS {engine}: Neutral centrado al 64%, cinco capas y núcleo, sin halo/partículas',flush=True)
finally:
    server.shutdown();server.server_close()
