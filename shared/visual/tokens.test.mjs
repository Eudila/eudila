// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("el prototipo consume todos los tokens canónicos sin una paleta editable paralela", () => {
  const source = readFileSync(
    new URL("../../app/globals.css", import.meta.url),
    "utf8",
  );
  const file = new URL("./tokens.css", import.meta.url);
  assert.ok(
    existsSync(file),
    "falta la exportación de tokens para el prototipo",
  );
  const generated = readFileSync(file, "utf8");
  const declarations = (text) =>
    Object.fromEntries(
      [...text.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
        ([, name, value]) => [name, value.replace(/\s+/g, " ").trim()],
      ),
    );
  const theme = source.match(/@theme\s+static\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(theme);
  assert.deepEqual(
    declarations(generated),
    declarations(theme),
    "ejecutar npm run visual:tokens al cambiar globals.css",
  );
  assert.ok(generated.includes("Generated from app/globals.css"));
  assert.ok(
    !/#[\da-f]{3,8}\b/i.test(
      readFileSync(new URL("./moods.js", import.meta.url), "utf8"),
    ),
    "la metadata no debe duplicar colores",
  );
});
