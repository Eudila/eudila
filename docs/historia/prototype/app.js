// SPDX-License-Identifier: AGPL-3.0-only
import { catalog } from "./config.js";
import { loadCatalogRows } from "./catalog.js";
import { moods, shapePath } from "./moods.js";
import { adjacentRoute, newDraft, restoreDraft, steps, types } from "./flow-state.js";

const DRAFT_KEY = "eudila-draft-v1";
const DISCARDED_KEY = "eudila-draft-discarded";

const shell = document.querySelector("#shell");
const app = document.querySelector("#app");
const closeDialog = document.querySelector("#close-dialog");
const emotionDialog = document.querySelector("#emotion-dialog");
const search = document.querySelector("#emotion-search");
const results = document.querySelector("#emotion-results");
const homeLink = document.querySelector("#home-link");
let draft = readDraft();
let emotions = [];
let factors = [];
let catalogProblem = "El catálogo de emociones todavía no está disponible.";
let activeRoute = routeFromUrl();
let renderedRoute = "";
let closeTarget = "";
let modalOrigin = null;

function readDraft() {
  try { return restoreDraft(sessionStorage.getItem(DRAFT_KEY)); }
  catch { return null; }
}

function persistDraft() {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* Keep the in-memory draft. */ }
}

function ensureDraft() {
  if (!draft) {
    draft = newDraft();
    persistDraft();
  }
}

function routeFromUrl() {
  try {
    const route = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    return steps.some(step => route === `registro/${step}`) ? route : "";
  } catch { return ""; }
}

function isFlow(route) { return route.startsWith("registro/"); }

function navigate(route, replace = false) {
  history[replace ? "replaceState" : "pushState"]({ eudilaEntry: true }, "", `#/${route}`);
  activeRoute = route;
  render();
}

function discardDraft() {
  draft = null;
  try {
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.setItem(DISCARDED_KEY, "1");
  } catch { /* The in-memory draft is still cleared. */ }
  navigate(closeTarget, true);
}

function askToClose(target = "") {
  closeTarget = target;
  closeDialog.returnValue = "";
  closeDialog.showModal();
}


function orbMarkup(mood) {
  const path = shapePath(mood);
  return `<svg class="orb" viewBox="0 0 220 220" aria-hidden="true">
    <g class="orb-layer"><path d="${path}" fill="currentColor" opacity=".18"/></g>
    <g class="orb-layer"><path d="${path}" transform="translate(110 110) scale(.82) translate(-110 -110)" fill="currentColor" opacity=".30"/></g>
    <g class="orb-layer"><path d="${path}" transform="translate(110 110) scale(.63) translate(-110 -110)" fill="currentColor" opacity=".48"/></g>
    <g class="orb-layer"><path d="${path}" transform="translate(110 110) scale(.45) translate(-110 -110)" fill="currentColor" opacity=".7"/></g>
    <g class="orb-layer"><path d="${path}" transform="translate(110 110) scale(.29) translate(-110 -110)" fill="currentColor" opacity=".9"/></g>
    <circle cx="110" cy="110" r="17" fill="white" opacity=".94"/>
  </svg>`;
}

function flowHeader(index) {
  return `<div class="flow-nav">
    <button class="circle-button" type="button" data-back aria-label="Volver">‹</button>
    <span id="step-progress">Registro · ${index + 1} de ${steps.length}</span>
    <button class="circle-button" type="button" data-close aria-label="Cerrar registro">×</button>
  </div>`;
}

function renderHome() {
  app.innerHTML = `<section class="home-screen">
    <div class="home-copy">
      <div class="home-orb" aria-hidden="true">${orbMarkup(moods[3])}</div>
      <p class="home-kicker">Un espejo tranquilo para cada estado de ánimo.</p>
      <h1>¿Cómo te sentís ahora?</h1>
      <p>Un momento para registrar lo que sentís, a tu manera.</p>
    </div>
    <button class="primary-button" type="button" id="start-record">Empezar registro</button>
  </section>`;
  document.querySelector("#start-record").addEventListener("click", () => {
    try { sessionStorage.removeItem(DISCARDED_KEY); } catch { /* Navigation still works. */ }
    ensureDraft();
    navigate("registro/tipo");
  });
}

