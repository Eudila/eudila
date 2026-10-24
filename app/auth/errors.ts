// SPDX-License-Identifier: AGPL-3.0-only
export function authError(error: { code?: string; status?: number }) {
  if (error.status === 429 || error.code?.includes("rate_limit"))
    return "Hubo varios intentos seguidos. Esperá un minuto antes de volver a intentar.";
  switch (error.code) {
    case "invalid_credentials":
      return "El email o la contraseña no coinciden. Revisalos e intentá de nuevo.";
    case "email_not_confirmed":
      return "Te falta confirmar tu email. Revisá tu correo o pedí otro enlace.";
    case "weak_password":
      return "Elegí una contraseña de al menos 8 caracteres.";
    case "same_password":
      return "Elegí una contraseña distinta de la anterior.";
    case "user_already_exists":
    case "email_exists":
      return "No pudimos crear la cuenta. Si ya tenés una, ingresá o recuperá tu contraseña.";
    default:
      return "No pudimos completar la solicitud. Revisá tu conexión y volvé a intentar.";
  }
}
