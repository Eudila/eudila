// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useDraft } from "./registro/registro";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { draft } = useDraft();
  const emotional = pathname === "/registro/animo";

  return (
    <div
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
