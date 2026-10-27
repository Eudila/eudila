// Copia el motor de la mascota de la app a la landing, sin reinterpretarlo.
// Fuente única: packages/mood/critter.ts y packages/mood/moods.js (docs/design/mascota/README.md manda).
// Uso: npm run sync:mascota (requiere el `typescript` instalado en la raíz del repo).
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const repo = path.resolve(landing, "..");
const ts = createRequire(path.join(repo, "package.json"))("typescript");

const header = (from) =>
  `// GENERADO por landing/scripts/sync-mascota.mjs desde ${from}. No editar a mano.\n`;

const critter = await readFile(
  path.join(repo, "packages/mood/critter.ts"),
  "utf8",
);
const { outputText } = ts.transpileModule(critter, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
});
await writeFile(
  path.join(landing, "mascota.js"),
  header("packages/mood/critter.ts") +
    outputText.replace("@eudila/mood/moods.js", "./moods.js"),
);

const moods = await readFile(path.join(repo, "packages/mood/moods.js"), "utf8");
await writeFile(
  path.join(landing, "moods.js"),
  header("packages/mood/moods.js") + moods,
);

console.log(
  "Motor de la mascota sincronizado: landing/mascota.js y landing/moods.js.",
);
