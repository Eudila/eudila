// SPDX-License-Identifier: AGPL-3.0-only
import { readFile, writeFile } from "node:fs/promises";
import { format } from "prettier";

const source = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
const theme = source.match(/@theme\s+static\s*\{([\s\S]*?)\n\}/)?.[1];
if (!theme) throw new Error("Missing @theme static in app/globals.css");
const css = await format(
  "/* SPDX-License-Identifier: AGPL-3.0-only */\n/* Generated from app/globals.css. Edit that source and run npm run visual:tokens. */\n:root {\n" +
    theme.replace(/\s*--color-\*:\s*initial;/, "") +
    "\n}\n",
  { parser: "css" },
);
const output = new URL("../shared/visual/tokens.css", import.meta.url);
if (process.argv.includes("--check")) {
  if ((await readFile(output, "utf8")) !== css)
    throw new Error("Stale visual tokens. Run npm run visual:tokens.");
} else await writeFile(output, css);
