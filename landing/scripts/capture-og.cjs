const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const source = path.resolve(__dirname, "og-source.html");
const output = path.resolve(__dirname, "..", "assets", "og-eudila.png");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: output });
  await browser.close();
  console.log("Imagen social actualizada: 1200 × 630.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
