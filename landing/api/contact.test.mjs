import assert from "node:assert/strict";
import test from "node:test";
import vercelHandler, { createHandler, validateContact } from "./contact.mjs";

const valid = {
  name: "Ana Pérez",
  email: "ana@example.org",
  organization: "Municipio de ejemplo",
  message: "Queremos conversar sobre una implementación responsable.",
  interest: "Otra consulta",
  privacy: true,
  "cf-turnstile-response": "fresh-token",
};
const env = {
  TURNSTILE_SECRET: "test-secret",
  TURNSTILE_HOSTNAMES: "eudila.com,www.eudila.com",
  CONTACT_DATABASE_URL: "https://database.test/rest/v1",
  SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
};
const request = (body = valid, headers = {}) =>
  new Request("https://app.eudila.com/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.1",
      origin: "https://eudila.com",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
function backend({
  retry = 0,
  verification = { success: true, action: "contact", hostname: "eudila.com" },
  saveStatus = 201,
} = {}) {
  const calls = [];
  return {
    calls,
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (url.endsWith("/rpc/consumir_limite_contacto"))
        return Response.json(retry);
      if (url.includes("siteverify")) return Response.json(verification);
      assert.equal(url, `${env.CONTACT_DATABASE_URL}/contact_messages`);
      return new Response(null, { status: saveStatus });
    },
  };
}

test("valida campos, consentimiento y normaliza sin convertir objetos", () => {
  assert.deepEqual(validateContact({ ...valid, name: " Ana\n Pérez " }).value, {
    name: "Ana Pérez",
    email: valid.email,
    organization: valid.organization,
    message: valid.message,
    interest: valid.interest,
  });
  for (const input of [
    null,
    [],
    { ...valid, name: {} },
    { ...valid, email: "no-email" },
    { ...valid, message: "corto" },
    { ...valid, interest: "spam" },
    { ...valid, privacy: "true" },
  ])
    assert.equal(validateContact(input).ok, false);
});

