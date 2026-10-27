// Movimiento de la landing. La mascota es la de la app (mascota.js, sincronizado
// desde app/mood/critter.ts) y respeta docs/design/mascota/README.md:
// nunca sigue al puntero, cada una tiene su reloj y con movimiento reducido queda quieta.
import { Critter, subscribe, now, orbAt, rgba } from "./mascota.js";
import { moods } from "./moods.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const label = (m) => moods[clamp(Math.round(m), 1, 7) - 1].label;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const ACCENT = moods.map((m) => hex(m.accent));
const accentAt = (m) => {
  m = clamp(m, 1, 7);
  const i = Math.min(5, Math.floor(m - 1)),
    f = m - 1 - i;
  return ACCENT[i].map((v, j) => Math.round(v + (ACCENT[i + 1][j] - v) * f));
};

// Curva de marca cubic-bezier(.32,.72,0,1), la misma de los cambios de estado.
function brand(t) {
  const f = (a, b, u) =>
    3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * b + u * u * u;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let lo = 0,
    hi = 1,
    u = t;
  for (let i = 0; i < 22; i++) {
    u = (lo + hi) / 2;
    if (f(0.32, 0, u) < t) lo = u;
    else hi = u;
  }
  return f(0.72, 1, u);
}

/**
 * Monta una mascota en su canvas, con su propio reloj. `paint` dibuja la escena
 * (por defecto, la mascota centrada). Se pausa fuera de pantalla y con la pestaña oculta.
 */
function mount(
  canvas,
  { mood, faceScale = 1, particles = 1, size = 0.34, y = 0.5, paint, onTap },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const c = new Critter({ mood, faceScale, particles });
  let w = 0,
    h = 0,
    dpr = 1,
    visible = false,
    stop = null;
  const scene = {
    critter: c,
    get size() {
      return { w, h, dpr };
    },
    redraw: () => !stop && scene.active && draw(now(), 0),
    active: true,
  };
  function draw(t, dt) {
    if (w < 2 || h < 2) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    if (paint) paint(ctx, w, h, t, dt, dpr);
    else c.render(ctx, w / 2, h * y, Math.min(w, h) * size, h, t, dt, dpr);
    canvas.parentElement?.setAttribute("data-live", "");
  }
  scene.draw = draw;
  function sync() {
    c.reduced = reduced.matches;
    const run = visible && scene.active && !c.reduced;
    if (run && !stop) stop = subscribe(draw);
    if (!run && stop) {
      stop();
      stop = null;
    }
    if (!run && scene.active) draw(now(), 0);
    if (!scene.active) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  scene.sync = sync;
  new ResizeObserver(([entry]) => {
    ({ width: w, height: h } = entry.contentRect);
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    scene.onResize?.();
    scene.redraw();
  }).observe(canvas);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      scene.onVisible?.(visible);
      sync();
    },
    { rootMargin: "120px" },
  ).observe(canvas);
  reduced.addEventListener("change", sync);
  // El toque es la única entrada del puntero: una reacción, nunca seguimiento.
  canvas.addEventListener("pointerdown", () => {
    const t = now();
    if (onTap) onTap(c, t);
    else c.wobT = t;
  });
  return scene;
}

