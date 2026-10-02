// SPDX-License-Identifier: AGPL-3.0-only
export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-[520px] flex-col px-6">
      <header className="py-6">
        <p className="font-display text-3xl font-extrabold tracking-[-0.035em]">
          eudila
        </p>
      </header>
      <main className="flex flex-1 flex-col justify-center gap-6 pb-16">
        <h1 className="font-display max-w-[12ch] text-4xl leading-tight font-bold tracking-[-0.035em] text-balance">
          ¿Cómo te sentís ahora?
        </h1>
        <p className="max-w-[32ch] text-lg leading-relaxed text-muted">
          Un momento para registrar lo que sentís, a tu manera.
        </p>
      </main>
    </div>
  );
}
