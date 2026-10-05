# ANI-115 / ANI-118 · Entrada de marca y sistema visual compartido

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** cerrar VIS-09 y VIS-12 en la ruta Next.js real, conservando la animación aprobada y el deslizador continuo.

**Architecture:** `shared/visual/` contiene estados/geometrías, árbol SVG, controlador, entrada y estilos de variantes. React conserva sus nodos mediante un adaptador del árbol; el prototipo serializa ese mismo árbol. `app/globals.css` sigue siendo la fuente editable de tokens; una exportación CSS generada y verificada permite consumirlos sin Tailwind en el prototipo. No se copian las referencias privadas.

**Tech Stack:** Next.js 16.3.8 / React 19.3, JavaScript ESM interoperable, CSS, Web Animations API, Playwright en Chromium/WebKit/Firefox.

---

## Decisión visual

Símbolo Neutral estático de 104 px sobre la pregunta de inicio, con entrada opcional de 600 ms (`opacity: .6 → 1`, `scale: .94 → 1`, curva `.32,.72,0,1`). Solo la primera apertura de la sesión puede animarlo. Cualquier puntero, tecla, salida de ruta, pestaña oculta o cambio a reduced motion lo deja estático. Copy, CTA y Ayuda permanecen utilizables desde SSR. No hay overlay ni montaje publicitario.

Se conservan cinco capas, gradientes radiales, núcleo estable, respiración de 4 s, rotación de 125.663706 s, partículas por familia y ondulación de Algo agradable de 8 s. La variante compacta comparte material/geometría, sin halo, partículas ni movimiento, mínimo 24 px. El prototipo adopta esas variantes y la selección continua; no se migra su navegación funcional a Next.js.

## Tarea 1: demostrar las brechas antes del cambio

**Files:** crear `app/brand/brand.test.py`; conservar `app/mood/geometry.test.mjs`; usar `prototype/splash.test.py`.

1. Agregar comprobaciones de entrada real, salto, sesión, rutas directas, reduced motion/visibilidad/storage bloqueado y SSR sin JavaScript.
2. Comparar árbol/material, colores, ciclos, thumb y posiciones intermedias de Next.js contra prototipo. La captura usa reduced motion para comparar geometría sin tiempos de animación distintos.
3. Ejecutar contra producción de baseline (`BRAND_BASE_URL=http://127.0.0.1:3120`): debe fallar por falta de símbolo y por render/slider distintos.

## Tarea 2: extraer el sistema visual conservando comportamiento

**Files:** crear `shared/visual/{moods.js,orb.js,orb.d.ts,motion.js,controller.js,controller.d.ts,orb.css,actions.css,tokens.css}`, `scripts/visual-tokens.mjs`, `shared/visual/tokens.test.mjs`; modificar `app/mood/{orb.tsx,motion.ts,controller.ts}`, `app/globals.css`, `prototype/{moods.js,app.js,style.css,sw.js,splash.test.py}`, `package.json`.

1. Añadir prueba de exportación desactualizada de tokens, ejecutar y comprobar fallo.
2. Mover geometría y movimiento sin cambiar constantes ni contornos; dejar reexports de compatibilidad. Eliminar hex duplicados de metadata de estados; la prueba AA obtiene paleta del CSS canónico.
3. Árbol SVG compartido con `orbTree(level, id, animated, className)`: React usa `createElement`; prototipo `orbMarkup`. Solo IDs sanitizados y atributos escapados se serializan.
4. Extraer CSS de acciones, escena y range; exportar tokens automáticamente desde `@theme static`, con `npm run visual:tokens` y prueba que falla si está desactualizado. Importar acciones/escena en ambos consumidores.
5. Montar escena una vez por pantalla del prototipo y usar el controlador compartido. `step="any"`, posición flotante en memoria, borrador redondeado entero; flechas/Home/End conservan categorías accesibles. Destruir controlador al salir.
6. Servir prototipo desde raíz del repo, cachear módulos/CSS compartidos y validar arranque offline.
7. Ejecutar geometría, paridad y regresiones de movimiento. Commit de la extracción tras checks verdes.

## Tarea 3: integrar la entrada en Next.js

**Files:** crear `shared/visual/intro.js`, `app/brand/entrance.tsx`; modificar `app/page.tsx`, `app/shell.tsx`, `prototype/app.js`, `prototype/sw.js`.

1. Usar las pruebas rojas de tarea 1 para implementar `playBrandIntro(element)` con limpieza idempotente de animación/listeners. Marcar sesión visitada desde shell incluso en rutas directas; la decisión de reproducir vive solo en el primer montaje de inicio.
2. El cliente decorativo del inicio renderiza `MoodOrb level={4}` dentro de `.home-orb`; el servidor mantiene acciones y texto. Agregar únicamente el espacio del símbolo, manteniendo jerarquía actual.
3. Compartir la misma política de entrada con el prototipo.
4. Build y verificar entrada en tres motores, keyboard/foco/Ayuda, 320/390/520 a 100/200%, storage bloqueado y sin JS. Commit tras checks verdes.

## Tarea 4: verificar, documentar y publicar la rama

**Files:** `DESIGN.md`, `README.md`, `AGENTS.md` si cambia la ubicación canónica, `docs/design/brand-review-2026-10-04.md`, `docs/design/evidence/brand-system-2026-10-05/`.

1. `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check`, pruebas Node de geometría y exportación de tokens.
2. Servidor producción nuevo (3130); `BRAND_BASE_URL` para entrada/paridad; `MOTION_BASE_URL` para motion/continuous; `MOOD_BASE_URL` para composición; `TOKENS_BASE_URL` y `FRONTEND_BASE_URL` para shell y flujo; prueba splash/offline.
3. Guardar capturas propias de inicio, comparación de siete estados y compacto, foco y reflujo con mediciones. WebKit es cobertura de motor, no atribuirla a Safari manual. La validación manual de Safari de ANI-110 ya está registrada; no reabrirla.
4. Aplicar @superpowers:requesting-code-review y resolver hallazgos importantes.
5. Actualizar decisiones y VIS-09/VIS-12 con evidencia real, commit y push de `feat/brand-entry-shared-visuals`. Marcar ambos issues Done con enlaces a evidencia y commit. No merge ni deploy.

## Baseline

Partimos de `4172a9e` (ANI-114). `npm ci` completado; geometría y estado del prototipo: 7 pruebas verdes. Branch aislada en `/Users/147pop/.config/superpowers/worktrees/eudila/ani-115-118-brand-system`.
