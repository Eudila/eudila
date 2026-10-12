# Transición completa y slider continuo · 05/10/2026

Preview Next.js de producción `/registro/animo`, desde `d441589`. [Plan](../../../plans/2026-10-05-mood-continuous.md). El usuario precisó que había que revisar la transición completa de Algo agradable y eliminar detenciones del selector.

Video pausado en fotogramas de entrada/permanencia/salida: 5.8–7.4s cada 100ms y 15–17s cada 167ms. Se observa progresión de pétalos hacia contorno orgánico, ondulación de capas durante permanencia y salida hacia círculo. Las fuentes/fotogramas internos se mantienen fuera del producto. El arreglo anterior solo modificaba la silueta fija; `step=1` y el reinicio de 600ms por categoría mantenían una interacción discontinua.

El range ahora usa `step=any`, conserva cada posición al soltar y mezcla vecinos directamente durante el arrastre. El estado 5 agrega ondulación radial contenida, con núcleo fijo y fases independientes por capa. Los 8s/0.7rad de esa ondulación son una traducción técnica, no timings medidos del video ni especificados por el PDF. Los seis contornos restantes, colores, giro y respiración conservan sus valores aprobados. Teclado recorre categorías con transición de 600ms; el registro guarda el entero más cercano. Navegar conserva la posición visual fraccionaria; recargar restaura la categoría guardada.

- Transición de la app: [6.0](transition-6.0.png), [5.5](transition-5.5.png), [Algo agradable 5.0](transition-5.0.png), [4.5](transition-4.5.png), [Neutral 4.0](transition-4.0.png).
- Grabaciones propias del arrastre completo, reversa, permanencia, pausa, reduced motion y teclado: [Chromium](chromium-continuous.webm), [WebKit](webkit-continuous.webm), [Firefox](firefox-continuous.webm).
- [Mediciones](measurements.json): **61 posiciones distintas** por motor; 5.25 permanece después de soltar/esperar 700ms; contraste mínimo observado **4.716:1**; borrador entero 5. Tap en contexto táctil conserva 5.25 en Chromium/WebKit. No se presenta como dispositivo físico ni app Safari.

## Verificación

Pruebas nuevas de posición/ondulación y arrastre fallan en baseline; pasan después del cambio. Se reprodujo además una pausa incorrecta de destellos cerca de Neutral: el selector CSS usaba la categoría redondeada. La prueba falla a 4.25 y pasa al restringir la pausa al centro exacto.

Se comprobaron más de 50 geometrías y colores distintos en el recorrido; correspondencia inmediata entre posición/color, sin snap al soltar; deformación orgánica durante permanencia; pausa de RAF por señal de visibilidad sintética; reduced motion en vivo; flechas/Home/End; navegación y recarga con borrador válido. Regresión de movimiento pasa en Chromium/WebKit/Firefox, incluidos 42 casos de reflujo al 200% por motor. Las mediciones de coordinación usan tiempos relativos al inicio observado de la transición, evitando confundir latencia del driver con la animación.

Build/lint/types/formato, seis tests de geometría/morph/AA/conservación y estado del prototipo pasan. Recorrido completo de frontend verifica edición/guardado/reintento, calendario, CSV/JSON/PDF, corrupción y reflujo. Revisión independiente comprobó pausa/reanudación en 5.25, reduced motion en 5.37 y persistencia/retorno/recarga, sin problemas concretos.

```sh
node --experimental-strip-types --test app/mood/geometry.test.mjs
node --test prototype/flow-state.test.mjs
npm run lint
npm run typecheck
npm run format:check
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
MOTION_BASE_URL=http://127.0.0.1:3118 MOTION_ENGINES=chromium,webkit,firefox CONTINUOUS_ARTIFACT_DIR=docs/design/evidence/mood-continuous-2026-10-05 uv run --with playwright python app/mood/continuous.test.py
MOTION_BASE_URL=http://127.0.0.1:3118 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/motion.test.py
MOOD_BASE_URL=http://127.0.0.1:3118 uv run --with playwright python app/design-mood.test.py
FRONTEND_BASE_URL=http://127.0.0.1:3118 uv run --with playwright --with pypdf python app/frontend.test.py
```
