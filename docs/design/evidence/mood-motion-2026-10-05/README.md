# Orbe y movimiento · evidencia 05/10/2026

Build Next.js de producción, preview explícito, `/registro/animo` en `127.0.0.1:3118`. Rama `feat/mood-orb-motion`, desde `31d84b0`. Implementación ANI-108/109/112; ANI-110 implementada y verificada en Chromium/WebKit/Firefox, con comprobación de la app Safari pendiente. [Plan](../../../plans/2026-10-05-mood-orb-motion.md).

Comparación con brandbook pp. 6/10/11 y Motion muestreado 0–18s: cinco capas translúcidas, borde de luz, núcleo blanco, círculo Neutral sin partículas, puntas/puntos desagradables y pétalos/destellos agradables. No se importan ni publican las referencias internas. Geometría común y renderer Next compartido; el material del prototipo aún requiere migración en ANI-118.

- Estados actuales: [1](mood-1.png), [2](mood-2.png), [3](mood-3.png), [Neutral](mood-4.png), [5](mood-5.png), [6](mood-6.png), [7](mood-7.png).
- Grabaciones propias de interacción, cambio rápido, ciclos, pausa/reduced motion y navegación: [Chromium](chromium-motion.webm), [WebKit](webkit-motion.webm), [Firefox](firefox-motion.webm). También hay capturas Neutral/agradable por motor.
- [Texto 200%, 320×470](reflow-320-470-200-reduced.png), [acción después de desplazar](reflow-320-470-200-action.png), [foco](keyboard-focus.png), [preview sobre Nube](preview-popover.png), [diálogo](close-dialog.png).
- [Mediciones de ambiente y 84 casos](measurements.json), [mediciones temporales por motor](motion-measurements.json).

## Resultados

Los tres motores comprobaron respiración 0.982–1.018 en ciclo de 4s, cinco giros alternos de 125.663706s, titileo independiente 2.5–6s, forma y colores coordinados, retargeting continuo, tinta AA cuadro por cuadro y cambios instantáneos/fijos con reduced motion en vivo. Se corrigió una desviación de 11–36 unidades SVG en capas internas: el origen explícito 110,110 conserva el núcleo centrado y la prueba verifica desviación menor a 0.1.

| Motor | Transición observada | Diferencia máxima de progreso entre forma/colores | Contraste mínimo muestreado | Reflujo al 200% |
| --- | --- | --- | --- | --- |
| Chromium | 610.9ms | 0.0060 | ≥4.5:1 | 42 casos |
| WebKit | 604.0ms | 0.0079 | 4.57:1 | 42 casos |
| Firefox | 603.0ms | 0.0085 | 4.55:1 | 42 casos |

La transición se programa a 600ms; el asentamiento observable cae en el siguiente frame. Se comparan geometrías asentadas independientes y el progreso real de forma/acento/ambiente/tinte, además de observar cambios en el degradé. No se afirma FPS sostenido de hardware. La tinta negra transitoria cubre mezclas donde blanco/Grafito no llegan a AA; los estados asentados conservan sus tintas de marca adaptadas.

Teclado Home/End/flechas y puntero/click/arrastre pasan en los tres motores; tap nativo en contextos táctiles de Chromium/WebKit. 42 casos por motor: siete estados × anchos 320/390/520 × altos 844/470 con texto 200%, sin desborde horizontal y controles ≥44px visibles al desplazar. Además pasan los 84 casos de composición con texto 100/200% en Chromium. Pausa/reanudación utiliza señal sintética `hidden`/`visibilitychange`, con transformaciones detenidas; navegación cancela el controlador y vuelve al lienzo neutro. Recarga conserva borrador y arranca asentada.

WebKit de Playwright no es la app Safari ni un dispositivo iOS físico. Se intentó crear una sesión local con Safari 26.5/safaridriver; no respondió dentro de 20s. Se detuvo el driver y la comprobación específica de Safari permanece pendiente; VIS-04 no se declara cerrada.

## Comandos y revisión

```sh
npm run lint
npm run typecheck
npm run format:check
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
node --experimental-strip-types --test app/mood/geometry.test.mjs app/historial/records.test.mjs app/exportar/export.test.mjs app/analisis/data.test.mjs
node --test prototype/flow-state.test.mjs
MOTION_BASE_URL=http://127.0.0.1:3118 MOTION_ENGINES=chromium,webkit,firefox MOTION_ARTIFACT_DIR=docs/design/evidence/mood-motion-2026-10-05 uv run --with playwright python app/mood/motion.test.py
MOOD_BASE_URL=http://127.0.0.1:3118 MOOD_ARTIFACT_DIR=docs/design/evidence/mood-motion-2026-10-05 uv run --with playwright python app/design-mood.test.py
ACTIONS_BASE_URL=http://127.0.0.1:3118 uv run --with playwright --with pillow python app/design-actions.test.py
FRONTEND_BASE_URL=http://127.0.0.1:3118 uv run --with playwright --with pypdf python app/frontend.test.py
```

Build, lint, types, formato, unidades y regresiones funcionales de frontend/auth/análisis/acciones pasan. Las pruebas de renderer/geometría fallaron en baseline antes de implementar. Revisión independiente sin problemas críticos/importantes: comparó referencias y verificó entrada por navegación cliente, pausa/reanudación durante transición y cambio de reduced motion en vivo. Su observación sobre medir duración/coordinación se incorporó a la prueba temporal.
