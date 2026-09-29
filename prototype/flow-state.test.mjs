// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { adjacentRoute, newDraft, restoreDraft, steps } from "./flow-state.js";

const draft = newDraft();
draft.type = "tarde";
draft.mood = 6;
draft.emotionId = "emotion-1";
draft.factors = ["factor-1", "factor-2"];
assert.deepEqual(restoreDraft(JSON.stringify(draft)), draft);
assert.equal(restoreDraft('{"mood":9,"factors":[]}'), null);
assert.deepEqual(steps, ["tipo", "animo", "emocion", "factores"]);
assert.equal(adjacentRoute("registro/factores", -1), "registro/emocion");
assert.equal(adjacentRoute("registro/emocion", -1), "registro/animo");
assert.equal(adjacentRoute("registro/animo", 1), "registro/emocion");
assert.equal(adjacentRoute("registro/tipo", -1), null);
console.log("Registro: estado y navegación correctos");
