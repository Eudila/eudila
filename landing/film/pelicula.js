// eudila en movimiento · pieza de 32 s a 1920 × 1080, 60 cuadros por segundo.
// Determinista: cada cuadro sale de `frame(i)`, con relojes sembrados por mascota.
// La mascota es el motor de la app (../mascota.js) y respeta docs/design/mascota/README.md.
import {
  Critter,
  orbAt,
  ambientAt,
  rgba,
  backOut,
  outCubic,
} from "../mascota.js";
import { moods } from "../moods.js";

export const W = 1920,
  H = 1080,
  FPS = 60,
  DURATION = 32;

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const span = (t, a, b) => clamp((t - a) / (b - a));
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
function brand(t) {
  const f = (a, b, u) =>
    3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * b + u * u * u;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let lo = 0,
    hi = 1,
    u = t;
  for (let i = 0; i < 22; i++) {
    u = (lo + hi) / 2;
    if (f(0.32, 0, u) < t) lo = u;
    else hi = u;
  }
  return f(0.72, 1, u);
}
// Reloj propio y repetible para cada mascota.
function seeded(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const label = (m) => moods[clamp(Math.round(m), 1, 7) - 1].label;
const ORB = moods.map((m) => m.orb);

const TEXT = "#f4f1fa",
  MUTED = "#dad5ea",
  CORAL = "#e65175",
  CORAL_L = "#f6c2cf",
  INK = "#1d1d1f";

let ctx, layer, lctx;
const A = new Critter({ mood: 4, random: seeded(11) }); // florece y recorre el péndulo
const ROW = [1, 2, 3, 4, 5, 6, 7].map(
  (m) => new Critter({ mood: m, random: seeded(100 + m * 7) }),
);
const S = new Critter({ mood: 3, random: seeded(303) }); // guarda y termina siendo el logo
for (const c of [A, ...ROW, S]) c.mRate = 0;

export function setup(canvas) {
  canvas.width = W;
  canvas.height = H;
  ctx = canvas.getContext("2d");
  layer = document.createElement("canvas");
  layer.width = W;
  layer.height = H;
  lctx = layer.getContext("2d");
}

/* Dibujo ------------------------------------------------------------------- */
function background(t, ambient, glowCol, glowA, gx = W / 2, gy = 430) {
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#1a1626");
  base.addColorStop(0.6, "#16131f");
  base.addColorStop(1, "#100d18");
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);
  // Lisa: una luz coral arriba.
  ctx.save();
  ctx.translate(W / 2, 0);
  ctx.scale(1.4 * W, 0.45 * H);
  const lisa = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  lisa.addColorStop(0, "rgba(230,81,117,.12)");
  lisa.addColorStop(0.7, "rgba(230,81,117,0)");
  ctx.fillStyle = lisa;
  ctx.fillRect(-1, 0, 2, 1);
  ctx.restore();
  // Ambiente del estado, como en la pantalla de ánimo.
  if (ambient && ambient.a > 0.001) {
    const amb = ctx.createLinearGradient(0, 0, 0, H);
    amb.addColorStop(0, rgba(ambient.c, 0.9 * ambient.a));
    amb.addColorStop(0.62, rgba(ambient.c, 0.35 * ambient.a));
    amb.addColorStop(1, rgba(ambient.c, 0));
    ctx.fillStyle = amb;
    ctx.fillRect(0, 0, W, H);
  }
  if (glowA > 0.001) {
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 620);
    g.addColorStop(0, rgba(glowCol, 0.24 * glowA));
    g.addColorStop(1, rgba(glowCol, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

function text(
  str,
  x,
  y,
  {
    size = 48,
    weight = 700,
    color = TEXT,
    alpha = 1,
    align = "center",
    track = -0.03,
    dy = 0,
  } = {},
) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Figtree`;
  ctx.letterSpacing = `${track * size}px`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(str, x, y + dy);
  ctx.restore();
}

/** Mascota con transparencia: el motor fija su propia opacidad, así que se compone aparte. */
function critter(c, x, y, R, t, alpha = 1) {
  if (R < 0.5 || alpha <= 0.002) return;
  if (alpha >= 0.999) return c.render(ctx, x, y, R, H, t, 1 / FPS, 1);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  c.render(lctx, x, y, R, H, t, 1 / FPS, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

function core(x, y, r, glow = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5.5);
  g.addColorStop(0, `rgba(255,255,255,${0.9 * glow})`);
  g.addColorStop(0.18, `rgba(255,255,255,${0.5 * glow})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 5.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function spark(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.closePath();
}

/* Escena 1 · Chispa: el núcleo cae en espiral con la estela de los siete colores */
const spiral = (u) => {
  const r = 420 * Math.sin(Math.PI * u) * (1 - 0.3 * u),
    a = -Math.PI / 2 + u * TAU * 1.35;
  return [W / 2 + Math.cos(a) * r, 430 + Math.sin(a) * r * 0.62];
};
function chispa(t) {
  const appear = brand(span(t, 0.05, 0.6));
  const u = inOut(span(t, 0.45, 2.9));
  const [x, y] = spiral(u);
  // Estela: los últimos tramos del recorrido, del violeta al coral.
  if (u > 0 && t < 3.6) {
    const fadeOut = 1 - span(t, 2.9, 3.5);
    const steps = 90;
    ctx.lineCap = "round";
    for (let i = 1; i <= steps; i++) {
      const u0 = u - ((i - 1) / steps) * 0.42,
        u1 = u - (i / steps) * 0.42;
      if (u1 < 0) break;
      const [x0, y0] = spiral(u0),
        [x1, y1] = spiral(u1);
      const k = clamp(1 - i / steps);
      const col = ORB[Math.min(6, Math.floor((1 - i / steps) * 7))];
      ctx.strokeStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 22 * k;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = k * k * 0.75 * fadeOut;
      ctx.lineWidth = 3 + 15 * k;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }
  const gather = span(t, 2.9, 3.4);
  core(x, y, 9 * appear + 6 * gather, appear * (1 + 0.6 * gather));
}

/* Escena 2 · Florece y recorre los siete estados con el selector ----------------- */
const PENDULUM = [4, 3, 5, 2, 6, 1, 7];
const STEP = 0.8,
  P0 = 5.2;
function pendulumMood(t) {
  let m = 4;
  for (let i = 1; i < PENDULUM.length; i++) {
    const t0 = P0 + (i - 1) * STEP;
    if (t < t0) break;
    m = lerp(PENDULUM[i - 1], PENDULUM[i], brand(span(t, t0, t0 + 0.6)));
  }
  return m;
}
const SL = { x: W / 2 - 300, w: 600, y: 900 };
const sliderX = (m) => SL.x + ((m - 1) / 6) * SL.w;

function slider(m, alpha) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(SL.x, 0, SL.x + SL.w, 0);
  [
    "#892FC9",
    "#5B4CE1",
    "#209AE7",
    "#2EC0BC",
    "#77CB47",
    "#FE9613",
    "#FF4A4B",
  ].forEach((c, i) => g.addColorStop(i / 6, c));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(SL.x, SL.y - 3, SL.w, 6, 3);
  ctx.fill();
  const x = sliderX(m);
  ctx.fillStyle = "rgba(255,255,255,.16)";
  ctx.beginPath();
  ctx.arc(x, SL.y, 24, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, SL.y, 15, 0, TAU);
  ctx.fill();
  const i = clamp(Math.round(m), 1, 7) - 1;
  ctx.fillStyle = moods[i].accent;
  ctx.beginPath();
  ctx.arc(x, SL.y, 8, 0, TAU);
  ctx.fill();
  ctx.restore();
  text("Muy desagradable", SL.x, SL.y + 52, {
    size: 22,
    weight: 500,
    color: MUTED,
    alpha,
    align: "left",
    track: 0,
  });
  text("Muy agradable", SL.x + SL.w, SL.y + 52, {
    size: 22,
    weight: 500,
    color: MUTED,
    alpha,
    align: "right",
    track: 0,
  });
}

/* Escena 4 · Cuatro semanas de registros y una proyección ------------------------- */
const PLAN = [
  3, 2, 3, 4, 3, 4, 4, 3, 2, 3, 4, 5, 4, 5, 4, 5, 5, 4, 6, 5, 5, 5, 6, 5, 6, 6,
  7, 6,
];
const AHEAD = [6, 5.3, 4.4, 3.5, 2.9];
const CH = { x: 250, w: 1420, y: 380, h: 420 };
const cx = (i) => CH.x + (i / (PLAN.length + AHEAD.length - 1)) * CH.w;
const cy = (m) => CH.y + CH.h - ((m - 1) / 6) * CH.h;
const ROW_Y = 560;
const rowX = (m) => W / 2 + (m - 4) * 228;

function chart(t) {
  const gridA = span(t, 15.4, 16.0) * (1 - span(t, 21.0, 21.4));
  if (gridA > 0.002) {
    ctx.save();
    ctx.globalAlpha = gridA;
    ctx.strokeStyle = "rgba(214,208,230,.12)";
    ctx.lineWidth = 1.5;
    for (let m = 1; m <= 7; m++) {
      ctx.beginPath();
      ctx.moveTo(CH.x, cy(m));
      ctx.lineTo(CH.x + CH.w, cy(m));
      ctx.stroke();
    }
    ctx.restore();
    text("hace 4 semanas", CH.x, CH.y + CH.h + 54, {
      size: 22,
      weight: 500,
      color: MUTED,
      alpha: gridA,
      align: "left",
      track: 0,
    });
  }
  // Línea del historial, de izquierda a derecha.
  const draw = brand(span(t, 15.9, 17.6));
  const lineA = 1 - span(t, 21.0, 21.4);
  if (draw > 0 && lineA > 0.002) {
    const pts = PLAN.map((m, i) => [cx(i), cy(m)]);
    const total = (pts.length - 1) * draw;
    ctx.save();
    ctx.globalAlpha = lineA;
    ctx.strokeStyle = TEXT;
    ctx.lineWidth = 4;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(...pts[0]);
    for (let i = 1; i <= Math.floor(total); i++) ctx.lineTo(...pts[i]);
    const f = total % 1,
      j = Math.floor(total);
    if (j < pts.length - 1)
      ctx.lineTo(
        lerp(pts[j][0], pts[j + 1][0], f),
        lerp(pts[j][1], pts[j + 1][1], f),
      );
    ctx.stroke();
    ctx.restore();
  }
  // Proyección: punteada, coral, con una banda que se abre y un aviso temprano.
  const ahead = brand(span(t, 18.2, 19.6));
  if (ahead > 0 && lineA > 0.002) {
    const last = PLAN.length - 1;
    const pts = [
      [cx(last), cy(PLAN[last])],
      ...AHEAD.map((m, i) => [cx(last + 1 + i), cy(m)]),
    ];
    const n = (pts.length - 1) * ahead;
    ctx.save();
    ctx.globalAlpha = lineA;
    // «hoy»
    ctx.strokeStyle = "rgba(214,208,230,.35)";
    ctx.setLineDash([8, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], CH.y - 20);
    ctx.lineTo(pts[0][0], CH.y + CH.h + 20);
    ctx.stroke();
    // banda
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(230,81,117,.16)";
    ctx.beginPath();
    for (let i = 0; i <= n && i < pts.length; i++)
      ctx.lineTo(pts[i][0], pts[i][1] - 6 - i * 16);
    for (let i = Math.min(pts.length - 1, Math.floor(n)); i >= 0; i--)
      ctx.lineTo(pts[i][0], pts[i][1] + 6 + i * 16);
    ctx.fill();
    ctx.strokeStyle = CORAL;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.setLineDash([2, 16]);
    ctx.beginPath();
    ctx.moveTo(...pts[0]);
    for (let i = 1; i <= Math.floor(n); i++) ctx.lineTo(...pts[i]);
    const f = n % 1,
      j = Math.floor(n);
    if (j < pts.length - 1)
      ctx.lineTo(
        lerp(pts[j][0], pts[j + 1][0], f),
        lerp(pts[j][1], pts[j + 1][1], f),
      );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    text("hoy", pts[0][0], CH.y + CH.h + 54, {
      size: 22,
      weight: 500,
      color: MUTED,
      alpha: lineA * ahead,
      track: 0,
    });
    const alertA = span(t, 19.5, 19.9) * lineA;
    if (alertA > 0) {
      const [ax, ay] = pts[pts.length - 1];
      const pulse = ((t - 19.5) % 1.2) / 1.2;
      ctx.save();
      ctx.globalAlpha = alertA * (1 - pulse);
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ax, ay, 14 + 30 * outCubic(pulse), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = alertA;
      ctx.fillStyle = CORAL;
      ctx.beginPath();
      ctx.arc(ax, ay, 13, 0, TAU);
      ctx.fill();
      ctx.restore();
      text("aviso temprano", ax, ay + 62, {
        size: 24,
        weight: 600,
        color: CORAL_L,
        alpha: alertA,
        track: 0,
      });
    }
  }
}

/** Cada registro nace de la mascota de su estado y viaja a su día en el gráfico. */
function dots(t) {
  const merge = inOut(span(t, 20.9, 21.8));
  PLAN.forEach((m, i) => {
    const go = brand(span(t, 14.95 + i * 0.022, 15.75 + i * 0.022));
    if (go <= 0) return;
    let x = lerp(rowX(m), cx(i), go),
      y = lerp(ROW_Y, cy(m), go) - Math.sin(Math.PI * go) * 60;
    let r = lerp(4, 10, go);
    if (merge > 0) {
      x = lerp(x, W / 2, merge);
      y = lerp(y, 450, merge);
      r = lerp(r, 5, merge);
    }
    ctx.globalAlpha = 1 - span(t, 21.6, 21.85);
    ctx.fillStyle = ORB[m - 1];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  if (merge > 0.6)
    core(
      W / 2,
      450,
      10 * span(t, 21.3, 21.8),
      span(t, 21.3, 21.8) * (1 - span(t, 21.85, 22.1)),
    );
}

/* Cuadro ------------------------------------------------------------------- */
const fired = new Set();
/** Dispara un momento una sola vez, en el primer cuadro que cruza `at`. */
function cue(key, i, at, fn) {
  if (fired.has(key) || i < Math.round(at * FPS)) return;
  fired.add(key);
  fn();
}

export function frame(i) {
  const t = i / FPS;
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Estado de A durante el péndulo y su ambiente.
  const mA = pendulumMood(t);
  A.mt = mA;
  const s2 = span(t, 3.3, 4.2) * (1 - span(t, 10.2, 10.9));
  const ambient = { c: ambientAt(mA), a: 0.55 * s2 };
  // El estado de S tiñe el fondo mientras guarda y vuelve al coral de marca.
  const mS = lerp(3, 7, brand(span(t, 25.5, 26.1)));
  S.mt = mS;
  const s5 = span(t, 21.7, 22.4) * (1 - span(t, 30.4, 31.4));
  background(
    t,
    s5 > 0
      ? { c: ambientAt(mS), a: 0.3 * s5 * (1 - span(t, 25.4, 26.4)) }
      : ambient,
    orbAt(s5 > 0 ? mS : mA),
    Math.max(s2, s5),
    W / 2,
    s5 > 0 ? 450 : 430,
  );

  // 1 · Chispa
  if (t < 3.8) chispa(t);

  // 2 · Florece (Saludo) y péndulo
  if (t >= 3.3 && t < 11.2) {
    cue("hola-A", i, 3.3, () => A.play("hola", t));
    const moving = PENDULUM.some(
      (_, k) =>
        k > 0 && t > P0 + (k - 1) * STEP && t < P0 + (k - 1) * STEP + 0.6,
    );
    if (moving) A.listenUntil = t + 0.25;
    const out = brand(span(t, 10.35, 10.95));
    const R = lerp(210, 0, out);
    const x = lerp(W / 2, sliderX(7), out),
      y = lerp(430, SL.y, out);
    critter(A, x, y, R, t, 1 - span(t, 10.75, 10.95));
    const nameA = span(t, 4.4, 5.0) * (1 - span(t, 10.2, 10.5));
    text(label(mA), W / 2, 770, { size: 60, alpha: nameA });
    slider(mA, span(t, 4.6, 5.2) * (1 - span(t, 10.6, 11.1)));
  }

  // 3 · Siete estados en fila, cada uno con su reloj
  if (t >= 10.4 && t < 15.8) {
    ROW.forEach((c, k) => {
      const m = k + 1,
        start = 10.5 + k * 0.07;
      const rise = backOut(span(t, start, start + 0.75), 1.4);
      const leave = brand(span(t, 14.8, 15.4));
      const R = lerp(0, 82, clamp(rise, 0, 1.2)) * (1 - 0.6 * leave);
      const y = lerp(SL.y, ROW_Y, clamp(rise, 0, 1.1));
      critter(
        c,
        lerp(sliderX(m), rowX(m), brand(span(t, start, start + 0.75))),
        y,
        R,
        t,
        1 - leave,
      );
      text(moods[k].label, rowX(m), ROW_Y + 150, {
        size: 23,
        weight: 600,
        color: MUTED,
        alpha:
          span(t, 11.6 + k * 0.05, 12.1 + k * 0.05) * (1 - span(t, 14.6, 14.9)),
        track: 0,
      });
    });
    const titleA = span(t, 11.5, 12.1) * (1 - span(t, 14.5, 14.9));
    text("Siete estados.", W / 2, 250, {
      size: 84,
      alpha: titleA,
      dy: 14 * (1 - brand(span(t, 11.5, 12.2))),
    });
    text("Ninguno es el correcto.", W / 2, 322, {
      size: 44,
      weight: 500,
      color: MUTED,
      alpha: span(t, 12.3, 12.9) * (1 - span(t, 14.5, 14.9)),
      track: -0.02,
      dy: 12 * (1 - brand(span(t, 12.3, 13))),
    });
  }

  // 4 · La historia que ve el psicólogo y lo que podría anticiparse
  if (t >= 14.9 && t < 22.2) {
    chart(t);
    dots(t);
    const a1 = span(t, 15.9, 16.4) * (1 - span(t, 17.9, 18.2));
    text("Cuatro semanas de registros.", CH.x, 220, {
      size: 64,
      alpha: a1,
      align: "left",
      dy: 12 * (1 - brand(span(t, 15.9, 16.6))),
    });
    text("La evolución que el psicólogo ve entre sesiones.", CH.x, 280, {
      size: 32,
      weight: 500,
      color: MUTED,
      alpha: span(t, 16.3, 16.8) * (1 - span(t, 17.9, 18.2)),
      align: "left",
      track: -0.01,
    });
    const a2 = span(t, 18.2, 18.7) * (1 - span(t, 20.9, 21.3));
    text("Y, a futuro, anticiparse.", CH.x, 220, {
      size: 64,
      alpha: a2,
      align: "left",
      dy: 12 * (1 - brand(span(t, 18.2, 18.9))),
    });
    text("Un modelo predictivo por paciente · en desarrollo", CH.x, 280, {
      size: 32,
      weight: 500,
      color: MUTED,
      alpha: span(t, 18.6, 19.1) * (1 - span(t, 20.9, 21.3)),
      align: "left",
      track: -0.01,
    });
  }

  // 5 · Guardado: celebra igual en un estado desagradable
  // 6 · Y termina siendo el logo
  if (t >= 21.75) {
    cue("hola-S", i, 21.75, () => S.play("hola", t));
    cue("guardar-S", i, 23.2, () => S.play("guardar", t));
    const lock = brand(span(t, 25.6, 26.6));
    // Lockup centrado según el ancho real del wordmark.
    ctx.font = "700 210px Figtree";
    ctx.letterSpacing = `${-0.045 * 210}px`;
    const wordW = ctx.measureText("eudila").width;
    const RL = 140,
      gap = 46,
      total = RL * 2 + gap + wordW,
      lx = W / 2 - total / 2 + RL,
      ly = 440;
    S.faceScale = lerp(1, 1.75, lock);
    S.particles = 1 - lock;
    S.scene = t > 25.3 ? { still: lock } : null;
    const x = lerp(W / 2, lx, lock),
      y = lerp(450, ly, lock),
      R = lerp(200, RL, lock);
    // El wordmark sale de atrás del orbe.
    const word = brand(span(t, 26.4, 27.3));
    const fadeAll = 1 - span(t, 30.4, 31.3);
    if (word > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(lx, 0, W, H);
      ctx.clip();
      text("eudila", lerp(lx - wordW * 0.6, lx + RL + gap, word), ly + 74, {
        size: 210,
        align: "left",
        track: -0.045,
        alpha: fadeAll,
      });
      ctx.restore();
    }
    critter(S, x, y, R, t, fadeAll);
    const stateA = span(t, 23.0, 23.4) * (1 - span(t, 25.2, 25.5));
    text(label(mS), W / 2, 760, {
      size: 40,
      weight: 600,
      color: MUTED,
      alpha: stateA,
      track: -0.02,
    });
    text("Celebra que registraste, nunca cómo te sentís.", W / 2, 840, {
      size: 52,
      alpha: span(t, 23.5, 24.0) * (1 - span(t, 25.2, 25.5)),
      dy: 10 * (1 - brand(span(t, 23.5, 24.2))),
    });
    text(
      "Lo que pasa entre sesiones, también llega a la consulta.",
      W / 2,
      720,
      {
        size: 48,
        weight: 500,
        color: MUTED,
        alpha: span(t, 27.3, 27.9) * fadeAll,
        track: -0.02,
        dy: 12 * (1 - brand(span(t, 27.3, 28))),
      },
    );
    // Sello de ganadores.
    const pill = brand(span(t, 28.1, 28.8)) * fadeAll;
    if (pill > 0.002) {
      const pw = 560,
        ph = 64,
        px = W / 2 - pw / 2,
        py = 800;
      ctx.save();
      ctx.globalAlpha = pill;
      ctx.translate(W / 2, py + ph / 2);
      ctx.scale(lerp(0.92, 1, pill), lerp(0.92, 1, pill));
      ctx.translate(-W / 2, -(py + ph / 2));
      ctx.fillStyle = CORAL;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, ph / 2);
      ctx.fill();
      ctx.fillStyle = INK;
      spark(px + 40, py + ph / 2, 12);
      ctx.fill();
      ctx.restore();
      text("Ganadores · Hackathon Noainova 2026", W / 2 + 18, py + 42, {
        size: 27,
        weight: 700,
        color: INK,
        alpha: pill,
        track: -0.01,
      });
    }
  }
}
