// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { adjacentRoute, newDraft, restoreDraft, steps, nextSteps } from "./flow-state.js";

const draft = newDraft();
draft.type = "tarde";
draft.mood = 6;
draft.emotionId = "emotion-1";
draft.factors = ["factor-1", "factor-2"];
assert.deepEqual(restoreDraft(JSON.stringify(draft)), draft);
assert.equal(restoreDraft('{"mood":9,"factors":[]}'), null);
assert.equal(restoreDraft(JSON.stringify({ ...draft, factors: [null] })), null);
assert.equal(restoreDraft(JSON.stringify({ ...draft, factors: ["factor-1", "factor-1"] })), null);
assert.equal(restoreDraft(JSON.stringify({ ...draft, emotionId: {} })), null);
assert.equal(restoreDraft(null), null);
assert.deepEqual(steps, ["tipo", "animo", "emocion", "factores"]);
assert.deepEqual(nextSteps, [...steps, "confirmacion"]);
assert.equal(steps.includes("confirmacion"), false);
assert.equal(adjacentRoute("registro/factores", -1), "registro/emocion");
assert.equal(adjacentRoute("registro/emocion", -1), "registro/animo");
assert.equal(adjacentRoute("registro/animo", 1), "registro/emocion");
assert.equal(adjacentRoute("registro/tipo", -1), null);
assert.equal(adjacentRoute("registro/factores", 1), null);
assert.equal(adjacentRoute("registro/confirmacion", -1), null);
assert.equal(adjacentRoute("registro/confirmacion", 1), null);
console.log("Registro: estado y navegación correctos");
