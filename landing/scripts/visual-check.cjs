const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.LANDING_URL || "http://127.0.0.1:4173/";
const evidence = path.resolve(__dirname, "..", "evidence");

let browser;
async function mockTurnstile(context) {
  await context.route(
    "https://challenges.cloudflare.com/turnstile/v0/api.js?*",
    (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `window.turnstile = {
      render(selector, options) {
        const widget = document.createElement('div');
        widget.style.width = options.size === 'compact' ? '150px' : '300px';
        widget.style.height = options.size === 'compact' ? '140px' : '65px';
        document.querySelector(selector).appendChild(widget);
        window.challengeOptions = options;
        queueMicrotask(() => options.callback('fresh-token'));
        return 'contact-widget';
      },
      reset(id) {
        if (id !== 'contact-widget') throw new Error('wrong widget reset');
        window.resetCount = (window.resetCount || 0) + 1;
        queueMicrotask(() => window.challengeOptions.callback('next-token'));
      }
    }; window.onContactTurnstileLoad();`,
      }),
  );
}
(async () => {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const cases = [
    { width: 320, height: 844, scale: 1 },
    { width: 390, height: 844, scale: 1 },
    { width: 768, height: 900, scale: 1 },
    { width: 1440, height: 1000, scale: 1 },
    { width: 320, height: 844, scale: 2 },
    { width: 390, height: 844, scale: 2 },
  ];

  for (const item of cases) {
    const context = await browser.newContext({
      viewport: { width: item.width, height: item.height },
      reducedMotion: "reduce",
    });
    await mockTurnstile(context);
    await context.route("**/runtime-config.js", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: "window.EUDILA_CONFIG={contactEnabled:true,turnstileSitekey:'test-sitekey',contactEndpoint:'/api/contact'};",
      }),
    );
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    if (item.scale === 2) {
      await page.addStyleTag({
        content: "html { font-size: 200% !important; }",
      });
    }
    await page.evaluate(() => document.fonts.ready);
    // Las imágenes diferidas se piden ya: una imagen sin cargar no es una imagen rota.
    await page.evaluate(() =>
      Promise.all(
        [...document.images].map(
          (image) => (
            (image.loading = "eager"),
            image.decode().catch(() => {})
          ),
        ),
      ),
    );

    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      widgetFits:
        document
          .querySelector("#contact-turnstile")
          .firstElementChild.getBoundingClientRect().width <=
        document.querySelector("#contact-turnstile").clientWidth,
      pageWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
    }));
    assert.equal(
      layout.widgetFits,
      true,
      `widget recortado en ${item.width}px × ${item.scale}`,
    );
    assert.equal(
      layout.pageWidth,
      layout.viewport,
      `desborde horizontal en ${item.width}px × ${item.scale}`,
    );
    assert.deepEqual(
      layout.brokenImages,
      [],
      `imágenes rotas en ${item.width}px × ${item.scale}`,
    );
    assert.deepEqual(
      errors,
      [],
      `errores de consola en ${item.width}px × ${item.scale}`,
    );

    if (
      (item.width === 390 && item.scale === 1) ||
      (item.width === 1440 && item.scale === 1)
    ) {
      await page.screenshot({
        path: path.join(evidence, `landing-${item.width}-full.png`),
        fullPage: true,
      });
    }

    await context.close();
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await mockTurnstile(context);
  const page = await context.newPage();
  await page.route("**/runtime-config.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.EUDILA_CONFIG={contactEnabled:true,turnstileSitekey:'test-sitekey',contactEndpoint:'/api/contact'};",
    });
  });
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => window.challengeOptions["expired-callback"]());
  assert.equal(await page.locator("button[type='submit']").isDisabled(), true);
  await page.evaluate(() => window.challengeOptions.callback("fresh-token"));
  await page.locator("#name").fill("Ana Pérez");
  await page.locator("#email").fill("ana@example.org");
  await page.locator("#organization").fill("Municipio de ejemplo");
  await page
    .locator("#message")
    .fill("Queremos conversar sobre una implementación responsable.");
  await page.locator("input[name='privacy']").check();
  await page.locator("button[type='submit']").click();
  await page.locator("#form-status[data-state='success']").waitFor();
  assert.equal(
    await page.locator("#email").inputValue(),
    "",
    "el formulario exitoso debe limpiarse",
  );
  assert.equal(
    await page.evaluate(() => window.resetCount),
    1,
    "el token debe renovarse tras guardar",
  );
  await context.close();

  const errorContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await mockTurnstile(errorContext);
  const errorPage = await errorContext.newPage();
  await errorPage.route("**/runtime-config.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.EUDILA_CONFIG={contactEnabled:true,turnstileSitekey:'test-sitekey',contactEndpoint:'/api/contact'};",
    });
  });
  await errorPage.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "Entrega temporalmente no disponible." }),
    });
  });
  await errorPage.goto(baseUrl, { waitUntil: "networkidle" });
  await errorPage.locator("#name").fill("Ana Pérez");
  await errorPage.locator("#email").fill("ana@example.org");
  await errorPage
    .locator("#message")
    .fill("Queremos conversar sobre una implementación responsable.");
  await errorPage.locator("input[name='privacy']").check();
  await errorPage.locator("button[type='submit']").click();
  await errorPage.locator("#form-status[data-state='error']").waitFor();
  assert.equal(
    await errorPage.locator("#email").inputValue(),
    "ana@example.org",
    "un error de entrega debe conservar los datos",
  );
  assert.equal(
    await errorPage.evaluate(() => window.resetCount),
    1,
    "el token debe renovarse tras un error",
  );
  await errorPage.evaluate(() => window.challengeOptions["error-callback"]());
  assert.equal(
    await errorPage.locator("button[type='submit']").isDisabled(),
    true,
  );
  await errorContext.close();

  await browser.close();
  console.log(
    `OK: ${cases.length} reflows, imágenes, consola y estados del formulario.`,
  );
})().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
  await browser?.close();
});
