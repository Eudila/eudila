// SPDX-License-Identifier: AGPL-3.0-only
// Canvas engine of the eudila mascot, ported from docs/design/mascota/eudila-viva.html.
// docs/design/mascota/README.md owns every value; change it there first.
import { moods, shapePoints } from "./moods.js";

type RGB = number[];
type Eyes = {
  open: number;
  gx: number;
  gy: number;
  winkL: number;
  winkR: number;
  happy: number;
  closed: number;
  sad: number;
};
type Pose = {
  x: number;
  y: number;
  R: number;
  m: number;
  t: number;
  dpr: number;
  gaze: number[];
  sx: number;
  sy: number;
  rot: number;
  unfold?: number[];
  core: number;
  glow: number;
  eyes: Eyes | null;
  particles: number;
  dim: number;
  rings: number[] | null;
  ringA: number;
  burst?: number;
  spin: number;
  faceScale: number;
};
export type MomentFrame = Partial<{
  unfold: number[];
  core: number;
  glow: number;
  sx: number;
  sy: number;
  dy: number;
  dyPx: number;
  particles: number;
  burst: number;
  winkR: number;
  winkL: number;
  happy: number;
  closed: number;
  spin: number;
  gaze: number[] | null;
  /** 0–1: fades out breath, sway, hops, shiver and sink (the static logo pose). */
  still: number;
}>;
export type Moment = "hop" | "hola" | "guardar" | "asomar";

const TAU = Math.PI * 2,
  PI = Math.PI;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: number[], b: number[], t: number) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];
const approach = (v: number, t: number, s: number) =>
  v < t ? Math.min(t, v + s) : Math.max(t, v - s);
function brand(t: number) {
  // cubic-bezier(.32,.72,0,1)
  const f = (a: number, b: number, u: number) =>
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
export const backOut = (t: number, s = 1.70158) => {
  t = clamp(t) - 1;
  return t * t * ((s + 1) * t + s) + 1;
};
const inCubic = (t: number) => t * t * t;
export const outCubic = (t: number) => 1 - (1 - t) ** 3;
const damp = (t: number, f: number, d: number) =>
  Math.exp(-d * t) * Math.sin(TAU * f * t);
const hump = (t: number, a: number, b: number) =>
  t <= a || t >= b ? 0 : Math.min(1, 1.8 * Math.sin((PI * (t - a)) / (b - a)));

const hex = (h: string) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const ORB = moods.map((m) => hex(m.orb));
const AMBIENT = moods.map((m) => hex(m.ambient));
function at(table: RGB[], m: number) {
  m = clamp(m, 1, 7);
  const i = Math.min(5, Math.floor(m - 1)),
    f = m - 1 - i;
  return [0, 1, 2].map(
    (j) => table[i][j] + (table[i + 1][j] - table[i][j]) * f,
  );
}
export const rgba = (c: RGB, a: number) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/** Orb and ambient colors at a continuous mood (1–7), for scenes drawn around the mascot. */
export const orbAt = (m: number) => at(ORB, m);
export const ambientAt = (m: number) => at(AMBIENT, m);

const N = 180;
const SHAPES = moods.map((mood) =>
  Float32Array.from(
    shapePoints(mood, N).flatMap(([x, y]) => [x - 110, y - 110]),
  ),
);
function shapeAt(m: number, out: Float32Array, t: number, layer: number) {
  m = clamp(m, 1, 7);
  const i = Math.min(5, Math.floor(m - 1)),
    f = m - 1 - i,
    A = SHAPES[i],
    B = SHAPES[i + 1];
  for (let k = 0; k < N * 2; k++) out[k] = A[k] + (B[k] - A[k]) * f;
  const org = Math.max(0, 1 - Math.abs(m - 5)); // ripple only near Algo agradable
  if (org > 0.001)
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TAU - PI / 2,
        d = org * 8 * Math.sin(3 * th + (t * TAU) / 8 + layer * 0.7);
      out[2 * k] += Math.cos(th) * d;
      out[2 * k + 1] += Math.sin(th) * d;
    }
  return out;
}
function trace(ctx: CanvasRenderingContext2D, p: Float32Array) {
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (let k = 2; k < p.length; k += 2) ctx.lineTo(p[k], p[k + 1]);
  ctx.closePath();
}
function spark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.closePath();
}

