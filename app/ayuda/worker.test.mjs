// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const origin = "https://test.invalid";
const entries = new Map();
let release,
  paused,
  reads = 0,
  fetches = 0;
const gate = new Promise((resolve) => {
  release = resolve;
});
const waiting = new Promise((resolve) => {
  paused = resolve;
});
const key = (value) =>
  typeof value === "string" ? new URL(value, origin).href : value.url;
const cache = {
  async addAll(urls) {
    for (const url of urls) entries.set(url, "asset");
  },
  async put(request, response) {
    entries.set(key(request), await response.text());
  },
  async keys() {
    if (++reads === 1) {
      paused();
      await gate;
    }
    return Array.from(entries.keys(), (url) => ({ url }));
  },
  async delete(request) {
    return entries.delete(key(request));
  },
};
// LockManager compartido: simula el ámbito de origen del lock del navegador.
let queue = Promise.resolve();
const locks = {
  request: (_name, callback) => {
    const result = queue.then(callback);
    queue = result.catch(() => {});
    return result;
  },
};
const source = readFileSync(
  new URL("../../public/help-sw.js", import.meta.url),
  "utf8",
);
function worker() {
  const events = {};
  const context = vm.createContext({
    self: {
      location: { origin },
      navigator: { locks },
      addEventListener: (name, handler) => {
        events[name] = handler;
      },
    },
    URL,
    Response,
    caches: { open: async () => cache },
    fetch: async () =>
      new Response(
        `<link href="/_next/static/${++fetches}.css"><img src="/brand/icon.svg" alt="">`,
        {
          headers: { "content-type": "text/html" },
        },
      ),
  });
  vm.runInContext(source, context);
  return () =>
    new Promise((resolve, reject) => {
      events.message({
        data: "refresh-help",
        waitUntil: (result) => result.then(resolve, reject),
      });
    });
}
// Dos instancias (worker activo e instalando), no solo dos mensajes al mismo.
const active = worker(),
  installing = worker();
const first = active();
await waiting;
const second = installing();
await new Promise((resolve) => setTimeout(resolve, 10));
release();
await Promise.all([first, second]);
assert.equal(fetches, 2);
const html = entries.get(`${origin}/ayuda`);
const asset = new URL(html.match(/href="([^"]+)"/)[1], origin).href;
assert(entries.has(asset), `El HTML referencia un recurso borrado: ${asset}`);
assert(
  entries.has(`${origin}/brand/icon.svg`),
  "El icono debe estar disponible en Ayuda offline",
);
console.log(
  "ANI-67: dos workers concurrentes conservan los recursos de su copia HTML.",
);
