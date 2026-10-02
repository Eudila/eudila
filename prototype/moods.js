// SPDX-License-Identifier: AGPL-3.0-only
export const moods = [
  { label: "Muy desagradable", accent: "#892FC9", orb: "#A845DA", ambient: "#32134D", points: 9, depth: .27, lightInk: true },
  { label: "Desagradable", accent: "#5B4CE1", orb: "#8A68D8", ambient: "#26235B", points: 14, depth: .17, lightInk: true },
  { label: "Algo desagradable", accent: "#209AE7", orb: "#3BBADF", ambient: "#123F60", points: 12, depth: .08, lightInk: false },
  { label: "Neutral", accent: "#2EC0BC", orb: "#5FD3D0", ambient: "#0F5654", points: 0, depth: 0, lightInk: false },
  { label: "Algo agradable", accent: "#77CB47", orb: "#B6D57A", ambient: "#285B25", points: 1, depth: .14, lightInk: false },
  { label: "Agradable", accent: "#FE9613", orb: "#F2B24A", ambient: "#6C3B0B", points: 7, depth: .13, lightInk: false },
  { label: "Muy agradable", accent: "#FF4A4B", orb: "#E65175", ambient: "#712127", points: 9, depth: .19, lightInk: false }
];

export function shapePath(mood) {
  const points = Array.from({ length: 120 }, (_, index) => {
    const angle = (index / 120) * Math.PI * 2 - Math.PI / 2;
    const wave = mood.points === 1 ? Math.sin(angle) : Math.cos(mood.points * angle);
    const radius = 82 * (1 + mood.depth * wave);
    return `${(110 + Math.cos(angle) * radius).toFixed(1)} ${(110 + Math.sin(angle) * radius).toFixed(1)}`;
  });
  return `M${points.join("L")}Z`;
}