test("guarda una consulta solo después del límite y Siteverify", async () => {
  const stub = backend();
  const response = await createHandler(env, stub.fetch)(request());
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(
    response.headers.get("Access-Control-Allow-Origin"),
    "https://eudila.com",
  );
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(stub.calls.length, 3);
  const [limit, verification, saved] = stub.calls;
  assert.match(JSON.parse(limit.options.body).p_key, /^[a-f0-9]{64}$/);
  assert.equal(verification.options.body.get("response"), "fresh-token");
  assert.equal(verification.options.body.get("remoteip"), "192.0.2.1");
  assert.equal(verification.options.body.get("secret"), env.TURNSTILE_SECRET);
  assert.deepEqual(
    JSON.parse(saved.options.body),
    validateContact(valid).value,
  );
  assert.equal(
    saved.options.headers.authorization,
    `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  );
  assert.doesNotMatch(
    saved.options.body,
    /fresh-token|192\.0\.2\.1|privacy|test-secret/,
  );
});

test("429 incluye Retry-After y no verifica ni escribe", async () => {
  const stub = backend({ retry: 900 });
  const response = await createHandler(env, stub.fetch)(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "900");
  assert.equal(stub.calls.length, 1);
});

test("honeypot no guarda ni consume Siteverify", async () => {
  const stub = backend();
  const response = await createHandler(
    env,
    stub.fetch,
  )(request({ ...valid, website: "spam.example" }));
  assert.equal(response.status, 202);
  assert.equal(stub.calls.length, 1);
});

test("rechaza token ausente, inválido, repetido, acción u hostname incorrectos", async () => {
  const missing = backend();
  assert.equal(
    (
      await createHandler(
        env,
        missing.fetch,
      )(request({ ...valid, "cf-turnstile-response": "" }))
    ).status,
    400,
  );
  assert.equal(missing.calls.length, 1);
  for (const verification of [
    null,
    { success: false, "error-codes": ["timeout-or-duplicate"] },
    { success: "true", action: "contact", hostname: "eudila.com" },
    { success: true, action: "login", hostname: "eudila.com" },
    { success: true, action: "contact", hostname: "evil.test" },
  ]) {
    const stub = backend({ verification });
    assert.equal((await createHandler(env, stub.fetch)(request())).status, 403);
    assert.equal(stub.calls.length, 2);
  }
});

test("un mismo token no se guarda dos veces al ser rechazado por Siteverify", async () => {
  const stub = backend();
  let redeemed = false;
  const fetch = async (url, options) => {
    if (url.includes("siteverify")) {
      if (redeemed) return Response.json({ success: false });
      redeemed = true;
    }
    return stub.fetch(url, options);
  };
  const handler = createHandler(env, fetch);
  assert.equal((await handler(request())).status, 201);
  assert.equal((await handler(request())).status, 403);
  assert.equal(
    stub.calls.filter((c) => c.url.endsWith("/contact_messages")).length,
    1,
  );
});

test("fallos de red, límite, Siteverify o DB no afirman guardado", async () => {
  for (const failAt of [
    "consumir_limite_contacto",
    "siteverify",
    "contact_messages",
  ]) {
    const stub = backend();
    const fetch = (url, options) => {
      if (url.includes(failAt)) throw new Error("private internal detail");
      return stub.fetch(url, options);
    };
    const response = await createHandler(env, fetch)(request());
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /private internal detail/);
  }
  const stub = backend({ saveStatus: 500 });
  assert.equal((await createHandler(env, stub.fetch)(request())).status, 503);
  const invalidLimit = backend({ retry: null });
  assert.equal(
    (await createHandler(env, invalidLimit.fetch)(request())).status,
    503,
  );
});

test("rechaza cuerpos grandes sin Content-Length, JSON roto y contenido incorrecto", async () => {
  for (const [body, headers, expected] of [
    ["x".repeat(17000), {}, 413],
    ["{", {}, 400],
    [valid, { "content-type": "text/plain" }, 415],
    [valid, { "content-length": "99999" }, 413],
    [{ ...valid, privacy: false }, {}, 400],
  ]) {
    const stub = backend();
    assert.equal(
      (await createHandler(env, stub.fetch)(request(body, headers))).status,
      expected,
    );
    assert.equal(stub.calls.length, 1);
  }
});

test("CORS acepta solo hostnames explícitos; preflight no llama servicios", async () => {
  const stub = backend();
  const handler = createHandler(env, stub.fetch);
  assert.equal(
    (await handler(request(valid, { origin: "https://evil.test" }))).status,
    403,
  );
  const preflight = await handler(
    new Request("https://app.eudila.com/api/contact", {
      method: "OPTIONS",
      headers: { origin: "https://www.eudila.com" },
    }),
  );
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    "https://www.eudila.com",
  );
  assert.equal(stub.calls.length, 0);
});

test("falla cerrado sin configuración o IP del gateway", async () => {
  assert.equal(
    (await createHandler({})(request(valid, { origin: "" }))).status,
    503,
  );
  const stub = backend();
  assert.equal(
    (
      await createHandler(
        env,
        stub.fetch,
      )(request(valid, { "x-forwarded-for": "" }))
    ).status,
    403,
  );
  assert.equal(stub.calls.length, 0);
});

test("el adaptador existente conserva JSON y falla cerrado sin configuración", async () => {
  const result = { headers: {} };
  await vercelHandler(
    {
      method: "POST",
      url: "/api/contact",
      headers: { "content-type": "application/json" },
      body: valid,
    },
    {
      setHeader(name, value) {
        result.headers[name] = value;
      },
      end(body) {
        result.body = body;
      },
      set statusCode(value) {
        result.status = value;
      },
    },
  );
  assert.equal(result.status, 503);
  assert.match(result.headers["content-type"], /application\/json/);
});