/* 1 · Portada: mascota, reflejo de espejo y el selector de la app ------------------ */
function hero() {
  const stage = document.querySelector("[data-stage]");
  const canvas = stage?.querySelector("canvas");
  const range = stage?.querySelector("[data-stage-range]");
  const stateEl = stage?.querySelector("[data-stage-state]");
  if (!canvas || !range || !stateEl) return;

  const buf = document.createElement("canvas"),
    bctx = buf.getContext("2d");
  const ref = document.createElement("canvas"),
    rctx = ref.getContext("2d");
  let tween = null; // { from, to, t0, dur }
  let auto = !reduced.matches;
  let autoAt = now() + 3.6; // después del Saludo
  let autoIdx = 0;
  const PENDULUM = [4, 3, 5, 2, 6, 1, 7]; // el mismo péndulo de la Apertura
  let lastLabel = "";

  function setValue(v) {
    range.value = String(v);
    const l = label(v);
    if (l !== lastLabel) {
      lastLabel = l;
      stateEl.textContent = l;
      range.setAttribute("aria-valuetext", l);
    }
    stage.style.setProperty("--mood-accent", `rgb(${accentAt(v).join(" ")})`);
  }
  function goTo(target, animate = true) {
    const c = scene.critter,
      t = now();
    if (!animate || reduced.matches) {
      tween = null;
      c.mt = target;
      setValue(target);
      scene.redraw();
      return;
    }
    tween = { from: c.mt, to: target, t0: t, dur: 0.6 };
  }

  const scene = mount(canvas, {
    mood: 7,
    paint(ctx, w, h, t, dt, dpr) {
      const c = scene.critter;
      if (tween) {
        const p = clamp((t - tween.t0) / tween.dur);
        const v = tween.from + (tween.to - tween.from) * brand(p);
        c.mt = v;
        setValue(v);
        if (p >= 1) tween = null;
      }
      if (auto && t > autoAt && !tween) {
        goTo(PENDULUM[autoIdx % PENDULUM.length]);
        autoIdx++;
        autoAt = t + (autoIdx % PENDULUM.length === 0 ? 5.2 : 2.4);
      }

      const R = Math.min(w, h) * 0.25,
        cx = w / 2,
        cy = h * 0.4,
        floor = cy + R * 1.06,
        depth = Math.min(h - floor, R * 1.1);
      // La luz pertenece al orbe: un halo del color del estado, nada más.
      const col = orbAt(c.m);
      // Se apaga antes del borde del canvas: sin cortes rectos.
      const glow = ctx.createRadialGradient(
        cx,
        cy,
        R * 0.2,
        cx,
        cy,
        Math.min(cx, cy, h - cy) * 0.98,
      );
      glow.addColorStop(0, rgba(col, 0.2));
      glow.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      for (const b of [buf, ref]) {
        if (b.width !== canvas.width || b.height !== canvas.height) {
          b.width = canvas.width;
          b.height = canvas.height;
        }
      }
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);
      c.render(bctx, cx, cy, R, h, t, dt, dpr);

      // Reflejo: la mascota invertida bajo el piso, con una onda lenta de agua quieta.
      rctx.setTransform(1, 0, 0, 1, 0, 0);
      rctx.globalCompositeOperation = "source-over";
      rctx.clearRect(0, 0, ref.width, ref.height);
      const step = 2,
        still = reduced.matches;
      for (let j = 0; j < depth; j += step) {
        const sy = (floor - j - step) * dpr;
        if (sy < 0) break;
        const wave = still
          ? 0
          : Math.sin(j * 0.11 - t * 1.4) * (0.6 + j * 0.035);
        rctx.drawImage(
          buf,
          0,
          sy,
          buf.width,
          step * dpr,
          wave * dpr,
          (floor + j) * dpr,
          buf.width,
          step * dpr,
        );
      }
      rctx.globalCompositeOperation = "destination-in";
      const fade = rctx.createLinearGradient(
        0,
        floor * dpr,
        0,
        (floor + depth) * dpr,
      );
      fade.addColorStop(0, "rgba(0,0,0,.3)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      rctx.fillStyle = fade;
      rctx.fillRect(0, floor * dpr, ref.width, depth * dpr);

      ctx.drawImage(ref, 0, 0, w, h);
      // Piso: una línea de luz apenas visible donde se apoya.
      const line = ctx.createLinearGradient(cx - R * 1.6, 0, cx + R * 1.6, 0);
      line.addColorStop(0, rgba(col, 0));
      line.addColorStop(0.5, rgba(col, 0.35));
      line.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = line;
      ctx.fillRect(cx - R * 1.6, floor, R * 3.2, 1);
      ctx.drawImage(buf, 0, 0, w, h);
    },
  });
  if (!scene) return;
  scene.critter.play("hola", now());
  setValue(7);

  const stopAuto = () => {
    auto = false;
  };
  range.addEventListener("pointerdown", stopAuto);
  range.addEventListener("input", () => {
    stopAuto();
    tween = null;
    const v = Number(range.value);
    scene.critter.mt = v;
    setValue(v);
    // Escucha: mira hacia el selector, nunca al pulgar.
    scene.critter.listenUntil = now() + 0.9;
    scene.redraw();
  });
  range.addEventListener("keydown", (e) => {
    const v = Math.round(Number(range.value));
    const map = {
      ArrowRight: v + 1,
      ArrowUp: v + 1,
      PageUp: v + 1,
      ArrowLeft: v - 1,
      ArrowDown: v - 1,
      PageDown: v - 1,
      Home: 1,
      End: 7,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    stopAuto();
    goTo(clamp(map[e.key], 1, 7));
    scene.critter.listenUntil = now() + 0.9;
  });
  scene.onVisible = (v) => {
    // Al volver a la portada, el péndulo sigue desde donde quedó.
    if (v && auto) autoAt = Math.max(autoAt, now() + 1.2);
  };
}

/* 2 · La semana: el scroll revela lo que el «bien» no contó ------------------------ */
function week() {
  const section = document.querySelector("[data-week]");
  if (!section) return;
  const sticky = section.querySelector(".week-sticky");
  const days = [...section.querySelectorAll(".week-days li")];
  const answer = section.querySelector("[data-week-answer]");
  const scenes = days.map((li) =>
    mount(li.querySelector("canvas"), {
      mood: Number(li.dataset.mood),
      size: 0.28,
      particles: 0.6,
    }),
  );
  scenes.forEach((s) => s && (s.active = false));
  let shown = -1;
  let still = null;

  function reveal(count) {
    if (count === shown) return;
    days.forEach((li, i) => {
      const on = i < count;
      const was = li.hasAttribute("data-revealed");
      li.toggleAttribute("data-revealed", on);
      const s = scenes[i];
      if (!s) return;
      s.active = on;
      if (on && !was) s.critter.play("hola", now());
      s.sync();
    });
    shown = count;
  }

  // El fijado solo sirve si todo el panel entra en la ventana: si no (laptops bajas,
  // celulares acostados) o con movimiento reducido, se muestra completo y sin fijar.
  function naturalHeight() {
    const had = section.classList.contains("is-still");
    section.classList.add("is-still");
    const h = sticky.getBoundingClientRect().height;
    if (!had) section.classList.remove("is-still");
    return h;
  }
  function update() {
    if (still) return;
    const r = section.getBoundingClientRect();
    const span = Math.max(1, r.height - innerHeight);
    const p = clamp(-r.top / span);
    reveal(
      Math.floor(
        clamp((p - 0.12) / 0.56) * days.length + (p > 0.12 ? 0.999 : 0),
      ),
    );
    answer.style.setProperty(
      "--fade",
      String(1 - 0.72 * clamp((p - 0.62) / 0.18)),
    );
    section.toggleAttribute("data-closed", p > 0.72);
  }
  function applyMode() {
    const next = reduced.matches || naturalHeight() > innerHeight;
    if (next === still) return update();
    still = next;
    section.classList.toggle("is-still", next);
    if (next) {
      reveal(days.length);
      answer.style.setProperty("--fade", "1");
      section.setAttribute("data-closed", "");
    } else {
      shown = -1;
      update();
    }
  }

  let queued = 0;
  addEventListener(
    "scroll",
    () =>
      !queued &&
      (queued = requestAnimationFrame(() => ((queued = 0), update()))),
    { passive: true },
  );
  let resizing = 0;
  addEventListener("resize", () => {
    clearTimeout(resizing);
    resizing = setTimeout(applyMode, 120);
  });
  reduced.addEventListener("change", applyMode);
  document.fonts?.ready.then(applyMode);
  applyMode();
}

/* 3 · Video: se reproduce mudo solo cuando se ve, nunca con movimiento reducido ----- */
function reel() {
  const video = document.querySelector("[data-reel]");
  const toggle = document.querySelector("[data-reel-toggle]");
  const text = toggle?.querySelector("[data-reel-label]");
  if (!video || !toggle || !text) return;
  let userPaused = reduced.matches;
  const paint = () => {
    const playing = !video.paused;
    toggle.setAttribute("aria-pressed", String(playing));
    text.textContent = playing ? "Pausar video" : "Reproducir video";
  };
  video.addEventListener("play", paint);
  video.addEventListener("pause", paint);
  toggle.addEventListener("click", () => {
    if (video.paused) {
      userPaused = false;
      video.play().catch(() => {});
    } else {
      userPaused = true;
      video.pause();
    }
  });
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !userPaused) video.play().catch(() => {});
      if (!entry.isIntersecting) video.pause();
    },
    { threshold: 0.45 },
  ).observe(video);
  paint();
}