/** eudila's identity state: Muy agradable, the coral of the logo (README). */
export const brandMood = 7;

/** Neutral draws three layers; the inner two fade in away from it (README rule 3). */
export const innerLayerOpacity = (m: number) => clamp(Math.abs(m - 4) * 1.5);

const LS = [1, 0.84, 0.68, 0.52, 0.36],
  ONES = [1, 1, 1, 1, 1],
  SCR = new Float32Array(N * 2);
const PART = Array.from({ length: 24 }, (_, i) => {
  const a = i * 2.399963,
    r = 98 + (i % 5) * 4;
  return {
    x: Math.cos(a) * r,
    y: Math.sin(a) * r,
    s: 0.65 + (i % 4) * 0.3,
    d: 2.5 + ((i * 7) % 15) * 0.25,
    ph: -((i * 1.618) % 6),
  };
});

function drawEyes(
  ctx: CanvasRenderingContext2D,
  e: Eyes,
  ink: string,
  A: number,
) {
  const W = 4.8,
    H = 9.4,
    S = 7.6;
  ctx.lineCap = "round";
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = ink;
  for (const side of [-1, 1]) {
    const ex = side * S + e.gx * 3,
      ey = -1 + e.gy * 2.4;
    const wink = side < 0 ? e.winkL : e.winkR;
    const open = Math.max(0.08, e.open * (1 - wink));
    const closed = clamp(e.closed),
      happy = clamp(e.happy) * (1 - closed),
      plain = (1 - closed) * (1 - happy);
    if (plain > 0.01) {
      ctx.globalAlpha = A * plain;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.ellipse(ex, ey, W / 2, (H / 2) * open, 0, 0, TAU);
      ctx.fill();
      if (e.sad > 0.01 && open > 0.3) {
        // Eyelid sits lower on the outer side.
        const yo = ey - H / 2 - 1 + e.sad * H * 0.55,
          yi = ey - H / 2 - 1 + e.sad * H * 0.08;
        const xo = ex + side * (W / 2 + 1.2),
          xi = ex - side * (W / 2 + 1.2);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(xo, ey - H);
        ctx.lineTo(xi, ey - H);
        ctx.lineTo(xi, yi);
        ctx.lineTo(xo, yo);
        ctx.closePath();
        ctx.fill();
      }
    }
    if (happy > 0.01) {
      ctx.globalAlpha = A * happy;
      ctx.beginPath();
      ctx.moveTo(ex - W * 0.8, ey + H * 0.18);
      ctx.quadraticCurveTo(ex, ey - H * 0.55, ex + W * 0.8, ey + H * 0.18);
      ctx.stroke();
    }
    if (closed > 0.01) {
      ctx.globalAlpha = A * closed;
      ctx.beginPath();
      ctx.moveTo(ex - W * 0.8, ey);
      ctx.quadraticCurveTo(ex, ey + H * 0.42, ex + W * 0.8, ey);
      ctx.stroke();
    }
  }
}

