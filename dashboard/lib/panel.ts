// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Cálculos del panel del psicólogo. Son funciones puras sobre registros con
 * fecha local ya resuelta ("AAAA-MM-DD" y "HH:MM"), así el resultado no
 * depende de la zona horaria del servidor ni del navegador.
 */

export type Range = 7 | 30 | 90;
export const RANGES: Range[] = [7, 30, 90];

export type PanelRecord = {
  day: string;
  time: string;
  /** 1 Muy desagradable … 7 Muy agradable. */
  mood: number;
  emotion: string;
  factors: string[];
};

export type Patient = {
  id: string;
  name: string;
  firstName: string;
  /** Ordenados de más viejo a más nuevo. */
  records: PanelRecord[];
};

export type Invitation = { name: string; email: string; sentDay: string };

export const STATES = [
  "Muy desagradable",
  "Desagradable",
  "Algo desagradable",
  "Neutral",
  "Algo agradable",
  "Agradable",
  "Muy agradable",
];

export function parseRange(value: unknown): Range {
  return value === "7" ? 7 : value === "90" ? 90 : 30;
}

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function utc(day: string) {
  return new Date(`${day}T12:00:00Z`);
}

export function addDays(day: string, amount: number): string {
  const date = utc(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function periodStart(today: string, range: Range) {
  return addDays(today, -(range - 1));
}

export function periodDays(today: string, range: Range): string[] {
  return Array.from({ length: range }, (_, i) =>
    addDays(periodStart(today, range), i),
  );
}

function dayParts(day: string) {
  const date = utc(day);
  return {
    weekday: date.getUTCDay(),
    date: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

/** "sáb 24/10" */
export function shortDay(day: string) {
  const p = dayParts(day);
  return `${WEEKDAYS[p.weekday]} ${p.date}/${p.month}`;
}

/** "24/10" */
export function axisDay(day: string) {
  const p = dayParts(day);
  return `${p.date}/${p.month}`;
}

export function monthName(month: number) {
  return MONTHS[month - 1];
}

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);

/** Columna «Paciente» de la lista: "hoy 09:14", "ayer 21:40" o "sáb 24/10". */
export function lastSeen(record: PanelRecord, today: string) {
  if (record.day === today) return `hoy ${record.time}`;
  if (record.day === addDays(today, -1)) return `ayer ${record.time}`;
  return shortDay(record.day);
}

/** Tabla «Recientes»: "Hoy, 09:14" o "Dom 25/10, 22:30". */
export function recordWhen(record: PanelRecord, today: string) {
  if (record.day === today) return `Hoy, ${record.time}`;
  return `${capitalize(shortDay(record.day))}, ${record.time}`;
}

/** Un decimal con coma: 3,6. */
export function decimal(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1).replace(".", ",");
}

/** Diferencia con signo tipográfico: −1,6 o +0,1. */
export function signed(value: number) {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return "0,0";
  return `${rounded > 0 ? "+" : "−"}${decimal(Math.abs(rounded))}`;
}

export function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

export function between(records: PanelRecord[], start: string, end: string) {
  return records.filter((record) => record.day >= start && record.day <= end);
}

export function inPeriod(records: PanelRecord[], today: string, range: Range) {
  return between(records, periodStart(today, range), today);
}

export function mean(records: PanelRecord[]): number | null {
  if (!records.length) return null;
  return records.reduce((sum, record) => sum + record.mood, 0) / records.length;
}

/** Estado más cercano a un promedio (4,5 redondea a Algo agradable). */
export function levelOf(average: number) {
  return Math.min(7, Math.max(1, Math.round(average)));
}

/** Posición horizontal de un promedio en la escala 1–7, en porcentaje. */
export function scalePercent(average: number) {
  return ((average - 1) / 6) * 100;
}

export type DayPoint = { day: string; average: number | null; count: number };

export function daily(records: PanelRecord[], days: string[]): DayPoint[] {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const record of records) {
    const total = totals.get(record.day) ?? { sum: 0, count: 0 };
    total.sum += record.mood;
    total.count += 1;
    totals.set(record.day, total);
  }
  return days.map((day) => {
    const total = totals.get(day);
    return {
      day,
      average: total ? total.sum / total.count : null,
      count: total?.count ?? 0,
    };
  });
}

export function patientSummary(patient: Patient, today: string, range: Range) {
  const records = inPeriod(patient.records, today, range);
  const average = mean(records);
  const start = periodStart(today, range);
  const previous = between(
    patient.records,
    addDays(start, -range),
    addDays(start, -1),
  );
  return {
    records,
    count: records.length,
    average,
    previous: mean(previous),
    last: patient.records.at(-1) ?? null,
    lastWeek: daily(patient.records, periodDays(today, 7)),
  };
}

export function overview(patients: Patient[], today: string, range: Range) {
  const records = patients.flatMap((patient) =>
    inPeriod(patient.records, today, range),
  );
  return { count: records.length, average: mean(records) };
}

export function stateShares(records: PanelRecord[]) {
  const counts = Array<number>(7).fill(0);
  for (const record of records) counts[record.mood - 1] += 1;
  return counts.map((count) =>
    records.length ? Math.round((count / records.length) * 100) : 0,
  );
}

export type FactorGroup = {
  name: string;
  count: number;
  /** Registros por estado, del 1 al 7. */
  distribution: number[];
};

export function factorGroups(records: PanelRecord[]) {
  const groups = new Map<string, FactorGroup>();
  const without: FactorGroup = {
    name: "Sin factores",
    count: 0,
    distribution: Array<number>(7).fill(0),
  };
  for (const record of records) {
    if (!record.factors.length) {
      without.count += 1;
      without.distribution[record.mood - 1] += 1;
    }
    for (const name of new Set(record.factors)) {
      const group = groups.get(name) ?? {
        name,
        count: 0,
        distribution: Array<number>(7).fill(0),
      };
      group.count += 1;
      group.distribution[record.mood - 1] += 1;
      groups.set(name, group);
    }
  }
  return {
    groups: [...groups.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"),
    ),
    without,
  };
}

export function emotionCounts(records: PanelRecord[], top = 5) {
  const counts = new Map<string, number>();
  for (const record of records)
    counts.set(record.emotion, (counts.get(record.emotion) ?? 0) + 1);
  const sorted = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
  return {
    top: sorted.slice(0, top),
    others: sorted.slice(top).reduce((sum, item) => sum + item.count, 0),
  };
}

export type CalendarCell =
  | { kind: "blank" }
  | {
      kind: "day";
      day: string;
      date: number;
      level: number | null;
      today: boolean;
      future: boolean;
    };

/** Semanas de un mes, de lunes a domingo, con el estado promedio de cada día. */
export function calendarMonth(
  records: PanelRecord[],
  year: number,
  month: number,
  today: string,
): CalendarCell[][] {
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const lead = (dayParts(first).weekday + 6) % 7;
  const days: string[] = [];
  for (let day = first; dayParts(day).month === month; day = addDays(day, 1))
    days.push(day);
  const points = daily(records, days);
  const cells: CalendarCell[] = [
    ...Array.from({ length: lead }, () => ({ kind: "blank" as const })),
    ...points.map((point) => ({
      kind: "day" as const,
      day: point.day,
      date: dayParts(point.day).date,
      level: point.average === null ? null : levelOf(point.average),
      today: point.day === today,
      future: point.day > today,
    })),
  ];
  while (cells.length % 7) cells.push({ kind: "blank" });
  return Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );
}

export function monthOf(day: string) {
  const p = dayParts(day);
  return { year: p.year, month: p.month };
}

export function shiftMonth(year: number, month: number, amount: number) {
  const index = year * 12 + (month - 1) + amount;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function toCsv(records: PanelRecord[]) {
  const escape = (value: string) =>
    /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const rows = records.map((record) =>
    [
      record.day,
      record.time,
      String(record.mood),
      STATES[record.mood - 1],
      record.emotion,
      record.factors.join(" | "),
    ]
      .map(escape)
      .join(","),
  );
  return ["fecha,hora,estado,estado_nombre,emocion,factores", ...rows].join(
    "\n",
  );
}
