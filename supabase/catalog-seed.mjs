// SPDX-License-Identifier: AGPL-3.0-only
import { readFileSync, writeFileSync } from "node:fs";

const catalog = JSON.parse(
  readFileSync(new URL("../data/catalogo-v1.json", import.meta.url), "utf8"),
);
const target = new URL("./seed.sql", import.meta.url);
const quote = (value) => `'${value.replaceAll("'", "''")}'`;

function insert(table, columns) {
  const rows = catalog[table].map(
    (row) =>
      `  (${columns.map((key) => (typeof row[key] === "boolean" ? row[key] : quote(row[key]))).join(", ")})`,
  );
  const updates = columns
    .filter((key) => key !== "id")
    .map((key) => `${key} = excluded.${key}`);
  return `insert into public.${table} (${columns.join(", ")})\nvalues\n${rows.join(",\n")}\non conflict (id) do update set ${updates.join(", ")};`;
}

const sql = `-- SPDX-License-Identifier: AGPL-3.0-only
-- Generated from data/catalogo-v1.json by supabase/catalog-seed.mjs.
begin;

${insert("emociones", ["id", "nombre", "sugerida"])}

${insert("factores_vida", ["id", "nombre"])}

commit;
`;

if (
  process.argv.length > 3 ||
  ![undefined, "--check"].includes(process.argv[2])
) {
  throw new Error("Usage: node supabase/catalog-seed.mjs [--check]");
}
if (process.argv[2] === "--check") {
  if (readFileSync(target, "utf8") !== sql)
    throw new Error("Catalog seed differs from data/catalogo-v1.json");
  console.log("Catalog seed matches data/catalogo-v1.json");
} else {
  writeFileSync(target, sql);
}
