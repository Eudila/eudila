// SPDX-License-Identifier: AGPL-3.0-only
export type CatalogItem = { id: string; nombre: string };
export type Draft = {
  type: string | null;
  mood: number;
  emotionId: string | null;
  factors: string[];
};
export type RecordEntry = {
  id: string;
  recordedAt: string;
  type: string;
  mood: number;
  emotion: CatalogItem;
  factors: CatalogItem[];
  source: "preview" | "example";
};

export function localDayKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) throw new Error("Fecha inválida");
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseDayKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1) return null;
  const date = new Date(2000, month - 1, day, 12);
  date.setFullYear(year);
  return localDayKey(date) === value ? date : null;
}

export function entriesForDay(
  records: RecordEntry[],
  key: string,
): RecordEntry[] {
  return records
    .filter((entry) => localDayKey(entry.recordedAt) === key)
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
}

export function averageMood(records: RecordEntry[]): number | null {
  return records.length
    ? Math.round(
        records.reduce((sum, entry) => sum + entry.mood, 0) / records.length,
      )
    : null;
}

function isCatalogItem(value: unknown): value is CatalogItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CatalogItem;
  return (
    typeof item.id === "string" &&
    !!item.id.trim() &&
    typeof item.nombre === "string" &&
    !!item.nombre.trim()
  );
}

export function restoreRecords(raw: string | null): RecordEntry[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (
    !Array.isArray(value) ||
    value.some(
      (entry) =>
        !entry ||
        typeof entry.id !== "string" ||
        !entry.id.trim() ||
        typeof entry.recordedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(
          entry.recordedAt,
        ) ||
        !Number.isFinite(Date.parse(entry.recordedAt)) ||
        Number(entry.recordedAt.slice(11, 13)) > 23 ||
        Number(entry.recordedAt.slice(14, 16)) > 59 ||
        Number(entry.recordedAt.slice(17, 19)) > 59 ||
        !parseDayKey(entry.recordedAt.slice(0, 10)) ||
        !["mañana", "tarde", "noche", "libre"].includes(entry.type) ||
        !Number.isInteger(entry.mood) ||
        entry.mood < 1 ||
        entry.mood > 7 ||
        !isCatalogItem(entry.emotion) ||
        !Array.isArray(entry.factors) ||
        entry.factors.some((item: unknown) => !isCatalogItem(item)) ||
        new Set(entry.factors.map((item: CatalogItem) => item.id)).size !==
          entry.factors.length ||
        !["preview", "example"].includes(entry.source),
    ) ||
    new Set(value.map((entry) => entry.id)).size !== value.length
  ) {
    throw new Error(
      "El historial de esta pestaña no se pudo leer. Conservamos los datos originales; reintentá cuando estén disponibles.",
    );
  }
  return value;
}

export function createExamples(now = new Date()): RecordEntry[] {
  return [0, 1, 3, 7].map((daysAgo, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(index === 0 ? 9 : 18, 0, 0, 0);
    return {
      id: `example-${localDayKey(date)}-${index}`,
      recordedAt: date.toISOString(),
      type: index === 0 ? "mañana" : "tarde",
      mood: [5, 3, 6, 4][index],
      emotion:
        index === 1
          ? { id: "1efda8cf-773d-53d8-a793-b5ce858e17c8", nombre: "Tristeza" }
          : { id: "5cb0d4e8-4585-5167-af6f-c820ceb7a345", nombre: "Calma" },
      factors: [
        {
          id: "ac26591c-acd3-5fc1-b769-a40e3bd4ec2d",
          nombre: "Sueño y descanso",
        },
      ],
      source: "example",
    };
  });
}
