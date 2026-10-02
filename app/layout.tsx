// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import localFont from "next/font/local";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={figtree.variable}>
      <body>{children}</body>
    </html>
  );
}
