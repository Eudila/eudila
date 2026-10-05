// SPDX-License-Identifier: AGPL-3.0-only
import type { CSSProperties } from "react";

/** Only the mood action receives emotional colors; other actions stay neutral. */
export function moodActionStyle(level: number): CSSProperties {
  return {
    "--action-accent": `var(--color-mood-${level})`,
    "--action-ink": `var(--color-mood-${level}-ink)`,
  } as CSSProperties;
}
