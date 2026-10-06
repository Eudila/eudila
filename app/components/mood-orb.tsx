// SPDX-License-Identifier: AGPL-3.0-only
import { useId } from "react";
import { moods, shapePath } from "@/prototype/moods.js";

export function MoodOrb({
  mood,
  variant = "hero",
  className,
}: {
  mood: number;
  variant?: "hero" | "compact";
  className?: string;
}) {
  const id = useId();
  const state = moods[mood - 1];
  if (!Number.isInteger(mood) || !state)
    throw new RangeError("MoodOrb requires a mood from 1 to 7");
  const path = shapePath(state);

  return (
    <svg
      viewBox="0 0 220 220"
      aria-hidden="true"
      focusable="false"
      data-mood-orb={mood}
      data-variant={variant}
      className={
        className ??
        (variant === "hero"
          ? "mx-auto h-auto w-48 max-w-full shrink-0"
          : "size-12 shrink-0")
      }
      style={{ color: `var(--color-mood-${mood}-orb)` }}
    >
      <defs>
        <radialGradient id={`${id}-material`}>
          <stop offset="0" stopColor="var(--color-white)" stopOpacity=".85" />
          <stop offset=".22" stopColor="currentColor" stopOpacity=".85" />
          <stop offset=".72" stopColor="currentColor" stopOpacity=".55" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".2" />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-white)" stopOpacity=".45" />
          <stop offset=".5" stopColor="var(--color-white)" stopOpacity=".06" />
          <stop offset="1" stopColor="var(--color-white)" stopOpacity=".25" />
        </linearGradient>
        <radialGradient id={`${id}-core`}>
          <stop offset="0" stopColor="var(--color-white)" />
          <stop offset=".65" stopColor="var(--color-white)" stopOpacity=".98" />
          <stop offset="1" stopColor="var(--color-white)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[1, 0.82, 0.63, 0.45, 0.29].map((scale, index) => (
        <g
          key={scale}
          data-orb-layer={index + 1}
          opacity={[0.18, 0.3, 0.48, 0.7, 0.9][index]}
        >
          <path
            d={path}
            transform={`translate(110 110) scale(${scale}) translate(-110 -110)`}
            fill={`url(#${id}-material)`}
            stroke={`url(#${id}-edge)`}
            strokeWidth="1"
          />
        </g>
      ))}
      <circle
        data-orb-core
        cx="110"
        cy="110"
        r="26"
        fill={`url(#${id}-core)`}
      />
    </svg>
  );
}
