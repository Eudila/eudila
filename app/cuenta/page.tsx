// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import "../auth/auth.css";
export default function Cuenta() {
  return (
    <section className="auth-screen" aria-labelledby="account-title">
      <div className="auth-intro">
        <h1
          id="account-title"
          className="font-display text-question leading-question font-bold tracking-brand"
        >
          Tu cuenta
        </h1>
        <p>No hay una sesión iniciada.</p>
      </div>
      <p id="account-status" className="auth-availability">
        El acceso con cuenta estará disponible próximamente.
      </p>
      <button
        type="button"
        className="auth-primary"
        disabled
        aria-describedby="account-status"
      >
        Cerrar sesión
      </button>
      <p className="auth-switch">
        <Link href="/ingresar">Ingresar</Link>
      </p>
      <Link href="/" className="auth-back">
        Volver al inicio
      </Link>
    </section>
  );
}
