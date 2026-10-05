// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { test } from "node:test";
import * as geometry from "../../prototype/moods.js";

test("las familias tienen 9/14 puntas, 12 ondas, círculo, gota y 7/9 pétalos", () => {
  assert.equal(
    typeof geometry.shapePoints,
    "function",
    "falta geometría por familia para morph",
  );
  const counts = [9, 14, 12, 0, null, 7, 9];
  for (const [index, mood] of geometry.moods.entries()) {
    const points = geometry.shapePoints(mood);
    assert.equal(points.length, 252);
    assert.ok(points.flat().every(Number.isFinite));
    const radii = points.map(([x, y]) => Math.hypot(x - 110, y - 110));
    assert.ok(Math.max(...radii) < 105, "silueta acotada, sin recorte");
    if (counts[index] === 0) {
      assert.ok(
        Math.max(...radii) - Math.min(...radii) < 0.00001,
        "Neutral circular",
      );
    } else if (counts[index] !== null) {
      const peaks = radii.filter(
        (r, i) =>
          r > radii[(i + points.length - 1) % points.length] &&
          r > radii[(i + 1) % points.length],
      ).length;
      assert.equal(peaks, counts[index], mood.label);
    } else {
      const [minY, maxY] = [
        Math.min(...points.map((p) => p[1])),
        Math.max(...points.map((p) => p[1])),
      ];
      assert.ok(Math.abs(110 - minY - (maxY - 110)) > 10, "gota asimétrica");
    }
    assert.ok(geometry.shapePath(mood).endsWith("Z"));
  }
});

test("morph continuo y tinta AA en todas las mezclas, incluso entre extremos", async () => {
  const motion = await import("./motion.ts");
  assert.equal(motion.brandEase(0), 0);
  assert.equal(motion.brandEase(1), 1);
  let last = 0;
  for (let i = 0; i <= 100; i++) {
    const progress = motion.brandEase(i / 100);
    assert.ok(progress >= last && progress <= 1);
    last = progress;
  }
  for (const a of geometry.moods) {
    for (const b of geometry.moods) {
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const accent = motion.mixColor(
          motion.hexColor(a.accent),
          motion.hexColor(b.accent),
          t,
        );
        const ink = motion.accessibleInk(accent, [29, 29, 31]);
        assert.ok(motion.contrast(accent, ink) >= 4.5, [
          a.label,
          b.label,
          t,
          accent,
          ink,
        ]);
        const points = motion.mixPoints(
          geometry.shapePoints(a),
          geometry.shapePoints(b),
          t,
        );
        assert.equal(points.length, 252);
        assert.ok(points.flat().every(Number.isFinite));
      }
    }
  }
});
