// SPDX-License-Identifier: AGPL-3.0-only
import type { SupabaseClient } from "@supabase/supabase-js";
import { restoreRecords, type CatalogItem, type RecordEntry } from "@eudila/domain/records.ts";

const selection =
  "id,recorded_at,type,mood,emotion:emociones(id,nombre),factors:registro_factores(factor:factores_vida(id,nombre))";

type AccountRow = {
  id: string;
  recorded_at: string;
  type: string;
  mood: number;
  emotion: CatalogItem;
  factors: { factor: CatalogItem }[];
};

function recordsFromRows(rows: AccountRow[]): RecordEntry[] {
  return restoreRecords(
    JSON.stringify(
      rows.map((row) => ({
        id: row.id,
        recordedAt: new Date(row.recorded_at).toISOString(),
        type: row.type,
        mood: row.mood,
        emotion: row.emotion,
        factors: row.factors.map(({ factor }) => factor),
        source: "account",
      })),
    ),
  );
}

export async function loadAccountRecords(
  client: SupabaseClient,
  userId: string,
): Promise<RecordEntry[]> {
  const rows: AccountRow[] = [];
  let cursor: string | null = null;
  for (;;) {
    let query = client
      .from("registros")
      .select(selection)
      .eq("user_id", userId)
      .order("id")
      .limit(500);
    if (cursor) query = query.gt("id", cursor);
    const { data, error } = await query;
    if (error) throw error;
    if (!data.length) break;
    rows.push(...(data as unknown as AccountRow[]));
    cursor = data[data.length - 1].id;
  }
  return recordsFromRows(rows);
}

export async function saveAccountRecord(
  client: SupabaseClient,
  userId: string,
  entry: RecordEntry,
): Promise<RecordEntry> {
  restoreRecords(JSON.stringify([entry]));
  const { error } = await client.rpc("guardar_registro", {
    p_user_id: userId,
    p_id: entry.id,
    p_recorded_at: entry.recordedAt,
    p_type: entry.type,
    p_mood: entry.mood,
    p_emotion_id: entry.emotion.id,
    p_factor_ids: entry.factors.map(({ id }) => id),
  });
  if (error) throw error;
  const { data, error: readError } = await client
    .from("registros")
    .select(selection)
    .eq("user_id", userId)
    .eq("id", entry.id)
    .single();
  if (readError) throw readError;
  return recordsFromRows([data as unknown as AccountRow])[0];
}
