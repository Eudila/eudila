// SPDX-License-Identifier: AGPL-3.0-only
export const steps = ["tipo", "animo", "emocion", "factores"];
export const nextSteps = [...steps, "confirmacion"];
export const types = ["mañana", "tarde", "noche", "libre"];

export function newDraft() {
  return { type: null, mood: 4, emotionId: null, factors: [] };
}

export function restoreDraft(raw) {
  try {
    const value = JSON.parse(raw);
    if (!Number.isInteger(value?.mood) || value.mood < 1 || value.mood > 7 || !Array.isArray(value.factors) || value.factors.some(id => typeof id !== "string" || !id.trim()) || new Set(value.factors).size !== value.factors.length || (value.emotionId != null && (typeof value.emotionId !== "string" || !value.emotionId.trim()))) return null;
    return {
      type: types.includes(value.type) ? value.type : null,
      mood: value.mood,
      emotionId: value.emotionId == null ? null : value.emotionId,
      factors: value.factors
    };
  } catch { return null; }
}

export function adjacentRoute(route, direction) {
  const index = steps.indexOf(route.replace(/^registro\//, ""));
  const step = index < 0 ? null : steps[index + direction];
  return step ? `registro/${step}` : null;
}
