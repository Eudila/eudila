// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useEffect, useRef } from "react";
import {
  Critter,
  ambientAt,
  backOut,
  hop,
  now,
  orbAt,
  outCubic,
  rgba,
  subscribe,
  type MomentFrame,
} from "../mood/critter";
import { brandEase } from "../mood/motion";
import { moods } from "../../prototype/moods.js";

/**
 * Onboarding opener, ~11 s on one clock: a spark opens into the orb, the orb
 * crosses the seven states with equal weight (the slider, told in light), lands
 * on the brand's coral, and the wordmark appears. Decorative and skippable; it
 * never reacts to the pointer (README rule 1) and reduced motion skips it.
 *
 * Beats (s): 0.5 spark · 1.1 layers unfold · 2.5→4.0 down to Muy desagradable ·
 * 4.3→7.1 up to Muy agradable · 7.0 landing · 7.8 orb rises · 8.2 wordmark ·
 * 9.4 tagline + wink · 11.4 fade out.
 */
const END = 11.4;
const SKIP_KEY = "eudila-intro";
const EASE = "cubic-bezier(.32,.72,0,1)";
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Continuous mood over time; each state gets the same share of the climb. */
function moodAt(t: number) {
  if (t < 2.5) return 4;
  if (t < 4.0) return lerp(4, 1, smooth((t - 2.5) / 1.5));
  if (t < 4.3) return 1;
  if (t < 7.1) return lerp(1, 7, smooth((t - 4.3) / 2.8));
  return 7;
}

const DUST = Array.from({ length: 70 }, (_, i) => ({
  a: i * 2.399963,
  o: (i * 0.618034) % 1,
  v: 0.05 + ((i * 7) % 11) * 0.012,
  s: 0.8 + (i % 4) * 0.55,
}));

function seen(mark = false) {
  try {
    if (mark) sessionStorage.setItem(SKIP_KEY, "1");
    return !!sessionStorage.getItem(SKIP_KEY);
  } catch {
    return false;
  }
}

