import assert from "node:assert/strict";
import test from "node:test";

import vercelHandler, { createHandler, validateContact } from "./contact.mjs";

const valid = {
  name: "Ana Pérez",
  email: "ana@example.org",
  organization: "Municipio de ejemplo",
  message: "Queremos conversar sobre una implementación responsable.",
};

test("valida y normaliza una consulta", () => {
  const result = validateContact(valid);
  assert.equal(result.ok, true);
  assert.equal(result.value.name, "Ana Pérez");
});

test("rechaza email y mensajes inválidos", () => {
  assert.equal(validateContact({ ...valid, email: "no-es-email" }).ok, false);
  assert.equal(validateContact({ ...valid, message: "corto" }).ok, false);
});

test("acepta silenciosamente el honeypot sin enviar", async () => {
  let calls = 0;
  const handler = createHandler({}, async () => {
    calls += 1;
  });
  const response = await handler(
    new Request("https://eudila.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...valid, website: "spam.example" }),
    }),
  );
  assert.equal(response.status, 202);
  assert.equal(calls, 0);
});

test("no afirma entrega sin configuración", async () => {
  const handler = createHandler({});
  const response = await handler(
    new Request("https://eudila.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(valid),
    }),
  );
  assert.equal(response.status, 503);
});

test("envía mediante Resend y usa reply-to", async () => {
  let sent;
  const handler = createHandler(
    {
      RESEND_API_KEY: "secret",
      CONTACT_TO: "equipo@example.org",
      CONTACT_FROM: "Eudila <web@example.org>",
    },
    async (url, options) => {
      sent = { url, options, body: JSON.parse(options.body) };
      return new Response("{}", { status: 200 });
    },
  );
  const response = await handler(
    new Request("https://eudila.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(valid),
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(sent.url, "https://api.resend.com/emails");
  assert.equal(sent.body.reply_to, valid.email);
});

test("el adaptador de Vercel responde con JSON sin configuración", async () => {
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
  assert.match(result.body, /no está configurado/);
});
