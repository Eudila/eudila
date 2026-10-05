// SPDX-License-Identifier: AGPL-3.0-only
export type Color = number[];
export type Points = number[][];

export const transitionDuration = 600;

export function positionWeights(position: number) {
  const value =
    Math.max(1, Math.min(7, Number.isFinite(position) ? position : 4)) - 1;
  const lower = Math.floor(value);
  return { lower, upper: Math.min(6, lower + 1), fraction: value - lower };
}

/** A quiet ripple of the organic contour; the center and point order stay fixed. */
export function organicPoints(points: Points, phase: number): Points {
  if (phase === 0) return points;
  return points.map(([x, y]) => {
    const dx = x - 110,
      dy = y - 110;
    const radius = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const ripple =
      2.5 * (Math.sin(3 * angle + phase) - Math.sin(3 * angle)) +
      1.5 * (Math.cos(4 * angle - phase) - Math.cos(4 * angle));
    const scale = 1 + ripple / radius;
    return [110 + dx * scale, 110 + dy * scale];
  });
}

/** Solve the brand cubic-bezier(.32,.72,0,1), including interrupted morphs. */
export function brandEase(progress: number) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  let low = 0,
    high = 1;
  for (let i = 0; i < 20; i++) {
    const t = (low + high) / 2;
    const x = 3 * (1 - t) ** 2 * t * 0.32 + t ** 3;
    if (x < progress) low = t;
    else high = t;
  }
  const t = (low + high) / 2;
  return 3 * (1 - t) ** 2 * t * 0.72 + 3 * (1 - t) * t ** 2 + t ** 3;
}

export function hexColor(value: string): Color {
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
}

export function mixColor(a: Color, b: Color, progress: number): Color {
  return a.map((v, i) => v + (b[i] - v) * progress);
}

export function mixPoints(a: Points, b: Points, progress: number): Points {
  return a.map((point, i) => mixColor(point, b[i], progress));
}

export function contrast(a: Color, b: Color) {
  function luminance(rgb: Color) {
    return rgb.reduce((sum, value, i) => {
      const c = value / 255;
      return (
        sum +
        (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][i]
      );
    }, 0);
  }
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

export function accessibleInk(accent: Color, graphite: Color): Color {
  const white = [255, 255, 255];
  if (contrast(accent, white) >= 4.5) return white;
  if (contrast(accent, graphite) >= 4.5) return graphite;
  // Some intermediate colors fall between white/Graphite's AA ranges.
  return [0, 0, 0];
}
