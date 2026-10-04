// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const sections = [
  ["/", "Registrar"],
  ["/hoy", "Hoy"],
  ["/calendario", "Calendario"],
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
  return (
    <nav
      aria-label="Secciones"
      className="app-navigation grid grid-cols-3 gap-2 border-t border-line px-2 pt-2"
    >
      {sections.map(([href, label]) => {
        const active =
          pathname === href ||
          (href === "/" && pathname.startsWith("/registro/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-action min-w-0 items-center justify-center rounded-control px-2 py-3 text-center text-title hover:underline ${active ? "font-semibold text-action underline" : "text-muted"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
