// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "./ui";

const sections = [
  ["/", "Registrar", "edit"],
  ["/hoy", "Hoy", "clock"],
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
  if (
    [
      "/ingresar",
      "/crear-cuenta",
      "/cuenta",
      "/bienvenida",
      "/empezar",
      "/recuperar",
      "/actualizar-clave",
    ].includes(pathname)
  )
    return null;
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
            className={`app-tab flex min-w-0 flex-col items-center justify-center gap-1 rounded-control text-center text-title hover:underline ${active ? "font-semibold text-action" : "text-muted"}`}
          >
            <Icon name={icon} className="size-6" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
