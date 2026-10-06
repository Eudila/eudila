// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transpileModule, ModuleKind, ScriptTarget, JsxEmit } from "typescript";
import { moods, shapePath } from "../../prototype/moods.js";

const source = await readFile(
  new URL("./mood-orb.tsx", import.meta.url),
  "utf8",
);
let code = transpileModule(source, {
  compilerOptions: {
    module: ModuleKind.ESNext,
    target: ScriptTarget.ES2022,
    jsx: JsxEmit.ReactJSX,
  },
}).outputText;
for (const name of ["react", "react/jsx-runtime"])
  code = code.replaceAll(`"${name}"`, `"${import.meta.resolve(name)}"`);
code = code.replaceAll(
  '"@/prototype/moods.js"',
  `"${new URL("../../prototype/moods.js", import.meta.url).href}"`,
);
const { MoodOrb } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);
const render = (props) => renderToStaticMarkup(createElement(MoodOrb, props));

test("all seven states retain five layers, one fixed core and their shared silhouette", () => {
  let core;
  for (const variant of ["hero", "compact"])
    for (let mood = 1; mood <= 7; mood++) {
      const html = render({ mood, variant });
      assert.equal([...html.matchAll(/data-orb-layer=/g)].length, 5);
      assert.equal([...html.matchAll(/<path /g)].length, 5);
      assert.equal([...html.matchAll(/<circle /g)].length, 1);
      assert.equal(
        [...html.matchAll(/ d="([^"]+)"/g)].every(
          ([, path]) => path === shapePath(moods[mood - 1]),
        ),
        true,
      );
      const geometry = html.match(
        /<circle data-orb-core="[^"]*" (.*?) fill=/,
      )[1];
      core ??= geometry;
      assert.equal(geometry, core);
      assert.match(html, new RegExp(`var\\(--color-mood-${mood}-orb\\)`));
      assert.match(html, /aria-hidden="true" focusable="false"/);
      assert.match(html, /viewBox="0 0 220 220"/);
      assert.doesNotMatch(html, /<animate|<filter|<text|tabindex=/i);
    }
});

test("multiple orbs own independent gradients and every paint reference resolves", () => {
  const html = renderToStaticMarkup(
    createElement(
      "div",
      null,
      ...moods.map((_, index) => createElement(MoodOrb, { mood: index + 1 })),
    ),
  );
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(ids.length, 21);
  assert.equal(new Set(ids).size, ids.length);
  for (const svg of html.matchAll(/<svg.*?<\/svg>/g)) {
    const ownIds = new Set(
      [...svg[0].matchAll(/ id="([^"]+)"/g)].map(([, id]) => id),
    );
    for (const [, reference] of svg[0].matchAll(/url\(#([^)]+)\)/g))
      assert.ok(ownIds.has(reference));
  }
});

test("variants and explicit dimensions preserve a decorative square renderer", () => {
  assert.match(render({ mood: 4 }), /data-variant="hero"/);
  assert.match(
    render({ mood: 4, variant: "compact" }),
    /class="size-12 shrink-0"/,
  );
  assert.match(
    render({ mood: 4, variant: "compact", className: "size-6 shrink-0" }),
    /class="size-6 shrink-0"/,
  );
  assert.doesNotMatch(
    source,
    /#[0-9a-fA-F]{3,8}\b|requestAnimationFrame|setInterval/,
  );
});

test("invalid mood values fail instead of selecting a different emotional state", () => {
  for (const mood of [0, 8, -1, 1.5, NaN, Infinity])
    assert.throws(() => render({ mood }), RangeError);
});
