// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DEMO_TODAY } from "@/lib/demo-data.ts";
import { saveDemoInvitation } from "@/lib/demo-invitations.ts";
import { Icon } from "../ui";

const STEPS = [
  "Recibe un email para aceptar.",
  "Al aceptar, ves sus registros.",
  "Puede dejar de compartir cuando quiera.",
];

export default function AltaForm() {
  const [sent, setSent] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  return (
    <main>
      <Link href="/" className="back">
        <Icon name="back" />
        Pacientes
      </Link>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: 48,
          marginTop: 4,
        }}
      >
        <h1 className="page-title">Dar de alta un paciente</h1>
      </div>

      <section
        aria-label="Datos del paciente"
        className="card"
        style={{ marginTop: 32 }}
      >
        {sent === null ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const name = String(data.get("nombre") ?? "").trim();
              const email = String(data.get("email") ?? "").trim();
              saveDemoInvitation({ name, email, sentDay: DEMO_TODAY });
              setSent(email);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            <div className="form-grid">
              <div className="field">
                <label htmlFor="nombre">Nombre o apodo</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  required
                  placeholder="nombre@ejemplo.com"
                />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="mensaje">
                  Mensaje{" "}
                  <span style={{ fontWeight: 400, color: "var(--d-muted)" }}>
                    (opcional)
                  </span>
                </label>
                <textarea id="mensaje" name="mensaje" rows={4} />
              </div>
            </div>
            <div className="next-steps">
              <h2>Qué pasa después</h2>
              <ol>
                {STEPS.map((step, i) => (
                  <li key={step}>
                    <span aria-hidden="true" className="step-number">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="form-actions">
              <Link href="/" className="button-text">
                Cancelar
              </Link>
              <button
                type="submit"
                className="button-fill"
                style={{ padding: "0 24px" }}
              >
                Enviar invitación
              </button>
            </div>
          </form>
        ) : (
          <div role="status" className="sent">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 ref={heading} tabIndex={-1}>
                Invitación enviada
              </h2>
              <p>Aparece en tu lista hasta que acepte.</p>
              <p style={{ fontSize: "0.875rem" }}>
                Vista previa: no se envió ningún email a {sent}.
              </p>
            </div>
            <div className="head-actions" style={{ gap: 8 }}>
              <button
                type="button"
                className="button-text"
                onClick={() => setSent(null)}
              >
                Dar de alta a otra persona
              </button>
              <Link
                href="/"
                className="button-fill"
                style={{ padding: "0 24px" }}
              >
                Volver a pacientes
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
