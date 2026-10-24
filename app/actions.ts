// SPDX-License-Identifier: AGPL-3.0-only
import type { CSSProperties } from "react";

/** Mood CTAs: the slider step and the registro steps tinted by its ambient. */
export function moodActionStyle(level: number): CSSProperties {
  return {
    "--action-accent": `var(--mood-accent, var(--color-mood-${level}))`,
    "--action-ink": `var(--mood-action-ink, var(--color-mood-${level}-ink))`,
  } as CSSProperties;
}
