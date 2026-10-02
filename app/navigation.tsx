// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  ["/", "Registrar"],
  ["/hoy", "Hoy"],
  ["/calendario", "Calendario"],
] as const;

export default function Navigation() {
  const pathname = usePathname();
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
