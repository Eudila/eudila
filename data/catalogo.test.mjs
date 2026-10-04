// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { newDraft, restoreDraft } from "../prototype/flow-state.js";

const catalog = JSON.parse(
  readFileSync(new URL("./catalogo-v1.json", import.meta.url), "utf8"),
);
const document = readFileSync(
  new URL("../docs/content/catalogo-emociones-factores.md", import.meta.url),
  "utf8",
);

test("filas importables, nombres únicos y seis sugerencias", () => {
  assert.equal(catalog.version, "1.0.0");
  assert.equal(catalog.idioma, "es-AR");
  const ids = new Set();
  for (const table of ["emociones", "factores_vida"]) {
    const names = new Set();
    for (const row of catalog[table]) {
      assert.deepEqual(
        Object.keys(row).sort(),
        (table === "emociones"
          ? ["id", "nombre", "sugerida"]
          : ["id", "nombre"]
        ).sort(),
      );
      assert.match(
        row.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      assert.ok(!ids.has(row.id), "UUID repetido");
      ids.add(row.id);
      assert.equal(row.nombre, row.nombre.trim().normalize("NFC"));
      assert.ok(row.nombre.length > 0 && row.nombre.length <= 40);
      const normalized = row.nombre.toLocaleLowerCase("es-AR");
      assert.ok(!names.has(normalized), "Etiqueta repetida");
      names.add(normalized);
      if (table === "emociones") assert.equal(typeof row.sugerida, "boolean");
    }
  }
  assert.equal(catalog.emociones.length, 21);
  assert.equal(catalog.factores_vida.length, 15);
  assert.deepEqual(
    catalog.emociones
      .filter((row) => row.sugerida)
      .map((row) => row.nombre)
      .sort(),
    ["Alegría", "Calma", "Enojo", "Miedo", "Preocupación", "Tristeza"].sort(),
  );
});

test("documento y JSON comparten etiquetas e identidades estables", () => {
  const namespace = Buffer.from("6ba7b8119dad11d180b400c04fd430c8", "hex");
  for (const table of ["emociones", "factores_vida"]) {
    for (const row of catalog[table]) {
      const line = document
        .split("\n")
        .find(
          (value) =>
            value.includes(` | ${row.nombre} | `) && !value.includes(row.id),
        );
      assert.ok(line, `Falta documentar ${row.nombre}`);
      const slug = line.match(/^\| `([a-z-]+)` \|/)[1];
      const bytes = createHash("sha1")
        .update(namespace)
        .update(`https://github.com/Eudila/eudila/catalogo/${table}/${slug}`)
        .digest()
        .subarray(0, 16);
      bytes[6] = (bytes[6] & 0x0f) | 0x50;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = bytes.toString("hex");
      assert.equal(
        row.id,
        `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`,
      );
      if (table === "emociones")
        assert.equal(line.split(" | ")[2], row.sugerida ? "Sí" : "No");
    }
  }
});

test("alternativas explícitas y UUID conservados por el borrador", () => {
  for (const name of [
    "Otra emoción",
    "No sé cómo nombrarlo",
    "Prefiero no indicarlo",
  ]) {
    const row = catalog.emociones.find((item) => item.nombre === name);
    assert.equal(row.sugerida, false);
    assert.ok(document.includes(`| \`${row.id}\` | ${name} |`));
    const draft = {
      ...newDraft(),
      type: "libre",
      emotionId: row.id,
      factors: [catalog.factores_vida[0].id, catalog.factores_vida[1].id],
    };
    assert.deepEqual(restoreDraft(JSON.stringify(draft)), draft);
    assert.deepEqual(
      restoreDraft(JSON.stringify({ ...draft, factors: [] })).factors,
      [],
    );
  }
});
