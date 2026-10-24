// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useId } from "react";
import { moods, shapePath } from "../../prototype/moods.js";
import { innerLayerOpacity } from "./critter";

const layers = [1, 0.84, 0.68, 0.52, 0.36];

/**
 * Static «Orbe vivo» (no face) for compact uses and the mascot's no-JS fallback.
 * The living mascot is the canvas in ./mascota.
 */
export default function MoodOrb({
  level,
  className = "",
}: {
  level: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const path = shapePath(moods[level - 1]);
  // Neutral keeps three layers (mascota README, rule 3).
  const inner = innerLayerOpacity(level);
  return (
    <svg
      viewBox="-14 -14 248 248"
      aria-hidden="true"
      className={`orb-scene ${className}`}
      style={{ color: `var(--color-mood-${level}-orb)` }}
    >
      <defs>
        <radialGradient id={`${id}-material`} cx="48%" cy="46%" r="60%">
          <stop offset="0%" stopColor="var(--color-white)" stopOpacity=".76" />
          <stop offset="34%" stopColor="var(--color-white)" stopOpacity=".28" />
          <stop offset="72%" stopColor="currentColor" stopOpacity=".62" />
          <stop offset="100%" stopColor="currentColor" stopOpacity=".38" />
        </radialGradient>
        <radialGradient id={`${id}-edge`} cx="38%" cy="24%" r="85%">
          <stop offset="0%" stopColor="var(--color-white)" stopOpacity=".76" />
          <stop offset="100%" stopColor="currentColor" stopOpacity=".3" />
        </radialGradient>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor="var(--color-white)" />
          <stop offset="22%" stopColor="var(--color-white)" stopOpacity=".96" />
          <stop offset="62%" stopColor="var(--color-white)" stopOpacity=".28" />
          <stop offset="100%" stopColor="var(--color-white)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {layers.map((scale, i) =>
        i > 2 && inner === 0 ? null : (
          <path
            key={scale}
            className="orb-layer"
            d={path}
            transform={`rotate(${(i % 2 ? -1 : 1) * i * 31.5} 110 110) translate(110 110) scale(${scale}) translate(-110 -110)`}
            fill={`url(#${id}-material)`}
            fillOpacity={0.6 + i * 0.065}
            opacity={i > 2 ? inner : undefined}
            stroke={`url(#${id}-edge)`}
            strokeWidth={0.8 / scale}
          />
        ),
      )}
      <circle cx="110" cy="110" r="53" fill={`url(#${id}-core)`} />
      <circle cx="110" cy="110" r="12" fill="var(--color-white)" />
    </svg>
  );
}
