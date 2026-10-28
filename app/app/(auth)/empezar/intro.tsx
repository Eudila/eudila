// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { Fragment, useEffect, useRef } from "react";
import {
  Critter,
  ambientAt,
  backOut,
  hop,
  orbAt,
  outCubic,
  rgba,
  subscribe,
  type MomentFrame,
} from "@eudila/mood/critter.ts";
import { brandEase } from "@eudila/mood/motion.ts";
import { moods } from "@eudila/mood/moods.js";

/**
 * Apertura de bienvenida: one clock, ~12.7 s, skippable, once per session.
 * Spec and rules: docs/design/mascota/README.md («Apertura»).
 *
 * The header logo wakes up, pulls its wordmark in and folds into its core,
 * which falls into the stage as a spark with the spectrum's trail. It blooms
 * as Neutral and swings out to both sides of the scale, one brand beat
 * (600 ms) per state, the same time each. The seven then stand side by side,
 * same size, each on its own clock, over a mirror; they fuse into one core,
 * which blooms as the brand's coral, writes `eudila` and lands back in the
 * header, where the page opens. It never reads the pointer.
 */
const COOKIE = "eudila-intro"; // also read by ../bienvenida/page.tsx
const EASE = "cubic-bezier(.32,.72,0,1)";
const BEAT = 0.6;
// Out from Neutral to both sides, so neither end of the scale is the goal.
const SEQ = [4, 3, 5, 2, 6, 1, 7];
const S = {
  dim: 0.65,
  look: 0.15,
  retract: 0.3,
  fold: 0.52,
  launch: 0.86,
  impact: 2.2,
  swing: 2.8,
  gather: 2.8 + 6 * BEAT,
  converge: 7.95,
  fuse: 8.35,
  bloom: 8.6,
  hop: 8.95,
  lock: 9.4,
  line: 10.0,
  hand: 10.6,
  form: 10.95,
  land: 11.45,
};
const TAU = Math.PI * 2,
  PI = Math.PI;
const LAYERS = [0, 1, 2, 3, 4];
const WHITE = [255, 255, 255];
// Dark "Lisa" stage (packages/brand/tokens.css before 27/10/2026).
const LISA = [26, 22, 38],
  LISA_FLOOR = [16, 13, 24],
  LISA_BOTTOM = [7, 20, 22];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, start: number, length: number) =>
  clamp((t - start) / length);
const smooth = (t: number) => t * t * (3 - 2 * t);
const inCubic = (t: number) => t * t * t;
const damp = (t: number, f: number, d: number) =>
  t < 0 ? 0 : Math.exp(-d * t) * Math.sin(TAU * f * t);
const mix = (a: number[], b: number[], t: number) =>
  a.map((v, i) => v + (b[i] - v) * t);
const hex = (value: string, fallback: string) => {
  const v = /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16));
};

/** Continuous mood: each beat morphs to the next state with the brand curve. */
function moodAt(t: number) {
  const i = Math.floor((t - S.swing) / BEAT);
  if (i < 0) return SEQ[0];
  if (i > 5) return SEQ[6];
  return lerp(SEQ[i], SEQ[i + 1], brandEase((t - S.swing) / BEAT - i));
}

// Dust in depth: farther grains move and scale less with the camera.
const DUST = Array.from({ length: 120 }, (_, i) => ({
  x: (((i * 0.618034) % 1) * 2 - 1) * 1.7,
  y: (((i * 0.414214 + 0.3) % 1) * 2 - 1) * 1.7,
  d: 1.3 + ((i * 7) % 10) * 0.3,
  s: 0.6 + (i % 5) * 0.3,
  ph: (i * 2.399963) % TAU,
  f: 0.6 + ((i * 13) % 7) * 0.2,
}));

const TAGLINE = "Un espejo tranquilo para cada estado de ánimo.".split(" ");

