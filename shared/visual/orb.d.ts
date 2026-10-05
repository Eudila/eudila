// SPDX-License-Identifier: AGPL-3.0-only
export type SvgNode = {
  tag: string;
  attrs: Record<string, unknown>;
  children: SvgNode[];
};
export function orbTree(
  level: number,
  id: string,
  animated?: boolean,
  className?: string,
): SvgNode;
export function orbMarkup(
  level: number,
  id: string,
  animated?: boolean,
  className?: string,
): string;
