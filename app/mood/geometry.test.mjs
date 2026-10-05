// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as geometry from "../../shared/visual/moods.js";
const css = readFileSync(new URL("../globals.css", import.meta.url), "utf8");
const accents = geometry.moods.map(
  (_, i) =>
    css.match(new RegExp(`--color-mood-${i + 1}:\\s*(#[a-f0-9]+)`, "i"))[1],
);

test("Algo agradable conserva una gota amplia al girar alrededor del núcleo", () => {
  const radii = geometry
    .shapePoints(geometry.moods[4])
    .map(([x, y]) => Math.hypot(x - 110, y - 110));
  assert.ok(
    Math.max(...radii) / Math.min(...radii) < 1.25,
    "la gota se estrecha y las capas leen como triángulos al girar",
  );
});

test("la corrección de Algo agradable conserva los otros seis contornos aprobados", () => {
  const baseline = {
    1: "b33ad2c587d1b299497245194d84005b9c18aad0a1e0b0c7b5109c8dbe9c1ba4",
    2: "e58cfb2db9f60637628511e335aa9a28291f147adb821ba8e088bb41373c6be3",
    3: "e174c4eff3e9c214744d61451795ed31186d5a95e152bd390b513d4c1f32c4d8",
    4: "814be0d67b346d868a804beb5923dd10b10a0ed69688111728e379fa8d43c125",
    6: "be391dd2b768e495bb03785789ca0865c3851d7065d760791bda47449aa62266",
    7: "5b36c6af7e35c02bacbeb195bf3dc52ad305ed9b3393a7cabdd86662144178ec",
  };
  for (const [level, expected] of Object.entries(baseline)) {
    const path = geometry.shapePath(geometry.moods[Number(level) - 1]);
    assert.equal(createHash("sha256").update(path).digest("hex"), expected);
  }
});

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
  for (const [aIndex, a] of geometry.moods.entries()) {
    for (const [bIndex, b] of geometry.moods.entries()) {
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const accent = motion.mixColor(
          motion.hexColor(accents[aIndex]),
          motion.hexColor(accents[bIndex]),
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

test("posiciones continuas mezclan vecinos sin cuantizar la escena", async () => {
  const motion = await import("./motion.ts");
  assert.equal(typeof motion.positionWeights, "function");
  assert.deepEqual(motion.positionWeights(5.25), {
    lower: 4,
    upper: 5,
    fraction: 0.25,
  });
  const nearFive = motion.positionWeights(4.8);
  assert.equal(nearFive.lower, 3);
  assert.equal(nearFive.upper, 4);
  assert.ok(Math.abs(nearFive.fraction - 0.8) < 1e-10);
  assert.deepEqual(motion.positionWeights(7), {
    lower: 6,
    upper: 6,
    fraction: 0,
  });
  assert.deepEqual(motion.positionWeights(-1), {
    lower: 0,
    upper: 1,
    fraction: 0,
  });
});

test("el contorno orgánico fluye sin desplazar el núcleo ni plegarse", async () => {
  const motion = await import("./motion.ts");
  assert.equal(typeof motion.organicPoints, "function");
  const base = geometry.shapePoints(geometry.moods[4]);
  assert.deepEqual(motion.organicPoints(base, 0), base);
  assert.notDeepEqual(motion.organicPoints(base, 1), base);
  for (let phase = 0; phase < 15; phase += 0.1) {
    const points = motion.organicPoints(base, phase);
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i].map((v) => v - 110);
      const [nx, ny] = points[(i + 1) % points.length].map((v) => v - 110);
      assert.ok(Math.hypot(x, y) < 110, "contorno dentro del halo");
      assert.ok(x * ny - y * nx > 0, "contorno sin pliegues");
      assert.ok(
        Math.hypot(points[i][0] - base[i][0], points[i][1] - base[i][1]) <=
          8.01,
        "ondulación contenida",
      );
    }
  }
});
