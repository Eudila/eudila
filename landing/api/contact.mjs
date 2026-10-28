import { createHmac } from "node:crypto";
import { isIP } from "node:net";

const MAX_BODY_BYTES = 16_384;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTERESTS = ["Piloto como psicólogo", "Inversión", "Otra consulta"];

export function validateContact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "La consulta no tiene un formato válido." };
  }
  for (const field of [
    "name",
    "email",
    "organization",
    "message",
    "website",
    "interest",
  ]) {
    if (input[field] !== undefined && typeof input[field] !== "string")
      return { ok: false, error: "La consulta no tiene un formato válido." };
  }
  const singleLine = (value = "") => value.replace(/\s+/g, " ").trim();
  const name = singleLine(input.name);
  const email = (input.email || "").trim();
  const organization = singleLine(input.organization);
  const message = (input.message || "").trim();
  const interest = input.interest || null;

  if (input.website?.trim()) return { ok: true, spam: true };
  if (name.length < 2 || name.length > 100)
    return { ok: false, error: "Revisá el nombre." };
  if (!EMAIL_PATTERN.test(email) || email.length > 200)
    return { ok: false, error: "Revisá el email de contacto." };
  if (organization.length > 160)
    return { ok: false, error: "La organización es demasiado larga." };
  if (message.length < 20 || message.length > 3000)
    return {
      ok: false,
      error: "La consulta debe tener entre 20 y 3000 caracteres.",
    };
  if (interest !== null && !INTERESTS.includes(interest))
    return { ok: false, error: "Revisá el motivo de la consulta." };
  if (input.privacy !== true)
    return {
      ok: false,
      error: "Confirmá el aviso de privacidad antes de enviar.",
    };

  return { ok: true, value: { name, email, organization, message, interest } };
}

export function createHandler(env = process.env, fetchImpl = fetch) {
  return async function handler(request) {
    const hostnames = (env.TURNSTILE_HOSTNAMES || "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    const origin = request.headers.get("origin");
    const allowedOrigin =
      origin && hostnames.some((h) => origin === `https://${h}`);
    const json = (response, status = 200, headers = {}) =>
      Response.json(response, {
        status,
        headers: {
          "Cache-Control": "no-store",
          Vary: "Origin",
          ...(allowedOrigin ? { "Access-Control-Allow-Origin": origin } : {}),
          ...headers,
        },
      });
    if (origin && !allowedOrigin)
      return json({ error: "Origen no permitido." }, 403);
    if (request.method === "OPTIONS")
      return new Response(null, {
        status: 204,
        headers: {
          ...(allowedOrigin ? { "Access-Control-Allow-Origin": origin } : {}),
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-store",
          Vary: "Origin",
        },
      });
    if (request.method !== "POST")
      return json({ error: "Método no permitido." }, 405, {
        Allow: "POST, OPTIONS",
      });
    if (
      !env.TURNSTILE_SECRET ||
      !hostnames.length ||
      !env.CONTACT_DATABASE_URL ||
      !env.SUPABASE_SERVICE_ROLE_KEY
    )
      return json(
        { error: "El canal de contacto todavía no está configurado." },
        503,
      );

    // El gateway del VPS reemplaza X-Forwarded-For por la IP autenticada por Cloudflare.
    const ip = request.headers.get("x-forwarded-for") || "";
    if (!isIP(ip))
      return json(
        { error: "No pudimos verificar el origen de la consulta." },
        403,
      );
    const databaseHeaders = {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    };
    const databaseUrl = env.CONTACT_DATABASE_URL.replace(/\/$/, "");
    try {
      const limit = await fetchImpl(
        `${databaseUrl}/rpc/consumir_limite_contacto`,
        {
          method: "POST",
          headers: databaseHeaders,
          body: JSON.stringify({
            p_key: createHmac("sha256", env.TURNSTILE_SECRET)
              .update(ip)
              .digest("hex"),
          }),
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (!limit.ok) throw new Error("rate-limit unavailable");
      const retryAfter = await limit.json();
      if (!Number.isInteger(retryAfter) || retryAfter < 0)
        throw new Error("invalid rate-limit response");
      if (retryAfter > 0)
        return json(
          {
            error:
              "Recibimos varios intentos. Esperá unos minutos antes de volver a enviar.",
          },
          429,
          { "Retry-After": String(retryAfter) },
        );
    } catch {
      return json(
        {
          error:
            "El canal de contacto no está disponible. Reintentá en unos minutos.",
        },
        503,
      );
    }

    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
      return json({ error: "La consulta es demasiado grande." }, 413);
    if (
      request.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() !== "application/json"
    )
      return json({ error: "La consulta debe enviarse como JSON." }, 415);

    let payload;
    try {
      const reader = request.body?.getReader();
      if (!reader)
        return json({ error: "La consulta no tiene un formato válido." }, 400);
      const chunks = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
          await reader.cancel();
          return json({ error: "La consulta es demasiado grande." }, 413);
        }
        chunks.push(value);
      }
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return json({ error: "La consulta no tiene un formato válido." }, 400);
    }
    const validation = validateContact(payload);
    if (!validation.ok) return json({ error: validation.error }, 400);
    if (validation.spam) return json({ ok: true }, 202);
    const token = payload["cf-turnstile-response"];
    if (typeof token !== "string" || !token.trim() || token.length > 2048)
      return json({ error: "Completá la verificación antes de enviar." }, 400);

    try {
      const verification = await fetchImpl(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: env.TURNSTILE_SECRET,
            response: token,
            remoteip: ip,
          }),
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (!verification.ok) throw new Error("siteverify unavailable");
      const result = await verification.json();
      if (
        result?.success !== true ||
        result.action !== "contact" ||
        !hostnames.includes(result.hostname)
      )
        return json(
          {
            error: "La verificación venció o no es válida. Volvé a intentarlo.",
          },
          403,
        );
    } catch {
      return json(
        { error: "No pudimos completar la verificación. Volvé a intentarlo." },
        503,
      );
    }
    try {
      const saved = await fetchImpl(`${databaseUrl}/contact_messages`, {
        method: "POST",
        headers: { ...databaseHeaders, Prefer: "return=minimal" },
        body: JSON.stringify(validation.value),
        signal: AbortSignal.timeout(10_000),
      });
      if (!saved.ok) throw new Error("storage unavailable");
      return json({ ok: true }, 201);
    } catch {
      return json(
        { error: "No pudimos guardar la consulta. Volvé a intentarlo." },
        503,
      );
    }
  };
}

const webHandler = createHandler();

export default async function vercelHandler(request, response) {
  const method = request.method || "GET";
  const rawBody =
    method === "GET" || method === "HEAD"
      ? undefined
      : typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body || {});
  const url = new URL(
    request.url || "/api/contact",
    "https://landing.eudila.invalid",
  );
  const webRequest = new Request(url, {
    method,
    headers: request.headers,
    body: rawBody,
  });
  const webResponse = await webHandler(webRequest);
  response.statusCode = webResponse.status;
  for (const [name, value] of webResponse.headers)
    response.setHeader(name, value);
  response.end(await webResponse.text());
}
