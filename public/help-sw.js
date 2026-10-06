// SPDX-License-Identifier: AGPL-3.0-only
const CACHE = "eudila-help-v2";
let preparing;

function refreshHelp() {
  // El lock también coordina el worker activo con uno nuevo que se instala.
  return (preparing ??= self.navigator.locks
    .request(CACHE, prepareHelp)
    .finally(() => {
      preparing = undefined;
    }));
}

async function prepareHelp() {
  const response = await fetch("/ayuda", {
    cache: "no-store",
    credentials: "omit",
  });
  if (
    !response.ok ||
    response.redirected ||
    !response.headers.get("content-type")?.startsWith("text/html")
  )
    throw new Error("Ayuda no está disponible");
  // ponytail: snapshot del HTML generado por Next; generar una ruta estática
  // si cambia su formato. No incluye scripts, hidratación ni datos de sesión.
  const html = (await response.text())
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b(?=[^>]*\bas="script")[^>]*>/gi, "");
  const assets = [
    ...new Set(
      [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
        .map((match) => new URL(match[1], self.location.origin))
        .filter(
          (url) =>
            (url.origin === self.location.origin &&
              url.pathname.startsWith("/_next/static/") &&
              /\.(css|woff2?|ttf)$/.test(url.pathname)) ||
            (url.origin === self.location.origin &&
              url.pathname === "/brand/icon.svg"),
        )
        .map((url) => url.href),
    ),
  ];
  const cache = await caches.open(CACHE);
  await cache.addAll(assets);
  await cache.put(
    "/ayuda",
    new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }),
  );
  // Mantener solo los recursos de la copia actual, incluso tras nuevos builds.
  const keys = await cache.keys();
  await Promise.all(
    keys
      .filter(
        (key) =>
          new URL(key.url).pathname !== "/ayuda" && !assets.includes(key.url),
      )
      .map((key) => cache.delete(key)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(refreshHelp().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("eudila-help-") && key !== CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "refresh-help")
    event.waitUntil(refreshHelp().catch(() => {})); // Una falla conserva la última copia.
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (url.pathname === "/ayuda" || url.pathname === "/ayuda/") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) throw new Error("Ayuda no está disponible");
          return response;
        })
        .catch(async () => {
          // Next.js convierte esta respuesta HTML a su petición RSC fallida en una
          // navegación completa; el documento funciona sin JavaScript ni internet.
          const cached = await (await caches.open(CACHE)).match("/ayuda");
          return cached || Response.error();
        }),
    );
  } else if (
    (url.pathname.startsWith("/_next/static/") &&
      /\.(css|woff2?|ttf)$/.test(url.pathname)) ||
    url.pathname === "/brand/icon.svg"
  ) {
    event.respondWith(
      caches
        .open(CACHE)
        .then(
          async (cache) =>
            (await cache.match(event.request)) || fetch(event.request),
        ),
    );
  }
});
