const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.EUDILA_APP_URL || "http://127.0.0.1:3119";
const assets = path.resolve(__dirname, "..", "assets");

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/registro/animo`);
  await settle(page);
  await page.screenshot({ path: path.join(assets, "app-registro.png") });

  await page.goto(`${baseUrl}/hoy`);
  await settle(page);
  const examples = page.getByRole("button", { name: /Cargar ejemplos ficticios/i });
  if (await examples.isVisible().catch(() => false)) {
    await examples.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(assets, "app-hoy.png") });

  await browser.close();
  console.log("Capturas reales actualizadas: registro y Hoy (390 × 844). ");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
