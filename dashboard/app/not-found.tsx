// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ marginTop: 48, maxWidth: "40rem" }}>
      <h1 className="page-title">No encontramos esta página</h1>
      <p style={{ color: "var(--d-muted)" }}>
        Puede que el paciente no exista en la vista previa.
      </p>
      <Link href="/" className="button-fill" style={{ marginTop: 16 }}>
        Volver a pacientes
      </Link>
    </main>
  );
}