function playIntro() {
  try {
    if (sessionStorage.getItem("eudila-intro-seen")) return;
    sessionStorage.setItem("eudila-intro-seen", "1");
  } catch { return; /* Keep the static state when storage is unavailable. */ }

  const orb = app.querySelector(".home-orb");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  if (!orb?.animate || motion.matches || document.hidden) return;

  const intro = orb.animate([
    { opacity: .6, transform: "scale(.94)" },
    { opacity: 1, transform: "scale(1)" }
  ], { duration: 600, easing: "cubic-bezier(.32, .72, 0, 1)" });
  const listeners = new AbortController();
  const finish = () => {
    intro.cancel();
    listeners.abort();
  };
  const options = { signal: listeners.signal };
  shell.addEventListener("pointerdown", finish, options);
  window.addEventListener("keydown", finish, options);
  window.addEventListener("popstate", finish, options);
  document.addEventListener("visibilitychange", finish, options);
  motion.addEventListener("change", finish, options);
  intro.finished.then(finish, finish);
}

function renderType() {
  app.innerHTML = `<section class="flow-screen detail-screen">
    ${flowHeader(0)}
    <div class="flow-body detail-body">
      <h1>¿A qué momento corresponde este registro?</h1>
      <fieldset class="type-options">
        <legend class="sr-only">Momento del registro</legend>
        ${types.map(type => `<label class="type-option"><input type="radio" name="record-type" value="${type}" ${draft.type === type ? "checked" : ""}><span>${type === "libre" ? "Registro libre" : type[0].toUpperCase() + type.slice(1)}</span></label>`).join("")}
      </fieldset>
    </div>
    <button class="primary-button flow-next" type="button" data-next ${draft.type ? "" : "disabled"}>Siguiente</button>
  </section>`;
  document.querySelectorAll('[name="record-type"]').forEach(input => input.addEventListener("change", () => {
    draft.type = input.value;
    persistDraft();
    document.querySelector("[data-next]").disabled = false;
  }));
}

function paintMood() {
  const mood = moods[draft.mood - 1];
  shell.style.setProperty("--accent", mood.accent);
  shell.style.setProperty("--orb-color", mood.orb);
  shell.style.setProperty("--ambient", mood.ambient);
  shell.style.setProperty("--action-ink", mood.lightInk ? "#fff" : "#1D1D1F");
  const orb = document.querySelector("#orb-host");
  if (orb) orb.innerHTML = orbMarkup(mood);
  const label = document.querySelector("#mood-label");
  if (label) label.textContent = mood.label;
  const live = document.querySelector("#mood-live");
  if (live) live.textContent = mood.label;
  const slider = document.querySelector("#mood-range");
  if (slider) slider.setAttribute("aria-valuetext", mood.label);
}

function renderMood() {
  app.innerHTML = `<section class="flow-screen mood-screen">
    ${flowHeader(1)}
    <div class="flow-body">
      <h1>¿Cómo te sentís ahora?</h1>
      <div id="orb-host" class="orb-host"></div>
      <p id="mood-label" class="mood-label"></p>
      <label class="sr-only" for="mood-range">Estado de ánimo</label>
      <input id="mood-range" type="range" min="1" max="7" step="1" value="${draft.mood}">
      <div class="range-ends"><span>Muy desagradable</span><span>Muy agradable</span></div>
      <p class="sr-only" id="mood-live" aria-live="polite"></p>
    </div>
    <button class="primary-button flow-next" type="button" data-next>Siguiente</button>
  </section>`;
  paintMood();
  document.querySelector("#mood-range").addEventListener("input", event => {
    draft.mood = Number(event.target.value);
    persistDraft();
    paintMood();
  });
}

