// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import {
  averageMood,
  createExamples,
  entriesForDay,
  localDayKey,
  parseDayKey,
  restoreRecords,
} from "./records.ts";

process.env.TZ = "America/Argentina/Buenos_Aires";
assert.equal(localDayKey("2026-10-05T01:00:00.000Z"), "2026-10-04");
assert.equal(parseDayKey("2024-02-29").getHours(), 12);
for (const invalid of [
  "2025-02-29",
  "2026-02-30",
  "2026-13-01",
  "2026-00-01",
  "2026-10-32",
  "2026-10-00",
  "26-10-04",
  "0000-01-01",
])
  assert.equal(parseDayKey(invalid), null);
assert.equal(localDayKey(parseDayKey("0001-01-01")), "0001-01-01");
const examples = createExamples(new Date("2026-10-04T18:30:00.000Z"));
assert.deepEqual(restoreRecords(JSON.stringify(examples)), examples);
assert.deepEqual(restoreRecords(null), []);
assert.deepEqual(restoreRecords("[]"), []);
assert.equal(averageMood([]), null);
assert.equal(averageMood(examples), 5);
const original = examples[0];
const late = {
  ...original,
  id: "later",
  recordedAt: "2026-10-04T22:00:00.000Z",
};
const early = {
  ...original,
  id: "earlier",
  recordedAt: "2026-10-04T10:00:00.000Z",
};
const overnight = {
  ...original,
  id: "overnight",
  recordedAt: "2026-10-05T01:00:00.000Z",
};
const unordered = [late, overnight, early];
assert.deepEqual(
  entriesForDay(unordered, "2026-10-04").map((entry) => entry.id),
  ["earlier", "later", "overnight"],
);
assert.deepEqual(
  unordered.map((entry) => entry.id),
  ["later", "overnight", "earlier"],
);
for (const raw of [
  "{",
  "null",
  "{}",
  JSON.stringify([original, original]),
  JSON.stringify([original, { ...original, id: "bad", mood: 8 }]),
  JSON.stringify([{ ...original, recordedAt: "2026-02-30T10:00:00.000Z" }]),
  JSON.stringify([{ ...original, recordedAt: "2026-10-04T24:00:00.000Z" }]),
  JSON.stringify([{ ...original, source: "account" }]),
  JSON.stringify([
    { ...original, factors: [original.factors[0], original.factors[0]] },
  ]),
  JSON.stringify([{ ...original, emotion: { id: "", nombre: "Calma" } }]),
])
  assert.throws(() => restoreRecords(raw));
console.log(
  "Historial: fechas locales, orden y restauración estricta correctos",
);
