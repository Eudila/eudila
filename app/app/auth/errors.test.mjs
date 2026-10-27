// SPDX-License-Identifier: AGPL-3.0-only
import { test } from "node:test";
import assert from "node:assert/strict";
import { authError } from "./errors.ts";

test("auth: errores recuperables no revelan mensajes internos del proveedor", () => {
  assert.match(
    authError({ code: "invalid_credentials" }),
    /email o la contraseña/,
  );
  assert.match(
    authError({ code: "email_not_confirmed" }),
    /confirmar tu email/,
  );
  assert.match(authError({ status: 429 }), /Esperá un minuto/);
  assert.match(
    authError({ code: "over_email_send_rate_limit" }),
    /Esperá un minuto/,
  );
  assert.match(authError({ code: "weak_password" }), /8 caracteres/);
  assert.match(authError({ code: "same_password" }), /distinta/);
  assert.equal(
    authError({ code: "email_exists" }),
    authError({ code: "user_already_exists" }),
  );
  assert.match(
    authError({ code: "unknown", message: "sql backend secret" }),
    /Revisá tu conexión/,
  );
  assert.doesNotMatch(
    authError({ code: "unknown", message: "sql backend secret" }),
    /secret/,
  );
});
