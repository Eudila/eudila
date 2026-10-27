// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useDraft } from "./(paciente)/registro/registro";
import { createMoodController } from "@eudila/mood/controller.ts";
import { moodActionStyle } from "./actions";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { draft, ready, moodInput } = useDraft();
  const emotional = pathname === "/registro/animo";
  // Steps after the slider keep the chosen mood's ambient as context.
  const tinted =
    emotional ||
    ["emocion", "factores", "confirmacion"].some(
      (step) => pathname === `/registro/${step}`,
    );
  const root = useRef<HTMLDivElement>(null);
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

  // <main> is the scroller, so Next's window scroll reset never reaches it.
  useLayoutEffect(() => {
    document.getElementById("contenido")?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      ref={root}
      className="app-shell mx-auto grid max-w-phone"
      data-mood={emotional ? draft.mood : undefined}
      data-mood-position={emotional ? moodInput.position : undefined}
      data-tint={tinted ? draft.mood : undefined}
      style={
        tinted
          ? ({
              "--mood-base": `var(--color-mood-${draft.mood}-ambient)`,
              "--mood-orb": `var(--color-mood-${draft.mood}-orb)`,
              "--mood-floor": "var(--color-mood-bottom)",
              "--glow": 0,
              // The slider's own CTA carries this; later steps inherit it.
              ...(emotional ? {} : moodActionStyle(draft.mood)),
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
