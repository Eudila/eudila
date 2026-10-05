// SPDX-License-Identifier: AGPL-3.0-only
export type Color = number[];
export type Points = number[][];
export const transitionDuration: number;
export function positionWeights(position: number): {
  lower: number;
  upper: number;
  fraction: number;
};
export function keyboardPosition(
  position: number,
  key: string,
): number | undefined;
export function organicPoints(points: Points, phase: number): Points;
export function brandEase(progress: number): number;
export function hexColor(value: string): Color;
export function mixColor(a: Color, b: Color, progress: number): Color;
export function mixPoints(a: Points, b: Points, progress: number): Points;
export function contrast(a: Color, b: Color): number;
export function accessibleInk(accent: Color, graphite: Color): Color;
