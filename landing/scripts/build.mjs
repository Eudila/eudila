import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const release = process.env.EUDILA_RELEASE === "true";

const required = [
  "SITE_URL",
  "CONTACT_TO",
  "CONTACT_FROM",
  "RESEND_API_KEY",
  "UMAMI_SCRIPT_URL",
  "UMAMI_WEBSITE_ID",
];
const missing = required.filter((name) => !process.env[name]);
if (release && missing.length) {
  throw new Error(
    `Faltan variables obligatorias para publicar: ${missing.join(", ")}`,
  );
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });

for (const file of [
  "index.html",
  "privacidad.html",
  "terminos.html",
  "styles.css",
  "brand-tokens.css",
  "main.js",
  "escena.js",
  "mascota.js",
  "moods.js",
  "robots.txt",
]) {
  await cp(path.join(root, file), path.join(dist, file));
}
await cp(path.join(root, "assets"), path.join(dist, "assets"), {
  recursive: true,
});

let html = await readFile(path.join(dist, "index.html"), "utf8");
if (process.env.SITE_URL) {
  const siteUrl = process.env.SITE_URL.replace(/\/$/, "");
  html = html.replace(
    '<meta property="og:type"',
    `<link rel=\"canonical\" href=\"${siteUrl}/\" />\n    <meta property=\"og:url\" content=\"${siteUrl}/\" />\n    <meta property=\"og:type\"`,
  );
}
await writeFile(path.join(dist, "index.html"), html);

const runtime = `window.EUDILA_CONFIG = Object.freeze(${JSON.stringify(
  {
    contactEnabled: release && missing.length === 0,
    contactEndpoint: "/api/contact",
    umamiScriptUrl: process.env.UMAMI_SCRIPT_URL || "",
    umamiWebsiteId: process.env.UMAMI_WEBSITE_ID || "",
  },
  null,
  2,
)});\n`;
await writeFile(path.join(dist, "runtime-config.js"), runtime);

console.log(
  `Landing preparada en ${dist}${release ? " para publicación" : " para revisión local"}.`,
);
