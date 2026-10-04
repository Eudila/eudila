// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";

async function load(relative, replacements = {}) {
  let code = transpileModule(
    await readFile(new URL(relative, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ModuleKind.ESNext,
        target: ScriptTarget.ES2022,
      },
    },
  ).outputText;
  for (const [specifier, url] of Object.entries(replacements))
    code = code.replaceAll(`"${specifier}"`, `"${url}"`);
  const url = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  return { url, api: await import(url) };
}
const recordsUrl = new URL("../historial/records.ts", import.meta.url).href;
const { url: exportsUrl } = await load("../exportar/export.ts", {
  "../historial/records": recordsUrl,
  "../../prototype/moods.js": new URL(
    "../../prototype/moods.js",
    import.meta.url,
  ).href,
});
const { api } = await load("./data.ts", {
  "../historial/records": recordsUrl,
  "../exportar/export": exportsUrl,
});
const oldTimezone = process.env.TZ;
process.env.TZ = "America/Argentina/Buenos_Aires";
test.after(() => {
  if (oldTimezone) process.env.TZ = oldTimezone;
  else delete process.env.TZ;
});
const now = new Date("2026-10-04T18:00:00Z");
const factorA = { id: "factor-a", nombre: "Familia" };
const factorB = { id: "factor-b", nombre: "Familia" };
function entry(id, recordedAt, extra = {}) {
  return {
    id,
    recordedAt,
    type: "libre",
    mood: 4,
    emotion: { id: "calm", nombre: "Calma" },
    factors: [],
    source: "preview",
    ...extra,
  };
}
function sequence(count, dates) {
  return Array.from({ length: count }, (_, index) =>
    entry(
      String(index),
      `2026-10-${String(4 - (index % dates)).padStart(2, "0")}T12:00:00Z`,
    ),
  );
}
test("período inclusivo por medianoche local excluye futuros y preserva promedio fraccional", () => {
  const records = [
    entry("before", "2026-09-28T02:59:59Z"),
    entry("start", "2026-09-28T03:00:00Z", { mood: 2 }),
    entry("same", "2026-09-28T09:00:00Z", { mood: 3 }),
    entry("today", "2026-10-04T18:00:00Z"),
    entry("future-time", "2026-10-04T19:00:00Z"),
    entry("future-day", "2026-10-05T03:00:00Z"),
  ];
  const snapshot = JSON.stringify(records);
  const result = api.analysis(records, "7", now);
  assert.deepEqual(result.period, { start: "2026-09-28", end: "2026-10-04" });
  assert.equal(result.days.length, 7);
  assert.deepEqual(
    result.chronology.map((record) => record.id),
    ["start", "same", "today"],
  );
  assert.equal(result.days[0].average, 2.5);
  assert.equal(result.days[1].average, null);
  assert.equal(result.days[0].count, 2);
  assert.equal(result.lineEnabled, false);
  assert.deepEqual(result.segments, []);
  assert.equal(JSON.stringify(records), snapshot);
});
test("2/3 registros y 13/14 registros en 6/7 fechas respetan el umbral técnico", () => {
  for (const [count, dates, expected] of [
    [2, 2, false],
    [3, 3, false],
    [13, 7, false],
    [14, 6, false],
    [14, 7, true],
  ]) {
    // Fechas válidas de septiembre/octubre, dos registros por día en el caso 14/7.
    const records = sequence(count, Math.min(dates, 4));
    records.forEach((record, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (index % dates));
      date.setHours(9, 0, 0, 0);
      record.recordedAt = date.toISOString();
    });
    assert.equal(
      api.analysis(records, "30", now).lineEnabled,
      expected,
      `${count}/${dates}`,
    );
  }
});
test("líneas unen únicamente días consecutivos con datos y cada serie filtrada tiene su umbral", () => {
  const records = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - [0, 1, 2, 4, 5, 6, 7][index % 7]);
    date.setHours(9, 0, 0, 0);
    return entry(String(index), date.toISOString(), {
      factors: index < 2 ? [factorA] : [],
      source: index === 0 ? "example" : "preview",
    });
  });
  const result = api.analysis(records, "30", now);
  assert.equal(result.lineEnabled, true);
  assert.equal(result.segments.length, 5);
  assert.ok(
    !result.segments.some(
      (segment) =>
        segment.from.day === "2026-09-30" && segment.to.day === "2026-10-02",
    ),
  );
  assert.equal(result.exampleCount, 1);
  const filtered = api.analysis(records, "30", now, "factor-a");
  assert.equal(filtered.chronology.length, 2);
  assert.equal(filtered.lineEnabled, false);
  assert.deepEqual(filtered.segments, []);
});
test("factor por UUID cuenta una vez por registro, admite varios y usa etiqueta más reciente", () => {
  const records = [
    entry("latest", "2026-10-04T12:00:00Z", {
      mood: 7,
      factors: [{ ...factorA, nombre: "Familia y vínculos" }, factorB],
    }),
    entry("old", "2026-09-30T12:00:00Z", {
      mood: 1,
      factors: [factorA, factorA],
      source: "example",
    }),
    entry("none", "2026-10-04T13:00:00Z"),
  ];
  const snapshot = JSON.stringify(records);
  const result = api.factorGroups(records, "7", now);
  assert.equal(result.withoutFactors, 1);
  assert.equal(result.groups.length, 2);
  assert.equal(result.groups[0].id, "factor-a");
  assert.equal(result.groups[0].nombre, "Familia y vínculos");
  assert.equal(result.groups[0].count, 2);
  assert.deepEqual(result.groups[0].distribution, [1, 0, 0, 0, 0, 0, 1]);
  assert.equal(result.groups[1].count, 1);
  assert.equal(api.factorName(records, "factor-a"), "Familia y vínculos");
  assert.equal(api.factorName(records, "unknown"), null);
  assert.equal(JSON.stringify(records), snapshot);
});
test("rango 7/30/90 conserva días de calendario bisiestos y DST; normaliza query", () => {
  assert.equal(api.normalizeRange("7"), "7");
  assert.equal(api.normalizeRange("90"), "90");
  for (const query of [undefined, "all", "0", ["7", "90"]])
    assert.equal(api.normalizeRange(query), "30");
  const leap = api.analysis([], "7", new Date("2024-03-01T12:00:00Z"));
  assert.ok(leap.days.some((point) => point.day === "2024-02-29"));
  process.env.TZ = "America/New_York";
  try {
    for (const instant of ["2026-03-10T16:00:00Z", "2026-11-03T17:00:00Z"])
      for (const range of ["7", "30", "90"]) {
        const result = api.analysis([], range, new Date(instant));
        assert.equal(result.days.length, Number(range));
        assert.equal(
          new Set(result.days.map((point) => point.day)).size,
          Number(range),
        );
      }
  } finally {
    process.env.TZ = "America/Argentina/Buenos_Aires";
  }
});

test("nombre estable fuera de rango y desempate consistente de selecciones con igual hora", () => {
  const records = [
    entry("old", "2026-09-15T12:00:00Z", { factors: [factorA] }),
    entry("first", "2026-10-04T12:00:00Z", {
      factors: [{ ...factorA, nombre: "Nombre anterior" }],
    }),
    entry("last", "2026-10-04T12:00:00Z", {
      factors: [{ ...factorA, nombre: "Nombre vigente" }],
    }),
  ];
  assert.equal(api.factorName(records, "factor-a"), "Nombre vigente");
  assert.equal(
    api.factorGroups(records, "30", now).groups[0].nombre,
    "Nombre vigente",
  );
  const past = new Date("2026-09-16T18:00:00Z");
  const group = api.factorGroups(records, "7", past).groups[0];
  assert.equal(group.count, 1);
  assert.equal(group.nombre, "Nombre vigente");
  assert.equal(
    api.analysis(records, "7", past, "factor-a").chronology.length,
    1,
  );
});