function drawOrb(ctx: CanvasRenderingContext2D, o: Pose) {
  const K = o.R / 110,
    m = o.m,
    t = o.t,
    dim = o.dim,
    col = at(ORB, m),
    unfold = o.unfold || ONES,
    g = o.gaze;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rot);
  ctx.scale(K * o.sx, K * o.sy);
  if (o.rings && o.ringA > 0.01) {
    ctx.lineWidth = 1.4 / K;
    ctx.strokeStyle = rgba(col, 1);
    for (const p of o.rings) {
      ctx.globalAlpha = o.ringA * 0.55 * (1 - p);
      ctx.beginPath();
      ctx.arc(0, 0, 104 + 64 * outCubic(p), 0, TAU);
      ctx.stroke();
    }
  }
  const u0 = unfold[0];
  if (u0 > 0.02) {
    shapeAt(m, SCR, t, 0);
    ctx.save();
    ctx.scale(u0, u0);
    trace(ctx, SCR);
    ctx.shadowColor = rgba(col, 0.75);
    ctx.shadowBlur = 20 * K * o.dpr;
    ctx.globalAlpha = 0.5 * dim;
    ctx.fillStyle = rgba(col, 0.45);
    ctx.fill();
    ctx.restore();
  }
  const mat = ctx.createRadialGradient(-4.4, -8.8, 0, -4.4, -8.8, 132);
  mat.addColorStop(0, "rgba(255,255,255,.76)");
  mat.addColorStop(0.34, "rgba(255,255,255,.28)");
  mat.addColorStop(0.72, rgba(col, 0.62));
  mat.addColorStop(1, rgba(col, 0.38));
  const edge = ctx.createRadialGradient(-26.4, -57.2, 0, -26.4, -57.2, 187);
  edge.addColorStop(0, "rgba(255,255,255,.76)");
  edge.addColorStop(1, rgba(col, 0.3));
  const inner = innerLayerOpacity(m);
  for (let i = 0; i < 5; i++) {
    const u = unfold[i];
    const keep = i < 3 ? 1 : inner;
    if (u < 0.02 || keep < 0.01) continue;
    shapeAt(m, SCR, t, i);
    const s = LS[i] * u,
      par = (1 - LS[i]) * 14,
      dir = i % 2 ? -1 : 1;
    ctx.save();
    ctx.translate(g[0] * par, g[1] * par);
    ctx.rotate(dir * (o.spin + i * 0.55));
    ctx.scale(s, s);
    trace(ctx, SCR);
    ctx.globalAlpha = (0.6 + i * 0.065) * dim * keep;
    ctx.fillStyle = mat;
    ctx.fill();
    ctx.globalAlpha = dim * keep;
    ctx.lineWidth = 0.8 / s;
    ctx.strokeStyle = edge;
    ctx.stroke();
    ctx.restore();
  }
  const pw = o.particles * Math.min(1, u0);
  if (pw > 0.01) {
    const dw = clamp(4 - m) * pw,
      sw = clamp(m - 4) * pw;
    for (const p of PART) {
      const a = 0.5 + 0.5 * Math.sin((TAU * (t - p.ph)) / p.d);
      if (dw > 0.01) {
        ctx.globalAlpha = dw * a;
        ctx.fillStyle = rgba(col, 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 1.7, 0, TAU);
        ctx.fill();
      }
      if (sw > 0.01) {
        ctx.globalAlpha = sw * a;
        ctx.fillStyle = "#fff";
        spark(ctx, p.x, p.y, p.s * 3.4);
        ctx.fill();
      }
    }
  }
  if (o.burst !== undefined && o.burst > 0 && o.burst < 0.9) {
    const p = o.burst / 0.9;
    for (let j = 0; j < 14; j++) {
      const an = (j * TAU) / 14 + 0.2,
        r = 30 + 150 * outCubic(p);
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = j % 2 ? "#fff" : rgba(col, 1);
      spark(ctx, Math.cos(an) * r, Math.sin(an) * r, (1 - p) * 6 + 2);
      ctx.fill();
    }
  }
  const cx = g[0] * 16,
    cy = g[1] * 16;
  if (o.glow > 0.01) {
    const r = 53 * o.glow,
      cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    cg.addColorStop(0, "rgba(255,255,255,1)");
    cg.addColorStop(0.22, "rgba(255,255,255,.96)");
    cg.addColorStop(0.62, "rgba(255,255,255,.28)");
    cg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = Math.min(1, 0.3 + 0.7 * dim);
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
  }
  if (o.core > 0.01) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    if (o.eyes) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(o.faceScale, o.faceScale);
      ctx.beginPath();
      ctx.arc(0, 0, 22 * o.core, 0, TAU);
      ctx.fill();
      if (o.core > 0.6) {
        const ink = at(AMBIENT, m).map((v) => v * 0.65);
        drawEyes(ctx, o.eyes, rgba(ink, 1), 1);
      }
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, 12 * o.core, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Temperament per state (1–7), interpolated with the continuous slider position. */
const TEMPER = {
  bp: [5.6, 5.0, 4.5, 4, 4, 3.6, 3.2],
  ba: [0.012, 0.014, 0.016, 0.018, 0.02, 0.024, 0.028],
  sh: [0, 0.6, 0.15, 0, 0, 0, 0],
  sw: [0, 0, 0, 0, 1.2, 2.4, 3.6],
  sink: [0.06, 0.035, 0.012, 0, -0.005, -0.012, -0.02],
  hop: [0, 0, 0, 0, 0, 0.035, 0.07],
};
function tem(k: keyof typeof TEMPER, m: number) {
  const a = TEMPER[k];
  m = clamp(m, 1, 7);
  const i = Math.min(5, Math.floor(m - 1));
  return lerp(a[i], a[i + 1], m - 1 - i);
}

