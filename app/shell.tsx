// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useDraft } from "./registro/registro";
import { createMoodController } from "./mood/controller";
import { markBrandVisited } from "../shared/visual/intro.js";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { draft, ready, moodInput } = useDraft();
  const emotional = pathname === "/registro/animo";
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pathname !== "/") markBrandVisited();
  }, [pathname]);
  const controller = useRef<ReturnType<typeof createMoodController> | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!emotional || !ready || !root.current) return;
    const active = createMoodController(
      root.current,
      Number(root.current.dataset.moodPosition),
    );
    controller.current = active;
    return () => {
      active.destroy();
      controller.current = null;
    };
  }, [emotional, ready]);

  useLayoutEffect(() => {
    controller.current?.setPosition(moodInput.position, !moodInput.animate);
  }, [moodInput, emotional, ready]);

  return (
    <div
      ref={root}
      className="app-shell mx-auto grid max-w-phone bg-surface"
      data-mood={emotional ? draft.mood : undefined}
      data-mood-position={emotional ? moodInput.position : undefined}
      style={
        emotional
          ? ({
              "--mood-ambient": `var(--color-mood-${draft.mood}-ambient)`,
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
