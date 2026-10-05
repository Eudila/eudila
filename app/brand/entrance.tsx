// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useEffect, useRef } from "react";
import MoodOrb from "../mood/orb";
import { playBrandIntro } from "../../shared/visual/intro.js";

export default function BrandEntrance() {
  const symbol = useRef<HTMLDivElement>(null);
  useEffect(() => playBrandIntro(symbol.current), []);
  return (
    <div ref={symbol} className="home-orb" aria-hidden="true">
      <MoodOrb level={4} />
    </div>
  );
}
