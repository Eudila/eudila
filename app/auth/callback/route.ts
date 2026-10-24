// SPDX-License-Identifier: AGPL-3.0-only
import { NextResponse, type NextRequest } from "next/server";
import { serverAuth } from "../server";
import { authConfigured } from "../config";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const code = query.get("code");
  const token = query.get("token_hash");
  const type = query.get("type");
  let destination = "/ingresar?error=enlace";
  if (authConfigured) {
    const client = await serverAuth();
    if (code) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) destination = "/empezar";
    } else if (token && (type === "signup" || type === "recovery")) {
      const { error } = await client.auth.verifyOtp({
        token_hash: token,
        type,
      });
      if (!error)
        destination = type === "recovery" ? "/actualizar-clave" : "/empezar";
    }
  }
  // Conservar el origen del navegador incluso detrás de un proxy o en 127.0.0.1.
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: destination },
  });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
