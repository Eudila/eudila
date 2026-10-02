// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hoy · eudila" };

export default function Today() {
  return (
    <div className="space-y-6 px-6 py-8">
      <h1 className="font-display text-question leading-question font-bold tracking-brand text-balance">
        Hoy
      </h1>
      <p className="text-muted">
        El resumen de tus registros del día estará disponible próximamente.
      </p>
    </div>
  );
}
