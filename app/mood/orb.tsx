// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { createElement, useId, type ReactElement } from "react";
import { orbTree, type SvgNode } from "../../shared/visual/orb.js";

function renderNode(
  { tag, attrs, children }: SvgNode,
  key: number = 0,
): ReactElement {
  return createElement(
    tag,
    { ...attrs, key },
    children.map((child, i) => renderNode(child, i)),
  );
}

export default function MoodOrb({
  level,
  animated = false,
  className = "",
}: {
  level: number;
  animated?: boolean;
  className?: string;
}) {
  const id = useId();
  return renderNode(orbTree(level, id, animated, className));
}
