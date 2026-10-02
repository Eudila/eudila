// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Identidad visual · eudila" };

const colors = [
  ["primary", "Turquesa institucional"],
  ["action", "Acción con contraste"],
  ["cloud", "Nube"],
  ["graphite", "Grafito"],
  ["fog", "Niebla"],
  ["surface", "Superficie"],
  ["text", "Texto"],
  ["muted", "Texto secundario"],
  ["line", "Borde"],
  ["white", "Blanco"],
] as const;

const moods = [
  "Muy desagradable",
  "Desagradable",
  "Algo desagradable",
  "Neutral",
  "Algo agradable",
  "Agradable",
  "Muy agradable",
] as const;

const typography = [
  ["state", "Estado", "font-display font-bold", "Neutral"],
  ["question", "Pregunta", "font-display font-bold", "¿Cómo te sentís ahora?"],
  ["title", "Título", "font-sans font-semibold", "Emoción"],
  [
    "body",
    "Cuerpo",
    "font-sans font-normal",
    "Un momento para registrar lo que sentís.",
  ],
  [
    "caption",
    "Rótulo",
    "font-sans font-bold tracking-label",
    "DESAGRADABLE · AGRADABLE",
  ],
  [
    "wordmark",
    "Wordmark",
    "font-display font-extrabold tracking-brand",
    "eudila",
  ],
] as const;

const typeDetails = [
  ["--font-sans", "Texto e interfaz"],
  ["--font-display", "Preguntas y estados"],
  ["--font-weight-normal", "Regular"],
  ["--font-weight-semibold", "Semibold"],
  ["--font-weight-bold", "Bold"],
  ["--font-weight-extrabold", "Wordmark"],
  ["--leading-body", "Interlínea de cuerpo"],
  ["--leading-question", "Interlínea de pregunta"],
  ["--leading-wordmark", "Interlínea de wordmark"],
  ["--tracking-brand", "Tracking de marca"],
  ["--tracking-label", "Tracking de rótulo"],
] as const;

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <div data-token={token} className="min-w-0">
      <div
        aria-hidden="true"
        className="h-action rounded-control border border-line"
        style={{ backgroundColor: `var(${token})` }}
      />
      <p className="mt-2 font-semibold break-words">{label}</p>
      <code className="block font-sans text-title break-all text-muted">
        {token}
      </code>
    </div>
  );
}

export default function Tokens() {
  return (
    <main className="mx-auto max-w-gallery space-y-12 px-6 py-8">
      <header className="space-y-4">
        <Link
          href="/"
          className="inline-flex min-h-touch items-center text-action underline"
        >
          Volver al inicio
        </Link>
        <h1 className="font-display text-question leading-question font-bold tracking-brand break-words">
          Identidad de eudila
        </h1>
        <p className="text-muted">Paleta y medidas compartidas por la app.</p>
      </header>

      <section aria-labelledby="palette-title" className="space-y-6">
        <h2 id="palette-title" className="text-title font-semibold">
          Paleta de marca
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {colors.map(([token, label]) => (
            <Swatch key={token} token={`--color-${token}`} label={label} />
          ))}
        </div>
        <Link
          href="/"
          data-contrast
          className="inline-flex min-h-action items-center justify-center rounded-pill bg-action px-6 py-3 font-semibold text-white"
        >
          Ver inicio
        </Link>
        <p className="text-muted">
          El turquesa institucional se conserva. Las acciones usan una variante
          más oscura para que su texto sea legible.
        </p>
      </section>

      <section aria-labelledby="moods-title" className="space-y-8">
        <h2 id="moods-title" className="text-title font-semibold">
          Siete estados de ánimo
        </h2>
        {moods.map((label, index) => {
          const token = `--color-mood-${index + 1}`;
          return (
            <div key={label} className="space-y-4">
              <h3 className="font-semibold">
                {index + 1} · {label}
              </h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <Swatch token={token} label="Acento" />
                <Swatch token={`${token}-orb`} label="Orbe" />
                <Swatch token={`${token}-ambient`} label="Ambiente" />
                <Swatch token={`${token}-ink`} label="Texto sobre acento" />
              </div>
              <div className="flex flex-wrap gap-4">
                <p
                  data-contrast
                  className="min-w-0 rounded-pill px-4 py-3 font-semibold break-words"
                  style={{
                    backgroundColor: `var(${token})`,
                    color: `var(${token}-ink)`,
                  }}
                >
                  {label}
                </p>
                <p
                  data-contrast
                  className="rounded-control px-4 py-3 text-white"
                  style={{ backgroundColor: `var(${token}-ambient)` }}
                >
                  Texto sobre ambiente
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="type-title" className="space-y-6">
        <h2 id="type-title" className="text-title font-semibold">
          Tipografía
        </h2>
        {typography.map(([token, label, className, sample]) => (
          <div key={token} data-token={`--text-${token}`}>
            <p className="text-muted">
              {label} · <code className="font-sans">--text-{token}</code>
            </p>
            <p
              className={`${className} break-words`}
              style={{ fontSize: `var(--text-${token})` }}
            >
              {sample}
            </p>
          </div>
        ))}
        <dl className="grid gap-4 md:grid-cols-2">
          {typeDetails.map(([token, label]) => (
            <div key={token} data-token={token}>
              <dt className="font-semibold">{label}</dt>
              <dd className="break-all text-muted">
                <code className="font-sans">{token}</code>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="spacing-title" className="space-y-6">
        <h2 id="spacing-title" className="text-title font-semibold">
          Espaciado y áreas táctiles
        </h2>
        <div data-token="--spacing" className="space-y-4">
          {[1, 2, 3, 4, 6, 8, 12, 16].map((units) => (
            <div key={units} className="flex flex-wrap items-center gap-4">
              <div
                aria-hidden="true"
                className="h-2 bg-action"
                style={{ width: `calc(var(--spacing) * ${units})` }}
              />
              <span>
                {units} × <code className="font-sans">--spacing</code>
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6">
          {["touch", "action"].map((token) => (
            <div key={token} data-token={`--spacing-${token}`}>
              <div
                aria-hidden="true"
                className="rounded-control bg-action"
                style={{
                  width: `var(--spacing-${token})`,
                  height: `var(--spacing-${token})`,
                }}
              />
              <code className="block font-sans break-all text-muted">
                --spacing-{token}
              </code>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="composition-title" className="space-y-6">
        <h2 id="composition-title" className="text-title font-semibold">
          Anchos de composición
        </h2>
        {["phone", "gallery", "question", "copy"].map((token) => (
          <div key={token} data-token={`--container-${token}`}>
            <code className="font-sans break-all text-muted">
              --container-{token}
            </code>
            <div
              aria-hidden="true"
              className="mt-2 h-2 max-w-full bg-action"
              style={{ width: `var(--container-${token})` }}
            />
          </div>
        ))}
      </section>

      <section aria-labelledby="surfaces-title" className="space-y-6">
        <h2 id="surfaces-title" className="text-title font-semibold">
          Radios y sombra
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {["control", "dialog", "pill"].map((token) => (
            <div key={token} data-token={`--radius-${token}`}>
              <div
                aria-hidden="true"
                className="h-action border border-line"
                style={{ borderRadius: `var(--radius-${token})` }}
              />
              <code className="mt-2 block font-sans break-all text-muted">
                --radius-{token}
              </code>
            </div>
          ))}
        </div>
        <p
          data-token="--shadow-shell"
          className="rounded-control bg-surface p-6 shadow-shell"
        >
          <code className="font-sans break-all">--shadow-shell</code>
        </p>
      </section>
    </main>
  );
}
