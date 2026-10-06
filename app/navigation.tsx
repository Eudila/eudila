// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import Icon, { type IconName } from "./icons";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const sections = [
  ["/", "Registrar", "register"],
  ["/hoy", "Hoy", "today"],
  ["/calendario", "Calendario", "calendar"],
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
      {sections.map(([href, label, icon]) => {
        const active =
          pathname === href ||
          (href === "/" && pathname.startsWith("/registro/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`app-tab flex min-w-0 items-center justify-center rounded-control text-center text-title hover:underline ${active ? "font-semibold text-action underline" : "text-muted"}`}
          >
            <Icon name={icon as IconName} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
