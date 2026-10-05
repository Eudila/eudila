# Evidencia — acciones y contraste, 04/10/2026

Grupo implementado: ANI-111 / VIS-05, ANI-116 / VIS-10 y ANI-117 / VIS-11. Rama `feat/visual-actions-aa`, desde `bd7339e`. [Plan y agrupación del backlog](../../../plans/2026-10-04-visual-actions.md).

La evidencia corresponde a la app Next.js de producción con preview activo, no al prototipo. Los archivos contienen capturas de la interfaz y datos ficticios de prueba; el PDF/video de marca interno no se incluyen.

## Referencia y decisiones

Brandbook v1.0 p. 10: acción principal en cápsula de 50 pt con acento del ánimo. Se conserva la paleta y se adapta la tinta de azul/turquesa/coral a Grafito conforme a DESIGN.md. Principal y secundaria comparten vocabulario; inputs, selección y tarjetas mantienen radio 14 px. Ayuda del header permanece visible en un toque con objetivo ≥44 px.

Las capturas todavía muestran las diferencias de orbe, ambiente, slider, tipografía y composición del baseline. Este grupo no acredita el cierre de ANI-107/108/109/110/112/113/114/115/118.

## Capturas

- [Siete estados, comparación completa](seven-moods.png).
- [Variantes con ejemplos disabled y loading](variants-and-disabled.png).
- [Hover](mood-hover.png), [foco de teclado](mood-focus.png) y [active](mood-active.png).
- [Principal disabled real](disabled-primary.png) y [secundaria disabled real](disabled-secondary.png).
- [320 px, texto 200%, reduced motion y acceso a Ayuda](reflow-320-200-reduced.png).
- [Guardado real a 390 px / texto 200%, sin cambio de dimensiones](saving-390-200.png).
- [Reintento real a 470 px / texto 200%, sin cambio de dimensiones](retry-470-200.png).
- [Inicio](route-home.png), [ingreso](route-ingresar.png), [crear cuenta](route-crear-cuenta.png) e [historial](route-hoy.png).

## Resultados

[Mediciones de la prueba](measurements.json): siete estados con color exacto del brandbook, tinta AA y contraste calculado sobre estilos computados del navegador. Hover/focus/active mantienen los pares; disabled usa Niebla/Nube sin opacidad.

| Estado | Contraste texto/acento |
| --- | ---: |
| Muy desagradable | 6.34:1 |
| Desagradable | 5.89:1 |
| Algo desagradable | 5.48:1 |
| Neutral | 7.52:1 |
| Algo agradable | 8.35:1 |
| Agradable | 7.68:1 |
| Muy agradable | 5.08:1 |
| Disabled (todos) | 4.91:1 |

Verificados teclado/Enter, slider con flechas/valor accesible, selección, CTA ≥50 px, radios de input/opciones, color institucional exacto fuera de ánimo, ausencia de errores JavaScript y 54 combinaciones de reflujo (nueve rutas × tres anchos × texto 100/200%). Se comprobó el loading en un guardado real: disabled/aria-busy, texto legible, dimensiones estables en el primer intento y en el reintento tras error de almacenamiento, y registro guardado una sola vez. La comparación inicial detectó cambios de 154 a 103 px al guardar y de 103 a 154 px al reintentar; la variante final conserva 154 px en ambas transiciones, con texto al 200%. La preferencia reduced motion conserva el CTA sin animación.

La regresión de frontend verifica registro y edición, guardado/reintento, calendario, corrupción de almacenamiento, CSV/JSON y PDF. Auth verifica validación, contraseña, navegación, cuenta, ausencia de POST y reflujo. La prueba de tokens/layout/registro se ejecuta por separado sin preview (su configuración requerida), incluyendo 68 tokens y los checks preexistentes de AA/navegación/almacenamiento.

## Reproducir

Desde `eudila/`:

```sh
npm run lint
npm run typecheck
NEXT_PUBLIC_FRONTEND_PREVIEW=true NEXT_TELEMETRY_DISABLED=1 npm run build
npm run start -- --hostname 127.0.0.1 --port 3117
```

En otra terminal:

```sh
ACTIONS_BASE_URL=http://127.0.0.1:3117 ACTIONS_ARTIFACT_DIR=docs/design/evidence/visual-actions-2026-10-04 uv run --with playwright --with pillow python app/design-actions.test.py
FRONTEND_BASE_URL=http://127.0.0.1:3117 uv run --with playwright --with pypdf python app/frontend.test.py
AUTH_BASE_URL=http://127.0.0.1:3117 uv run --with playwright python app/auth/browser.test.py
uv run --with playwright python app/tokens/tokens.test.py
```

La última prueba inicia su propio dev server con preview desactivado; no pasarle el servidor de producción con preview. Chrome local o Chromium de Playwright para la evidencia visual. Este grupo no modifica el control range nativo; Safari/Firefox quedan explícitamente pendientes para ANI-110.
