(() => {
  "use strict";

  const config = window.EUDILA_CONFIG || {};

  if (
    config.umamiScriptUrl &&
    config.umamiWebsiteId &&
    !navigator.doNotTrack?.startsWith("1")
  ) {
    const analytics = document.createElement("script");
    analytics.defer = true;
    analytics.src = config.umamiScriptUrl;
    analytics.dataset.websiteId = config.umamiWebsiteId;
    analytics.dataset.doNotTrack = "true";
    document.head.appendChild(analytics);
  }

  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  const submit = form?.querySelector("button[type='submit']");

  if (!form || !status || !submit) return;

  if (config.contactEnabled !== true || !config.turnstileSitekey) {
    for (const control of form.querySelectorAll("input, textarea, button"))
      control.disabled = true;
    status.dataset.state = "error";
    status.textContent =
      "El envío todavía no está habilitado. Mientras tanto, escribinos por el canal público de GitHub (sin datos de salud).";
    return;
  }

  let widgetId;
  let token = "";
  let busy = false;
  submit.disabled = true;
  window.onContactTurnstileLoad = () => {
    widgetId = window.turnstile.render("#contact-turnstile", {
      sitekey: config.turnstileSitekey,
      action: "contact",
      theme: "light",
      size: "flexible",
      callback(value) {
        token = value;
        submit.disabled = busy || !token;
      },
      "expired-callback"() {
        token = "";
        submit.disabled = true;
      },
      "error-callback"() {
        token = "";
        submit.disabled = true;
        status.dataset.state = "error";
        status.textContent =
          "No pudimos cargar la verificación. Recargá la página para volver a intentarlo.";
      },
    });
  };
  const challenge = document.createElement("script");
  challenge.src =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onContactTurnstileLoad&render=explicit";
  challenge.async = true;
  challenge.onerror = () => {
    status.dataset.state = "error";
    status.textContent =
      "No pudimos cargar la verificación. Recargá la página para volver a intentarlo.";
  };
  document.head.appendChild(challenge);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !token) return;

    status.textContent = "";
    status.removeAttribute("data-state");

    if (!form.reportValidity()) return;

    const body = Object.fromEntries(new FormData(form).entries());
    body.privacy = body.privacy === "on";
    body["cf-turnstile-response"] = token;

    busy = true;
    submit.disabled = true;
    submit.textContent = "Enviando…";

    try {
      const response = await fetch(config.contactEndpoint || "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true)
        throw new Error(result.error || "No pudimos guardar la consulta.");

      form.reset();
      status.dataset.state = "success";
      status.textContent =
        "Guardamos tu consulta. El equipo de Eudila va a responder a tu email.";
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = `${error.message || "No pudimos guardar la consulta."} Tus datos siguen en el formulario para que puedas reintentar.`;
    } finally {
      busy = false;
      token = "";
      submit.disabled = true;
      submit.textContent = "Enviar consulta";
      if (widgetId !== undefined) window.turnstile.reset(widgetId);
    }
  });
})();
