// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transpileModule, ModuleKind, ScriptTarget, JsxEmit } from "typescript";
import { moods } from "../../prototype/moods.js";
import { createExamples, localDayKey } from "./records.ts";

const moduleUrl = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
async function load(relative, replacements) {
  let code = transpileModule(
    await readFile(new URL(relative, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ModuleKind.ESNext,
        target: ScriptTarget.ES2022,
        jsx: JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  for (const name of ["react", "react/jsx-runtime"])
    code = code.replaceAll(`"${name}"`, `"${import.meta.resolve(name)}"`);
  for (const [name, url] of Object.entries(replacements))
    code = code.replaceAll(`"${name}"`, `"${url}"`);
  return moduleUrl(code);
}
const moodsUrl = new URL("../../prototype/moods.js", import.meta.url).href;
const orbUrl = await load("../components/mood-orb.tsx", {
  "@/prototype/moods.js": moodsUrl,
});
const now = new Date();
const dayKey = localDayKey(now);
const example = createExamples(now)[0];
const records = moods.map((_, index) => ({
  ...example,
  id: `orb-fixture-${index}`,
  mood: index + 1,
  recordedAt: now.toISOString(),
}));
const viewsUrl = await load("./views.tsx", {
  "@/prototype/moods.js": moodsUrl,
  "@/app/components/mood-orb": orbUrl,
  "./records": new URL("./records.ts", import.meta.url).href,
  "./state": moduleUrl(
    `export function useHistory() { return { records: ${JSON.stringify(records)}, ready: true, problem: null, preview: true }; }`,
  ),
  "next/link": moduleUrl(
    `import { createElement } from "${import.meta.resolve("react")}";
     export default function Link({ children, ...props }) { return createElement("a", props, children); }`,
  ),
});
const { TodayView, CalendarView, DayView } = await import(viewsUrl);

for (const [name, view, props, orbCount, smallCount] of [
  ["today", TodayView, {}, 8, 7],
  ["calendar", CalendarView, { requestedMonth: dayKey.slice(0, 7) }, 8, 8],
  ["day detail", DayView, { dayKey }, 15, 14],
])
  test(`${name} uses compact shared orbs and retains the seven state labels`, () => {
    const html = renderToStaticMarkup(createElement(view, props));
    assert.equal([...html.matchAll(/data-mood-orb=/g)].length, orbCount);
    assert.equal(
      [...html.matchAll(/data-variant="compact"/g)].length,
      orbCount,
    );
    assert.equal([...html.matchAll(/data-orb-layer=/g)].length, orbCount * 5);
    assert.equal([...html.matchAll(/data-orb-core=/g)].length, orbCount);
    assert.equal(
      [...html.matchAll(/class="size-6 shrink-0"/g)].length,
      smallCount,
    );
    for (const state of moods) assert.ok(html.includes(state.label));
    for (const svg of html.matchAll(/<svg.*?<\/svg>/g))
      assert.match(svg[0], /aria-hidden="true" focusable="false"/);
    assert.doesNotMatch(html, /size-5|data-variant="hero"|<animate|<style/i);
  });
