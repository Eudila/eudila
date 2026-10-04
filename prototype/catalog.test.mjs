// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { loadCatalogRows } from "./catalog.js";

const config = { url: "https://catalog.invalid/", anonKey: "public-test-key" };
const seeds = JSON.parse(
  readFileSync(new URL("../data/catalogo-v1.json", import.meta.url), "utf8"),
);

test("lee los endpoints y conserva las filas de ANI-96", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const request = new URL(url);
    const table = request.pathname.split("/").at(-1);
    assert.ok(["emociones", "factores_vida"].includes(table));
    assert.equal(request.pathname, `/rest/v1/${table}`);
    assert.equal(request.searchParams.get("order"), "nombre.asc");
    assert.equal(request.searchParams.get("select"), table === "emociones" ? "id,nombre,sugerida" : "id,nombre");
    assert.deepEqual(options.headers, { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` });
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => seeds[table] };
  });
  for (const table of ["emociones", "factores_vida"])
    assert.deepEqual(await loadCatalogRows(table, config), seeds[table]);
});

test("rechaza respuestas incompatibles sin filtrar filas en silencio", async (t) => {
  const emotion = seeds.emociones[0];
  const invalid = [null, {}, [null], [{ ...emotion, id: 1 }], [{ ...emotion, id: "not-a-uuid" }], [{ ...emotion, nombre: " " }], [{ ...emotion, nombre: 1 }], [{ ...emotion, sugerida: "true" }], [{ ...emotion, sugerida: undefined }], [emotion, { ...emotion, id: emotion.id.toUpperCase() }]];
  let rows;
  t.mock.method(globalThis, "fetch", async () => ({ ok: true, json: async () => rows }));
  for (const value of invalid) {
    rows = value;
    await assert.rejects(loadCatalogRows("emociones", config));
  }
  rows = [];
  assert.deepEqual(await loadCatalogRows("emociones", config), []);
});

test("no consulta tablas ajenas al catálogo", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new Error("No debe consultar"); });
  await assert.rejects(loadCatalogRows("registros", config));
  assert.equal(fetch.mock.callCount(), 0);
});

test("propaga fallos HTTP y JSON incompleto", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false }));
  await assert.rejects(loadCatalogRows("emociones", config));
  globalThis.fetch = async () => ({ ok: true, json: async () => { throw new SyntaxError("JSON incompleto"); } });
  await assert.rejects(loadCatalogRows("emociones", config));
});

test("cancelar una lectura cancela el fetch", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    controller.abort();
    assert.equal(signal.aborted, true);
  }));
  await assert.rejects(loadCatalogRows("emociones", config, controller.signal), { name: "AbortError" });
});
