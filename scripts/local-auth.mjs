// SPDX-License-Identifier: AGPL-3.0-only
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(
  new URL("../node_modules/.bin/supabase", import.meta.url),
);
// El arranque imprime claves: capturarlas para no publicarlas en logs compartidos.
try {
  execFileSync(cli, ["start"], { cwd: root, stdio: "pipe", timeout: 600_000 });
} catch (error) {
  process.stderr.write(
    error.stderr ||
      "No pudimos iniciar Supabase. Verificá que Docker esté abierto.\n",
  );
  process.exit(1);
}
const status = JSON.parse(
  execFileSync(cli, ["status", "-o", "json"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }),
);
if (!status.API_URL || !status.ANON_KEY)
  throw new Error("Supabase no informó URL y clave pública.");
const target = new URL("../.env.local", import.meta.url);
let env = existsSync(target) ? readFileSync(target, "utf8") : "";
const values = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
  NEXT_PUBLIC_CATALOG_URL: status.API_URL,
  NEXT_PUBLIC_CATALOG_ANON_KEY: status.ANON_KEY,
  NEXT_PUBLIC_FRONTEND_PREVIEW: "false",
};
for (const [name, value] of Object.entries(values)) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  env = pattern.test(env)
    ? env.replace(pattern, `${name}=${value}`)
    : `${env.trimEnd()}\n${name}=${value}\n`;
}
writeFileSync(target, env.trimStart(), { mode: 0o600 });
console.log(
  "Supabase local listo; .env.local actualizado solo con configuración pública local.",
);
console.log(
  `API: ${status.API_URL}\nStudio: ${status.STUDIO_URL}\nCorreos de prueba: ${status.MAILPIT_URL ?? status.INBUCKET_URL ?? "http://127.0.0.1:54324"}`,
);
console.log("Iniciá o reiniciá la app con npm run dev.");
