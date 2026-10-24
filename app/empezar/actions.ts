// SPDX-License-Identifier: AGPL-3.0-only
"use server";

import { requireUser, serverAuth } from "../auth/server";

export async function completeOnboarding(name: string) {
  const user = await requireUser();
  if (
    typeof name !== "string" ||
    name.trim().length > 60 ||
    /[\u0000-\u001f\u007f]/.test(name)
  )
    return { error: "Usá un nombre de hasta 60 caracteres." };
  const client = await serverAuth();
  const { error } = await client.from("profiles").upsert({
    id: user.id,
    display_name: name.trim() || null,
    onboarding_completed_at: new Date().toISOString(),
  });
  return {
    error: error
      ? "No pudimos guardar tu preferencia. Volvé a intentar."
      : null,
  };
}