export function hop(t: number, a = 0.22) {
  const k = a / 0.22;
  if (t < 0 || t > 1.05) return { sx: 1, sy: 1, dy: 0 };
  if (t < 0.14) {
    const e = Math.sin(((t / 0.14) * PI) / 2);
    return { sx: 1 + 0.07 * k * e, sy: 1 - 0.1 * k * e, dy: 0 };
  }
  if (t < 0.46) {
    const p = (t - 0.14) / 0.32,
      v = Math.abs(Math.cos(PI * p));
    return {
      sx: 1 - 0.05 * k * v,
      sy: 1 + 0.08 * k * v,
      dy: -a * Math.sin(PI * p),
    };
  }
  const q = t - 0.46,
    w = Math.exp(-7 * q) * Math.cos(TAU * 3 * q);
  return { sx: 1 + 0.08 * k * w, sy: 1 - 0.1 * k * w, dy: 0 };
}

const MOMENTS: Record<
  Moment,
  (t: number, c: { H: number; R: number; y: number }) => MomentFrame | null
> = {
  hop: (t) => (t > 1.1 ? null : hop(t)),
  hola(t) {
    if (t > 2.3) return null;
    const unfold = [0, 1, 2, 3, 4].map((i) =>
      Math.max(0, backOut(clamp((t - 0.2 - (4 - i) * 0.07) / 0.5), 1.9)),
    );
    const core = Math.max(0, backOut(clamp(t / 0.28), 2.2)),
      h = hop(t - 1.0);
    return {
      unfold,
      core,
      glow: core,
      sx: h.sx,
      sy: h.sy,
      dy: h.dy,
      particles: clamp((t - 0.6) / 0.4),
      burst: t - 0.62,
      winkR: t > 1.75 && t < 2.05 ? Math.sin((PI * (t - 1.75)) / 0.3) : 0,
    };
  },
  guardar(t) {
    if (t > 2.1) return null;
    let s = 1;
    if (t < 0.18) s = 1 + 0.06 * outCubic(t / 0.18);
    else if (t < 0.6) s = 1.06 - 0.06 * ((t - 0.18) / 0.42);
    const unfold = [0, 1, 2, 3, 4].map((i) => {
      if (t < 0.18) return 1;
      if (t < 0.8)
        return Math.max(
          0.04,
          1 - inCubic(clamp(((t - 0.18) / 0.42 - i * 0.08) / 0.68)),
        );
      return Math.max(
        0.04,
        backOut(clamp((t - 0.8 - (4 - i) * 0.07) / 0.55), 1.7),
      );
    });
    const flash = Math.sin(PI * clamp((t - 0.55) / 0.7));
    return {
      sx: s,
      sy: s,
      unfold,
      spin: 1.4 * Math.sin(PI * clamp((t - 0.18) / 1.75)),
      core: 1 + 0.7 * flash,
      glow: 1 + 1.6 * flash,
      burst: t - 0.62,
      happy: hump(t, 0.55, 1.85),
      particles: t < 0.18 ? 1 : t < 0.9 ? 0 : clamp((t - 0.9) / 0.6),
    };
  },
  asomar(t, c) {
    if (t > 3.0) return null;
    const B = c.H - c.y,
      hid = B + c.R * 1.45,
      peek = B + c.R * 0.15;
    if (t < 0.55)
      return { dyPx: lerp(hid, peek, brand(t / 0.55)), gaze: [0, -0.6] };
    if (t < 1.85)
      return {
        dyPx: peek,
        gaze: t < 1.1 ? [-0.85, -0.35] : t < 1.6 ? [0.85, -0.35] : [0, -0.85],
      };
    const tt = t - 1.85,
      h = hop(tt);
    let dyPx = 0;
    if (tt < 0.14) dyPx = peek;
    else if (tt < 0.46) {
      const p = (tt - 0.14) / 0.32;
      dyPx = lerp(peek, 0, outCubic(p)) - c.R * 0.22 * Math.sin(PI * p);
    }
    return { dyPx, sx: h.sx, sy: h.sy, gaze: tt < 0.5 ? [0, -0.3] : null };
  },
};

