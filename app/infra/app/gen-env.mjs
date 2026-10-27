// Genera el .env de producción: secretos nuevos y las claves anon/service firmadas con el JWT secret.
// Uso: node gen-env.mjs https://app.eudila.com > .env   (el .env vive solo en el servidor; nunca se versiona)
import { createHmac, randomBytes } from "node:crypto";

const publicUrl = process.argv[2];
if (!publicUrl)
  throw new Error("Falta la URL pública, por ejemplo https://app.eudila.com");

const b64 = (value) => Buffer.from(value).toString("base64url");
const sign = (payload, secret) => {
  const head = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64(JSON.stringify(payload));
  return `${head}.${body}.${createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url")}`;
};

// Solo hex: la contraseña viaja dentro de URLs de conexión.
const postgresPassword = randomBytes(24).toString("hex");
const jwtSecret = randomBytes(32).toString("hex");
const iat = Math.floor(Date.now() / 1000);
const exp = iat + 10 * 365 * 24 * 3600;
const key = (role) => sign({ iss: "supabase", role, iat, exp }, jwtSecret);

process.stdout.write(
  [
    `PUBLIC_URL=${publicUrl.replace(/\/$/, "")}`,
    `POSTGRES_PASSWORD=${postgresPassword}`,
    `JWT_SECRET=${jwtSecret}`,
    `ANON_KEY=${key("anon")}`,
    `SERVICE_ROLE_KEY=${key("service_role")}`,
    "# Google: se completan con scripts/deploy-app.sh (GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET).",
    "GOOGLE_ENABLED=false",
    "GOOGLE_CLIENT_ID=",
    "GOOGLE_CLIENT_SECRET=",
    "# Login por email: necesita SMTP para confirmar cuentas y recuperar claves.",
    "EMAIL_AUTH_ENABLED=false",
    "SMTP_HOST=",
    "SMTP_PORT=587",
    "SMTP_USER=",
    "SMTP_PASS=",
    "SMTP_ADMIN_EMAIL=",
    "SMTP_SENDER_NAME=eudila",
    "",
  ].join("\n"),
);
