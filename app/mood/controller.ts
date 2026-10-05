// SPDX-License-Identifier: AGPL-3.0-only
import { moods, shapePoints, pathFromPoints } from "../../prototype/moods.js";
import {
  accessibleInk,
  brandEase,
  mixColor,
  mixPoints,
  transitionDuration,
  type Color,
  type Points,
} from "./motion";

type Frame = {
  points: Points;
  accent: Color;
  ambient: Color;
  orb: Color;
  dots: number;
  sparks: number;
};

export function createMoodController(
  root: HTMLDivElement,
  initialLevel: number,
) {
  const styles = getComputedStyle(root);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  function token(name: string) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = styles.getPropertyValue(name).trim();
    ctx.fillRect(0, 0, 1, 1);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3);
  }
  const graphite = token("--color-graphite");
  const palette = moods.map((mood, index) => ({
    points: shapePoints(mood),
    accent: token(`--color-mood-${index + 1}`),
    ambient: token(`--color-mood-${index + 1}-ambient`),
    orb: token(`--color-mood-${index + 1}-orb`),
    dots: index < 3 ? 1 : 0,
    sparks: index > 3 ? 1 : 0,
  }));
  const paths = root.querySelectorAll<SVGPathElement>("[data-orb-shape]");
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let level = initialLevel;
  let current: Frame = palette[level - 1];
  let transition: {
    from: Frame;
    to: Frame;
    elapsed: number;
    last: number;
  } | null = null;
  let raf: number | null = null;
  let destroyed = false;

  const cssColor = (color: Color) => `rgb(${color.map(Math.round).join(" ")})`;
  function paint(frame: Frame) {
    root.style.setProperty("--mood-ambient", cssColor(frame.ambient));
    root.style.setProperty("--mood-orb-color", cssColor(frame.orb));
    root.style.setProperty("--mood-accent", cssColor(frame.accent));
    root.style.setProperty(
      "--mood-action-ink",
      cssColor(accessibleInk(frame.accent.map(Math.round), graphite)),
    );
    root.style.setProperty("--orb-dots-opacity", String(frame.dots));
    root.style.setProperty("--orb-sparks-opacity", String(frame.sparks));
    const path = pathFromPoints(frame.points);
    paths.forEach((node) => node.setAttribute("d", path));
  }

  function cancel() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  }

  function tick(now: number) {
    raf = null;
    if (destroyed || !transition || document.hidden || media.matches) return;
    transition.elapsed += Math.max(0, now - transition.last);
    transition.last = now;
    const progress = brandEase(transition.elapsed / transitionDuration);
    const { from, to } = transition;
    current = {
      points: mixPoints(from.points, to.points, progress),
      accent: mixColor(from.accent, to.accent, progress),
      ambient: mixColor(from.ambient, to.ambient, progress),
      orb: mixColor(from.orb, to.orb, progress),
      dots: from.dots + (to.dots - from.dots) * progress,
      sparks: from.sparks + (to.sparks - from.sparks) * progress,
    };
    paint(current);
    if (transition.elapsed >= transitionDuration) {
      current = to;
      transition = null;
      root.dataset.moodTransition = "idle";
    } else raf = requestAnimationFrame(tick);
  }

  function syncMotion() {
    cancel();
    if (media.matches) {
      current = palette[level - 1];
      transition = null;
      paint(current);
      root.dataset.moodTransition = "idle";
      root.dataset.motion = "reduced";
    } else if (document.hidden) root.dataset.motion = "paused";
    else {
      root.dataset.motion = "running";
      if (transition) {
        transition.last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
  }

  document.addEventListener("visibilitychange", syncMotion);
  media.addEventListener("change", syncMotion);
  root.dataset.moodTransition = "idle";
  paint(current);
  syncMotion();

  return {
    setLevel(next: number) {
      if (destroyed || level === next) return;
      level = next;
      cancel();
      const target = palette[level - 1];
      if (media.matches || document.hidden) {
        current = target;
        transition = null;
        paint(current);
        root.dataset.moodTransition = "idle";
      } else {
        transition = {
          from: current,
          to: target,
          elapsed: 0,
          last: performance.now(),
        };
        // React may just have rendered the target path; rebase before paint.
        paint(current);
        root.dataset.moodTransition = "running";
        raf = requestAnimationFrame(tick);
      }
    },
    destroy() {
      destroyed = true;
      cancel();
      document.removeEventListener("visibilitychange", syncMotion);
      media.removeEventListener("change", syncMotion);
      delete root.dataset.motion;
      delete root.dataset.moodTransition;
      [
        "--mood-ambient",
        "--mood-orb-color",
        "--mood-accent",
        "--mood-action-ink",
        "--orb-dots-opacity",
        "--orb-sparks-opacity",
      ].forEach((name) => root.style.removeProperty(name));
    },
  };
}
