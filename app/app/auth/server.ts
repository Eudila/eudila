// SPDX-License-Identifier: AGPL-3.0-only
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authUrl, authKey, authConfigured } from "./config";

export async function serverAuth() {
  const store = await cookies();
  return createServerClient(authUrl, authKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          // Server Components no escriben cookies; proxy renueva la sesión.
        }
      },
    },
  });
}

export async function currentUser() {
  if (!authConfigured) return null;
  const client = await serverAuth();
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/ingresar");
  return user;
}
