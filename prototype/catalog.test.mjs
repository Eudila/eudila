// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { loadCatalogRows } from "./catalog.js";

const config = { url: "https://catalog.invalid/", anonKey: "public-test-key" };
let rows = [{ id: "test-1", nombre: "Etiqueta de prueba", sugerida: true }];
globalThis.fetch = async (url, options) => {
  assert.match(url, /^https:\/\/catalog.invalid\/rest\/v1\/(emociones|factores_vida)\?/);
  assert.equal(options.headers.apikey, config.anonKey);
  assert.equal(options.cache, "no-store");
  return { ok: true, json: async () => rows };
};
assert.deepEqual(await loadCatalogRows("emociones", config), rows);
for (const invalid of [null, {}, [null], [{ id: {}, nombre: "A", sugerida: true }], [{ id: "a", nombre: " ", sugerida: true }], [{ id: "a", nombre: "A" }], [...rows, ...rows]]) {
  rows = invalid;
  await assert.rejects(loadCatalogRows("emociones", config));
}
rows = [];
assert.deepEqual(await loadCatalogRows("emociones", config), []);
rows = [{ id: 1, nombre: "Factor de prueba" }];
assert.deepEqual(await loadCatalogRows("factores_vida", config), rows);
await assert.rejects(loadCatalogRows("registros", config));
globalThis.fetch = async () => ({ ok: false });
await assert.rejects(loadCatalogRows("emociones", config));
console.log("Catálogo: validación y errores correctos");
