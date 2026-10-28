// SPDX-License-Identifier: AGPL-3.0-only
/**
 * DATOS FICTICIOS. Ninguna persona, registro ni invitación de este archivo es
 * real: alimentan la vista previa del panel del psicólogo hasta que existan
 * vínculos, invitaciones y permisos en Supabase (docs/decisiones/
 * 2026-10-27-panel-vista-previa.md). El panel no lee datos de pacientes.
 *
 * Los últimos 30 días de Lucía M. y los resúmenes de la lista reproducen el
 * diseño «Panel del psicólogo». El resto del historial se genera con una
 * semilla fija: siempre da los mismos números.
 */
import type { Invitation, PanelRecord, Patient } from "./panel.ts";
import { addDays } from "./panel.ts";

/** «Hoy» de la vista previa. Fijo para que las fechas del diseño coincidan. */
export const DEMO_TODAY = "2026-10-26";

/** Referencia de la población, también ficticia: promedio y % por estado. */
export const POPULATION = {
  average: 4.5,
  shares: [3, 7, 12, 27, 23, 18, 10],
};

type Tuple = [string, string, number, string, string[]];

const W = "Trabajo";
const S = "Sueño y descanso";
const F = "Familia";
const A = "Amistades";
const AF = "Actividad física";

// Lucía M., 27/9 a 26/10: los promedios diarios y los cinco recientes del diseño.
const LUCIA: Tuple[] = [
  ["09-27", "10:20", 4, "Calma", [F]],
  ["09-27", "21:45", 4, "Preocupación", [W]],
  ["09-28", "20:10", 4, "Interés", [AF]],
  ["09-30", "08:30", 4, "Preocupación", [W]],
  ["09-30", "14:00", 4, "Calma", [F, AF]],
  ["09-30", "22:15", 4, "Tristeza", [S]],
  ["10-01", "09:40", 4, "Preocupación", [W, S]],
  ["10-01", "19:20", 5, "Calma", [F, A, AF]],
  ["10-03", "12:30", 5, "Alegría", [F, A, AF]],
  ["10-04", "18:30", 4, "Soledad", [F]],
  ["10-05", "08:50", 4, "Frustración", [W]],
  ["10-05", "21:00", 4, "Calma", [A]],
  ["10-07", "08:40", 3, "Preocupación", [W, S]],
  ["10-07", "13:15", 3, "Frustración", [W, S]],
  ["10-07", "20:30", 4, "Tristeza", [S]],
  ["10-08", "19:45", 4, "Preocupación", ["Pareja"]],
  ["10-09", "09:10", 4, "Soledad", [F]],
  ["10-09", "22:10", 3, "Tristeza", [W, S]],
  ["10-11", "17:20", 4, "Tristeza", []],
  ["10-12", "19:30", 3, "Preocupación", [W]],
  ["10-13", "09:05", 3, "Preocupación", [W, S]],
  ["10-13", "20:15", 5, "Alivio", [F, A, S]],
  ["10-15", "22:50", 2, "Tristeza", [W, S]],
  ["10-16", "21:20", 3, "Tristeza", [W]],
  ["10-17", "11:00", 4, "Preocupación", [W]],
  ["10-17", "22:30", 4, "Frustración", []],
  ["10-18", "23:05", 3, "Soledad", [S, F]],
  ["10-20", "08:55", 3, "Frustración", [A]],
  ["10-21", "10:30", 3, "Preocupación", []],
  ["10-21", "19:50", 5, "Calma", []],
  ["10-22", "22:40", 3, "Tristeza", []],
  ["10-23", "20:45", 3, "Frustración", [W]],
  ["10-24", "18:20", 4, "Calma", [A]],
  ["10-25", "10:05", 2, "Preocupación", [S]],
  ["10-25", "22:30", 2, "Tristeza", [F]],
  ["10-26", "09:14", 2, "Preocupación", [W, S]],
];

const EMOTIONS: string[][] = [
  ["Tristeza", "Miedo", "Soledad", "Culpa"],
  ["Tristeza", "Preocupación", "Soledad", "Enojo"],
  ["Preocupación", "Frustración", "Tristeza", "Aburrimiento"],
  ["Calma", "Preocupación", "Aburrimiento", "Interés"],
  ["Calma", "Alivio", "Interés", "Gratitud"],
  ["Alegría", "Calma", "Cariño", "Gratitud"],
  ["Alegría", "Entusiasmo", "Orgullo", "Cariño"],
];

