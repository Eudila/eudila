// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Image from "next/image";
import Navigation from "./navigation";
import { Icon } from "./ui";
import AppShell from "./shell";
import SessionScope from "./auth/session-scope";
import "./globals.css";

const figtree = localFont({
  src: "../prototype/fonts/Figtree.ttf",
  variable: "--font-figtree",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "eudila",
  description: "Un momento para registrar lo que sentís, a tu manera.",
};

export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={figtree.variable}>
      <body>
        <SessionScope>
          <AppShell>
            <div>
              <header className="app-header flex flex-wrap items-center justify-between">
                <a
                  href="#contenido"
                  className="sr-only min-h-touch text-action underline focus:not-sr-only"
                >
                  Ir al contenido
                </a>
                <p className="app-brand inline-flex items-center font-display text-wordmark leading-wordmark font-bold tracking-wordmark">
                  {/* Static on purpose: the header logo never moves, hops or sparkles. */}
                  <span className="app-logo">
                    <Image
                      src="/brand/logo-mascota.svg"
                      width={72}
                      height={72}
                      alt=""
                      unoptimized
                      className="size-full"
                    />
                  </span>
                  <span>eudila</span>
                </p>
                <Link
                  href="/ayuda"
                  prefetch={false}
                  className="app-help action action-primary text-title"
                >
                  <Icon name="phone" className="size-4" />
                  Ayuda ahora
                </Link>
              </header>
            </div>
            <main
              id="contenido"
              tabIndex={-1}
              className="flex min-h-0 flex-col overflow-y-auto"
            >
              {children}
            </main>
            <Navigation />
          </AppShell>
        </SessionScope>
      </body>
    </html>
  );
}
