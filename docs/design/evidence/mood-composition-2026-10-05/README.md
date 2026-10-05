# Ambiente y composición · 05/10/2026

ANI-107 / VIS-01 y ANI-113 / VIS-07, rama `feat/mood-ambient-composition`, baseline `60211f4`. Capturas del build Next.js real con preview explícito, Chrome en macOS. No se distribuyen referencias internas.

## Comparación de marca y decisiones

Brandbook v1.0 p. 10 y Motion 0s: ambiente de tres paradas, pregunta centrada, navegación circular y acción inferior. Se conserva el acceso a Ayuda, preview, progreso y tabs sobre fondo continuo; ventanas de aviso/confirmación siguen sobre Nube. Estado Figtree Bold. Orbe cuadrado sin deformación y contenido ampliable con desplazamiento.

Las paradas usan los tokens ambientales existentes, mezcla 72% con Grafito a 56% y casi negro #071416 al final. No son hex ambientales certificados en el brandbook. Siete fondos renderizados se comprueban con sus posiciones/colores computados, sin comparar solo una variable prevista. Contraste de lectura secundaria por estado: 12.77, 11.58, 8.96, 6.88, 6.53, 7.52, 8.76:1 (mínimo de las tres paradas). CTA conserva tintas AA existentes.

Los círculos visuales miden 32px al 14% de blanco; objetivos >=44px. Fila de navegación estable aun con texto 200%. A <=600px se desplaza toda la pantalla para dar espacio legible a los controles; en alturas normales, main conserva scroll interno. Los accesos globales permanecen en el flujo y pueden necesitar desplazamiento en alturas cortas. No se elimina información ni se achica texto.

## Capturas

- `mood-1.png` a `mood-7.png`: siete estados a 390×844; captura con `Siguiente` en hover, subrayado intencional.
- `keyboard-focus.png`: foco de teclado en acción.
- `preview-popover.png`, `close-dialog.png`: ventanas neutras con controles legibles sobre Nube.
- `reflow-*-200-reduced.png`: cabecera/composición al 200% y movimiento reducido; parte del contenido requiere scroll.
- `reflow-*-200-action.png`: acción visible después del desplazamiento, incluyendo 320×470 al 200%.
- `storage-blocked.png`: aviso de borrador con almacenamiento bloqueado.
- `measurements.json`: fondos computados, mínimos de contraste y 84 combinaciones de reflujo.

## Comprobaciones realizadas

```sh
npm run lint
npm run typecheck
npm run format:check
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
npm run start -- --hostname 127.0.0.1 --port 3118
MOOD_BASE_URL=http://127.0.0.1:3118 MOOD_ARTIFACT_DIR=docs/design/evidence/mood-composition-2026-10-05 uv run --with playwright python app/design-mood.test.py
FRONTEND_BASE_URL=http://127.0.0.1:3118 uv run --with playwright --with pypdf python app/frontend.test.py
AUTH_BASE_URL=http://127.0.0.1:3118 uv run --with playwright python app/auth/browser.test.py
ACTIONS_BASE_URL=http://127.0.0.1:3118 uv run --with playwright --with pillow python app/design-actions.test.py
```

Resultados: siete ambientes, contraste real de tres paradas y ventanas neutras, teclado Home/End/flecha/Tab/Enter, cierre/continuación/descarte, preview, Ayuda, cambio de rutas y recuperación al volver/recargar. 84 combinaciones (7 estados × 3 anchos × 2 tamaños de texto × 2 alturas); sin desborde horizontal y con controles completos visibles tras scroll. Fallo de almacenamiento conserva aviso y selección. Regresiones de guardado/reintento, calendario, CSV/JSON/PDF, auth sin POST y 54 casos compartidos de acciones pasan.

Prueba inicialmente roja por ausencia de ambiente. Tras inspección se añadió regresión de alineación atrás/cerrar que falló al 200%, y se corrigió la fila. Revisión independiente detectó blanco en el cierre del popover (1.03:1); la prueba reprodujo el fallo y se corrigió limitando el estilo de Ayuda al header.

Límites: geometría, profundidad y movimiento del orbe pendientes ANI-108/109/112/118; slider/espectro pendiente ANI-110. El range conserva el estilo nativo y color-scheme anterior; esta evidencia no certifica Safari/Firefox ni resuelve el control de esos motores. ANI-114 mantiene el wordmark pendiente. Cambios instantáneos, sin ciclos añadidos, incluso con reduced motion. Sin backend/autenticación real nuevos.
