// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const sections = [
  [
    "/",
    "Registrar",
    "M12 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7 M16 3l5 5-10 10-5 1 1-5Z M14 5l5 5",
  ],
  ["/hoy", "Hoy", "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9 M12 7v5l3 2"],
  [
    "/calendario",
    "Calendario",
    "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M16 3v4M8 3v4M3 11h18 M8 15h.01M12 15h.01M16 15h.01",
  ],
] as const;

export default function Navigation() {
  const pathname = usePathname();
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    navigator.serviceWorker
      .register("/help-sw.js", { updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => registration.active?.postMessage("refresh-help"))
      .catch(() => {
        // Si el navegador impide la copia local, Ayuda sigue disponible online.
      });
  }, []);
  if (["/ingresar", "/crear-cuenta", "/cuenta"].includes(pathname)) return null;
  return (
    <nav
      aria-label="Secciones"
      className="app-navigation grid grid-cols-3 border-t border-line"
    >
      {sections.map(([href, label, path]) => {
        const active =
          pathname === href ||
          (href === "/" && pathname.startsWith("/registro/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`app-tab flex min-w-0 flex-col items-center justify-center gap-1 rounded-control text-center text-title hover:underline ${active ? "font-semibold text-action underline" : "text-muted"}`}
          >
            <svg
              className="size-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d={path} />
            </svg>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
