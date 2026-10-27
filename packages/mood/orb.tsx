// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useId } from "react";
import { moods, shapePath } from "./moods.js";
import { innerLayerOpacity } from "./critter";

const layers = [1, 0.84, 0.68, 0.52, 0.36];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Still face from the mascot spec: same eyes per state, no blink or gaze. */
function Face({ level, scale }: { level: number; scale: number }) {
  const W = 4.8,
    H = 9.4,
    S = 7.6,
    ey = -1;
  // Eye ink: the state's ambient mixed with 35% black.
  const ink = `#${moods[level - 1].ambient
    .slice(1)
    .match(/../g)!
    .map((h: string) =>
      Math.round(parseInt(h, 16) * 0.65)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
  const sad = clamp((3.6 - level) / 2.2) * 0.9;
  const happy = level >= 6;
  return (
    <g transform={`translate(110 110) scale(${scale})`}>
      <circle r="22" fill="var(--color-white)" />
      {[-1, 1].map((side) => {
        const ex = side * S;
        if (happy)
          return (
            <path
              key={side}
              d={`M${ex - W * 0.8} ${ey + H * 0.18}Q${ex} ${ey - H * 0.55} ${ex + W * 0.8} ${ey + H * 0.18}`}
              fill="none"
              stroke={ink}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          );
        const xo = ex + side * (W / 2 + 1.2),
          xi = ex - side * (W / 2 + 1.2);
        return (
          <g key={side}>
            <ellipse cx={ex} cy={ey} rx={W / 2} ry={H / 2} fill={ink} />
            {sad > 0 && (
              // Eyelid sits lower on the outer side.
              <path
                d={`M${xo} ${ey - H}L${xi} ${ey - H}L${xi} ${ey - H / 2 - 1 + sad * H * 0.08}L${xo} ${ey - H / 2 - 1 + sad * H * 0.55}Z`}
                fill="var(--color-white)"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Static eudila with its face for lists, chips and the mascot's no-JS fallback;
 * it never moves (no breathing in lists). The living mascot is ./mascota.
 */
export default function MoodOrb({
  level,
  compact = false,
  className = "",
}: {
  level: number;
  /** Small sizes enlarge the face (x1.75, as the logo) so the eyes still read. */
  compact?: boolean;
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
      <Face level={level} scale={compact ? 1.75 : 1} />
    </svg>
  );
}
