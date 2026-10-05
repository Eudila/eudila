// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import BrandEntrance from "./brand/entrance";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-8">
      <BrandEntrance />
      <h1 className="font-display max-w-question text-question leading-question font-bold tracking-brand text-balance">
        ¿Cómo te sentís ahora?
      </h1>
      <p className="max-w-copy text-body leading-body text-muted">
        Un momento para registrar lo que sentís, a tu manera.
      </p>
      <Link href="/registro/tipo" className="action action-primary">
        Empezar registro
      </Link>
      <Link href="/ingresar" className="action action-text">
        Ingresar o crear cuenta
      </Link>
    </div>
  );
}