export const now = () => performance.now() / 1000;

export class Critter {
  m: number;
  mt: number;
  eyes: boolean;
  mRate: number;
  faceScale: number;
  particles: number;
  reduced = false;
  restT = 0;
  rest = 0;
  /** A scripted pose (the onboarding intro) that replaces any moment while set. */
  scene: MomentFrame | null = null;
  listenUntil = -9;
  wobT = -9;
  // Escucha looks down toward the slider, never at the thumb or pointer.
  private listen = 0;
  private listenDir = [0, 1];
  private gaze = [0, 0];
  private sac = [0, 0];
  private sacAt: number;
  private blinkT = -9;
  private blinkAt: number;
  private mom: Moment | null = null;
  private t0 = 0;
  /** Layer spin (rad). The logo SVG is drawn at 0; the intro lands on it. */
  spinA: number;
  private breathPh: number;
  private ph: number;
  private random: () => number;

  constructor(o: {
    mood: number;
    eyes?: boolean;
    mRate?: number;
    faceScale?: number;
    /** 0 hides the dots and sparkles around the orb. */
    particles?: number;
    random?: () => number;
  }) {
    this.m = this.mt = o.mood;
    this.eyes = o.eyes ?? true;
    this.mRate = o.mRate ?? 7;
    this.faceScale = o.faceScale ?? 1;
    this.particles = o.particles ?? 1;
    // Each mascot keeps its own clock (README rule 2).
    const random = (this.random = o.random ?? Math.random);
    this.ph = random() * 20;
    this.sacAt = random() * 2.5;
    this.blinkAt = 1 + random() * 3;
    this.spinA = random() * 6;
    this.breathPh = random() * 6;
  }

  play(name: Moment, t: number) {
    if (this.reduced) return;
    this.mom = name;
    this.t0 = t;
  }

