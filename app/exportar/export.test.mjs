// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { transpileModule, ModuleKind, JsxEmit, ScriptTarget } from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function loadTs(relative, replacements = {}) {
  const file = new URL(relative, import.meta.url);
  let code = transpileModule(await readFile(file, "utf8"), {
    compilerOptions: {
      module: ModuleKind.ESNext,
      target: ScriptTarget.ES2022,
      jsx: JsxEmit.ReactJSX,
    },
  }).outputText;
  for (const [specifier, url] of Object.entries(replacements))
    code = code.replaceAll(`"${specifier}"`, `"${url}"`);
  const url = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  return { url, module: await import(url) };
}
const replacements = {
  "../historial/records": new URL("../historial/records.ts", import.meta.url)
    .href,
  "../../prototype/moods.js": new URL(
    "../../prototype/moods.js",
    import.meta.url,
  ).href,
};
const { module: api, url: exportUrl } = await loadTs(
  "./export.ts",
  replacements,
);
const {
  module: { default: Report },
} = await loadTs("./report.tsx", {
  ...replacements,
  "./export": exportUrl,
  "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"),
});

const originalTimezone = process.env.TZ;
process.env.TZ = "America/Argentina/Buenos_Aires";
test.after(() => {
  if (originalTimezone) process.env.TZ = originalTimezone;
  else delete process.env.TZ;
});
function entry(id, recordedAt, extra = {}) {
  return {
    id,
    recordedAt,
    type: "libre",
    mood: 4,
    emotion: { id: "emotion-calm", nombre: "Calma" },
    factors: [{ id: "factor-sleep", nombre: "Sueño y descanso" }],
    source: "preview",
    ...extra,
  };
}

test("períodos inclusivos y límites de medianoche local conservan varios registros", () => {
  const period = api.reportPeriod([], "7", new Date("2026-10-04T18:00:00Z"));
  assert.deepEqual(period, { start: "2026-09-28", end: "2026-10-04" });
  const records = [
    entry("before", "2026-09-28T02:59:59Z"),
    entry("start", "2026-09-28T03:00:00Z"),
    entry("end", "2026-10-05T02:59:59Z"),
    entry("after", "2026-10-05T03:00:00Z"),
    entry("second", "2026-09-28T09:00:00Z"),
  ];
  const summary = api.summarize(records, period);
  assert.deepEqual(
    summary.chronology.map((record) => record.id),
    ["start", "second", "end"],
  );
  assert.equal(summary.recordedDays, 2);
  assert.deepEqual(summary.missingDays, [
    "2026-09-29",
    "2026-09-30",
    "2026-10-01",
    "2026-10-02",
    "2026-10-03",
  ]);
});

test("días de calendario atraviesan año bisiesto y DST sin sumar bloques de 24 horas", () => {
  assert.deepEqual(api.periodDays({ start: "2024-02-28", end: "2024-03-01" }), [
    "2024-02-28",
    "2024-02-29",
    "2024-03-01",
  ]);
  assert.throws(() =>
    api.periodDays({ start: "2025-02-29", end: "2025-03-01" }),
  );
  process.env.TZ = "America/New_York";
  try {
    for (const end of ["2026-03-10T16:00:00Z", "2026-11-03T17:00:00Z"]) {
      const period = api.reportPeriod([], "7", new Date(end));
      assert.equal(api.periodDays(period).length, 7);
      const days = api.periodDays(period);
      assert.equal(new Set(days).size, 7);
    }
    assert.deepEqual(
      api.periodDays({ start: "2026-03-07", end: "2026-03-09" }),
      ["2026-03-07", "2026-03-08", "2026-03-09"],
    );
  } finally {
    process.env.TZ = "America/Argentina/Buenos_Aires";
  }
});

test("todo el historial incluye fechas anteriores y futuras; ventanas de 30/90 días son inclusivas", () => {
  const now = new Date("2026-10-04T12:00:00Z");
  const records = [
    entry("old", "2024-01-01T12:00:00Z"),
    entry("future", "2027-01-01T12:00:00Z"),
  ];
  const all = api.reportPeriod(records, "all", now);
  assert.deepEqual(all, { start: "2024-01-01", end: "2027-01-01" });
  assert.equal(api.summarize(records, all).chronology.length, 2);
  for (const days of ["30", "90"])
    assert.equal(
      api.periodDays(api.reportPeriod(records, days, now)).length,
      Number(days),
    );
});