type Spec = {
  id: string;
  name: string;
  firstName: string;
  /** Registros y suma de estados de los últimos 30 días (fijan la media). */
  count30: number;
  sum30: number;
  /** Estado de cada uno de los últimos 7 días; null, sin registro. */
  lastWeek: (number | null)[];
  /** Hora del último registro, si el diseño la muestra. */
  lastTime?: string;
  /** Media de los meses anteriores. */
  before: number;
  spread: number;
  factors: string[];
};

const SPECS: Spec[] = [
  {
    id: "joaquin-p",
    name: "Joaquín P.",
    firstName: "Joaquín",
    count30: 18,
    sum30: 52,
    lastWeek: [3, 3, null, 2, 2, null, null],
    before: 3.4,
    spread: 0.6,
    factors: ["Estudio", S, F, "Uso de pantallas", A],
  },
  {
    id: "martin-d",
    name: "Martín D.",
    firstName: "Martín",
    count30: 12,
    sum30: 47,
    lastWeek: [null, 4, 4, null, null, null, null],
    before: 4,
    spread: 0.4,
    factors: [W, "Dinero", S, "Pareja"],
  },
  {
    id: "nicolas-s",
    name: "Nicolás S.",
    firstName: "Nicolás",
    count30: 9,
    sum30: 37,
    lastWeek: [null, 4, null, null, null, null, null],
    before: 4.3,
    spread: 0.4,
    factors: ["Estudio", A, AF, "Tiempo libre"],
  },
  {
    id: "sofia-l",
    name: "Sofía L.",
    firstName: "Sofía",
    count30: 29,
    sum30: 128,
    lastWeek: [4, 5, 4, null, 5, 4, 5],
    lastTime: "08:02",
    before: 4.2,
    spread: 0.5,
    factors: ["Estudio", F, A, S, "Salud y cuerpo"],
  },
  {
    id: "camila-f",
    name: "Camila F.",
    firstName: "Camila",
    count30: 35,
    sum30: 161,
    lastWeek: [5, 4, 5, 5, null, 6, null],
    lastTime: "21:40",
    before: 4.7,
    spread: 0.5,
    factors: [W, "Pareja", AF, A, "Tiempo libre"],
  },
  {
    id: "tomas-r",
    name: "Tomás R.",
    firstName: "Tomás",
    count30: 22,
    sum30: 106,
    lastWeek: [5, null, 5, 6, 5, 5, null],
    lastTime: "19:15",
    before: 4.6,
    spread: 0.4,
    factors: [W, AF, F, "Cuidados y responsabilidades"],
  },
  {
    id: "valentina-g",
    name: "Valentina G.",
    firstName: "Valentina",
    count30: 41,
    sum30: 213,
    lastWeek: [6, 5, 5, 6, 6, null, null],
    before: 5,
    spread: 0.5,
    factors: [F, A, "Tiempo libre", AF, "Estudio"],
  },
];

