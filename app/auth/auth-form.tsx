// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Icon } from "../ui";
import { authClient } from "./client";
import { authConfigured } from "./config";
import { authError } from "./errors";
import "./auth.css";

type Mode = "ingresar" | "crear-cuenta" | "recuperar" | "actualizar";

export default function AuthForm({
  mode,
  invalidLink = false,
}: {
  mode: Mode;
  invalidLink?: boolean;
}) {
  const router = useRouter();
  const signup = mode === "crear-cuenta";
  const recovery = mode === "recuperar";
  const update = mode === "actualizar";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmation?: string;
  }>({});
  const [notice, setNotice] = useState(
    invalidLink
      ? "El enlace venció, ya fue usado o no es válido. Pedí uno nuevo para continuar."
      : "",
  );
  const [sent, setSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const confirmationInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const title = sent
    ? "Revisá tu email"
    : signup
      ? "Creá tu cuenta"
      : recovery
        ? "Recuperá tu acceso"
        : update
          ? "Elegí una nueva contraseña"
          : "Ingresá a eudila";
  const action = signup
    ? "Crear cuenta"
    : recovery
      ? "Enviar enlace"
      : update
        ? "Guardar contraseña"
        : "Ingresar";

  async function run(task: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setNotice("");
    try {
      await task();
    } catch {
      setNotice(
        authConfigured
          ? "No pudimos conectar. Revisá tu conexión y volvé a intentar."
          : "El acceso todavía no está disponible. Volvé a intentar más tarde.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!update) {
      if (!email.trim()) next.email = "Ingresá tu email.";
      else if (!emailInput.current?.validity.valid)
        next.email = "Revisá el email. Por ejemplo: vos@correo.com.";
    }
    if (!recovery) {
      if (!password) next.password = "Ingresá tu contraseña.";
      else if ((signup || update) && password.length < 8)
        next.password = "Usá al menos 8 caracteres.";
      if (update && password !== confirmation)
        next.confirmation = "Las contraseñas no coinciden.";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      (next.email
        ? emailInput
        : next.password
          ? passwordInput
          : confirmationInput
      ).current?.focus();
      return;
    }
    void run(async () => {
      const client = authClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      if (recovery) {
        const { error } = await client.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo },
        );
        if (error) {
          setNotice(authError(error));
          return;
        }
      } else if (signup) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) {
          setNotice(authError(error));
          return;
        }
        if (data.session) {
          router.replace("/registro/tipo");
          router.refresh();
          return;
        }
      } else if (update) {
        const { error } = await client.auth.updateUser({ password });
        if (error) {
          setNotice(authError(error));
          return;
        }
        setPassword("");
        setConfirmation("");
        router.replace("/cuenta?clave=actualizada");
        router.refresh();
        return;
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setNotice(authError(error));
          setCanResend(error.code === "email_not_confirmed");
          return;
        }
        router.replace("/registro/tipo");
        router.refresh();
        return;
      }
      setPassword("");
      setVisible(false);
      setSent(true);
      requestAnimationFrame(() => heading.current?.focus());
    });
  }

  function resend() {
    void run(async () => {
      const client = authClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = recovery
        ? await client.auth.resetPasswordForEmail(email.trim(), { redirectTo })
        : await client.auth.resend({
            type: "signup",
            email: email.trim(),
            options: { emailRedirectTo: redirectTo },
          });
      setNotice(
        error
          ? authError(error)
          : "Si hay una cuenta pendiente para ese email, vas a recibir un nuevo enlace. Revisá también correo no deseado.",
      );
    });
  }

  return (
    <section className="auth-screen auth-access" aria-labelledby="auth-title">
      <div className="auth-intro">
        <h1
          ref={heading}
          tabIndex={-1}
          id="auth-title"
          className="font-display text-question leading-question font-bold tracking-brand text-balance"
        >
          {title}
        </h1>
        <p className="text-muted">
          {sent
            ? `Si ${email.trim()} puede recibir este enlace, te lo enviamos. Revisá también correo no deseado.`
            : signup
              ? "Un espacio propio para registrar lo que sentís."
              : recovery
                ? "Te enviamos un enlace para elegir una nueva contraseña."
                : update
                  ? "Usá una contraseña que no uses en otros sitios."
                  : "Qué bueno tenerte por acá. Continuá a tu ritmo."}
        </p>
      </div>
      {!authConfigured && (
        <p className="auth-availability">
          El acceso con cuenta no está configurado en este entorno.
        </p>
      )}
      {sent ? (
        <div className="auth-form">
          <p className="text-muted">
            {recovery
              ? "Abrí el enlace del correo para recuperar tu acceso."
              : "Confirmá tu email desde el enlace del correo para continuar. Si ya tenés cuenta, podés ingresar."}
          </p>
          <button
            type="button"
            className="action action-secondary"
            onClick={resend}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? "Enviando…" : "Reenviar enlace"}
          </button>
          <button
            type="button"
            className="action action-text"
            onClick={() => {
              setSent(false);
              setNotice("");
            }}
            disabled={busy}
          >
            Usar otro email
          </button>
        </div>
      ) : (
        <>
          <form
            noValidate
            onSubmit={submit}
            className="auth-form"
            aria-busy={busy}
          >
            {!update && (
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
                  maxLength={254}
                  value={email}
                  disabled={busy}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      email: undefined,
                    }));
                    setCanResend(false);
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "auth-email-error" : undefined
                  }
                />
                {errors.email && (
                  <p id="auth-email-error" className="auth-error">
                    {errors.email}
                  </p>
                )}
              </div>
            )}
            {!recovery && (
              <div className="auth-field">
                <label htmlFor="auth-password" className="font-semibold">
                  {update ? "Nueva contraseña" : "Contraseña"}
                </label>
                <div className="auth-password">
                  <input
                    ref={passwordInput}
                    id="auth-password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete={
                      signup || update ? "new-password" : "current-password"
                    }
                    required
                    minLength={signup || update ? 8 : undefined}
                    value={password}
                    disabled={busy}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((previous) => ({
                        ...previous,
                        password: undefined,
                      }));
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password
                        ? "auth-password-error"
                        : signup || update
                          ? "auth-password-hint"
                          : undefined
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      visible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={visible}
                    aria-controls="auth-password"
                    title={
                      visible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setVisible((previous) => !previous)}
                  >
                    <Icon name={visible ? "eyeOff" : "eye"} />
                  </button>
                </div>
                {(signup || update) && (
                  <p id="auth-password-hint" className="text-muted text-sm">
                    Al menos 8 caracteres.
                  </p>
                )}
                {errors.password && (
                  <p id="auth-password-error" className="auth-error">
                    {errors.password}
                  </p>
                )}
              </div>
            )}
            {!signup && !recovery && !update && (
              <Link
                href="/recuperar"
                className="auth-forgot action action-text"
              >
                Olvidé mi contraseña
              </Link>
            )}
            {update && (
              <div className="auth-field">
                <label htmlFor="auth-confirmation" className="font-semibold">
                  Repetí la contraseña
                </label>
                <input
                  ref={confirmationInput}
                  id="auth-confirmation"
                  name="confirmation"
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmation}
                  disabled={busy}
                  onChange={(event) => {
                    setConfirmation(event.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      confirmation: undefined,
                    }));
                  }}
                  aria-invalid={Boolean(errors.confirmation)}
                  aria-describedby={
                    errors.confirmation ? "auth-confirmation-error" : undefined
                  }
                />
                {errors.confirmation && (
                  <p id="auth-confirmation-error" className="auth-error">
                    {errors.confirmation}
                  </p>
                )}
              </div>
            )}
            <button
              type="submit"
              className="action action-primary w-full"
              disabled={busy}
            >
              {busy ? "Un momento…" : action}
            </button>
          </form>
        </>
      )}
      <div aria-live="polite" aria-atomic="true" role="status">
        {notice && <p className="auth-notice">{notice}</p>}
      </div>
      {canResend && !sent && (
        <button
          type="button"
          className="action action-text w-full"
          onClick={resend}
          disabled={busy}
        >
          Reenviar confirmación
        </button>
      )}
      {!update && (
        <div className="auth-switch">
          <p className="text-muted">
            {signup
              ? "¿Ya tenés cuenta?"
              : recovery
                ? "¿Recordaste tu contraseña?"
                : "¿Es tu primera vez?"}
          </p>
          <Link
            href={signup || recovery ? "/ingresar" : "/crear-cuenta"}
            className="action action-secondary"
          >
            {signup || recovery ? "Ingresar" : "Crear cuenta"}
          </Link>
        </div>
      )}
      <Link href={update ? "/cuenta" : "/bienvenida"} className="auth-back">
        {update ? "Volver a mi cuenta" : "Volver al inicio"}
      </Link>
    </section>
  );
}
