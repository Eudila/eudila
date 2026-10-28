// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "./ui";
import "./globals.css";

const figtree = localFont({
  src: "../../packages/brand/fonts/Figtree.ttf",
  variable: "--font-figtree",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Pacientes · eudila", template: "%s · eudila" },
  description:
    "Vista previa del panel de eudila para psicólogos, con datos ficticios.",
  // Vista previa con datos ficticios: no se indexa.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={figtree.variable}>
      <body>
        <p className="preview-note">
          <strong>Vista previa con datos ficticios.</strong> Ningún paciente ni
          registro es real y el panel todavía no accede a datos de la app.
        </p>
        <div className="wrap">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