function selectedEmotion() { return emotions.find(item => String(item.id) === draft.emotionId); }

function renderEmotion() {
  app.innerHTML = `<section class="flow-screen detail-screen">
    ${flowHeader(2)}
    <div class="flow-body detail-body">
      <h1>¿Qué emoción describe mejor lo que sentís?</h1>
      <p class="step-context" id="emotion-mood"></p>
      <div id="quick-options" class="chip-list" role="group" aria-label="Emociones sugeridas"></div>
      <button class="text-button" type="button" id="all-emotions" ${emotions.length ? "" : "disabled"}>Ver todas las emociones</button>
      <p class="selected-emotion" id="selected-emotion" aria-live="polite"></p>
      ${emotions.length ? "" : `<p class="catalog-message" role="status">${catalogProblem}</p>`}
    </div>
    <button class="primary-button flow-next" type="button" data-next ${selectedEmotion() ? "" : "disabled"}>Siguiente</button>
  </section>`;
  document.querySelector("#emotion-mood").textContent = moods[draft.mood - 1].label;
  const chosen = selectedEmotion();
  document.querySelector("#selected-emotion").textContent = chosen ? `Elegiste: ${chosen.nombre}` : "";
  const quick = document.querySelector("#quick-options");
  emotions.filter(item => item.sugerida).forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip-button";
    button.dataset.emotionId = String(item.id);
    button.textContent = item.nombre;
    button.setAttribute("aria-pressed", String(String(item.id) === draft.emotionId));
    button.addEventListener("click", () => chooseEmotion(item));
    quick.append(button);
  });
  document.querySelector("#all-emotions").addEventListener("click", openEmotions);
}

function chooseEmotion(item) {
  draft.emotionId = String(item.id);
  persistDraft();
  if (emotionDialog.open) emotionDialog.close();
  document.querySelector("#selected-emotion").textContent = `Elegiste: ${item.nombre}`;
  document.querySelector("[data-next]").disabled = false;
  document.querySelectorAll("#quick-options .chip-button").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.emotionId === draft.emotionId));
  });
}

function fillEmotionResults() {
  const query = search.value.trim().toLocaleLowerCase("es-AR");
  results.replaceChildren();
  const found = emotions.filter(item => item.nombre.toLocaleLowerCase("es-AR").includes(query));
  if (!found.length) {
    const empty = document.createElement("p");
    empty.textContent = "No hay resultados para esa búsqueda.";
    results.append(empty);
  }
  found.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "emotion-result";
    button.textContent = item.nombre;
    button.setAttribute("aria-pressed", String(String(item.id) === draft.emotionId));
    button.addEventListener("click", () => chooseEmotion(item));
    results.append(button);
  });
}

function openEmotions(event) {
  modalOrigin = event.currentTarget;
  search.value = "";
  fillEmotionResults();
  emotionDialog.showModal();
  search.focus();
}

function renderFactors() {
  app.innerHTML = `<section class="flow-screen detail-screen">
    ${flowHeader(3)}
    <div class="flow-body detail-body">
      <h1>¿Qué factores influyeron hoy?</h1>
      <p class="step-context">Podés elegir más de uno.</p>
      <div id="factor-options" class="chip-list" role="group" aria-label="Factores de vida"></div>
      ${factors.length ? "" : `<p class="catalog-message" role="status">${catalogProblem.replace("emociones", "factores de vida")}</p>`}
    </div>
  </section>`;
  const options = document.querySelector("#factor-options");
  factors.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip-button";
    button.textContent = item.nombre;
    button.setAttribute("aria-pressed", String(draft.factors.includes(String(item.id))));
    button.addEventListener("click", () => {
      const id = String(item.id);
      draft.factors = draft.factors.includes(id) ? draft.factors.filter(value => value !== id) : [...draft.factors, id];
      persistDraft();
      button.setAttribute("aria-pressed", String(draft.factors.includes(id)));
    });
    options.append(button);
  });
}

