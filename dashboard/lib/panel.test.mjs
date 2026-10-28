// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_TODAY, INVITATIONS, PATIENTS, findPatient } from "./demo-data.ts";
import {
  calendarMonth,
  daily,
  decimal,
  emotionCounts,
  factorGroups,
  lastSeen,
  overview,
  patientSummary,
  periodDays,
  recordWhen,
  signed,
  stateShares,
  toCsv,
} from "./panel.ts";

const POPULATION = 4.5;

test("la lista reproduce los números del diseño a 30 días", () => {
  const rows = Object.fromEntries(
    PATIENTS.map((patient) => {
      const summary = patientSummary(patient, DEMO_TODAY, 30);
      return [
        patient.name,
        [
          summary.average === null ? "—" : decimal(summary.average),
          summary.average === null ? "" : signed(summary.average - POPULATION),
          summary.count,
          lastSeen(summary.last, DEMO_TODAY),
        ],
      ];
    }),
  );
  assert.deepEqual(rows, {
    "Joaquín P.": ["2,9", "−1,6", 18, "sáb 24/10"],
    "Lucía M.": ["3,6", "−0,9", 36, "hoy 09:14"],
    "Martín D.": ["3,9", "−0,6", 12, "jue 22/10"],
    "Nicolás S.": ["4,1", "−0,4", 9, "mié 21/10"],
    "Sofía L.": ["4,4", "−0,1", 29, "hoy 08:02"],
    "Camila F.": ["4,6", "+0,1", 35, "ayer 21:40"],
    "Tomás R.": ["4,8", "+0,3", 22, "ayer 19:15"],
    "Valentina G.": ["5,2", "+0,7", 41, "sáb 24/10"],
    "Federico A.": ["—", "", 0, "mié 2/9"],
  });
  const total = overview(PATIENTS, DEMO_TODAY, 30);
  assert.equal(total.count, 202);
  assert.equal(decimal(total.average), "4,3");
  assert.equal(PATIENTS.length + INVITATIONS.length, 10);
});

test("los últimos 7 días de cada paciente coinciden con el diseño", () => {
  const week = (id) =>
    patientSummary(findPatient(id), DEMO_TODAY, 30).lastWeek.map((point) =>
      point.average === null ? null : point.average,
    );
  assert.deepEqual(week("joaquin-p"), [3, 3, null, 2, 2, null, null]);
  assert.deepEqual(week("lucia-m"), [3, 4, 3, 3, 4, 2, 2]);
  assert.deepEqual(week("valentina-g"), [6, 5, 5, 6, 6, null, null]);
});

test("la ficha de Lucía calza con el diseño", () => {
  const lucia = findPatient("lucia-m");
  const summary = patientSummary(lucia, DEMO_TODAY, 30);
  assert.equal(decimal(summary.previous), "4,1");
  assert.deepEqual(stateShares(summary.records), [0, 11, 31, 47, 11, 0, 0]);
  const points = daily(summary.records, periodDays(DEMO_TODAY, 30));
  assert.equal(points[0].day, "2026-09-27");
  assert.deepEqual(
    points.slice(0, 7).map((point) => point.average),
    [4, 4, null, 4, 4.5, null, 5],
  );
  const emotions = emotionCounts(summary.records);
  assert.deepEqual(
    emotions.top.map((item) => [item.name, item.count]),
    [
      ["Preocupación", 11],
      ["Tristeza", 8],
      ["Calma", 6],
      ["Frustración", 5],
      ["Soledad", 3],
    ],
  );
  assert.equal(emotions.others, 3);
  const factors = factorGroups(summary.records);
  assert.deepEqual(
    factors.groups.map((group) => [group.name, group.count]),
    [
      ["Trabajo", 14],
      ["Sueño y descanso", 12],
      ["Familia", 9],
      ["Amistades", 6],
      ["Actividad física", 4],
      ["Pareja", 1],
    ],
  );
  assert.equal(factors.without.count, 5);
  assert.deepEqual(
    summary.records
      .slice(-5)
      .reverse()
      .map((record) => recordWhen(record, DEMO_TODAY)),
    [
      "Hoy, 09:14",
      "Dom 25/10, 22:30",
      "Dom 25/10, 10:05",
      "Sáb 24/10, 18:20",
      "Vie 23/10, 20:45",
    ],
  );
});

test("el calendario de octubre empieza el jueves 1 y marca hoy", () => {
  const weeks = calendarMonth(
    findPatient("lucia-m").records,
    2026,
    10,
    DEMO_TODAY,
  );
  assert.equal(weeks.length, 5);
  assert.deepEqual(
    weeks[0].map((cell) => (cell.kind === "day" ? cell.level : cell.kind)),
    ["blank", "blank", "blank", 5, null, 5, 4],
  );
  const today = weeks[4].find((cell) => cell.kind === "day" && cell.today);
  assert.equal(today.date, 26);
  assert.equal(today.level, 2);
});

test("el historial alcanza para comparar 90 días con los 90 anteriores", () => {
  for (const patient of PATIENTS) {
    const summary = patientSummary(patient, DEMO_TODAY, 90);
    assert.ok(summary.previous !== null, patient.name);
    for (const record of patient.records) {
      assert.ok(record.mood >= 1 && record.mood <= 7);
      assert.ok(record.day <= DEMO_TODAY);
    }
  }
});

test("la exportación es CSV con encabezado", () => {
  const csv = toCsv(findPatient("lucia-m").records.slice(-1));
  assert.equal(
    csv,
    "fecha,hora,estado,estado_nombre,emocion,factores\n2026-10-26,09:14,2,Desagradable,Preocupación,Trabajo | Sueño y descanso",
  );
});
