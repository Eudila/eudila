// SPDX-License-Identifier: AGPL-3.0-only
// node --test app/mood/critter.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { Critter, innerLayerOpacity } from "./critter.ts";

/** Records every canvas call; gradients are tagged so layer strokes can be counted. */
function recorder() {
  const ops = [];
  const ctx = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "createRadialGradient")
          return (...args) => ({ gradient: args, addColorStop() {} });
        return (...args) => ops.push([key, ...args]);
      },
      set(target, key, value) {
        if (key === "strokeStyle") ops.push(["strokeStyle", value]);
        target[key] = value;
        return true;
      },
    },
  );
  return { ctx, ops };
}

function frames(critter, times) {
  return times.map((t) => {
    const { ctx, ops } = recorder();
    critter.render(ctx, 100, 100, 50, 200, t, 1 / 60, 1);
    return JSON.stringify(ops);
  });
}

function layerStrokes(mood) {
  const { ctx, ops } = recorder();
  new Critter({ mood, random: () => 0.5 }).render(
    ctx,
    100,
    100,
    50,
    200,
    1,
    0,
    1,
  );
  let edge = false,
    count = 0;
  for (const [key, value] of ops) {
    if (key === "strokeStyle") edge = typeof value === "object";
    if (key === "stroke" && edge) count++;
  }
  return count;
}

test("Neutral dibuja tres capas y las interiores aparecen gradualmente", () => {
  assert.equal(layerStrokes(4), 3);
  assert.equal(layerStrokes(1), 5);
  assert.equal(layerStrokes(7), 5);
  assert.equal(innerLayerOpacity(4), 0);
  assert.ok(Math.abs(innerLayerOpacity(4 + 1 / 3) - 0.5) < 1e-9);
  assert.equal(innerLayerOpacity(4.67), 1);
  assert.equal(innerLayerOpacity(3.33), 1);
});

test("dos mascotas no se mueven sincronizadas", () => {
  const times = [10, 10.5, 11];
  assert.notDeepEqual(
    frames(new Critter({ mood: 4 }), times),
    frames(new Critter({ mood: 4 }), times),
  );
});

test("Muy desagradable mantiene su posición sin temblar", () => {
  const c = new Critter({ mood: 1, random: () => 0.5 });
  const positions = frames(c, [0, 0.05, 0.1, 0.5, 1, 3, 6]).map((frame) =>
    JSON.parse(frame).find(([key]) => key === "translate"),
  );
  for (const position of positions) {
    assert.deepEqual(position, ["translate", 100, 103]);
  }
});

test("con movimiento reducido queda quieta e ignora los momentos", () => {
  const c = new Critter({ mood: 7 });
  c.reduced = true;
  c.play("hola", 0);
  assert.equal(c.playing, null);
  c.wobT = 1;
  const [a, b, d] = frames(c, [1, 1.4, 9]);
  assert.equal(a, b);
  assert.equal(a, d);
});

test("los momentos terminan solos y devuelven la mascota a su estado", () => {
  const c = new Critter({ mood: 5, random: () => 0.5 });
  for (const [moment, length] of [
    ["hola", 2.3],
    ["guardar", 2.1],
    ["asomar", 3],
    ["hop", 1.1],
  ]) {
    c.play(moment, 0);
    frames(c, [length / 2]);
    assert.equal(c.playing, moment);
    frames(c, [length + 0.01]);
    assert.equal(c.playing, null, moment);
  }
});

test("el ánimo se acerca al destino sin saltos y el logo queda fijo", () => {
  const c = new Critter({ mood: 1, random: () => 0.5 });
  c.mt = 7;
  frames(c, [1]);
  assert.ok(c.m > 1 && c.m < 7, c.m);
  const logo = new Critter({ mood: 7, mRate: 0 });
  logo.mt = 7;
  frames(logo, [1]);
  assert.equal(logo.m, 7);
});

test("la mascota nunca sigue al puntero: solo reacciona al toque", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const file of ["critter.ts", "mascota.tsx"]) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(
      source,
      /pointermove|mousemove|pointerenter|mouseenter|pointerover|mouseover|onPointerMove|onMouse|clientX|clientY|offsetX|pageX|:hover/i,
      file,
    );
  }
  const component = await readFile(
    new URL("mascota.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(component.match(/onPointer\w+/g)?.join(), "onPointerDown");
});

test("en descanso la mascota coral no salta ni se balancea", () => {
  // One full hop cycle of Muy agradable (3.2 s); position comes from the first translate.
  const times = Array.from({ length: 33 }, (_, i) => i * 0.1);
  const poses = (critter) =>
    new Set(
      frames(critter, times).map((f) =>
        JSON.stringify(
          JSON.parse(f).filter(([k]) => k === "translate" || k === "rotate")[0],
        ),
      ),
    ).size;
  const awake = new Critter({ mood: 7, random: () => 0.5 });
  const resting = new Critter({ mood: 7, random: () => 0.5 });
  resting.restT = resting.rest = 1;
  assert.ok(poses(awake) > 1, "despierta debería saltar");
  assert.equal(poses(resting), 1);
});