function render() {
  const focused = document.activeElement;
  const focusTarget = app.contains(focused)
    ? focused.matches("[data-back]") ? "[data-back]"
      : focused.matches("[data-close]") ? "[data-close]"
      : focused.id ? `#${CSS.escape(focused.id)}` : "h1"
    : null;
  if (isFlow(activeRoute)) ensureDraft();
  shell.toggleAttribute("data-flow", isFlow(activeRoute));
  shell.toggleAttribute("data-mood", activeRoute === "registro/animo");
  if (activeRoute === "registro/tipo") renderType();
  else if (activeRoute === "registro/animo") renderMood();
  else if (activeRoute === "registro/emocion") renderEmotion();
  else if (activeRoute === "registro/factores") renderFactors();
  else renderHome();

  document.querySelector("[data-close]")?.addEventListener("click", () => askToClose());
  document.querySelector("[data-back]")?.addEventListener("click", () => {
    const previous = adjacentRoute(activeRoute, -1);
    if (previous) navigate(previous);
    else askToClose();
  });
  document.querySelector("[data-next]")?.addEventListener("click", () => {
    const next = adjacentRoute(activeRoute, 1);
    if (next) navigate(next);
  });
  const heading = app.querySelector("h1");
  if (isFlow(activeRoute)) heading?.setAttribute("aria-describedby", "step-progress");
  if (renderedRoute !== activeRoute || focusTarget) {
    const target = renderedRoute !== activeRoute ? heading : app.querySelector(focusTarget) || heading;
    if (target === heading) heading.tabIndex = -1;
    target?.focus(renderedRoute !== activeRoute ? undefined : { preventScroll: true });
  }
  renderedRoute = activeRoute;
}

async function loadCatalog() {
  if (!catalog.url || !catalog.anonKey) return;
  try {
    const [emotionRows, factorRows] = await Promise.all([
      loadCatalogRows("emociones", catalog),
      loadCatalogRows("factores_vida", catalog)
    ]);
    emotions = emotionRows;
    factors = factorRows;
    catalogProblem = "El catálogo está vacío. Volvé a intentarlo más tarde.";
  } catch {
    catalogProblem = "No se pudo cargar el catálogo. Volvé a intentarlo más tarde.";
  }
  if (activeRoute === "registro/emocion" || activeRoute === "registro/factores") render();
}

homeLink.addEventListener("click", event => {
  event.preventDefault();
  if (isFlow(activeRoute) && draft) askToClose();
  else navigate("");
});

closeDialog.addEventListener("close", () => {
  if (closeDialog.returnValue === "discard") discardDraft();
});

document.querySelector("#emotion-close").addEventListener("click", () => emotionDialog.close());
emotionDialog.addEventListener("close", () => {
  (document.contains(modalOrigin) ? modalOrigin : document.querySelector("#all-emotions"))?.focus();
});
search.addEventListener("input", fillEmotionResults);

window.addEventListener("popstate", () => {
  const target = routeFromUrl();
  let discarded = false;
  try { discarded = sessionStorage.getItem(DISCARDED_KEY) === "1"; } catch { /* In-memory navigation still works. */ }
  if (isFlow(target) && !draft && discarded) {
    navigate("", true);
    return;
  }
  if (isFlow(activeRoute) && !isFlow(target) && draft) {
    history.pushState({ eudilaEntry: true }, "", `#/${activeRoute}`);
    askToClose(target);
    return;
  }
  activeRoute = target;
  render();
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
if (isFlow(activeRoute) && !history.state?.eudilaEntry) {
  history.replaceState({ eudilaEntry: true }, "", "#/");
  history.pushState({ eudilaEntry: true }, "", `#/${activeRoute}`);
}
render();
playIntro();
loadCatalog();