  get playing() {
    return this.mom;
  }

  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    R: number,
    H: number,
    t: number,
    dt: number,
    dpr: number,
  ) {
    const rm = this.reduced,
      ta = rm ? 0 : t + this.ph,
      K = R / 110,
      random = this.random;
    if (rm) this.mom = null;
    this.m =
      rm || !this.mRate
        ? this.mt
        : this.m + (this.mt - this.m) * (1 - Math.exp(-dt * this.mRate));
    this.rest = rm ? this.restT : approach(this.rest, this.restT, dt * 1.4);
    const lOn = t < this.listenUntil;
    this.listen = rm
      ? 0
      : approach(this.listen, lOn ? 1 : 0, dt * (lOn ? 5 : 2.5));
    const m = this.m;
    let mo: MomentFrame | null = null;
    if (this.mom) {
      mo = MOMENTS[this.mom](t - this.t0, { H, R, y });
      if (!mo) this.mom = null;
    }
    mo = this.scene ?? mo ?? {};
    if (t > this.sacAt) {
      this.sac =
        random() < 0.3
          ? [0, 0]
          : [(random() * 2 - 1) * 0.6, (random() * 2 - 1) * 0.4];
      this.sacAt = t + 1.1 + random() * 2.2;
    }
    let gt = lerp2(this.sac, this.listenDir, this.listen);
    gt = lerp2(gt, [0, 0], this.rest);
    if (mo.gaze) gt = mo.gaze;
    if (rm) gt = [0, 0];
    const gr = rm ? 1 : 1 - Math.exp(-dt * 11);
    this.gaze = [
      this.gaze[0] + (gt[0] - this.gaze[0]) * gr,
      this.gaze[1] + (gt[1] - this.gaze[1]) * gr,
    ];
    if (!rm) {
      this.breathPh += (dt * TAU) / (tem("bp", m) * (1 + this.rest));
      this.spinA += dt * 0.05 * (1 - 0.6 * this.rest);
    }
    const live = 1 - clamp(mo.still ?? 0);
    const b =
      1 +
      (rm ? 0 : tem("ba", m) * (1 + 0.6 * this.rest)) *
        Math.sin(this.breathPh) *
        live;
    let sx = b,
      sy = b,
      dx = 0,
      dy = 0,
      rot = 0;
    if (!rm) {
      // Descanso is still: resting fades out the sway and the little hops.
      const calm = (1 - this.rest) * live;
      rot += ((tem("sw", m) * calm * PI) / 180) * Math.sin((ta * TAU) / 3.4);
      const hp = tem("hop", m) * calm;
      if (hp > 0.002 && !this.mom) {
        const h = hop((ta % 3.2) - 2.0, hp);
        sx *= h.sx;
        sy *= h.sy;
        dy += h.dy * R;
      }
      const sh = tem("sh", m) * live;
      if (sh > 0) {
        dx += sh * K * Math.sin(ta * 43) * Math.sin(ta * 19.3);
        dy += sh * K * 0.5 * Math.sin(ta * 37);
      }
    }
    dy += (tem("sink", m) * R + 0.05 * this.rest * R) * live;
    sx *= 1 + 0.025 * this.listen;
    sy *= 1 - 0.04 * this.listen;
    dy += 0.03 * R * this.listen;
    rot += this.listenDir[0] * 0.09 * this.listen;
    const wt = t - this.wobT;
    if (!rm && wt >= 0 && wt < 1.3) {
      const w = 0.11 * damp(wt, 3.1, 4.2);
      sx *= 1 + w;
      sy *= 1 - w;
    }
    if (mo.sx) sx *= mo.sx;
    if (mo.sy) sy *= mo.sy;
    if (mo.dy) dy += mo.dy * R;
    if (mo.dyPx) dy += mo.dyPx;
    dy += ((b - sy) / b) * R * 0.85; // squash rests on the floor
    let open = 1;
    if (this.eyes && !rm) {
      if (t > this.blinkAt) {
        this.blinkT = t;
        this.blinkAt = t + 2.4 + random() * 3.8;
      }
      const bt = t - this.blinkT;
      if (bt < 0.16) open = 1 - Math.sin((PI * bt) / 0.16) * 0.95;
    }
    const eyes = this.eyes
      ? {
          open,
          gx: this.gaze[0],
          gy: this.gaze[1],
          winkL: mo.winkL || 0,
          winkR: mo.winkR || 0,
          happy: Math.max(clamp((m - 5.5) / 0.5), mo.happy || 0),
          closed: Math.max(this.rest, mo.closed || 0),
          sad: clamp((3.6 - m) / 2.2) * 0.9,
        }
      : null;
    const rings =
      this.listen > 0.01
        ? [0, 0.5, 1].map((o) => ((ta + o) % 1.5) / 1.5)
        : null;
    drawOrb(ctx, {
      x: x + dx,
      y: y + dy,
      R,
      m,
      t: ta,
      dpr,
      gaze: this.gaze,
      sx,
      sy,
      rot,
      unfold: mo.unfold,
      core: mo.core ?? 1,
      glow: mo.glow ?? 1,
      eyes,
      particles: this.particles * (1 - 0.85 * this.rest) * (mo.particles ?? 1),
      dim: 1 - 0.3 * this.rest,
      rings,
      ringA: this.listen,
      burst: mo.burst,
      spin: this.spinA + (mo.spin || 0),
      faceScale: this.faceScale,
    });
  }
}

// One animation frame serves every mascot on screen; it stops with the tab hidden.
const subscribers = new Set<(t: number, dt: number) => void>();
let raf = 0,
  last = 0;
function frame(ms: number) {
  raf = 0;
  const t = ms / 1000,
    dt = Math.min(0.05, Math.max(0, t - last));
  last = t;
  subscribers.forEach((draw) => draw(t, dt));
  schedule();
}
function schedule() {
  if (!raf && subscribers.size && !document.hidden)
    raf = requestAnimationFrame(frame);
}
function wake() {
  last = now();
  schedule();
}
export function subscribe(draw: (t: number, dt: number) => void) {
  if (!subscribers.size) document.addEventListener("visibilitychange", wake);
  subscribers.add(draw);
  wake();
  return () => {
    subscribers.delete(draw);
    if (subscribers.size) return;
    document.removeEventListener("visibilitychange", wake);
    cancelAnimationFrame(raf);
    raf = 0;
  };
}
