// SPDX-License-Identifier: AGPL-3.0-only
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authConfigured, authKey, authUrl } from "./app/auth/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!authConfigured) return response;
  const client = createServerClient(authUrl, authKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  // Validar identidad con Auth; nunca confiar en una cookie sin verificar.
  const {
    data: { user },
  } = await client.auth.getUser();
  const path = request.nextUrl.pathname;
  const privatePage =
    path === "/cuenta" || path === "/empezar" || path === "/actualizar-clave";
  const appPage =
    path === "/" ||
    /^\/(registro|hoy|calendario|evolucion|factores|exportar)(\/|$)/.test(path);
  if (
    !user &&
    (privatePage ||
      (appPage && process.env.NEXT_PUBLIC_FRONTEND_PREVIEW !== "true"))
  ) {
    const destination = request.nextUrl.clone();
    destination.pathname = path === "/" ? "/bienvenida" : "/ingresar";
    destination.search = "";
    const redirect = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    response = redirect;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/",
    "/cuenta",
    "/empezar",
    "/ingresar",
    "/crear-cuenta",
    "/actualizar-clave",
    "/registro/:path*",
    "/hoy",
    "/calendario/:path*",
    "/evolucion",
    "/factores/:path*",
    "/exportar/:path*",
  ],
};
