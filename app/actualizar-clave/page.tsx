// SPDX-License-Identifier: AGPL-3.0-only
import AuthForm from "../auth/auth-form";
import { requireUser } from "../auth/server";
export default async function ActualizarClave() {
  await requireUser();
  return <AuthForm mode="actualizar" />;
}
