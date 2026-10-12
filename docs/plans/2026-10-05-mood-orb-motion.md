# Orbe y movimiento de marca — Implementation Plan

**Goal:** reproducir la experiencia animada del video Motion en la ruta real de ánimo, bajo la instrucción explícita del usuario.

**Architecture:** renderer SVG compartido y geometría por familias, usando tokens existentes. Un controlador de transición actualiza forma, color, ambiente y acción sobre una sola línea de tiempo de 600ms, sin renders React por frame. CSS lleva respiración/giro/titileo; el controlador pausa los ciclos al ocultarse y respeta reduced motion en vivo. Conserva borrador inmediato, teclado, Ayuda y navegación.

**Tech Stack:** Next.js 16.3.8, React 19, TypeScript/JavaScript, SVG/CSS, requestAnimationFrame, Playwright Chromium/WebKit/Firefox.

## Diseño y alcance

Fuentes: DESIGN.md, PRODUCT.md, brandbook v1.0 pp. 6/10/11 y muestreo Motion 0–18s. Pedido autorizado: «le faltan animaciones, se tiene que ver como la del video». Orbe protagonista, cinco capas con borde de luz y material radial, núcleo blanco estable; desagradables angulosos/puntos, agradables orgánicos/destellos, Neutral circular sin partículas.

Se elige SVG + controlador DOM con RAF (una línea temporal, rebasa cambios rápidos desde la forma visible, sin dependencias). Animaciones CSS independientes de forma/fondo pueden desincronizarse; agregar una librería completa no aporta valor para esta escena acotada. Los ciclos usan transform/opacity, filtros estáticos y gradientes limitados al orbe. No se anima layout ni se bloquea interacción.

600ms cubic-bezier(.32,.72,0,1), respiración 4s ±1.8%, giro alterno 0.05rad/s, partículas 2.5–6s con fases independientes. Al ocultarse se pausa todo; al desmontar se cancelan RAF/listeners. Reduced motion: renderer fijo, transición instantánea y partículas estáticas. Una sola etiqueta anunciada, valor del borrador cambia inmediatamente. La tinta del CTA se elige por contraste en cada frame: blanco/Grafito; negro transitorio si ninguno alcanza AA durante una mezcla (adaptación explícita).

Slider: input range nativo 1–7 y ARIA actuales, pista de espectro 6px, thumb blanco de 30px con punto del estado/halo 9px, objetivo >=44px. Comprobar Blink/WebKit/Gecko, foco, flechas, arrastre y táctil. Historial usa representación compacta estática del renderer, sin ciclos/partículas. Geometría común también orienta el prototipo, sin copiar su CSS de movimiento aproximado. ANI-108/109/110/112 cubren este alcance; ANI-118 conserva cualquier migración completa pendiente del prototipo, ANI-114/115 conservan wordmark/inicio.

## Task 1 — Pruebas rojas

- Crear `app/mood/geometry.test.mjs`: familia/cantidad de puntas/pétalos, círculo, gota, continuidad y finitud de morph; easing/tintas con contraste >=4.5 a lo largo de mezclas.
- Crear `app/mood/motion.test.py`: movimiento real medido en tiempo, interrupción rápida y asentamiento a 600ms, estado/fondo/botón coordinados, pausa/reduced motion, ciclo cancelado en navegación y semántica/slider de marca.
- Ejecutar sobre baseline para demostrar orbe sin material/movimiento y slider sin espectro.

## Task 2 — Renderer, transición y slider

- `prototype/moods.js`: puntos geométricos por familia, fuente de shapePath conservada para consumidores existentes.
- Crear `app/mood/motion.ts` y `app/mood/controller.ts`: easing, mezcla/contraste y controlador DOM cancelable; leer paleta de tokens, sin hex emocionales paralelos.
- Crear `app/mood/orb.tsx`: cinco capas/núcleo iluminados; compacto estático en historial, escena completa con partículas en ánimo.
- Conectar `app/shell.tsx`, `app/actions.ts`, `app/registro/registro.tsx`, `app/historial/views.tsx`; agregar estilos scoped de escena/slider/ciclos a `app/globals.css`.
- Ajustar comprobaciones existentes para esperar el estado asentado; mantener pruebas separadas de los frames transitorios y contraste.

## Task 3 — Validación y muestra

- Lint, types, formato y build preview; geometría/contraste y regresiones de frontend, acciones, composición, auth/análisis según las rutas afectadas.
- Verificar Chrome y motores WebKit/Firefox con teclado/puntero/touch donde disponible, tamaños 320/390/520, 200%, alto corto y reduced motion.
- Comparar capturas y grabación propias con referencias internas; guardar evidencia de la app, no archivos/fotogramas privados. Medir continuidad/duración y pausa, no afirmar FPS de hardware no probado.
- Revisión independiente; actualizar DESIGN.md, brechas, README y evidencia; commit local, renovar preview 3118 y abrirla al usuario. Registrar cierre técnico solo con criterios cumplidos.

Referencias técnicas consultadas: [gradientes SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/radialGradient), [blur SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur), [input range nativo](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range). La marca tiene prioridad sobre timings genéricos de interfaces.

## Resultado · 05/10/2026

Renderer, geometrías, controlador coordinado, partículas y selector implementados. Pruebas rojas originales demostraron falta de renderer/shapePoints; posteriormente pasan geometría/contraste, medición temporal en tres motores, 126 casos de reflujo al 200% más 84 casos de composición, teclado/puntero/tap, pausa/reduced motion y navegación. Transición observada 603–610.9ms, diferencia de progreso menor a 0.009 y AA por frame ≥4.5. Se reprodujo y corrigió el origen SVG desplazado; prueba centrada menor a 0.1 unidades. Revisión independiente sin problemas críticos/importantes; observación menor de duración/coordinación cubierta.

ANI-108/109/112 cumplen su cierre técnico. ANI-110 conserva comprobación pendiente de la app Safari: los tests WebKit/Firefox/Chromium pasan, pero safaridriver 26.5 no respondió al crear sesión en 20s; no se equipara motor WebKit a Safari. ANI-114/115/118 mantienen sus alcances. [Evidencia propia y comandos](../design/evidence/mood-motion-2026-10-05/README.md).
