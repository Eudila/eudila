// SPDX-License-Identifier: AGPL-3.0-only
import { moods, shapePoints, pathFromPoints } from "./moods.js";
import {
  accessibleInk,
  brandEase,
  mixColor,
  mixPoints,
  positionWeights,
  organicPoints,
  transitionDuration,
} from "./motion.js";
function blendFrame(from, to, progress) {
  return {
    points: mixPoints(from.points, to.points, progress),
    accent: mixColor(from.accent, to.accent, progress),
    ambient: mixColor(from.ambient, to.ambient, progress),
    orb: mixColor(from.orb, to.orb, progress),
    dots: from.dots + (to.dots - from.dots) * progress,
    sparks: from.sparks + (to.sparks - from.sparks) * progress,
    organic: from.organic + (to.organic - from.organic) * progress,
  };
}
export function createMoodController(root, initialPosition) {
  const styles = getComputedStyle(root);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  function token(name) {
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
    organic: index === 4 ? 1 : 0,
  }));
  function frameAt(position) {
    const { lower, upper, fraction } = positionWeights(position);
    return blendFrame(palette[lower], palette[upper], fraction);
  }
  const paths = root.querySelectorAll("[data-orb-shape]");
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let position = initialPosition;
  let current = frameAt(position);
  let organicElapsed = 0;
  let lastTick = performance.now();
  let transition = null;
  let raf = null;
  let destroyed = false;
  const cssColor = (color) => `rgb(${color.map(Math.round).join(" ")})`;
  function paint(frame) {
    root.style.setProperty("--mood-ambient", cssColor(frame.ambient));
    root.style.setProperty("--mood-orb-color", cssColor(frame.orb));
    root.style.setProperty("--mood-accent", cssColor(frame.accent));
    root.style.setProperty(
      "--mood-action-ink",
      cssColor(accessibleInk(frame.accent.map(Math.round), graphite)),
    );
    root.style.setProperty("--orb-dots-opacity", String(frame.dots));
    root.style.setProperty("--orb-sparks-opacity", String(frame.sparks));
    paintShapes(frame);
  }
  function paintShapes(frame) {
    const flowing = frame.organic > 0 && !media.matches;
    paths.forEach((node, index) => {
      let points = frame.points;
      if (flowing) {
        // Halo follows the outer layer; inner layers have their own ripple phase.
        const phase =
          (organicElapsed / 8000) * Math.PI * 2 + Math.max(0, index - 1) * 0.7;
        const waved = organicPoints(palette[4].points, phase);
        points = points.map((point, i) =>
          point.map(
            (v, axis) =>
              v + (waved[i][axis] - palette[4].points[i][axis]) * frame.organic,
          ),
        );
      }
      node.setAttribute("d", pathFromPoints(points));
    });
  }
  function cancel() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  }
  function tick(now) {
    raf = null;
    if (destroyed || document.hidden || media.matches) return;
    organicElapsed += Math.max(0, now - lastTick);
    lastTick = now;
    if (transition) {
      transition.elapsed += Math.max(0, now - transition.last);
      transition.last = now;
      current = blendFrame(
        transition.from,
        transition.to,
        brandEase(transition.elapsed / transitionDuration),
      );
      paint(current);
      if (transition.elapsed >= transitionDuration) {
        current = transition.to;
        transition = null;
        root.dataset.moodTransition = "idle";
      }
    } else paintShapes(current);
    if (transition || current.organic > 0) raf = requestAnimationFrame(tick);
  }
  function syncMotion() {
    cancel();
    if (media.matches) {
      current = frameAt(position);
      transition = null;
      paint(current);
      root.dataset.moodTransition = "idle";
      root.dataset.motion = "reduced";
    } else if (document.hidden) root.dataset.motion = "paused";
    else {
      root.dataset.motion = "running";
      lastTick = performance.now();
      if (transition) transition.last = lastTick;
      if (transition || current.organic > 0) {
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
    setPosition(next, immediate = false) {
      if (destroyed || (position === next && !immediate)) return;
      position = next;
      const wasAnimating = raf !== null;
      cancel();
      if (!wasAnimating) lastTick = performance.now();
      const target = frameAt(position);
      if (immediate || media.matches || document.hidden) {
        current = target;
        transition = null;
        paint(current);
        root.dataset.moodTransition = "idle";
        if (!media.matches && !document.hidden && current.organic > 0)
          raf = requestAnimationFrame(tick);
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
