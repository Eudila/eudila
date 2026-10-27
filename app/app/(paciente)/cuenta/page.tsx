// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import { requireUser, serverAuth } from "../../auth/server";
import Logout from "../../auth/logout";
import "../../auth/auth.css";

export default async function Cuenta({
  searchParams,
}: {
  searchParams: Promise<{ clave?: string }>;
}) {
  const user = await requireUser();
  const client = await serverAuth();
  const { data: profile } = await client
    .from("profiles")
    .select("display_name,onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  const query = await searchParams;
  return (
    <section className="auth-screen" aria-labelledby="account-title">
      <div className="auth-intro">
        <h1
          id="account-title"
          className="font-display text-question leading-question font-bold tracking-brand"
        >
          Tu cuenta
        </h1>
        {profile?.display_name && <p>{profile.display_name}</p>}
        <p className="text-muted">{user.email}</p>
      </div>
      {query.clave === "actualizada" && (
        <p role="status" className="auth-notice">
          Tu contraseña se actualizó.
        </p>
      )}
      <div className="auth-form">
        <p>
          Tu sesión está iniciada. El guardado de registros en tu cuenta todavía
          está en preparación.
        </p>
        {!profile?.onboarding_completed_at && (
          <Link href="/empezar" className="action action-primary">
            Personalizar mi cuenta
          </Link>
        )}
        <Link href="/recuperar" className="action action-text">
          Cambiar mi contraseña
        </Link>
        <Logout />
      </div>
      <Link href="/" className="auth-back">
        Volver al inicio
      </Link>
    </section>
  );
}
