// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import Intro from "../empezar/intro";
import { authClient } from "../../auth/client";
import { authConfigured, googleEnabled } from "../../auth/config";
import { authError } from "../../auth/errors";
import "../../auth/auth.css";

export default function Welcome({ intro: opener }: { intro: boolean }) {
  const [intro, setIntro] = useState(opener);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const inFlight = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  async function google() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setNotice("");
    try {
      const { data, error } = await authClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });
      if (error) setNotice(authError(error));
      else if (data.url) window.location.assign(data.url);
    } catch {
      setNotice("No pudimos conectar. Revisá tu conexión y volvé a intentar.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      {intro && (
        <Intro
          onDone={(played) => {
            if (!played) return setIntro(false);
            // Release inert before moving focus to the welcome title.
            flushSync(() => setIntro(false));
            heading.current?.focus();
          }}
        />
      )}
      <section
        className="auth-screen auth-access auth-gateway"
        aria-labelledby="welcome-title"
        inert={intro}
        data-opener={opener || undefined}
      >
        <div className="auth-intro">
          <h1
            ref={heading}
            id="welcome-title"
            tabIndex={-1}
            className="font-display text-question leading-question font-bold tracking-brand text-balance"
          >
            Un momento para vos.
          </h1>
          <p className="text-muted">Elegí cómo querés entrar.</p>
        </div>
        <button
          type="button"
          className="action action-secondary auth-google"
          onClick={google}
          disabled={busy || !authConfigured || !googleEnabled}
          aria-busy={busy}
          aria-describedby={!googleEnabled ? "google-status" : undefined}
          title={
            !googleEnabled ? "Google todavía no está habilitado" : undefined
          }
        >
          <Image
            src="/brand/google-g.png"
            alt=""
            width={20}
            height={20}
            className="size-5 shrink-0 object-contain"
            unoptimized
          />
          {busy ? "Conectando…" : "Continuar con Google"}
        </button>
        <Link href="/ingresar" className="action action-primary">
          Ingresar
        </Link>
        <Link href="/crear-cuenta" className="action action-secondary">
          Registrarse
        </Link>
        {!googleEnabled && (
          <p id="google-status" className="sr-only">
            Google todavía no está habilitado. Podés ingresar o registrarte con
            email.
          </p>
        )}
        <div role="status" aria-live="polite" aria-atomic="true">
          {notice && <p className="auth-notice">{notice}</p>}
        </div>
      </section>
    </>
  );
}
