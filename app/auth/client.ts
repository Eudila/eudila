// SPDX-License-Identifier: AGPL-3.0-only
import { createBrowserClient } from "@supabase/ssr";
import { authUrl, authKey, authConfigured } from "./config";

export function authClient() {
  if (!authConfigured)
    throw new Error(
      "El acceso todavía no está disponible. Volvé a intentar más tarde.",
    );
  return createBrowserClient(authUrl, authKey);
}