function random(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  let a = (h << 13) | (h >>> 19);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;
const pick = <T>(rand: Rand, items: T[]) =>
  items[Math.floor(rand() * items.length)];

/** `count` estados entre 1 y 7 que suman exactamente `sum`. */
function levels(rand: Rand, count: number, sum: number, spread: number) {
  const base = Math.floor(sum / count);
  const values = Array.from({ length: count }, (_, i) =>
    i < sum - base * count ? base + 1 : base,
  );
  for (let k = 0; k < Math.round(count * spread); k++) {
    const i = Math.floor(rand() * count);
    const j = Math.floor(rand() * count);
    if (i !== j && values[i] < 7 && values[j] > 1) {
      values[i] += 1;
      values[j] -= 1;
    }
  }
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function time(rand: Rand) {
  const minutes = 8 * 60 + Math.floor(rand() * 15 * 12) * 5;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function record(
  rand: Rand,
  day: string,
  mood: number,
  factors: string[],
): PanelRecord {
  const count = rand() < 0.15 ? 0 : rand() < 0.6 ? 1 : 2;
  const chosen = new Set<string>();
  while (chosen.size < count) chosen.add(pick(rand, factors));
  return {
    day,
    time: time(rand),
    mood,
    emotion: pick(rand, EMOTIONS[mood - 1]),
    factors: [...chosen],
  };
}

/** Reparte `count` registros en días distintos (hasta tres por día). */
function spreadDays(rand: Rand, from: number, to: number, count: number) {
  const days: number[] = [];
  const perDay = new Map<number, number>();
  while (days.length < count) {
    const offset = from + Math.floor(rand() * (to - from + 1));
    const used = perDay.get(offset) ?? 0;
    if (used >= 3 || (used >= 1 && rand() < 0.6)) continue;
    perDay.set(offset, used + 1);
    days.push(offset);
  }
  return days;
}

/** Registros de un tramo [from, to] (días antes de hoy) con media `average`. */
function stretch(
  rand: Rand,
  spec: Pick<Spec, "spread" | "factors">,
  from: number,
  to: number,
  count: number,
  average: number,
) {
  const values = levels(rand, count, Math.round(count * average), spec.spread);
  return spreadDays(rand, from, to, count).map((offset, i) =>
    record(rand, addDays(DEMO_TODAY, offset), values[i], spec.factors),
  );
}

function sorted(records: PanelRecord[]) {
  return records.sort(
    (a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time),
  );
}

/** Seis meses de historia: el último mes calza con el diseño. */
function history(spec: Spec, recent: PanelRecord[], previous: number) {
  const rand = random(`${spec.id}-historia`);
  const monthly = Math.max(6, Math.round(spec.count30 * 0.9));
  return [
    ...stretch(rand, spec, -179, -120, monthly * 2, spec.before + 0.2),
    ...stretch(rand, spec, -119, -60, monthly * 2, spec.before),
    ...stretch(rand, spec, -59, -30, monthly, previous),
    ...recent,
  ];
}

function generated(spec: Spec): Patient {
  const rand = random(spec.id);
  const week: PanelRecord[] = [];
  spec.lastWeek.forEach((mood, i) => {
    if (mood !== null)
      week.push(record(rand, addDays(DEMO_TODAY, i - 6), mood, spec.factors));
  });
  if (spec.lastTime) week[week.length - 1].time = spec.lastTime;
  const weekSum = week.reduce((sum, item) => sum + item.mood, 0);
  const rest = spec.count30 - week.length;
  const values = levels(rand, rest, spec.sum30 - weekSum, spec.spread);
  const month = spreadDays(rand, -29, -7, rest).map((offset, i) =>
    record(rand, addDays(DEMO_TODAY, offset), values[i], spec.factors),
  );
  return {
    id: spec.id,
    name: spec.name,
    firstName: spec.firstName,
    records: sorted(history(spec, [...month, ...week], spec.before)),
  };
}

const lucia: Patient = {
  id: "lucia-m",
  name: "Lucía M.",
  firstName: "Lucía",
  records: sorted(
    history(
      {
        id: "lucia-m",
        name: "Lucía M.",
        firstName: "Lucía",
        count30: 36,
        sum30: 129,
        lastWeek: [],
        before: 4.3,
        spread: 0.5,
        factors: [W, S, F, A, AF],
      },
      LUCIA.map(([day, time, mood, emotion, factors]) => ({
        day: `2026-${day}`,
        time,
        mood,
        emotion,
        factors,
      })),
      4.1,
    ),
  ),
};

/** Sin registros desde el miércoles 2/9. */
const federico: Patient = (() => {
  const spec = {
    spread: 0.5,
    factors: [W, "Estudio", S, "Salud y cuerpo"],
  };
  const rand = random("federico-a");
  const records = [
    ...stretch(rand, spec, -179, -60, 14, 3.9),
    {
      day: addDays(DEMO_TODAY, -54),
      time: "20:35",
      mood: 4,
      emotion: "Aburrimiento",
      factors: ["Estudio"],
    },
  ];
  return {
    id: "federico-a",
    name: "Federico A.",
    firstName: "Federico",
    records: sorted(records),
  };
})();

export const PATIENTS: Patient[] = [
  ...SPECS.slice(0, 1).map(generated),
  lucia,
  ...SPECS.slice(1).map(generated),
  federico,
];

export const INVITATIONS: Invitation[] = [
  {
    name: "Agustina B.",
    email: "agustina.b@ejemplo.com",
    sentDay: "2026-10-24",
  },
];

export function findPatient(id: string) {
  return PATIENTS.find((patient) => patient.id === id) ?? null;
}
