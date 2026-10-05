// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-8">
      <h1 className="font-display max-w-question text-question leading-question font-bold tracking-brand text-balance">
        ¿Cómo te sentís ahora?
      </h1>
      <p className="max-w-copy text-body leading-body text-muted">
        Un momento para registrar lo que sentís, a tu manera.
      </p>
      <Link
        href="/registro/tipo"
        className="inline-flex min-h-action items-center justify-center rounded-control bg-action px-6 py-3 font-semibold text-white hover:underline"
      >
        Empezar registro
      </Link>
      <Link
        href="/ingresar"
        className="inline-flex min-h-touch items-center justify-center text-action underline"
      >
        Ingresar o crear cuenta
      </Link>
    </div>
  );
}
