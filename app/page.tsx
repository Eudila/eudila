// SPDX-License-Identifier: AGPL-3.0-only
export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-8">
      <h1 className="font-display max-w-question text-question leading-question font-bold tracking-brand text-balance">
        ¿Cómo te sentís ahora?
      </h1>
      <p className="max-w-copy text-body leading-body text-muted">
        Un momento para registrar lo que sentís, a tu manera.
      </p>
    </div>
  );
}
