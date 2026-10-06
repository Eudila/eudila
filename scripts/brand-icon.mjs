// SPDX-License-Identifier: AGPL-3.0-only
// Generate from the approved neutral renderer, never a second logo definition.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import prettier from "prettier";
import { orbMarkup } from "../shared/visual/orb.js";
import { moods, shapePoints } from "../shared/visual/moods.js";

const css = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
const token = (name) => {
  const value = css.match(
    new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`),
  )?.[1];
  if (!value) throw new Error(`Missing brand color ${name}`);
  return value;
};
const white = token("--color-white");
const orb = token("--color-mood-4-orb");
const ambient = token("--color-mood-4-ambient");
const bottom = token("--color-mood-bottom");
// Derive the viewport from the actual shared Neutral outline (currently 176).
const points = shapePoints(moods[3]);
const x = points.map(([x]) => x),
  y = points.map(([, y]) => y);
const left = Math.min(...x),
  top = Math.min(...y);
const size = Math.max(Math.max(...x) - left, Math.max(...y) - top);
const viewBox = `${left} ${top} ${size} ${size}`;
const neutral = orbMarkup(4, "app-neutral")
  .replace(
    'viewBox="-14 -14 248 248"',
    `x="18" y="18" width="64" height="64" viewBox="${viewBox}" overflow="visible"`,
  )
  .replaceAll("var(--color-white)", white)
  .replaceAll("var(--color-mood-4-orb)", orb);
const svg = await prettier.format(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100"><defs><linearGradient id="app-ambient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${ambient}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="100" height="100" fill="url(#app-ambient)"/>${neutral}</svg>`,
  { parser: "html" },
);
const root = new URL("../", import.meta.url);
await mkdir(new URL("public/brand/", root), { recursive: true });
const assets = new Map([
  [
    "app/manifest.json",
    await prettier.format(
      JSON.stringify({
        name: "eudila",
        short_name: "eudila",
        description: "Un momento para registrar lo que sentís, a tu manera.",
        start_url: "/",
        display: "standalone",
        background_color: bottom,
        theme_color: bottom,
        icons: [
          {
            src: "/brand/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/brand/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      }),
      { parser: "json" },
    ),
  ],
  ["app/icon.svg", svg],
  ["public/brand/icon.svg", svg],
  [
    "app/apple-icon.png",
    await sharp(Buffer.from(svg)).resize(180, 180).png().toBuffer(),
  ],
  [
    "public/brand/icon-192.png",
    await sharp(Buffer.from(svg)).resize(192, 192).png().toBuffer(),
  ],
  [
    "public/brand/icon-512.png",
    await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer(),
  ],
]);
for (const [path, data] of assets) {
  if (process.argv.includes("--check")) {
    const actual = await readFile(new URL(path, root));
    if (!actual.equals(Buffer.from(data)))
      throw new Error(`Stale icon ${path}: npm run visual:icon`);
  } else await writeFile(new URL(path, root), data);
}
