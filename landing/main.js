(() => {
  "use strict";

  const config = window.EUDILA_CONFIG || {};

  if (config.umamiScriptUrl && config.umamiWebsiteId && !navigator.doNotTrack?.startsWith("1")) {
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

  if (config.contactEnabled !== true) {
    for (const control of form.querySelectorAll("input, textarea, button")) control.disabled = true;
    status.dataset.state = "error";
    status.textContent =
      "Formulario visible para revisión local. El envío se habilitará cuando el proyecto tenga una casilla monitoreada.";
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    status.textContent = "";
    status.removeAttribute("data-state");

    if (!form.reportValidity()) return;

    const body = Object.fromEntries(new FormData(form).entries());
    delete body.privacy;

    submit.disabled = true;
    submit.textContent = "Enviando…";

    try {
      const response = await fetch(config.contactEndpoint || "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "No pudimos entregar la consulta.");

      form.reset();
      status.dataset.state = "success";
      status.textContent = "Consulta enviada. El equipo de Eudila va a responder a tu email.";
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = `${error.message || "No pudimos entregar la consulta."} Tus datos siguen en el formulario para que puedas reintentar.`;
    } finally {
      submit.disabled = false;
      submit.textContent = "Enviar consulta";
    }
  });
})();