export default function Intro({
  onDone,
}: {
  onDone: (played: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const finish = useRef<(skipped: boolean) => void>(null);

  useEffect(() => {
    const el = root.current!,
      node = canvas.current!,
      ctx = node.getContext("2d"),
      page = el.nextElementSibling,
      media = matchMedia("(prefers-reduced-motion: reduce)");
    // Movimiento reducido omits it, like every mascot moment (README rule 5).
    if (
      !ctx ||
      media.matches ||
      new RegExp(`(^|; )${COOKIE}=`).test(document.cookie)
    ) {
      onDone(false);
      return;
    }
    const g = ctx,
      stageEl = stage.current!,
      trackEl = track.current!,
      thumbEl = thumb.current!,
      wordEl = word.current!,
      lineEl = line.current!,
      [labelA, labelB] = [...labels.current!.children] as HTMLElement[];
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) =>
      hex(css.getPropertyValue(name).trim(), fallback);
    // The stage is the dark "Lisa" canvas with the lights down, also over the
    // light page (27/10/2026): sparks, rings and cores are white light. The
    // page's own light comes back as the logo lands in the header.
    const top = mix(LISA, [0, 0, 0], 0.45),
      bottom = mix(LISA_FLOOR, [0, 0, 0], 0.45),
      graphite = token("--color-graphite", "#1d1d1f"),
      floor = LISA_BOTTOM;
    const ACCENT = moods.map((m) => hex(m.accent, "#ffffff"));
    const accentAt = (m: number) => {
      const v = clamp(m, 1, 7) - 1,
        i = Math.min(5, Math.floor(v));
      return mix(ACCENT[i], ACCENT[i + 1], v - i);
    };

    // The header logo is the hero; the other six get their own clocks.
    const hero = new Critter({
      mood: 7,
      mRate: 0,
      faceScale: 1.75,
      particles: 0,
    });
    hero.spinA = 0; // the static logo SVG is drawn at spin 0
    const crew = [1, 2, 3, 4, 5, 6].map(
      (k) => new Critter({ mood: k, mRate: 0, faceScale: 1.75 }),
    );
    const seven = [...crew, hero];
    const trails = seven.map(() => [] as number[][]);
    const mirror = document.createElement("canvas"),
      mctx = mirror.getContext("2d");
    const prev = new Float32Array(DUST.length * 2);

    let w = 0,
      h = 0,
      dpr = 1,
      cx = 0,
      oy = 0,
      R0 = 0,
      Lx = 0,
      ax = 0,
      ay = 0,
      th0 = 0,
      look = [0, 0],
      // Header lockup: logo center/radius and wordmark box.
      hx = 0,
      hy = 0,
      hR = 0,
      wx = 0,
      wy = 0,
      ww = 0,
      wh = 0,
      mx = 0,
      my = 0,
      k = 1,
      trackX = 0,
      trackW = 0,
      trackY = 0,
      Rrow = 0,
      prevOk = false,
      T = 0,
      done = false,
      cancelled = false,
      reduced = false,
      revealed = false,
      spinSet = false,
      lineIn = false,
      lineOut = false,
      shown = -1,
      flip = 0,
      stop: (() => void) | null = null;

    function measure() {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      // Up to 2x, and about 2.6 Mpx of backing store on large screens.
      dpr = Math.min(2, devicePixelRatio || 1, Math.sqrt(2.6e6 / (w * h)));
      node.width = Math.round(w * dpr);
      node.height = Math.round(h * dpr);
      cx = w / 2;
      oy = h * 0.4;
      R0 = Math.min(w * 0.27, h * 0.19, 150);
      Lx = Math.min(w * 0.14, 90);
      ax = w * 0.36;
      ay = Math.min(h * 0.3, w * 0.62);
      stageEl.style.top = `${oy + R0 * 1.32}px`;
      const tr = trackEl.getBoundingClientRect();
      trackX = tr.left;
      trackW = tr.width;
      trackY = tr.top + tr.height / 2;
      Rrow = Math.min((trackW / 6) * 0.38, 44);
      // layout.tsx: the 72px logo box frames the orb at 0.34 of its width.
      const logo = document.querySelector(".app-logo")?.getBoundingClientRect(),
        text = document
          .querySelector(".app-logo + span")
          ?.getBoundingClientRect();
      hx = logo ? logo.left + logo.width / 2 : 40;
      hy = logo ? logo.top + logo.height / 2 : 48;
      hR = logo ? logo.width * 0.34 : 24;
      wx = text?.left ?? hx + hR + 8;
      wy = text?.top ?? hy - 18;
      ww = text?.width ?? wordEl.offsetWidth;
      wh = text?.height ?? wordEl.offsetHeight;
      const left = hx - hR,
        right = wx + ww;
      mx = (left + right) / 2;
      my = hy;
      k = clamp(Math.min(w - 48, 560) / (right - left), 0.6, 2.6);
      lineEl.style.top = `${oy + Math.max(hR, wh / 2) * k + 20}px`;
      th0 = Math.atan2((hy - oy) / ay, (hx - cx) / ax);
      const d = Math.hypot(cx - hx, oy - hy) || 1;
      look = [((cx - hx) / d) * 0.8, ((oy - hy) / d) * 0.6];
      prevOk = false;
      mirror.width = Math.max(1, Math.round(w * dpr));
      mirror.height = Math.max(1, Math.round(Rrow * 2.6 * dpr));
    }

    /** The lockup from the stage (e = 0, k times the header) to the header (1). */
    function lockup(e: number) {
      const s = lerp(k, 1, e),
        ox = lerp(cx, mx, e),
        oyy = lerp(oy, my, e);
      return {
        s,
        x: ox + (hx - mx) * s,
        y: oyy + (hy - my) * s,
        R: hR * s,
        wx: ox + (wx - mx) * s,
        wy: oyy + (wy - my) * s,
      };
    }

    /** Wordmark slid by `off` (unscaled px) and clipped where the orb's edge is. */
    function placeWord(
      x: number,
      y: number,
      s: number,
      off: number,
      edge: number,
      alpha: number,
    ) {
      const left = x + off * s,
        c = Math.max(0, (edge - left) / s);
      wordEl.style.transform = `translate(${left}px, ${y}px) scale(${s})`;
      wordEl.style.clipPath = c
        ? `polygon(${c}px -50%, 150% -50%, 150% 150%, ${c}px 150%)`
        : "none";
      wordEl.style.opacity = String(alpha);
    }

    function sparkAt(s: number) {
      // A spiral that tightens into the center, faster as it closes.
      const u = clamp(s / (S.impact - S.launch)),
        e = u ** 1.6,
        th = th0 - TAU * 1.15 * e,
        r = (1 - e) ** 0.9,
        b = outCubic(clamp(u / 0.2));
      return [
        lerp(hx, cx + ax * r * Math.cos(th), b),
        lerp(hy, oy + ay * r * Math.sin(th), b),
      ];
    }

    function wash(stops: number[][], alpha: number) {
      const grad = g.createLinearGradient(0, 0, 0, h);
      stops.forEach((c, i) =>
        grad.addColorStop(stops.length === 3 ? [0, 0.56, 1][i] : i, rgba(c, 1)),
      );
      g.globalAlpha = alpha;
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    }

    function glow(x: number, y: number, r: number, c: number[], a: number) {
      if (a < 0.005) return;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, rgba(c, a));
      grad.addColorStop(0.3, rgba(c, a * 0.35));
      grad.addColorStop(1, rgba(c, 0));
      g.globalAlpha = 1;
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    function ring(x: number, y: number, r: number, c: number[], a: number) {
      if (a < 0.005) return;
      g.globalAlpha = a;
      g.strokeStyle = rgba(c, 1);
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
    }

    function dot(x: number, y: number, r: number, c: number[], a: number) {
      g.globalAlpha = a;
      g.fillStyle = rgba(c, 1);
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }

    function dust(
      z: number,
      camX: number,
      light: number[],
      on: number,
      col: number[],
      vis: number,
      t: number,
    ) {
      if (vis < 0.01) {
        prevOk = false;
        return;
      }
      const span = Math.max(w, h) * 0.5,
        sig = (R0 * 3.4) ** 2;
      g.fillStyle = g.strokeStyle = rgba(mix(WHITE, col, 0.55), 1);
      g.lineCap = "round";
      for (let i = 0; i < DUST.length; i++) {
        const p = DUST[i],
          zf = 1 + (z - 1) / p.d,
          x = cx + (p.x * span - camX / p.d) * zf,
          y = oy + p.y * span * zf,
          qx = prev[2 * i],
          qy = prev[2 * i + 1];
        prev[2 * i] = x;
        prev[2 * i + 1] = y;
        const dx = x - light[0],
          dy = y - light[1],
          a =
            vis *
            (0.07 + 0.6 * on * Math.exp(-(dx * dx + dy * dy) / sig)) *
            (0.55 + 0.45 * Math.sin((t * p.f * TAU) / 3 + p.ph));
        if (a < 0.01 || x < -9 || x > w + 9 || y < -9 || y > h + 9) continue;
        const r = (p.s / p.d) * 1.6;
        g.globalAlpha = a;
        if (prevOk && Math.hypot(x - qx, y - qy) > 1) {
          // Camera moves streak the grains, like motion blur.
          g.lineWidth = r * 2;
          g.beginPath();
          g.moveTo(qx, qy);
          g.lineTo(x, y);
          g.stroke();
        } else {
          g.beginPath();
          g.arc(x, y, r, 0, TAU);
          g.fill();
        }
      }
      prevOk = true;
    }

    function swapLabel(text: string, dir: number) {
      const out = flip ? labelB : labelA,
        next = flip ? labelA : labelB;
      flip = 1 - flip;
      out.getAnimations().forEach((a) => a.cancel());
      out.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: `translateX(${-dir * 0.5}em)` },
        ],
        { duration: 160, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" },
      );
      next.getAnimations().forEach((a) => a.cancel());
      next.textContent = text;
      next.animate(
        [
          { opacity: 0, transform: `translateX(${dir * 0.7}em)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: 440, delay: 150, easing: EASE, fill: "both" },
      );
    }

    function reveal(delay: number) {
      if (revealed) return;
      revealed = true;
      el.dataset.reveal = "";
      if (!page || reduced) return;
      [...page.children].forEach((child, i) =>
        child.animate(
          [
            { opacity: 0, transform: "translateY(16px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 560,
            delay: delay + i * 70,
            easing: EASE,
            fill: "backwards",
          },
        ),
      );
    }

    function draw(t: number, dt: number) {
      if (w < 2 || h < 2 || done) return;
      if (t >= S.land) return finish.current?.(false);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
      g.clearRect(0, 0, w, h);
      // Same frame as the canvas logo, so the swap is invisible.
      if (!("hold" in el.dataset)) el.dataset.hold = "";

      const m = moodAt(t),
        handE = brandEase(seg(t, S.hand, S.land - S.hand)),
        lockE = brandEase(seg(t, S.lock, 0.8)),
        swingX = cx + ((m - 4) / 3) * Lx;

      // Lights down; the light page comes back as the hand lands. (Over the
      // dark canvas the bloom lifted them to 0.6; on light that reads gray.)
      const D = smooth(seg(t, 0, S.dim)) * (1 - handE);
      if (D > 0.002) wash([top, bottom], D);
      // Ink over the stage: light once the lights are down, the page's dark
      // ink again as they come back (labels, tagline, wordmark, Ayuda).
      document.documentElement.style.setProperty(
        "--intro-dim",
        String(smooth(seg(D, 0.2, 0.25))),
      );
      // The state's ambient, as on the slider screen.
      const F =
        smooth(seg(t, S.impact, 0.6)) * (1 - smooth(seg(t, S.gather, 0.7)));
      const amb = ambientAt(m);
      if (F > 0.002) wash([amb, mix(amb, graphite, 0.28), floor], F);

      // Camera: a slow push during the spark, a kick on each impact, a pull
      // back to see the seven, a fast push as they fuse.
      let z = 1,
        camX = 0;
      const spark =
        t >= S.launch && t < S.impact ? sparkAt(t - S.launch) : null;
      if (t < S.impact) {
        z = 1 + 0.1 * smooth(seg(t, S.launch, S.impact - S.launch));
        camX = spark ? (spark[0] - cx) * 0.12 : 0;
      } else if (t < S.gather) {
        z =
          lerp(1.1, 1, brandEase(seg(t, S.impact, 0.9))) +
          0.06 * damp(t - S.impact, 1.4, 5);
        camX = (swingX - cx) * 0.5;
      } else if (t < S.converge) {
        const e = brandEase(seg(t, S.gather, 0.9));
        z = lerp(1, 0.74, e);
        camX = lerp(Lx * 0.5, 0, e);
      } else if (t < S.fuse) {
        z = lerp(0.74, 1.16, inCubic(seg(t, S.converge, S.fuse - S.converge)));
      } else {
        z =
          lerp(1.16, 1, brandEase(seg(t, S.fuse, 1))) +
          0.05 * damp(t - S.fuse, 1.4, 5);
      }

      // Where the light is this frame: the logo, the spark or the orb.
      let light = [cx, oy],
        lightOn = 0.7,
        lightCol = WHITE;
      if (t < S.launch) light = [hx, hy];
      else if (spark) [light, lightOn] = [spark, 1];
      else if (t < S.gather)
        [light, lightOn, lightCol] = [[swingX, oy], 1, orbAt(m)];
      else if (t >= S.bloom) {
        const L = lockup(handE);
        light = [lerp(cx, L.x, lockE), lerp(oy, L.y, lockE)];
        lightOn = 1 - handE;
        lightCol = orbAt(7);
      }

      g.globalCompositeOperation = "lighter";
      dust(
        z,
        camX,
        light,
        lightOn,
        lightCol,
        brandEase(seg(t, 0.2, 0.6)) * (1 - handE),
        t,
      );

      // Spark trail: a ribbon of the seven colors, coral at the head as it
      // leaves the logo. Opaque segments pre-mixed with the stage, so the
      // joints never double up into beads.
      const trailA = 1 - seg(t, S.impact, 0.45);
      if (t > S.launch && trailA > 0) {
        g.globalCompositeOperation = "source-over";
        g.globalAlpha = 1;
        g.lineCap = "round";
        let last: number[] | null = null;
        for (let j = 64; j >= 0; j--) {
          const s = t - S.launch - j * 0.008;
          if (s < 0) continue;
          const p = sparkAt(s),
            f = 1 - j / 65;
          if (last) {
            g.strokeStyle = rgba(
              mix(bottom, orbAt(1 + 6 * f), f * 0.9 * trailA),
              1,
            );
            g.lineWidth = 0.6 + R0 * 0.075 * f;
            g.beginPath();
            g.moveTo(last[0], last[1]);
            g.lineTo(p[0], p[1]);
            g.stroke();
          }
          last = p;
        }
        g.globalCompositeOperation = "lighter";
      }
      // Impact: white flash and ring as the spark lands.
      glow(
        cx,
        oy,
        R0 * 2,
        WHITE,
        0.55 * (1 - seg(t, S.impact, 0.35)) * +(t > S.impact),
      );
      g.lineWidth = 2;
      const ip = seg(t, S.impact, 0.9);
      if (t > S.impact)
        ring(cx, oy, R0 * (0.2 + 2.4 * outCubic(ip)), WHITE, (1 - ip) * 0.7);
      // A thin ring in the new state's color on every beat.
      g.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const p = seg(t, S.swing + i * BEAT + 0.08, 0.9);
        if (p > 0 && p < 1)
          ring(
            swingX,
            oy,
            R0 * (1.02 + 0.55 * outCubic(p)),
            orbAt(SEQ[i + 1]),
            (1 - p) * 0.45,
          );
      }
      // Fusion: one ring per state, all the same, then the white core alone.
      g.lineWidth = 2.5;
      for (let j = 0; j < 7; j++) {
        const p = seg(t, S.fuse + j * 0.035, 1);
        if (p > 0 && p < 1)
          ring(
            cx,
            oy,
            R0 * (0.15 + 2.6 * outCubic(p)),
            orbAt(j + 1),
            (1 - p) * 0.6,
          );
      }
      glow(
        cx,
        oy,
        R0 * 2.2,
        WHITE,
        0.7 * (1 - seg(t, S.fuse, 0.4)) * +(t > S.fuse),
      );
      g.globalCompositeOperation = "source-over";

      if (t < S.launch) {
        // Act I · the logo wakes up, looks at the stage and folds into its core.
        const s1 = Math.sin((seg(t, S.fold, 0.14) * PI) / 2),
          s2 = seg(t, S.fold + 0.14, 0.2);
        hero.scene = {
          still: 1,
          gaze: t > S.look ? look : [0, 0],
          sx: 1 + 0.08 * s1 * (1 - s2) - 0.06 * s2,
          sy: 1 - 0.12 * s1 * (1 - s2) + 0.12 * s2,
          unfold: LAYERS.map(
            (i) => 1 - inCubic(seg(t, S.fold + 0.14 + i * 0.025, 0.18)),
          ),
          core: lerp(1, 0.3, seg(t, S.fold + 0.2, 0.14)),
        };
        hero.render(g, hx, hy, hR, h, t, dt, dpr);
        placeWord(
          wx,
          wy,
          1,
          (hx + hR * 0.95 - 2 - wx - ww) * inCubic(seg(t, S.retract, 0.32)),
          hx + hR * 0.95,
          1,
        );
      } else if (spark) {
        // Act II · the spark.
        wordEl.style.opacity = "0";
        glow(spark[0], spark[1], 26, WHITE, 0.9);
        dot(spark[0], spark[1], 3.2, WHITE, 1);
      } else if (t < S.gather) {
        // Act III · bloom as Neutral, then the pendulum.
        hero.mt = m;
        hero.faceScale = 1;
        hero.particles = 1;
        const core = Math.max(0, backOut(seg(t, S.impact, 0.3), 2.2));
        hero.scene = {
          core,
          glow: core * (1 + 0.9 * (1 - seg(t, S.impact, 0.5))),
          unfold: LAYERS.map((i) =>
            Math.max(
              0,
              backOut(seg(t, S.impact + 0.05 + (4 - i) * 0.07, 0.5), 1.9),
            ),
          ),
          particles: seg(t, S.impact + 0.4, 0.5),
        };
        g.globalCompositeOperation = "lighter";
        glow(swingX, oy, R0 * 2.3, orbAt(m), 0.2 * core);
        g.globalCompositeOperation = "source-over";
        hero.render(g, swingX, oy, R0, h, t, dt, dpr);
        if (t < S.impact + 0.12)
          dot(cx, oy, 3.2, WHITE, 1 - seg(t, S.impact, 0.12));
      } else if (t < S.fuse) {
        // Act IV · seven, side by side, over a mirror; then they fuse.
        drawSeven(t, dt);
      } else if (t < S.bloom) {
        // The core alone, one breath of silence.
        const p = Math.sin(PI * seg(t, S.fuse, S.bloom - S.fuse));
        glow(cx, oy, 30 + 10 * p, WHITE, 0.9);
        dot(cx, oy, 3 + 1.5 * p, WHITE, 1);
      } else {
        // Act V · eudila: coral of the brand, lockup, back to the header.
        if (!spinSet) {
          // Lands exactly on the logo SVG's spin (the engine adds 0.05 rad/s).
          spinSet = true;
          hero.spinA = -0.05 * (S.land - t);
        }
        hero.mt = 7;
        hero.particles = 0;
        hero.faceScale = lerp(1, 1.75, lockE);
        const L = lockup(handE),
          X = lerp(cx, L.x, lockE),
          Y = lerp(oy, L.y, lockE),
          R = lerp(R0 * 0.92, L.R, lockE),
          core = Math.max(0, backOut(seg(t, S.bloom, 0.28), 2.2)),
          j = hop(t - S.hop);
        hero.scene = {
          core,
          glow: core * (1 + 0.8 * (1 - seg(t, S.bloom, 0.6))),
          unfold: LAYERS.map((i) =>
            Math.max(
              0,
              backOut(seg(t, S.bloom + 0.06 + (4 - i) * 0.07, 0.5), 1.9),
            ),
          ),
          burst: t - S.bloom - 0.1,
          sx: j.sx,
          sy: j.sy,
          dy: j.dy,
          still: seg(t, S.lock, 0.6),
          gaze: t > S.lock ? [0, 0] : null,
        };
        g.globalCompositeOperation = "lighter";
        glow(X, Y, R * 2.3, orbAt(7), 0.2 * core * (1 - handE));
        g.globalCompositeOperation = "source-over";
        hero.render(g, X, Y, R, h, t, dt, dpr);
        if (t < S.bloom + 0.1) dot(cx, oy, 3, WHITE, 1 - seg(t, S.bloom, 0.1));
        if (t > S.lock + 0.1)
          placeWord(
            L.wx,
            L.wy,
            L.s,
            ((X + R * 0.95 - 2 - L.wx) / L.s - ww) *
              (1 - brandEase(seg(t, S.lock + 0.12, 0.78))),
            t < S.hand ? X + R * 0.95 : -Infinity,
            1,
          );
      }

      // DOM beats: state names and the slider under the orb.
      stageEl.style.opacity = String(
        smooth(seg(t, S.impact + 0.1, 0.4)) *
          (1 - smooth(seg(t, S.gather, 0.35))),
      );
      thumbEl.style.transform = `translateX(${((m - 1) / 6) * trackW}px)`;
      thumbEl.style.background = rgba(accentAt(m), 1);
      const idx =
        t < S.swing ? 0 : Math.min(6, Math.floor((t - S.swing) / BEAT) + 1);
      if (t > S.impact + 0.1 && t < S.gather && idx !== shown) {
        swapLabel(
          moods[SEQ[idx] - 1].label,
          idx ? Math.sign(SEQ[idx] - SEQ[idx - 1]) : 0,
        );
        shown = idx;
      }
      if (!lineIn && t > S.line) {
        lineIn = true;
        [...lineEl.children].forEach((span, i) =>
          span.animate(
            [
              { opacity: 0, transform: "translateY(.5em)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 520, delay: i * 45, easing: EASE, fill: "both" },
          ),
        );
      }
      if (!lineOut && t > S.hand) {
        lineOut = true;
        lineEl.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 260,
          easing: EASE,
          fill: "forwards",
        });
      }
      if (t > S.form) reveal(0);
    }

    function drawSeven(t: number, dt: number) {
      const ge = brandEase(seg(t, S.gather, 0.8)),
        ce = inCubic(seg(t, S.converge, S.fuse - S.converge)),
        floorY = oy + Rrow * 1.25,
        mirrorA =
          0.26 * seg(t, S.gather + 0.5, 0.4) * (1 - seg(t, S.converge, 0.15));
      hero.mt = 7;
      hero.faceScale = lerp(1, 1.75, ge);
      const poses: {
        c: Critter;
        x: number;
        y: number;
        r: number;
        k: number;
      }[] = [];
      seven.forEach((c, i) => {
        const kk = i + 1,
          slot = trackX + (i / 6) * trackW,
          scene: MomentFrame = {};
        let x = slot,
          y = oy,
          r = Rrow;
        if (kk === 7) {
          x = lerp(cx + Lx, slot, ge);
          r = lerp(R0, Rrow, ge);
        } else {
          // Each state rises from its place on the slider, nearest first.
          const st = S.gather + 0.12 + (6 - kk) * 0.06;
          if (t < st) return;
          y = lerp(trackY, oy, brandEase(seg(t, st, 0.65)));
          scene.core = Math.max(0, backOut(seg(t, st, 0.3), 2.2));
          scene.unfold = LAYERS.map((l) =>
            Math.max(0, backOut(seg(t, st + 0.12 + (4 - l) * 0.05, 0.45), 1.8)),
          );
        }
        if (t > S.converge) {
          x = lerp(slot, cx, ce);
          y = oy - Math.sin(PI * ce) * Math.abs(kk - 4) * Rrow * 0.7;
          scene.unfold = LAYERS.map(() => Math.max(0.03, 1 - ce * 1.05));
          scene.core = 1 - 0.5 * ce;
          trails[i].push([x, y]);
          if (trails[i].length > 14) trails[i].shift();
        }
        c.scene = scene;
        poses.push({ c, x, y, r, k: kk });
      });

      // "Un espejo tranquilo": a soft reflection under the row.
      if (mirrorA > 0.01 && mctx) {
        const band = mirror.height / dpr;
        mctx.setTransform(1, 0, 0, 1, 0, 0);
        mctx.globalCompositeOperation = "source-over";
        mctx.clearRect(0, 0, mirror.width, mirror.height);
        mctx.setTransform(dpr, 0, 0, -dpr, 0, floorY * dpr);
        for (const p of poses) p.c.render(mctx, p.x, p.y, p.r, h, t, 0, dpr);
        mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mctx.globalAlpha = 1;
        mctx.globalCompositeOperation = "destination-in";
        const fade = mctx.createLinearGradient(0, 0, 0, band);
        fade.addColorStop(0, "rgba(0,0,0,1)");
        fade.addColorStop(1, "rgba(0,0,0,0)");
        mctx.fillStyle = fade;
        mctx.fillRect(0, 0, w, band);
        g.globalAlpha = mirrorA;
        g.drawImage(mirror, 0, floorY, w, band);
        g.globalAlpha = mirrorA * 0.6;
        g.strokeStyle = "#fff";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(trackX - Rrow, floorY);
        g.lineTo(trackX + trackW + Rrow, floorY);
        g.stroke();
      }
      g.globalCompositeOperation = "lighter";
      poses.forEach((p) => {
        trails[p.k - 1].forEach(([x, y], j, all) =>
          dot(
            x,
            y,
            1 + p.r * 0.25 * (j / all.length),
            orbAt(p.k),
            (j / all.length) * 0.6,
          ),
        );
        glow(p.x, p.y, p.r * 2.3, orbAt(p.k), 0.18);
      });
      g.globalCompositeOperation = "source-over";
      for (const p of poses) p.c.render(g, p.x, p.y, p.r, h, t, dt, dpr);
    }

    finish.current = (skipped) => {
      if (done) return;
      done = true;
      stop?.();
      stop = null;
      // Marked when it ends: SessionScope remounts the page once the session
      // resolves, and a mark at the start would make that remount skip it.
      document.cookie = `${COOKIE}=1; path=/; samesite=lax`;
      document.documentElement.style.removeProperty("--intro-dim");
      delete el.dataset.hold;
      if (skipped && !reduced) {
        reveal(60);
        el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 300,
          easing: EASE,
          fill: "forwards",
        }).onfinish = () => onDone(true);
        return;
      }
      reveal(0);
      el.style.visibility = "hidden";
      onDone(true);
    };

    function start() {
      if (cancelled) return;
      el.dataset.playing = "";
      measure();
      stop = subscribe((_, dt) => {
        // Own clock: pauses with the tab and never skips a beat.
        const pace = T >= S.bloom ? 0.7 : 1;
        T += dt * pace;
        draw(T, dt * pace);
      });
    }

    const resize = new ResizeObserver(() => {
      if (!el.dataset.playing) return;
      measure();
    });
    resize.observe(el);
    const onMotion = () => {
      if (!media.matches) return;
      // Turned on mid-play: cut to the page at once.
      reduced = true;
      finish.current?.(true);
    };
    media.addEventListener("change", onMotion);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish.current?.(true);
    };
    addEventListener("keydown", onKey);
    // Start once the route's entrance (which moves this fixed layer) and the
    // wordmark's font are ready, so the first frame matches the header.
    const entrance = el.closest(".route-enter")?.getAnimations() ?? [];
    Promise.all([
      document.fonts?.ready,
      ...entrance.map((a) => a.finished.catch(() => {})),
    ]).then(start, start);

    return () => {
      cancelled = done = true;
      stop?.();
      document.documentElement.style.removeProperty("--intro-dim");
      resize.disconnect();
      media.removeEventListener("change", onMotion);
      removeEventListener("keydown", onKey);
    };
    // The opener runs once; onDone is stable enough for a single call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={root} className="intro">
      <noscript>
        <style>{".intro{display:none}"}</style>
      </noscript>
      <canvas ref={canvas} aria-hidden="true" />
      <div ref={stage} className="intro-stage" aria-hidden="true">
        <div ref={labels} className="intro-label font-display font-bold">
          <p />
          <p />
          {/* Reserves the longest name, so the slider never jumps. */}
          <p className="invisible">Algo desagradable</p>
        </div>
        <div ref={track} className="intro-track">
          <span ref={thumb} className="intro-thumb" />
        </div>
      </div>
      <p
        ref={word}
        aria-hidden="true"
        className="intro-word font-display text-wordmark leading-wordmark font-bold tracking-wordmark"
      >
        eudila
      </p>
      <p ref={line} aria-hidden="true" className="intro-line text-muted">
        {TAGLINE.map((part, i) => (
          <Fragment key={i}>
            <span>{part}</span>{" "}
          </Fragment>
        ))}
      </p>
      <button
        type="button"
        className="intro-skip action action-text"
        onClick={() => finish.current?.(true)}
      >
        Saltar<span className="sr-only"> la presentación</span>
      </button>
    </div>
  );
}