export default function Intro({
  onDone,
}: {
  onDone: (played: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<HTMLParagraphElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const finish = useRef<(played: boolean) => void>(null);

  useEffect(() => {
    if (seen() || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone(false);
      return;
    }
    const node = canvas.current!,
      ctx = node.getContext("2d");
    if (!ctx) {
      onDone(false);
      return;
    }
    skip.current?.focus();
    const css = getComputedStyle(document.documentElement),
      top = css.getPropertyValue("--color-canvas").trim() || "#1a1626",
      floor = css.getPropertyValue("--color-canvas-floor").trim() || "#100d18";
    const c = new Critter({ mood: 4, mRate: 0 });
    const t0 = now();
    let w = 0,
      h = 0,
      dpr = 1,
      lastM = 4,
      lastLabel = -1,
      stage = 0,
      done = false,
      stop: (() => void) | null = null;
    const rings: { t: number; col: number[]; big: boolean }[] = [];
    const letters = [...(word.current?.children ?? [])] as HTMLElement[];

    const rise = (el: Element | null | undefined, delay: number, ms = 700) =>
      el?.animate(
        [
          { opacity: 0, transform: "translateY(.6em)", filter: "blur(8px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" },
        ],
        { duration: ms, delay, easing: EASE, fill: "both" },
      );

    function end(played: boolean) {
      if (done) return;
      done = true;
      stop?.();
      seen(true);
      const fade = root.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: played ? 600 : 250,
        easing: EASE,
        fill: "forwards",
      });
      if (fade) fade.onfinish = () => onDone(true);
      else onDone(true);
    }
    finish.current = end;

    function draw(ms: number, dt: number) {
      if (w < 2 || h < 2 || done) return;
      const t = ms - t0;
      if (t > END) return end(true);
      const m = moodAt(t),
        orb = orbAt(m),
        amb = ambientAt(m);
      // Act IV: the orb rises and shrinks to make room for the wordmark.
      const rise4 = brandEase(clamp((t - 7.8) / 1.1));
      const side = Math.min(w, h, 720);
      const R = side * lerp(0.27, 0.17, rise4);
      const cx = w / 2,
        cy = h * lerp(0.46, 0.33, rise4);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.globalAlpha = 1;
      const bg = ctx!.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, top);
      bg.addColorStop(1, floor);
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // The state's ambient floods the room from the orb, like the mood screen.
      const flood = smooth(clamp((t - 2.2) / 0.8)) * (1 - 0.35 * rise4);
      if (flood > 0) {
        const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
        g.addColorStop(0, rgba(amb, 0.9 * flood));
        g.addColorStop(0.55, rgba(amb, 0.32 * flood));
        g.addColorStop(1, rgba(amb, 0));
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, w, h);
      }

      ctx!.globalCompositeOperation = "lighter";
      const halo = ctx!.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.4);
      const ha = 0.2 * smooth(clamp((t - 0.6) / 1));
      halo.addColorStop(0, rgba(orb, ha));
      halo.addColorStop(1, rgba(orb, 0));
      ctx!.fillStyle = halo;
      ctx!.fillRect(0, 0, w, h);

      // Stardust drifting out of the orb while it crosses the states.
      const dust =
        smooth(clamp((t - 2.5) / 0.8)) * (1 - smooth(clamp((t - 7.6) / 1.4)));
      if (dust > 0.01)
        for (const p of DUST) {
          const f = (p.o + t * p.v) % 1,
            r = R * (1.15 + f * 2.6),
            a = Math.sin(Math.PI * f) * dust * 0.8;
          ctx!.globalAlpha = a;
          ctx!.fillStyle = p.s > 1.9 ? "#fff" : rgba(orb, 1);
          ctx!.beginPath();
          ctx!.arc(
            cx + Math.cos(p.a) * r,
            cy + Math.sin(p.a) * r,
            p.s,
            0,
            6.2832,
          );
          ctx!.fill();
        }
      ctx!.globalCompositeOperation = "source-over";

      // Beat rings: the opening spark, each state crossed, the landing.
      if (t > 0.5 && !rings.length)
        rings.push({ t: 0.5, col: [255, 255, 255], big: false });
      if (t > 2.5 && t < 7.2 && Math.round(m) !== Math.round(lastM))
        rings.push({ t, col: orbAt(Math.round(m)), big: false });
      if (t > 7.0 && !rings.some((r) => r.big))
        rings.push({ t: 7.0, col: orbAt(7), big: true });
      lastM = m;
      ctx!.lineWidth = 2;
      for (const r of rings) {
        const p = (t - r.t) / (r.big ? 1.6 : 1.1);
        if (p < 0 || p > 1) continue;
        ctx!.globalAlpha = (1 - p) * (r.big ? 0.8 : 0.5);
        ctx!.strokeStyle = rgba(r.col, 1);
        ctx!.beginPath();
        ctx!.arc(
          cx,
          cy,
          R * (r.big ? 1.1 + 2.8 * outCubic(p) : 1.05 + 1.5 * outCubic(p)),
          0,
          6.2832,
        );
        ctx!.stroke();
      }

      // The orb, scripted through the engine so it keeps its own eyes and clock.
      const core = Math.max(0, backOut(clamp((t - 0.5) / 0.35), 2.2)),
        j = hop(t - 6.8);
      const scene: MomentFrame = {
        core,
        glow: core * (1 + 0.8 * Math.max(0, 1 - Math.abs(t - 0.85) * 3)),
        unfold: [0, 1, 2, 3, 4].map((i) =>
          Math.max(0, backOut(clamp((t - 1.1 - (4 - i) * 0.09) / 0.55), 1.9)),
        ),
        particles: clamp((t - 3) / 0.8),
        burst: t - 7.0,
        sx: j.sx,
        sy: j.sy,
        dy: j.dy,
        winkR: t > 9.4 && t < 9.7 ? Math.sin((Math.PI * (t - 9.4)) / 0.3) : 0,
      };
      c.scene = scene;
      c.mt = m;
      ctx!.globalAlpha = 1;
      c.render(ctx!, cx, cy, R, h, t, dt, dpr);

      // The seven states as the slider's scale, with a thumb that follows m.
      const row =
        smooth(clamp((t - 2.6) / 0.6)) * (1 - smooth(clamp((t - 7.4) / 0.5)));
      if (row > 0.01) {
        const span = Math.min(w * 0.72, 320),
          x0 = cx - span / 2,
          ry = h * 0.74;
        ctx!.globalAlpha = row * 0.25;
        ctx!.strokeStyle = "#fff";
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(x0, ry);
        ctx!.lineTo(x0 + span, ry);
        ctx!.stroke();
        for (let i = 0; i < 7; i++) {
          const near = clamp(1 - Math.abs(m - (i + 1)));
          ctx!.globalAlpha = row * (0.4 + 0.6 * near);
          ctx!.fillStyle = rgba(orbAt(i + 1), 1);
          ctx!.beginPath();
          ctx!.arc(x0 + (span * i) / 6, ry, 4 + 5 * near, 0, 6.2832);
          ctx!.fill();
        }
        const tx = x0 + (span * (m - 1)) / 6;
        const tg = ctx!.createRadialGradient(tx, ry, 0, tx, ry, 22);
        tg.addColorStop(0, "rgba(255,255,255,.9)");
        tg.addColorStop(0.3, rgba(orb, 0.5));
        tg.addColorStop(1, rgba(orb, 0));
        ctx!.globalAlpha = row;
        ctx!.fillStyle = tg;
        ctx!.fillRect(tx - 22, ry - 22, 44, 44);
        ctx!.fillStyle = "#fff";
        ctx!.beginPath();
        ctx!.arc(tx, ry, 5, 0, 6.2832);
        ctx!.fill();
      }

      // State names, one per crossing; DOM text so the font and rem stay the app's.
      if (state.current && t > 2.6 && t < 7.4) {
        const k = Math.round(m);
        if (k !== lastLabel) {
          lastLabel = k;
          state.current.textContent = moods[k - 1].label;
          state.current.animate(
            [
              {
                opacity: 0,
                transform: "translateY(.4em)",
                filter: "blur(6px)",
              },
              { opacity: 1, transform: "none", filter: "blur(0)" },
            ],
            { duration: 420, easing: EASE, fill: "both" },
          );
        }
      } else if (state.current && t >= 7.4 && lastLabel !== 0) {
        lastLabel = 0;
        state.current.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 300,
          fill: "forwards",
        });
      }

      // DOM beats fire once as the clock passes them.
      if (stage < 1 && t > 8.2) {
        stage = 1;
        letters.forEach((l, i) => rise(l, i * 80, 800));
      }
      if (stage < 2 && t > 9.4) {
        stage = 2;
        rise(line.current, 0, 900);
      }
    }

    function sync() {
      const r = node.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(2, devicePixelRatio || 1);
      node.width = Math.round(w * dpr);
      node.height = Math.round(h * dpr);
    }
    const resize = new ResizeObserver(sync);
    resize.observe(node);
    sync();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && end(true);
    addEventListener("keydown", onKey);
    stop = subscribe((ms, dt) => draw(ms, dt));
    return () => {
      done = true;
      stop?.();
      resize.disconnect();
      removeEventListener("keydown", onKey);
    };
    // The opener runs once; onDone is stable enough for a single call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      className="intro fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-label="Presentación de eudila"
    >
      <noscript>
        <style>{".intro{display:none}"}</style>
      </noscript>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 size-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center px-6 text-center"
      >
        <p
          ref={state}
          className="font-display text-state absolute font-bold text-balance"
          style={{ top: "79%", opacity: 0 }}
        />
        <div className="absolute w-full" style={{ top: "52%" }}>
          <p
            ref={word}
            className="font-display font-bold"
            style={{
              fontSize: "clamp(3.25rem, 17vw, 6rem)",
              letterSpacing: "var(--tracking-wordmark, -0.045em)",
              lineHeight: 1,
            }}
          >
            {[..."eudila"].map((l, i) => (
              <span key={i} className="inline-block" style={{ opacity: 0 }}>
                {l}
              </span>
            ))}
          </p>
          <p
            ref={line}
            className="text-muted mx-auto mt-5 max-w-copy text-body leading-body text-balance"
            style={{ opacity: 0 }}
          >
            Un espejo tranquilo para cada estado de ánimo.
          </p>
        </div>
      </div>
      <button
        ref={skip}
        type="button"
        className="action action-text absolute top-4 right-4"
        onClick={() => finish.current?.(true)}
      >
        Saltar
      </button>
    </div>
  );
}
