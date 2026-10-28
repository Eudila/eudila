// SPDX-License-Identifier: AGPL-3.0-only
import paths from "./rueda-emociones.json" with { type: "json" };

export function emotionPath(id: string | null): string[] {
  if (!id) return [];
  const path = paths.find((route) => route.includes(id));
  return path ? path.slice(0, path.indexOf(id) + 1) : [];
}

export function emotionOptions(id: string | null, mood: number): string[] {
  const path = emotionPath(id);
  const families = [...new Set(paths.map((route) => route[0]))];
  const pleasant = families.slice(3);
  if (path.length === 3) return [id!];
  if (path.length) {
    return paths
      .filter((route) =>
        path.length === 1 && pleasant.includes(path[0])
          ? pleasant.includes(route[0])
          : route[0] === path[0],
      )
      .map((route) => route[path.length]);
  }
  return mood < 4
    ? families.slice(0, 3)
    : mood > 4
      ? families.slice(3)
      : families;
}

const alternatives = [
  "eceefb9f-2dec-58f4-b1a6-609a7e7c36ca",
  "f0d3a478-e3fa-5503-a6e2-3b58df5a9c15",
  "5ef2f8bc-a656-5d50-852f-67db0486cac4",
];

export function emotionAllowed(id: string, mood: number): boolean {
  return (
    alternatives.includes(id) ||
    emotionOptions(null, mood).includes(emotionPath(id)[0])
  );
}

export function emotionComplete(id: string | null, mood: number): boolean {
  if (!id) return false;
  return (
    alternatives.includes(id) ||
    (emotionPath(id).length === 3 && emotionAllowed(id, mood))
  );
}
