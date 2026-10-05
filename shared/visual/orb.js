// SPDX-License-Identifier: AGPL-3.0-only
import { moods, shapePath } from "./moods.js";

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

const node = (tag, attrs = {}, children = []) => ({ tag, attrs, children });
const stop = (offset, color, opacity) =>
  node("stop", { offset, stopColor: color, stopOpacity: opacity });
const white = "var(--color-white)";

/** Shared scene definition. Adapters only translate nodes, never visual decisions. */
export function orbTree(level, id, animated = false, className = "") {
  level = Math.max(
    1,
    Math.min(7, Math.round(Number.isFinite(level) ? level : 4)),
  );
  id = String(id).replace(/[^a-z0-9_-]/gi, "") || "orb";
  const path = shapePath(moods[level - 1]);
  const defs = [
    node(
      "radialGradient",
      { id: `${id}-material`, cx: "48%", cy: "46%", r: "60%" },
      [
        stop("0%", white, ".76"),
        stop("34%", white, ".28"),
        stop("72%", "currentColor", ".62"),
        stop("100%", "currentColor", ".38"),
      ],
    ),
    node(
      "radialGradient",
      { id: `${id}-edge`, cx: "38%", cy: "24%", r: "85%" },
      [stop("0%", white, ".76"), stop("100%", "currentColor", ".3")],
    ),
    node("radialGradient", { id: `${id}-core` }, [
      stop("0%", white),
      stop("22%", white, ".96"),
      stop("62%", white, ".28"),
      stop("100%", white, "0"),
    ]),
  ];
  if (animated)
    defs.push(
      node(
        "filter",
        {
          id: `${id}-glow`,
          x: "-40%",
          y: "-40%",
          width: "180%",
          height: "180%",
          colorInterpolationFilters: "sRGB",
        },
        [node("feGaussianBlur", { stdDeviation: "7" })],
      ),
    );
  const body = [];
  if (animated)
    body.push(
      node("path", {
        "data-orb-shape": true,
        d: path,
        fill: "currentColor",
        opacity: ".38",
        filter: `url(#${id}-glow)`,
      }),
    );
  layers.forEach((scale, i) =>
    body.push(
      node(
        "g",
        {
          className: "orb-turn",
          style: { "--orb-phase": `${-i * 11}s` },
        },
        [
          node("path", {
            className: "orb-layer",
            "data-orb-shape": animated || undefined,
            d: path,
            transform: `translate(110 110) scale(${scale}) translate(-110 -110)`,
            fill: `url(#${id}-material)`,
            fillOpacity: 0.6 + i * 0.065,
            stroke: `url(#${id}-edge)`,
            strokeWidth: 0.8 / scale,
          }),
        ],
      ),
    ),
  );
  body.push(
    node("circle", {
      className: "orb-core-glow",
      cx: "110",
      cy: "110",
      r: "53",
      fill: `url(#${id}-core)`,
    }),
  );
  body.push(
    node("circle", {
      className: "orb-core",
      cx: "110",
      cy: "110",
      r: "12",
      fill: white,
    }),
  );
  const children = [
    node("defs", {}, defs),
    node("g", { className: animated ? "orb-breath" : undefined }, body),
  ];
  if (animated)
    for (const family of ["dots", "sparks"]) {
      children.push(
        node(
          "g",
          {
            "data-particle-family": family,
            className: `orb-particles orb-particles-${family}`,
          },
          particles.map((p) =>
            node(
              "g",
              {
                className: "orb-particle",
                style: {
                  "--particle-duration": `${p.duration}s`,
                  "--particle-phase": `${p.phase}s`,
                },
              },
              [
                family === "dots"
                  ? node("circle", {
                      cx: p.x,
                      cy: p.y,
                      r: p.size,
                      fill: "currentColor",
                    })
                  : node("path", {
                      d: `M${p.x} ${p.y - p.size * 2.2} Q${p.x} ${p.y} ${p.x + p.size * 2.2} ${p.y} Q${p.x} ${p.y} ${p.x} ${p.y + p.size * 2.2} Q${p.x} ${p.y} ${p.x - p.size * 2.2} ${p.y} Q${p.x} ${p.y} ${p.x} ${p.y - p.size * 2.2}Z`,
                      fill: white,
                    }),
              ],
            ),
          ),
        ),
      );
    }
  return node(
    "svg",
    {
      viewBox: "-14 -14 248 248",
      "aria-hidden": "true",
      className: `orb-scene ${className}`,
      "data-animated": animated || undefined,
      style: {
        color: animated
          ? `var(--mood-orb-color, var(--color-mood-${level}-orb))`
          : `var(--color-mood-${level}-orb)`,
      },
    },
    children,
  );
}

const svgNames = {
  className: "class",
  stopColor: "stop-color",
  stopOpacity: "stop-opacity",
  fillOpacity: "fill-opacity",
  strokeWidth: "stroke-width",
  colorInterpolationFilters: "color-interpolation-filters",
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

/** Static prototype adapter. All attribute values are escaped, including IDs/classes. */
export function orbMarkup(level, id, animated = false, className = "") {
  function markup({ tag, attrs, children }) {
    const attributes = Object.entries(attrs)
      .filter(([, v]) => v !== undefined)
      .map(([name, value]) => {
        if (name === "style")
          value = Object.entries(value)
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
        return `${svgNames[name] || name}="${escape(value)}"`;
      })
      .join(" ");
    return `<${tag}${attributes ? " " + attributes : ""}>${children.map(markup).join("")}</${tag}>`;
  }
  return markup(orbTree(level, id, animated, className));
}
