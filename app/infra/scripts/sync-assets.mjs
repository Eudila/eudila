// SPDX-License-Identifier: AGPL-3.0-only
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../../../", import.meta.url);
await mkdir(new URL("app/public/brand/", root), { recursive: true });
await cp(
  new URL("packages/brand/assets/", root),
  new URL("app/public/brand/", root),
  { recursive: true },
);
await cp(
  new URL("packages/brand/fonts/Figtree.ttf", root),
  new URL("landing/assets/Figtree.ttf", root),
);

// La landing consume CSS nativo; los valores siguen siendo los de Tailwind.
const tokens = await readFile(
  new URL("packages/brand/tokens.css", root),
  "utf8",
);
await writeFile(
  new URL("landing/brand-tokens.css", root),
  tokens
    .replace("@theme static", ":root")
    .replace("  --color-*: initial;\n", ""),
);

await cp(
  new URL("packages/brand/assets/logo-mascota.svg", root),
  new URL("landing/assets/logo.svg", root),
);
