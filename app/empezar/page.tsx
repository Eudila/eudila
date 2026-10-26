// SPDX-License-Identifier: AGPL-3.0-only
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser, serverAuth } from "../auth/server";
import Onboarding from "./onboarding";

export default async function Empezar() {
  const user = await requireUser();
  const client = await serverAuth();
  const { data } = await client
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  if (data?.onboarding_completed_at) redirect("/");
  // Session cookie set by ./intro.tsx: the opener plays once per session.
  const seen = (await cookies()).has("eudila-intro");
  return <Onboarding intro={!seen} />;
}
