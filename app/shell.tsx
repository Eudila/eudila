// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useDraft } from "./registro/registro";
import { createMoodController } from "./mood/controller";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { draft, ready } = useDraft();
  const emotional = pathname === "/registro/animo";
  const root = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createMoodController> | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!emotional || !ready || !root.current) return;
    const active = createMoodController(
      root.current,
      Number(root.current.dataset.mood),
    );
    controller.current = active;
    return () => {
      active.destroy();
      controller.current = null;
    };
  }, [emotional, ready]);

  useLayoutEffect(() => {
    controller.current?.setLevel(draft.mood);
  }, [draft.mood, emotional, ready]);

  return (
    <div
      ref={root}
      className="app-shell mx-auto grid max-w-phone bg-surface"
      data-mood={emotional ? draft.mood : undefined}
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
