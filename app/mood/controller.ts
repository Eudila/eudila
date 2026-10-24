// SPDX-License-Identifier: AGPL-3.0-only
import { moods } from "../../prototype/moods.js";
import {
  accessibleInk,
  brandEase,
  mixColor,
  positionWeights,
  transitionDuration,
  type Color,
} from "./motion";

// The mascot canvas draws the symbol; this paints the ambient and the AA CTA.
type Frame = { accent: Color; ambient: Color };

function blendFrame(from: Frame, to: Frame, progress: number): Frame {
  return {
    accent: mixColor(from.accent, to.accent, progress),
    ambient: mixColor(from.ambient, to.ambient, progress),
  };
}

export function createMoodController(
  root: HTMLDivElement,
  initialPosition: number,
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
  const palette = moods.map((_, index) => ({
    accent: token(`--color-mood-${index + 1}`),
    ambient: token(`--color-mood-${index + 1}-ambient`),
  }));
  function frameAt(position: number) {
    const { lower, upper, fraction } = positionWeights(position);
    return blendFrame(palette[lower], palette[upper], fraction);
  }
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let position = initialPosition;
  let current: Frame = frameAt(position);
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
    root.style.setProperty("--mood-accent", cssColor(frame.accent));
    root.style.setProperty(
      "--mood-action-ink",
      cssColor(accessibleInk(frame.accent.map(Math.round), graphite)),
    );
  }

  function cancel() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  }

  function tick(now: number) {
    raf = null;
    if (destroyed || document.hidden || media.matches) return;
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
    }
    if (transition) raf = requestAnimationFrame(tick);
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
    setPosition(next: number, immediate = false) {
      if (destroyed || (position === next && !immediate)) return;
      position = next;
      cancel();
      const target = frameAt(position);
      if (immediate || media.matches || document.hidden) {
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
      ["--mood-ambient", "--mood-accent", "--mood-action-ink"].forEach((name) =>
        root.style.removeProperty(name),
      );
    },
  };
}
