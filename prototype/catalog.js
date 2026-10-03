// SPDX-License-Identifier: AGPL-3.0-only
// Contrato de lectura usado por el prototipo; ANI-50 debe confirmarlo con sus migraciones.
export async function loadCatalogRows(table, config, signal) {
  const emotions = table === "emociones";
  if (!emotions && table !== "factores_vida") throw new Error("Invalid catalog table");
  const columns = emotions ? "id,nombre,sugerida" : "id,nombre";
  const base = config.url.replace(/\/$/, "");
  const response = await fetch(`${base}/rest/v1/${table}?select=${columns}&order=nombre.asc`, {
    signal,
    cache: "no-store",
    headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` }
  });
  if (!response.ok) throw new Error("Catalog unavailable");
  const rows = await response.json();
  const validId = id => typeof id === "string" ? id.trim().length > 0 : Number.isSafeInteger(id) && id >= 0;
  if (!Array.isArray(rows) || rows.some(row => !row || !validId(row.id) || typeof row.nombre !== "string" || !row.nombre.trim() || (emotions && typeof row.sugerida !== "boolean"))) throw new Error("Invalid catalog");
  if (new Set(rows.map(row => String(row.id))).size !== rows.length) throw new Error("Duplicate catalog id");
  return rows;
}
