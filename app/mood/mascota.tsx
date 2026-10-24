// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
  type Ref,
} from "react";
import { Critter, now, subscribe, type Moment } from "./critter";

export type MascotaHandle = {
  play(moment: Moment): void;
  /** Escucha for the given seconds; called from slider input, never pointer moves. */
  listen(seconds: number): void;
};

/** Reads or marks a `session:key` / `local:key`; blocked storage plays every time. */
function seen(once: string, mark = false) {
  const [where, key] = once.split(/:(.*)/);
  try {
    const store = where === "local" ? localStorage : sessionStorage;
    if (mark) store.setItem(key, "1");
    return !!store.getItem(key);
  } catch {
    return false;
  }
}

const isNight = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};

/**
 * The eudila mascot on its own canvas and clock. Decorative: the state stays in
 * the surrounding text. `fallback` shows until the first frame (no JS, SSR).
 */
export default function Mascota({
  mood,
  eyes = true,
  logo = false,
  rest = false,
  moment,
  once,
  size = 0.34,
  y = 0.5,
  className = "",
  fallback,
  ref,
}: {
  mood: number;
  eyes?: boolean;
  logo?: boolean;
  /** Descanso; "night" rests only between 22 and 7 h local time. */
  rest?: boolean | "night";
  /** Moment played on mount, at most once per `once` key. */
  moment?: Moment;
  once?: `session:${string}` | `local:${string}`;
  /** Orb radius as a fraction of the smaller canvas side. */
  size?: number;
  /** Vertical center as a fraction of the canvas height. */
  y?: number;
  className?: string;
  fallback?: ReactNode;
  ref?: Ref<MascotaHandle>;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const critter = useRef<Critter>(null);
  const redraw = useRef<() => void>(null);
  const layout = useRef({ size, y });

  useImperativeHandle(ref, () => ({
    play: (moment) => critter.current?.play(moment, now()),
    listen: (seconds) => {
      if (critter.current) critter.current.listenUntil = now() + seconds;
    },
  }));

  useEffect(() => {
    const node = canvas.current!,
      ctx = node.getContext("2d");
    if (!ctx) return;
    const c = (critter.current = new Critter({
      mood,
      eyes,
      // The logo is brand identity: fixed state, bigger face and sparkles.
      ...(logo ? { mRate: 0, faceScale: 1.75, pScale: 2.4 } : {}),
    }));
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    c.reduced = media.matches;
    const first = !!moment && !(once && seen(once));
    if (first) c.play(moment, now());
    // Marked after mount, so a remount that discards this one still plays it.
    const mark = first && once ? setTimeout(() => seen(once, true)) : undefined;
    let w = 0,
      h = 0,
      dpr = 1,
      visible = true,
      stop: (() => void) | null = null;

    function draw(t: number, dt: number) {
      if (w < 2 || h < 2) return;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.globalAlpha = 1;
      ctx!.clearRect(0, 0, w, h);
      const { size, y } = layout.current;
      const R = logo ? w * 0.34 : Math.min(w, h) * size;
      c.render(ctx!, w / 2, h * y, R, h, t, dt, dpr);
      wrap.current?.setAttribute("data-live", "");
    }
    function sync() {
      c.reduced = media.matches;
      const run = visible && !c.reduced;
      if (run && !stop) stop = subscribe(draw);
      if (!run && stop) {
        stop();
        stop = null;
      }
      // Reduced motion: one still frame, redrawn only when something changes.
      if (!run) draw(now(), 0);
    }
    redraw.current = () => {
      if (!stop) draw(now(), 0);
    };

    const resize = new ResizeObserver(([entry]) => {
      ({ width: w, height: h } = entry.contentRect);
      dpr = Math.min(2, devicePixelRatio || 1);
      node.width = Math.round(w * dpr);
      node.height = Math.round(h * dpr);
      redraw.current?.();
    });
    resize.observe(node);
    const onScreen = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" },
    );
    onScreen.observe(node);
    media.addEventListener("change", sync);
    sync();
    return () => {
      clearTimeout(mark);
      stop?.();
      resize.disconnect();
      onScreen.disconnect();
      media.removeEventListener("change", sync);
      critter.current = null;
      redraw.current = null;
    };
    // Other props are synced by the next effect without recreating the clock;
    // moment and once only matter on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo]);

  useEffect(() => {
    layout.current = { size, y };
    const c = critter.current;
    if (!c) return;
    c.mt = mood;
    c.eyes = eyes;
    c.restT = (rest === "night" ? isNight() : rest) ? 1 : 0;
    redraw.current?.();
  }, [mood, eyes, rest, size, y]);

  return (
    <span ref={wrap} className={`mascota ${className}`}>
      {fallback}
      <canvas
        ref={canvas}
        aria-hidden="true"
        onPointerDown={() => {
          // Touch is the only pointer input: a reaction, never tracking.
          const c = critter.current,
            t = now();
          if (!c) return;
          if (logo) {
            c.play("hop", t);
            c.wobT = t + 1;
          } else c.wobT = t;
        }}
      />
    </span>
  );
}
