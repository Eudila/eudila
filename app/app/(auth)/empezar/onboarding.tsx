// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useRef, useState, type FormEvent } from "react";
import { completeOnboarding } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../auth/auth.css";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!step) {
      setStep(1);
      requestAnimationFrame(() => heading.current?.focus());
      return;
    }
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await completeOnboarding(name);
      if (result.error) setError(result.error);
      else {
        router.replace("/");
        router.refresh();
      }
    } catch {
      setError("No pudimos conectar. Tu nombre sigue acá; volvé a intentar.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <section className="auth-screen" aria-labelledby="onboarding-title">
        <p className="text-muted text-sm mb-6">
          Para empezar · {step + 1} de 2
        </p>
        <div className="auth-intro">
          <h1
            ref={heading}
            tabIndex={-1}
            id="onboarding-title"
            className="font-display text-question leading-question font-bold tracking-brand text-balance"
          >
            {step
              ? "Este espacio va a tu ritmo."
              : "¿Cómo querés que te llamemos?"}
          </h1>
          <p className="text-muted">
            {step
              ? "No hay una forma correcta de sentirse. Podés volver cuando lo necesites."
              : "Podés usar tu nombre, un apodo o dejarlo para después."}
          </p>
        </div>
        <form className="auth-form" onSubmit={submit} aria-busy={busy}>
          {!step ? (
            <div className="auth-field">
              <label htmlFor="display-name" className="font-semibold">
                Nombre o apodo{" "}
                <span className="font-normal text-muted">(opcional)</span>
              </label>
              <input
                id="display-name"
                autoComplete="nickname"
                maxLength={60}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          ) : (
            <ol className="onboarding-steps">
              <li>
                <strong>Hacé una pausa.</strong>
                <p>
                  Elegí el momento y el ánimo que más se acerque a lo que
                  sentís.
                </p>
              </li>
              <li>
                <strong>Encontrá tus palabras.</strong>
                <p>
                  Elegí una emoción. Los factores son opcionales y podés decir
                  «No sé».
                </p>
              </li>
              <li>
                <strong>Volvé cuando quieras.</strong>
                <p>
                  Esta versión ya guarda tu cuenta y tus preferencias. El
                  guardado de registros en tu cuenta todavía está en
                  preparación.
                </p>
              </li>
            </ol>
          )}
          {error && (
            <p role="alert" className="auth-notice">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="action action-primary"
          >
            {busy ? "Guardando…" : step ? "Empezar" : "Continuar"}
          </button>
          {step ? (
            <button
              type="button"
              disabled={busy}
              className="action action-text"
              onClick={() => setStep(0)}
            >
              Volver
            </button>
          ) : (
            <button
              type="button"
              className="action action-text"
              onClick={() => {
                setName("");
                setStep(1);
                requestAnimationFrame(() => heading.current?.focus());
              }}
            >
              Ahora no
            </button>
          )}
        </form>
        <Link href="/cuenta" className="auth-back">
          Mi cuenta
        </Link>
      </section>
    </>
  );
}