test("CSV conserva acentos, comillas, saltos, ISO e identificadores; neutraliza fórmulas", () => {
  assert.equal(
    api.csvCell('Alegría, "calma"\nSueño'),
    '"Alegría, ""calma""\nSueño"',
  );
  for (const value of [
    "=1+1",
    "+SUM(A1)",
    "-2",
    "@formula",
    " \t=1",
    "\r\n+formula",
    "\uFEFF=1",
  ])
    assert.equal(api.csvCell(value), `"'${value}"`);
  assert.equal(api.csvCell("Calma"), '"Calma"');
  const record = entry("id-special", "2026-10-04T03:00:00.123Z", {
    emotion: { id: "emotion-specific", nombre: '  ="alegría"' },
    factors: [
      { id: "factor,1", nombre: 'Sueño, "descanso"\ntrabajo' },
      { id: "factor-2", nombre: "Familia" },
    ],
  });
  const csv = api.recordsCsv([record]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"2026-10-04T03:00:00.123Z"'));
  assert.ok(csv.includes('"2026-10-04","00:00:00"'));
  assert.ok(csv.includes(api.csvCell(record.emotion.nombre)));
  assert.ok(
    csv.includes(api.csvCell(JSON.stringify(["factor,1", "factor-2"]))),
  );
  assert.ok(
    csv.includes(
      api.csvCell(
        JSON.stringify(record.factors.map((factor) => factor.nombre)),
      ),
    ),
  );
  assert.ok(csv.endsWith("\r\n"));
});

test("JSON roundtrip conserva todos los campos y relaciones sin depender del período PDF", () => {
  const records = [
    entry("old", "2025-01-01T12:00:00Z"),
    entry("current", "2026-10-04T12:00:00Z", {
      factors: [],
      source: "example",
    }),
  ];
  assert.deepEqual(JSON.parse(api.recordsJson(records)), records);
  assert.match(
    api.exportFilename(new Date("2026-10-04T03:00:00Z"), "json"),
    /^eudila-vista-previa-historial-2026-10-04\.json$/,
  );
});

test("conteos distinguen UUID de alternativas y conservan selección en cronología", () => {
  const alternatives = [...api.alternativeEmotionIds];
  const records = [
    entry("ordinary", "2026-10-04T12:00:00Z", {
      emotion: { id: "ordinary-uuid", nombre: "Otra emoción" },
    }),
    ...alternatives.map((id, index) =>
      entry(`alternative-${index}`, "2026-10-04T13:00:00Z", {
        mood: index + 1,
        emotion: { id, nombre: `Alternativa ${index}` },
      }),
    ),
  ];
  const summary = api.summarize(records, {
    start: "2026-10-04",
    end: "2026-10-04",
  });
  assert.deepEqual(
    summary.emotions.map((emotion) => emotion.id),
    ["ordinary-uuid"],
  );
  assert.equal(summary.alternatives.length, 3);
  assert.equal(summary.chronology.length, 4);
  assert.equal(summary.factors[0].count, 4);
  assert.equal(
    summary.distribution.reduce((total, item) => total + item.count, 0),
    4,
  );
  assert.equal(summary.distribution[6].count, 0);
});

test("informe describe todos los datos y ausencias sin diagnóstico ni clasificaciones automáticas", () => {
  const generatedAt = new Date("2026-10-04T18:00:00Z");
  const records = [
    entry("one", "2026-10-04T12:00:00Z", { factors: [] }),
    entry("two", "2026-10-04T13:00:00Z", {
      emotion: {
        id: [...api.alternativeEmotionIds][1],
        nombre: "No sé cómo nombrarlo",
      },
    }),
  ];
  const html = renderToStaticMarkup(
    createElement(Report, {
      records,
      period: { start: "2026-10-03", end: "2026-10-04" },
      generatedAt,
    }),
  );
  for (const text of [
    "2 registros",
    "1 día con al menos un registro",
    "1 día sin registro",
    "Sin factores seleccionados",
    "No sé cómo nombrarlo",
    "Sueño y descanso",
    "3 de octubre de 2026",
    "4 de 7",
    "7 de 7",
    "no ofrece diagnósticos",
    "15:00:00",
  ])
    assert.ok(html.includes(text), text);
  assert.ok(
    !/nivel de riesgo|depresión|ansiedad detectada|tendencia positiva|tendencia negativa/i.test(
      html,
    ),
  );
  assert.equal(
    html,
    renderToStaticMarkup(
      createElement(Report, {
        records,
        period: { start: "2026-10-03", end: "2026-10-04" },
        generatedAt,
      }),
    ),
  );
});