/* 4 · Pasos del registro: las capturas reales avanzan solas mientras se ven -------- */
function steps() {
  const section = document.querySelector("[data-steps]");
  if (!section) return;
  const buttons = [...section.querySelectorAll("[data-step]")];
  const shots = [...section.querySelectorAll(".phone-screens img")];
  let index = 0,
    timer = 0,
    visible = false,
    manual = reduced.matches;
  const HOLD = 2800;

  function show(i) {
    index = (i + shots.length) % shots.length;
    shots.forEach((img, k) => img.classList.toggle("is-active", k === index));
    buttons.forEach((b, k) => {
      if (k === index) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    section.classList.remove("is-running");
    if (!manual && visible) {
      void section.offsetWidth; // reinicia la barra de progreso del paso
      section.classList.add("is-running");
    }
  }
  function schedule() {
    clearTimeout(timer);
    if (manual || !visible) return;
    timer = setTimeout(() => {
      show(index + 1);
      schedule();
    }, HOLD);
  }
  buttons.forEach((b, k) =>
    b.addEventListener("click", () => {
      manual = true;
      clearTimeout(timer);
      show(k);
    }),
  );
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      show(index);
      schedule();
    },
    { threshold: 0.35 },
  ).observe(section);
}

/* 5 · Gráfico del psicólogo: se dibuja una vez al entrar ---------------------------- */
function chart() {
  const fig = document.querySelector("[data-chart]");
  if (!fig || reduced.matches) return;
  if (fig.getBoundingClientRect().top < innerHeight * 0.85) return; // ya visible al cargar
  fig.classList.add("is-armed");
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      fig.classList.add("is-drawn");
      io.disconnect();
    },
    { threshold: 0.4 },
  );
  io.observe(fig);
}

