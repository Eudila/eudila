// SPDX-License-Identifier: AGPL-3.0-only
export const moods = [
  { label: "Muy desagradable", points: 9, depth: 0.27 },
  { label: "Desagradable", points: 14, depth: 0.17 },
  { label: "Algo desagradable", points: 12, depth: 0.08 },
  { label: "Neutral", points: 0, depth: 0 },
  { label: "Algo agradable", points: 1, depth: 0.14 },
  { label: "Agradable", points: 7, depth: 0.13 },
  { label: "Muy agradable", points: 9, depth: 0.19 },
];

const polar = (radius, angle) => [
  radius * Math.cos(angle),
  radius * Math.sin(angle),
];

function cubic(a, b, c, d, t) {
  const u = 1 - t;
  return a.map(
    (value, i) =>
      u ** 3 * value +
      3 * u ** 2 * t * b[i] +
      3 * u * t ** 2 * c[i] +
      t ** 3 * d[i],
  );
}

function closedCurve(nodes, progress, tension) {
  const position = progress * nodes.length;
  const index = Math.floor(position);
  const a = nodes[index % nodes.length],
    b = nodes[(index + 1) % nodes.length];
  const prev = nodes[(index + nodes.length - 1) % nodes.length],
    next = nodes[(index + 2) % nodes.length];
  const c1 = a.map((v, i) => v + ((b[i] - prev[i]) * tension) / 6);
  const c2 = b.map((v, i) => v - ((next[i] - a[i]) * tension) / 6);
  return cubic(a, c1, c2, b, position - index);
}

/** Same topology for morph; each family keeps its own outline construction. */
export function shapePoints(mood, count = 252) {
  const unpleasant =
    mood.points === 14 || (mood.points === 9 && mood.depth > 0.2);
  const nodes = unpleasant
    ? Array.from({ length: mood.points * 2 }, (_, i) =>
        polar(
          i % 2 ? (mood.points === 9 ? 65 : 75) : 96,
          (i * Math.PI) / mood.points - Math.PI / 2,
        ),
      )
    : [
        [0, -84],
        [62, -79],
        [84, -36],
        [91, 18],
        [69, 68],
        [12, 98],
        [-48, 73],
        [-86, 28],
        [-77, -35],
        [-48, -79],
      ];
  return Array.from({ length: count }, (_, index) => {
    const progress = index / count,
      angle = progress * Math.PI * 2 - Math.PI / 2;
    let point;
    if (unpleasant)
      point = closedCurve(nodes, progress, mood.points === 9 ? 0 : 0.6);
    else if (mood.points === 0) point = polar(88, angle);
    else if (mood.points === 12)
      point = polar(86 + 3.5 * Math.cos(12 * (angle + Math.PI / 2)), angle);
    else if (mood.points === 1) point = closedCurve(nodes, progress, 1);
    else {
      // Round outward petal arcs; inward joins stay distinct from star tips.
      const sector = (Math.PI * 2) / mood.points;
      const position = progress * mood.points,
        start = Math.floor(position) * sector - Math.PI / 2;
      point = cubic(
        polar(72, start),
        polar(111, start + sector * 0.22),
        polar(111, start + sector * 0.78),
        polar(72, start + sector),
        position % 1,
      );
    }
    return point.map((value) => value + 110);
  });
}

export function pathFromPoints(points) {
  return `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;
}

export function shapePath(mood) {
  return pathFromPoints(shapePoints(mood));
}
