// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Navigation from "./navigation";
import { RegistroProvider } from "./registro/registro";
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
        <RegistroProvider>
          <div className="app-shell mx-auto grid max-w-phone bg-surface">
            <header className="app-header flex flex-wrap items-center justify-between gap-3 px-6 pb-3">
              <a
                href="#contenido"
                className="sr-only min-h-touch text-action underline focus:not-sr-only"
              >
                Ir al contenido
              </a>
              <p className="font-display text-wordmark leading-wordmark font-extrabold tracking-brand">
                eudila
              </p>
              <Link
                href="/ayuda"
                prefetch={false}
                className="inline-flex min-h-touch max-w-full items-center justify-center rounded-pill bg-action px-4 py-3 text-title font-semibold text-white hover:underline"
              >
                Ayuda ahora
              </Link>
            </header>
            <main
              id="contenido"
              tabIndex={-1}
              className="flex min-h-0 flex-col overflow-y-auto"
            >
              {children}
            </main>
            <Navigation />
          </div>
        </RegistroProvider>
      </body>
    </html>
  );
}
