// SPDX-License-Identifier: AGPL-3.0-only
import { periodDays, reportPeriod } from "../exportar/export";
import { localDayKey, type RecordEntry } from "../historial/records";

export type Range = "7" | "30" | "90";
export type DayPoint = { day: string; count: number; average: number | null };

export function normalizeRange(value: string | string[] | undefined): Range {
  return value === "7" || value === "90" ? value : "30";
}

export function analysis(
  records: RecordEntry[],
  range: Range,
  now: Date,
  factorId?: string,
) {
  const period = reportPeriod(records, range, now);
  const chronology = records
    .filter((record) => {
      const day = localDayKey(record.recordedAt);
      return (
        day >= period.start &&
        day <= period.end &&
        Date.parse(record.recordedAt) <= now.getTime() &&
        (!factorId || record.factors.some((factor) => factor.id === factorId))
      );
    })
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  const totals = new Map<string, { count: number; sum: number }>();
  for (const record of chronology) {
    const day = localDayKey(record.recordedAt);
    const current = totals.get(day) ?? { count: 0, sum: 0 };
    current.count += 1;
    current.sum += record.mood;
    totals.set(day, current);
  }
  const days: DayPoint[] = periodDays(period).map((day) => {
    const total = totals.get(day);
    return {
      day,
      count: total?.count ?? 0,
      average: total ? total.sum / total.count : null,
    };
  });
  // Umbral de presentación provisional; no constituye una validación clínica.
  const lineEnabled = chronology.length >= 14 && totals.size >= 7;
  const segments: { from: DayPoint; to: DayPoint }[] = [];
  if (lineEnabled)
    for (let index = 1; index < days.length; index++) {
      if (days[index - 1].average !== null && days[index].average !== null)
        segments.push({ from: days[index - 1], to: days[index] });
    }
  return {
    period,
    days,
    chronology,
    lineEnabled,
    segments,
    exampleCount: chronology.filter((record) => record.source === "example")
      .length,
  };
}

export function factorName(records: RecordEntry[], id: string): string | null {
  const latest = records
    .filter((record) => record.factors.some((factor) => factor.id === id))
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt))
    .at(-1);
  return latest?.factors.find((factor) => factor.id === id)?.nombre ?? null;
}

export function factorGroups(records: RecordEntry[], range: Range, now: Date) {
  const { chronology } = analysis(records, range, now);
  const groups = new Map<
    string,
    { id: string; nombre: string; count: number; distribution: number[] }
  >();
  for (const record of chronology) {
    const seen = new Set<string>();
    for (const factor of record.factors) {
      if (seen.has(factor.id)) continue;
      seen.add(factor.id);
      const group = groups.get(factor.id) ?? {
        ...factor,
        count: 0,
        distribution: Array<number>(7).fill(0),
      };
      group.nombre = factor.nombre;
      group.count += 1;
      group.distribution[record.mood - 1] += 1;
      groups.set(factor.id, group);
    }
  }
  return {
    groups: [...groups.values()]
      .map((group) => ({ ...group, nombre: factorName(records, group.id)! }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.nombre.localeCompare(b.nombre, "es") ||
          a.id.localeCompare(b.id),
      ),
    withoutFactors: chronology.filter((record) => record.factors.length === 0)
      .length,
  };
}
