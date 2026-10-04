// SPDX-License-Identifier: AGPL-3.0-only
import {
  localDayKey,
  parseDayKey,
  type CatalogItem,
  type RecordEntry,
} from "../historial/records";
import { moods } from "../../prototype/moods.js";

export type PeriodChoice = "7" | "30" | "90" | "all";
export type Period = { start: string; end: string };
export const alternativeEmotionIds = new Set([
  "eceefb9f-2dec-58f4-b1a6-609a7e7c36ca",
  "f0d3a478-e3fa-5503-a6e2-3b58df5a9c15",
  "5ef2f8bc-a656-5d50-852f-67db0486cac4",
]);

export function reportPeriod(
  records: RecordEntry[],
  choice: PeriodChoice,
  now: Date,
): Period {
  const today = localDayKey(now);
  if (choice === "all") {
    const days = records.map((record) => localDayKey(record.recordedAt));
    return {
      start: [today, ...days].sort()[0],
      end: [today, ...days].sort().at(-1)!,
    };
  }
  const start = parseDayKey(today)!;
  start.setDate(start.getDate() - Number(choice) + 1);
  return { start: localDayKey(start), end: today };
}

export function periodDays(period: Period): string[] {
  const cursor = parseDayKey(period.start);
  if (!cursor || !parseDayKey(period.end) || period.start > period.end)
    throw new Error("Período inválido");
  const days: string[] = [];
  for (
    ;
    localDayKey(cursor) <= period.end;
    cursor.setDate(cursor.getDate() + 1)
  )
    days.push(localDayKey(cursor));
  return days;
}

type Count = CatalogItem & { count: number };
function counts(items: CatalogItem[]): Count[] {
  const result = new Map<string, Count>();
  for (const item of items) {
    const current = result.get(item.id);
    if (current) current.count += 1;
    else result.set(item.id, { ...item, count: 1 });
  }
  return [...result.values()].sort(
    (a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre, "es"),
  );
}

export function summarize(records: RecordEntry[], period: Period) {
  const chronology = records
    .filter((record) => {
      const day = localDayKey(record.recordedAt);
      return day >= period.start && day <= period.end;
    })
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  const recordedDays = new Set(
    chronology.map((record) => localDayKey(record.recordedAt)),
  );
  return {
    chronology,
    recordedDays: recordedDays.size,
    missingDays: periodDays(period).filter((day) => !recordedDays.has(day)),
    emotions: counts(
      chronology
        .map((record) => record.emotion)
        .filter((emotion) => !alternativeEmotionIds.has(emotion.id)),
    ),
    alternatives: counts(
      chronology
        .map((record) => record.emotion)
        .filter((emotion) => alternativeEmotionIds.has(emotion.id)),
    ),
    factors: counts(chronology.flatMap((record) => record.factors)),
    distribution: moods.map((mood, index) => ({
      value: index + 1,
      label: mood.label,
      count: chronology.filter((record) => record.mood === index + 1).length,
    })),
  };
}

export function formatDay(day: string): string {
  const date = parseDayKey(day);
  if (!date) throw new Error("Fecha inválida");
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function csvCell(value: string | number): string {
  const text = String(value);
  // Las comillas CSV no impiden que una planilla ejecute fórmulas.
  const safe = /^[\s\uFEFF]*[=+\-@]/u.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function recordsCsv(records: RecordEntry[]): string {
  const rows: (string | number)[][] = [
    [
      "id",
      "recorded_at",
      "fecha_local",
      "hora_local",
      "tipo",
      "escala",
      "escala_etiqueta",
      "emocion_id",
      "emocion",
      "factor_ids",
      "factores",
      "origen",
    ],
  ];
  for (const record of records)
    rows.push([
      record.id,
      record.recordedAt,
      localDayKey(record.recordedAt),
      formatTime(record.recordedAt),
      record.type,
      record.mood,
      moods[record.mood - 1].label,
      record.emotion.id,
      record.emotion.nombre,
      JSON.stringify(record.factors.map((factor) => factor.id)),
      JSON.stringify(record.factors.map((factor) => factor.nombre)),
      record.source,
    ]);
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export function recordsJson(records: RecordEntry[]): string {
  return JSON.stringify(records, null, 2);
}

export function exportFilename(
  now: Date,
  extension: "csv" | "json" | "pdf",
): string {
  return `eudila-vista-previa-historial-${localDayKey(now)}.${extension}`;
}
