// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import "./auth.css";

type Mode = "ingresar" | "crear-cuenta";

export default function AuthForm({ mode }: { mode: Mode }) {
  const signup = mode === "crear-cuenta";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [notice, setNotice] = useState("");
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Ingresá tu email.";
    else if (!emailInput.current?.validity.valid)
      next.email = "Revisá el email. Por ejemplo: vos@correo.com.";
    if (!password) next.password = "Ingresá tu contraseña.";
    setErrors(next);
    if (next.email || next.password) {
      (next.email ? emailInput : passwordInput).current?.focus();
      return;
    }
    // Solo frontend: no enviar, guardar ni simular credenciales o sesiones.
    setPassword("");
    setVisible(false);
    setNotice(
      signup
        ? "El acceso todavía no está disponible. No creamos una cuenta ni guardamos tu contraseña."
        : "El acceso todavía no está disponible. No iniciamos una sesión ni guardamos tu contraseña.",
    );
  }

  return (
    <section className="auth-screen" aria-labelledby="auth-title">
      <div className="auth-intro">
        <h1
          id="auth-title"
          className="font-display text-question leading-question font-bold tracking-brand text-balance"
        >
          {signup ? "Creá tu cuenta" : "Ingresá a eudila"}
        </h1>
        <p className="text-muted">
          {signup
            ? "Solo necesitás tu email y una contraseña."
            : "Un espacio para registrar lo que sentís."}
        </p>
      </div>
      <p className="auth-availability">
        El acceso con cuenta estará disponible próximamente.
      </p>
      <form noValidate onSubmit={submit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="auth-email" className="font-semibold">
            Email
          </label>
          <input
            ref={emailInput}
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((previous) => ({ ...previous, email: undefined }));
              setNotice("");
            }}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "auth-email-error" : undefined}
          />
          {errors.email && (
            <p id="auth-email-error" className="auth-error">
              {errors.email}
            </p>
          )}
        </div>
        <div className="auth-field">
          <label htmlFor="auth-password" className="font-semibold">
            Contraseña
          </label>
          <div className="auth-password">
            <input
              ref={passwordInput}
              id="auth-password"
              name="password"
              type={visible ? "text" : "password"}
              autoComplete={signup ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((previous) => ({ ...previous, password: undefined }));
                setNotice("");
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "auth-password-error" : undefined
              }
            />
            <button
              type="button"
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={visible}
              aria-controls="auth-password"
              onClick={() => setVisible((previous) => !previous)}
            >
              {visible ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {errors.password && (
            <p id="auth-password-error" className="auth-error">
              {errors.password}
            </p>
          )}
        </div>
        <div aria-live="polite" aria-atomic="true" role="status">
          {notice && <p className="auth-notice">{notice}</p>}
        </div>
        <button type="submit" className="auth-primary">
          {signup ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>
      <p className="auth-switch">
        {signup ? "¿Ya tenés cuenta?" : "¿Es tu primera vez?"}{" "}
        <Link href={signup ? "/ingresar" : "/crear-cuenta"}>
          {signup ? "Ingresar" : "Crear cuenta"}
        </Link>
      </p>
      <Link href="/" className="auth-back">
        Volver al inicio
      </Link>
    </section>
  );
}
