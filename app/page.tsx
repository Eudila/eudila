// SPDX-License-Identifier: AGPL-3.0-only
export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-phone flex-col px-6">
      <header className="py-6">
        <p className="font-display text-wordmark leading-wordmark font-extrabold tracking-brand">
          eudila
        </p>
      </header>
      <main className="flex flex-1 flex-col justify-center gap-6 pb-16">
        <h1 className="font-display max-w-question text-question leading-question font-bold tracking-brand text-balance">
          ¿Cómo te sentís ahora?
        </h1>
        <p className="max-w-copy text-body leading-body text-muted">
          Un momento para registrar lo que sentís, a tu manera.
        </p>
      </main>
    </div>
  );
}
