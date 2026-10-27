// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-6 px-6 py-8">
      <h1 className="font-display text-question leading-question font-bold tracking-brand text-balance">
        Esta página no está disponible.
      </h1>
      <Link
        href="/"
        className="inline-flex min-h-touch items-center text-action underline"
      >
        Volver a Registrar
      </Link>
    </div>
  );
}
