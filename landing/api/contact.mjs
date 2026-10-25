const MAX_BODY_BYTES = 16_384;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(response, status = 200) {
  return new Response(JSON.stringify(response), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function validateContact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "La consulta no tiene un formato válido." };
  }

  const singleLine = (value) => String(value || "").replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  const name = singleLine(input.name);
  const email = String(input.email || "").trim();
  const organization = singleLine(input.organization);
  const message = String(input.message || "").trim();
  const website = String(input.website || "").trim();

  if (website) return { ok: true, spam: true };
  if (name.length < 2 || name.length > 100) {
    return { ok: false, error: "Revisá el nombre." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 200) {
    return { ok: false, error: "Revisá el email de contacto." };
  }
  if (organization.length > 160) {
    return { ok: false, error: "La organización es demasiado larga." };
  }
  if (message.length < 20 || message.length > 3000) {
    return { ok: false, error: "La consulta debe tener entre 20 y 3000 caracteres." };
  }

  return { ok: true, value: { name, email, organization, message } };
}

export function createHandler(env = process.env, fetchImpl = fetch) {
  return async function handler(request) {
    if (request.method !== "POST") return json({ error: "Método no permitido." }, 405);

    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) return json({ error: "La consulta es demasiado grande." }, 413);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "La consulta no tiene un formato válido." }, 400);
    }

    const validation = validateContact(payload);
    if (!validation.ok) return json({ error: validation.error }, 400);
    if (validation.spam) return json({ ok: true }, 202);

    if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
      return json({ error: "El canal de contacto todavía no está configurado." }, 503);
    }

    const { name, email, organization, message } = validation.value;
    const delivery = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `Consulta desde eudila · ${organization || name}`,
        text: [
          `Nombre: ${name}`,
          `Email: ${email}`,
          `Organización: ${organization || "No indicada"}`,
          "",
          message,
        ].join("\n"),
      }),
    });

    if (!delivery.ok) return json({ error: "No pudimos entregar la consulta." }, 502);
    return json({ ok: true }, 200);
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
  const url = new URL(request.url || "/api/contact", "https://landing.eudila.invalid");
  const webRequest = new Request(url, {
    method,
    headers: request.headers,
    body: rawBody,
  });
  const webResponse = await webHandler(webRequest);
  response.statusCode = webResponse.status;
  for (const [name, value] of webResponse.headers) response.setHeader(name, value);
  response.end(await webResponse.text());
}
