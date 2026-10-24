// SPDX-License-Identifier: AGPL-3.0-only
import AuthForm from "../auth/auth-form";
import { currentUser } from "../auth/server";
import { redirect } from "next/navigation";
export default async function CrearCuenta() {
  if (await currentUser()) redirect("/empezar");
  return <AuthForm mode="crear-cuenta" />;
}
