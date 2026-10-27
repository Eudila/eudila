// Renderiza film/pelicula.js cuadro a cuadro y lo codifica con ffmpeg.
// Uso: npm run render:film            → assets/eudila-film.mp4 + assets/eudila-film-poster.jpg
//      npm run render:film -- --stills → solo un cuadro cada segundo, en outputs/, para revisar.
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stills = process.argv.includes("--stills");
// --at=2,10.7 guarda solo esos segundos (los cuadros previos se calculan igual: el motor tiene estado).
const at = (process.argv.find((a) => a.startsWith("--at=")) || "")
  .slice(5)
  .split(",")
  .filter(Boolean)
  .map(Number);
const POSTER_AT = 29.4; // el lockup completo, con el sello

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".ttf": "font/ttf",
};
const server = http.createServer((req, res) => {
  const file = path.join(
    root,
    decodeURIComponent(new URL(req.url, "http://x").pathname),
  );
  if (!file.startsWith(root)) return res.writeHead(403).end();
  res.setHeader(
    "content-type",
    types[path.extname(file)] || "application/octet-stream",
  );
  createReadStream(file)
    .on("error", () => res.writeHead(404).end())
    .pipe(res);
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const url = `http://127.0.0.1:${server.address().port}/film/render.html`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("pageerror", (e) => console.error("página:", e.message));
await page.goto(url);
await page.waitForFunction(() => window.ready === true);
const { fps, frames } = await page.evaluate(() => window.FILM);
const png = async (i) =>
  Buffer.from(
    (await page.evaluate((n) => window.renderFrame(n), i)).split(",")[1],
    "base64",
  );

if (stills || at.length) {
  const out = path.join(root, "outputs", "film");
  await mkdir(out, { recursive: true });
  const want = new Set(at.map((s) => Math.round(s * fps)));
  const last = at.length ? Math.max(...want) : frames - 1;
  for (let i = 0; i <= last; i++) {
    if (at.length && !want.has(i)) {
      await page.evaluate((n) => window.stepFrame(n), i);
      continue;
    }
    const buf = await png(i);
    if (at.length || i % fps === 0 || i === Math.round(POSTER_AT * fps))
      await writeFile(
        path.join(out, `t${String(i / fps).padStart(5, "0")}.png`),
        buf,
      );
  }
  console.log(`Cuadros de revisión en ${out}`);
} else {
  const mp4 = path.join(root, "assets", "eudila-film.mp4");
  const ffmpeg = spawn(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-f",
      "image2pipe",
      "-framerate",
      String(fps),
      "-i",
      "-",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "21",
      "-tune",
      "animation",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      mp4,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise((ok, fail) =>
    ffmpeg.on("close", (code) =>
      code ? fail(new Error(`ffmpeg ${code}`)) : ok(),
    ),
  );
  let poster = null;
  for (let i = 0; i < frames; i++) {
    const buf = await png(i);
    if (i === Math.round(POSTER_AT * fps)) poster = buf;
    if (!ffmpeg.stdin.write(buf))
      await new Promise((ok) => ffmpeg.stdin.once("drain", ok));
    if (i % 120 === 0)
      process.stdout.write(`\r${Math.round((i / frames) * 100)}%`);
  }
  ffmpeg.stdin.end();
  await done;
  // Póster liviano: el mismo cuadro del lockup.
  const jpg = spawn("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "png_pipe",
    "-i",
    "-",
    "-q:v",
    "3",
    path.join(root, "assets", "eudila-film-poster.jpg"),
  ]);
  jpg.stdin.end(poster);
  await new Promise((ok) => jpg.on("close", ok));
  console.log(`\rPieza lista: ${mp4}`);
}

await browser.close();
server.close();
