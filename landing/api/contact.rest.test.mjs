import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { createHandler } from "./contact.mjs";

const databaseUrl = process.env.CONTACT_TEST_REST_URL;

test(
  "PostgREST real: inserta con service_role sin permiso de lectura",
  { skip: !databaseUrl },
  async () => {
    assert.equal(new URL(databaseUrl).hostname, "127.0.0.1");
    const encode = (value) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    const data = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role: "service_role", exp: Math.floor(Date.now() / 1000) + 60 })}`;
    const key = `${data}.${createHmac("sha256", "eudila-contact-test-only-signing-key-00000000000").update(data).digest("base64url")}`;
    const env = {
      TURNSTILE_SECRET: "test-secret",
      TURNSTILE_HOSTNAMES: "eudila.com",
      CONTACT_DATABASE_URL: databaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: key,
    };
    const handler = createHandler(env, (url, options) =>
      url.includes("siteverify")
        ? Promise.resolve(
            Response.json({
              success: true,
              action: "contact",
              hostname: "eudila.com",
            }),
          )
        : fetch(url, options),
    );
    const response = await handler(
      new Request("https://app.eudila.com/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "192.0.2.25",
          Origin: "https://eudila.com",
        },
        body: JSON.stringify({
          name: "Contacto REST de prueba",
          email: "test@example.org",
          message: "Prueba sintética de guardado con PostgREST real.",
          privacy: true,
          "cf-turnstile-response": "test-token",
        }),
      }),
    );
    assert.equal(response.status, 201, await response.text());
    assert.equal(
      (
        await fetch(`${databaseUrl}/contact_messages`, {
          headers: { authorization: `Bearer ${key}` },
        })
      ).status,
      403,
    );
    assert.equal((await fetch(`${databaseUrl}/contact_messages`)).status, 401);
  },
);
