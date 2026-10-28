// Capturas reales de la app Next.js para la landing: los cinco pasos del registro.
// Requiere la app en vista previa (NEXT_PUBLIC_FRONTEND_PREVIEW=true) en EUDILA_APP_URL.
// Cada captura es el área útil de un celular (390 × 763) con su barra de estado y el
// indicador de inicio, para que las esquinas redondeadas del teléfono no corten la app.
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.EUDILA_APP_URL || "http://127.0.0.1:3119";
const assets = path.resolve(__dirname, "..", "assets");
const SCALE = Number(process.env.CAPTURE_SCALE || 2);
const W = 390,
  H = 844,
  STATUS = 47,
  HOME = 34;

// IDs del catálogo v1 (data/catalogo-v1.json).
const ALIVIO = "851800a9-6633-56f1-8bb7-39acac479435";
const FACTORES = [
  "74fefb59-738a-5fff-aa9a-9f441853adcd",
  "38688d41-d762-5c75-97e3-eb22ffafd7e2",
]; // Amistades, Actividad física

const shots = [
  ["app-tipo", "/registro/tipo", null],
  [
    "app-animo",
    "/registro/animo",
    { type: "noche", mood: 6, emotionId: null, factors: [] },
  ],
  [
    "app-emocion",
    "/registro/emocion",
    { type: "noche", mood: 6, emotionId: ALIVIO, factors: [] },
  ],
  [
    "app-factores",
    "/registro/factores",
    { type: "noche", mood: 6, emotionId: ALIVIO, factors: FACTORES },
  ],
  [
    "app-confirmacion",
    "/registro/confirmacion",
    { type: "noche", mood: 6, emotionId: ALIVIO, factors: FACTORES },
  ],
];

/** Arma la pantalla completa: barra de estado + app + indicador de inicio, con el color de cada borde. */
async function phoneScreen(browser, png) {
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: SCALE,
  });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">
    <div style="width:${W}px;height:${H}px;display:flex;flex-direction:column;color:#fff;font:600 16px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <div id="top" style="height:${STATUS}px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:4px 30px 0 40px;box-sizing:border-box">
        <span style="letter-spacing:-0.01em">9:41</span>
        <svg width="66" height="12" viewBox="0 0 66 12" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/>
          <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/>
          <path d="M28.5 3.6a8.6 8.6 0 0 1 11 0M30.6 6.3a5.3 5.3 0 0 1 6.8 0M32.7 9a2 2 0 0 1 2.6 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
          <rect x="43.5" y="0.5" width="20" height="11" rx="3.2" stroke="currentColor" stroke-opacity=".45" fill="none"/>
          <rect x="45.5" y="2.5" width="16" height="7" rx="1.6" fill="currentColor"/><rect x="64.5" y="4" width="1.5" height="4" rx=".7" fill="currentColor" fill-opacity=".45"/>
        </svg>
      </div>
      <img id="app" style="width:${W}px;height:${H - STATUS - HOME}px;display:block;flex:none" />
      <div id="bottom" style="height:${HOME}px;flex:none;display:grid;place-items:center">
        <span style="width:134px;height:5px;border-radius:3px;background:currentColor;opacity:.72"></span>
      </div>
    </div></body></html>`);
  await page.evaluate(
    async (src) => {
      const img = document.getElementById("app");
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      // Each bar takes its edge's color, and dark ink on the light theme.
      const paint = (id, y) => {
        const [r, g, b] = ctx.getImageData(
          Math.round(c.width / 2),
          y,
          1,
          1,
        ).data;
        const bar = document.getElementById(id);
        bar.style.background = `rgb(${r} ${g} ${b})`;
        bar.style.color =
          0.2126 * r + 0.7152 * g + 0.0722 * b > 140 ? "#1a1626" : "#fff";
      };
      paint("top", 1);
      paint("bottom", c.height - 2);
    },
    `data:image/png;base64,${png.toString("base64")}`,
  );
  const out = await page.screenshot();
  await page.close();
  return out;
}

async function main() {
  // CAPTURE_CHANNEL="" uses Playwright's own Chromium when Chrome is missing.
  const channel = process.env.CAPTURE_CHANNEL ?? "chrome";
  const browser = await chromium.launch({
    channel: channel || undefined,
    headless: true,
  });
  for (const [name, route, draft] of shots) {
    const context = await browser.newContext({
      viewport: { width: W, height: H - STATUS - HOME },
      deviceScaleFactor: SCALE,
      reducedMotion: "reduce",
      colorScheme: "light",
      locale: "es-AR",
    });
    // Borrador ficticio en la pestaña: el mismo mecanismo que usa la vista previa.
    await context.addInitScript((value) => {
      if (value)
        sessionStorage.setItem("eudila-draft-v1", JSON.stringify(value));
    }, draft);
    const page = await context.newPage();
    await page.goto(baseUrl + route, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    const screen = await phoneScreen(browser, await page.screenshot());
    require("node:fs").writeFileSync(path.join(assets, `${name}.png`), screen);
    await context.close();
  }
  await browser.close();
  console.log(
    `Capturas reales actualizadas: ${shots.length} pasos del registro (${W * SCALE} × ${H * SCALE}).`,
  );
}

// Se puede importar `phoneScreen` sin disparar las capturas.
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
module.exports = { phoneScreen, W, H, STATUS, HOME };
