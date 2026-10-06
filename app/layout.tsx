// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Image from "next/image";
import Icon from "./icons";
import manifest from "./manifest.json";
import Navigation from "./navigation";
import AppShell from "./shell";
import { RegistroProvider } from "./registro/registro";
import { HistoryProvider } from "./historial/state";
import { previewEnabled } from "./frontend-preview";
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

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: manifest.theme_color,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={figtree.variable}>
      <body>
        <HistoryProvider>
          <RegistroProvider>
            <AppShell>
              <div>
                <header className="app-header flex flex-wrap items-center justify-between">
                  <a
                    href="#contenido"
                    className="app-skip-link sr-only min-h-touch text-action underline focus:not-sr-only"
                  >
                    Ir al contenido
                  </a>
                  <div className="app-brand">
                    <Image
                      src="/brand/icon.svg"
                      width={40}
                      height={40}
                      alt=""
                      unoptimized
                    />
                    <p className="font-display text-wordmark leading-wordmark font-bold tracking-wordmark">
                      eudila
                    </p>
                  </div>
                  <Link
                    href="/ayuda"
                    prefetch={false}
                    className="app-help action action-primary text-title"
                  >
                    <Icon name="help" />
                    Ayuda ahora
                  </Link>
                </header>
                {previewEnabled && (
                  <div data-frontend-preview>
                    <button
                      type="button"
                      popoverTarget="preview-notice"
                      className="app-preview-toggle block w-full border-y border-line bg-action/5 text-left text-muted underline"
                    >
                      <strong>Vista previa</strong> · En esta pestaña
                    </button>
                    <div
                      id="preview-notice"
                      popover="auto"
                      className="preview-notice rounded-control border border-line bg-surface text-text"
                      role="note"
                      aria-labelledby="preview-notice-title"
                    >
                      <h2 id="preview-notice-title" className="font-semibold">
                        Sobre la vista previa
                      </h2>
                      <p className="my-3">
                        Los registros se conservan solo en esta pestaña. Al
                        cerrarla, se pierden. Los ejemplos se cargan cuando vos
                        los elegís.
                      </p>
                      <button
                        type="button"
                        popoverTarget="preview-notice"
                        popoverTargetAction="hide"
                        className="app-help text-action underline"
                      >
                        Cerrar aviso de vista previa
                      </button>
                    </div>
                  </div>
                )}
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
          </RegistroProvider>
        </HistoryProvider>
      </body>
    </html>
  );
}
