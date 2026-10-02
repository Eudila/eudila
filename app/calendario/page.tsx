// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendario · eudila" };

export default function Calendar() {
  return (
    <div className="space-y-6 px-6 py-8">
      <h1 className="font-display text-question leading-question font-bold tracking-brand text-balance">
        Calendario
      </h1>
      <p className="text-muted">
        Acá podrás consultar tus registros por día. El calendario estará
        disponible próximamente.
      </p>
    </div>
  );
}
