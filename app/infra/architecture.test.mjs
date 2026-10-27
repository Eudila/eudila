import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = new URL("../../", import.meta.url);
test("los paquetes compartidos no dependen de apps ni del prototipo histórico", async () => {
  for (const folder of ["packages", "app"]) {
    const base = new URL(`${folder}/`, root);
    const files = await readdir(base, { recursive: true });
    for (const file of files) {
      if (
        !/\.(ts|tsx|js|mjs)$/.test(file) ||
        /node_modules|\.next|\.test\./.test(file)
      )
        continue;
      const source = await readFile(new URL(file, base), "utf8");
      const imports = [
        ...source.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g),
      ].map((m) => m[1]);
      for (const specifier of imports) {
        const resolved = specifier.startsWith(".")
          ? fileURLToPath(new URL(specifier, new URL(file, base)))
          : specifier;
        assert.doesNotMatch(
          resolved,
          /prototype|docs\/historia/,
          `${file}: ${specifier}`,
        );
        if (folder === "packages")
          assert.doesNotMatch(
            resolved,
            /\/(app|landing|dashboard)\/|@eudila\/(app|landing|dashboard)/,
            `${file}: ${specifier}`,
          );
        if (folder === "packages" && file.startsWith("domain/"))
          assert.doesNotMatch(
            specifier,
            /^(react|next)(\/|$)/,
            `${file}: ${specifier}`,
          );
      }
    }
  }
});

test("la landing sirve los mismos tokens canónicos sin depender de Tailwind", async () => {
  const source = await readFile(
    new URL("packages/brand/tokens.css", root),
    "utf8",
  );
  const output = await readFile(
    new URL("landing/brand-tokens.css", root),
    "utf8",
  );
  assert.equal(
    output,
    source
      .replace("@theme static", ":root")
      .replace("  --color-*: initial;\n", ""),
  );
});