/* 6 · Gamificación: la mascota celebra el registro, igual en cualquier estado ------- */
function streak() {
  const canvas = document.querySelector("[data-streak]");
  if (!canvas) return;
  let next = now() + 1.2;
  const scene = mount(canvas, {
    mood: 7,
    size: 0.26,
    particles: 0,
    paint(ctx, w, h, t, dt, dpr) {
      if (t > next) {
        scene.critter.play("guardar", t);
        next = t + 5.5;
      }
      scene.critter.render(
        ctx,
        w / 2,
        h / 2,
        Math.min(w, h) * 0.26,
        h,
        t,
        dt,
        dpr,
      );
    },
  });
}

/* 7 · Noainova: Guardado al entrar en pantalla; tocala y salta --------------------- */
function win() {
  const canvas = document.querySelector("[data-win]");
  if (!canvas) return;
  let played = false;
  const scene = mount(canvas, {
    mood: 7,
    size: 0.27,
    faceScale: 1.3,
    onTap(c, t) {
      c.play("hop", t);
      c.wobT = t + 1;
    },
  });
  if (!scene) return;
  scene.onVisible = (v) => {
    if (v && !played) {
      played = true;
      setTimeout(() => scene.critter.play("guardar", now()), 250);
    }
  };
}

/* Botones de interés: preseleccionan el motivo en el formulario -------------------- */
function interest() {
  for (const link of document.querySelectorAll("[data-interest]")) {
    link.addEventListener("click", () => {
      const radio = document.querySelector(
        `#interest-${link.dataset.interest}`,
      );
      if (radio) radio.checked = true;
    });
  }
}

hero();
week();
reel();
steps();
chart();
streak();
win();
interest();
