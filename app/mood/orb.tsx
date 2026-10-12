// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useId, type CSSProperties } from "react";
import { moods, shapePath } from "../../prototype/moods.js";

const layers = [1, 0.84, 0.68, 0.52, 0.36];
const particles = Array.from({ length: 24 }, (_, i) => {
  const angle = i * 2.399963;
  const radius = 98 + (i % 5) * 4;
  return {
    x: 110 + Math.cos(angle) * radius,
    y: 110 + Math.sin(angle) * radius,
    size: 0.65 + (i % 4) * 0.3,
    duration: 2.5 + ((i * 7) % 15) * 0.25,
    phase: -((i * 1.618) % 6),
  };
});

export default function MoodOrb({
  level,
  animated = false,
  className = "",
}: {
  level: number;
  animated?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const path = shapePath(moods[level - 1]);
  return (
    <svg
      viewBox="-14 -14 248 248"
      aria-hidden="true"
      className={`orb-scene ${className}`}
      data-animated={animated || undefined}
      style={{
        color: animated
          ? `var(--mood-orb-color, var(--color-mood-${level}-orb))`
          : `var(--color-mood-${level}-orb)`,
      }}
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
        {animated && (
          <filter
            id={`${id}-glow`}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="7" />
          </filter>
        )}
      </defs>
      <g className={animated ? "orb-breath" : undefined}>
        {animated && (
          <path
            data-orb-shape
            d={path}
            fill="currentColor"
            opacity=".38"
            filter={`url(#${id}-glow)`}
          />
        )}
        {layers.map((scale, i) => (
          <g
            className="orb-turn"
            key={scale}
            style={{ "--orb-phase": `${-i * 11}s` } as CSSProperties}
          >
            <path
              className="orb-layer"
              data-orb-shape={animated || undefined}
              d={path}
              transform={`translate(110 110) scale(${scale}) translate(-110 -110)`}
              fill={`url(#${id}-material)`}
              fillOpacity={0.6 + i * 0.065}
              stroke={`url(#${id}-edge)`}
              strokeWidth={0.8 / scale}
            />
          </g>
        ))}
        <circle
          className="orb-core-glow"
          cx="110"
          cy="110"
          r="53"
          fill={`url(#${id}-core)`}
        />
        <circle
          className="orb-core"
          cx="110"
          cy="110"
          r="12"
          fill="var(--color-white)"
        />
      </g>
      {animated &&
        (["dots", "sparks"] as const).map((family) => (
          <g
            key={family}
            data-particle-family={family}
            className={`orb-particles orb-particles-${family}`}
          >
            {particles.map((particle, i) => (
              <g
                className="orb-particle"
                key={i}
                style={
                  {
                    "--particle-duration": `${particle.duration}s`,
                    "--particle-phase": `${particle.phase}s`,
                  } as CSSProperties
                }
              >
                {family === "dots" ? (
                  <circle
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size}
                    fill="currentColor"
                  />
                ) : (
                  <path
                    d={`M${particle.x} ${particle.y - particle.size * 2.2} Q${particle.x} ${particle.y} ${particle.x + particle.size * 2.2} ${particle.y} Q${particle.x} ${particle.y} ${particle.x} ${particle.y + particle.size * 2.2} Q${particle.x} ${particle.y} ${particle.x - particle.size * 2.2} ${particle.y} Q${particle.x} ${particle.y} ${particle.x} ${particle.y - particle.size * 2.2}Z`}
                    fill="var(--color-white)"
                  />
                )}
              </g>
            ))}
          </g>
        ))}
    </svg>
  );
}
