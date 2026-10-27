// SPDX-License-Identifier: AGPL-3.0-only
"use client";
import { useState } from "react";
import { authClient } from "./client";
import { useDraft } from "../(paciente)/registro/registro";

export default function Logout() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { discard } = useDraft();
  async function logout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await authClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      discard();
      window.location.replace("/bienvenida");
    } catch {
      setError(
        "No pudimos cerrar la sesión. Revisá tu conexión y volvé a intentar.",
      );
      setBusy(false);
    }
  }
  return (
    <>
      <p className="text-muted text-sm">
        Al salir, se limpia el borrador de este dispositivo.
      </p>
      <button
        type="button"
        className="action action-secondary w-full"
        disabled={busy}
        aria-busy={busy}
        onClick={logout}
      >
        {busy ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
