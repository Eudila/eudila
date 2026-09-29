// SPDX-License-Identifier: AGPL-3.0-only
import { catalog } from "./config.js";
import { adjacentRoute, newDraft, restoreDraft, steps, types } from "./flow-state.js";

const DRAFT_KEY = "eudila-draft-v1";
const DISCARDED_KEY = "eudila-draft-discarded";
const moods = [
  { label: "Muy desagradable", accent: "#892FC9", orb: "#A845DA", ambient: "#32134D", points: 9, depth: .27, lightInk: true },
  { label: "Desagradable", accent: "#5B4CE1", orb: "#8A68D8", ambient: "#26235B", points: 14, depth: .17, lightInk: true },
  { label: "Algo desagradable", accent: "#209AE7", orb: "#3BBADF", ambient: "#123F60", points: 12, depth: .08, lightInk: true },
  { label: "Neutral", accent: "#2EC0BC", orb: "#5FD3D0", ambient: "#0F5654", points: 0, depth: 0, lightInk: true },
  { label: "Algo agradable", accent: "#77CB47", orb: "#B6D57A", ambient: "#285B25", points: 1, depth: .14, lightInk: false },
  { label: "Agradable", accent: "#FE9613", orb: "#F2B24A", ambient: "#6C3B0B", points: 7, depth: .13, lightInk: false },
  { label: "Muy agradable", accent: "#FF4A4B", orb: "#E65175", ambient: "#712127", points: 9, depth: .19, lightInk: true }
];

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
  history[replace ? "replaceState" : "pushState"]({}, "", `#/${route}`);
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

function shapePath(mood) {
  const points = Array.from({ length: 120 }, (_, index) => {
    const angle = (index / 120) * Math.PI * 2 - Math.PI / 2;
    const wave = mood.points === 1 ? Math.sin(angle) : Math.cos(mood.points * angle);
    const radius = 82 * (1 + mood.depth * wave);
    return `${(110 + Math.cos(angle) * radius).toFixed(1)} ${(110 + Math.sin(angle) * radius).toFixed(1)}`;
  });
  return `M${points.join("L")}Z`;
}

function orbMarkup(mood) {
  const path = shapePath(mood);
  return `<svg class="orb" viewBox="0 0 220 220" aria-hidden="true">
    <path d="${path}" fill="currentColor" opacity=".18"/>
    <path d="${path}" transform="translate(110 110) scale(.82) translate(-110 -110)" fill="currentColor" opacity=".30"/>
    <path d="${path}" transform="translate(110 110) scale(.63) translate(-110 -110)" fill="currentColor" opacity=".48"/>
    <path d="${path}" transform="translate(110 110) scale(.45) translate(-110 -110)" fill="currentColor" opacity=".7"/>
    <path d="${path}" transform="translate(110 110) scale(.29) translate(-110 -110)" fill="currentColor" opacity=".9"/>
    <circle cx="110" cy="110" r="17" fill="white" opacity=".94"/>
  </svg>`;
}

function flowHeader(index) {
  return `<div class="flow-nav">
    <button class="circle-button" type="button" data-back aria-label="Volver">‹</button>
    <span>Registro · ${index + 1} de ${steps.length}</span>
    <button class="circle-button" type="button" data-close aria-label="Cerrar registro">×</button>
  </div>`;
}

function renderHome() {
  app.innerHTML = `<section class="home-screen">
    <div class="home-copy">
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
      <div id="quick-options" class="chip-list" aria-label="Emociones sugeridas"></div>
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
  render();
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
      <div id="factor-options" class="chip-list" aria-label="Factores de vida"></div>
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
  if (isFlow(activeRoute)) ensureDraft();
  shell.toggleAttribute("data-flow", isFlow(activeRoute));
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
  if (renderedRoute !== activeRoute) {
    const heading = app.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    renderedRoute = activeRoute;
  }
}

async function loadCatalog() {
  if (!catalog.url || !catalog.anonKey) return;
  const base = catalog.url.replace(/\/$/, "");
  const headers = { apikey: catalog.anonKey, Authorization: `Bearer ${catalog.anonKey}` };
  try {
    const [emotionResponse, factorResponse] = await Promise.all([
      fetch(`${base}/rest/v1/emociones?select=id,nombre,sugerida&order=nombre.asc`, { headers }),
      fetch(`${base}/rest/v1/factores_vida?select=id,nombre&order=nombre.asc`, { headers })
    ]);
    if (!emotionResponse.ok || !factorResponse.ok) throw new Error("Catalog unavailable");
    const [emotionRows, factorRows] = await Promise.all([emotionResponse.json(), factorResponse.json()]);
    if (!Array.isArray(emotionRows) || !Array.isArray(factorRows)) throw new Error("Invalid catalog");
    emotions = emotionRows.filter(row => row && row.id != null && typeof row.nombre === "string" && typeof row.sugerida === "boolean");
    factors = factorRows.filter(row => row && row.id != null && typeof row.nombre === "string");
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
    history.pushState({}, "", `#/${activeRoute}`);
    askToClose(target);
    return;
  }
  activeRoute = target;
  render();
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
render();
loadCatalog();
