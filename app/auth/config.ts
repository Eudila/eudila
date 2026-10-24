// SPDX-License-Identifier: AGPL-3.0-only
export const authUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const authKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
export const authConfigured = Boolean(authUrl && authKey);
export const googleEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
