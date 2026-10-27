// SPDX-License-Identifier: AGPL-3.0-only
import AuthForm from "../../auth/auth-form";
import { currentUser } from "../../auth/server";
import { redirect } from "next/navigation";
export default async function Ingresar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error && (await currentUser())) redirect("/registro/tipo");
  return <AuthForm mode="ingresar" invalidLink={error === "enlace"} />;
}
