// SPDX-License-Identifier: AGPL-3.0-only
// Genera los stickers de evento de la mascota eudila (círculo troquelado de 7 cm).
// Uso: node docs/design/stickers/generar.mjs  → escribe stickers.html (Chrome lo pasa a PNG/PDF, ver README).
import { writeFileSync } from "node:fs";
import { moods, shapePath } from "../../../prototype/moods.js";

const ROT = [0, -31.51, 63.03, -94.54, 126.05], SCALE = [1, .84, .68, .52, .36];
// Mismos ojos felices (^ ^) que public/brand/logo-mascota.svg
const EYES = "M89.98 111.21Q96.7 99.2 103.42 111.21M116.58 111.21Q123.3 99.2 130.02 111.21";

const ink = hex => "#" + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * .65).toString(16).padStart(2, "0")).join("");

function mascota(m, id) {
  const d = shapePath(m), c = m.orb;
  const layers = SCALE.map((s, i) =>
    `<path d="${d}" fill-opacity="${(.6 + i * .065).toFixed(3)}" stroke-width="${(.8 / s).toFixed(2)}" transform="rotate(${ROT[i]} 110 110) translate(110 110) scale(${s}) translate(-110 -110)"/>`).join("");
  return `<defs>
<radialGradient id="m${id}" cx="48%" cy="46%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".76"/><stop offset=".34" stop-color="#fff" stop-opacity=".28"/><stop offset=".72" stop-color="${c}" stop-opacity=".62"/><stop offset="1" stop-color="${c}" stop-opacity=".38"/></radialGradient>
<radialGradient id="e${id}" cx="38%" cy="24%" r="85%"><stop offset="0" stop-color="#fff" stop-opacity=".76"/><stop offset="1" stop-color="${c}" stop-opacity=".3"/></radialGradient>
<radialGradient id="c${id}"><stop offset="0" stop-color="#fff"/><stop offset=".22" stop-color="#fff" stop-opacity=".96"/><stop offset=".62" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="g${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter></defs>
<path d="${d}" fill="${c}" opacity=".38" filter="url(#g${id})"/>
<g fill="url(#m${id})" stroke="url(#e${id})">${layers}</g>
<circle cx="110" cy="110" r="53" fill="url(#c${id})"/><circle cx="110" cy="110" r="38.5" fill="#fff"/>
<path d="${EYES}" fill="none" stroke="${ink(c)}" stroke-width="4.55" stroke-linecap="round"/>`;
}

// Sticker: borde blanco (sangrado y troquel), disco del lienzo «Lisa» con luz coral, mascota y texto opcional.
function sticker(m, id, { texto, glow = m.orb } = {}) {
  const s = texto ? .8 : .95, tx = 150 - 110 * s, ty = texto ? 20 : 150 - 110 * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" class="sticker">
<defs><radialGradient id="l${id}" cx="50%" cy="8%" r="90%"><stop offset="0" stop-color="${glow}" stop-opacity=".34"/><stop offset=".7" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs>
<circle cx="150" cy="150" r="150" fill="#fff"/><circle cx="150" cy="150" r="140" fill="#1A1626"/><circle cx="150" cy="150" r="140" fill="url(#l${id})"/>
<g transform="translate(${tx} ${ty}) scale(${s})">${mascota(m, id)}</g>
${texto ? `<text x="150" y="244" text-anchor="middle" font-family="Figtree" font-weight="700" font-size="38" letter-spacing="-1.7" fill="#F4F1FA">${texto}</text>` : ""}
</svg>`;
}

const [muyAgradable, agradable] = [moods[6], moods[5]];
const set = [
  sticker(agradable, 1, { texto: "eudila.com" }),
  sticker(muyAgradable, 2, { texto: "eudila.com" })
];

writeFileSync(new URL("./stickers.html", import.meta.url), `<!doctype html><meta charset="utf-8"><title>Stickers eudila</title>
<style>@font-face{font-family:Figtree;font-weight:700;src:url(Figtree.ttf)}
@page{size:144mm 74mm;margin:0}html,body{margin:0;background:transparent}
body{display:flex;gap:6mm;padding:2mm;width:140mm}.sticker{width:66mm;height:66mm}</style>${set.join("")}`);
set.forEach((svg, i) => writeFileSync(new URL(`./sticker-${i + 1}.html`, import.meta.url),
  `<!doctype html><meta charset="utf-8"><style>@font-face{font-family:Figtree;font-weight:700;src:url(Figtree.ttf)}html,body{margin:0;background:transparent}svg{display:block;width:900px;height:900px}</style>${svg}`));
