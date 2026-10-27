# Bienvenida y cierre pausado · 26/10/2026

Pedido: hacer más lento el final de la animación, revisar un error de Next y subir el bloque de acceso con texto arriba.

- Desde el florecimiento coral (8,6 s), el reloj de la apertura corre al 70 % de velocidad. El cierre se extiende de 2,85 a ≈4,07 s; la pieza completa pasa de 11,45 a ≈12,67 s. El motor recibe el mismo delta escalado que la escena para conservar el aterrizaje del logo.
- La bienvenida muestra «Un momento para vos.» y «Elegí cómo querés entrar.» sobre las tres cápsulas. Se mantiene centrada horizontalmente; el margen superior `clamp(24px, 12dvh, 112px)` la sitúa por encima del centro vertical sin recortar el contenido al ampliar texto.
- Se mantienen Lisa, Figtree, tokens coral, Ayuda, foco tras la apertura, salto/Esc, cookie de sesión y movimiento reducido.

[Captura de producción a 390 × 844](bienvenida-390.png). Comparación anterior: [entrada sin título, centrada verticalmente](../entrada-acceso-2026-10-26/bienvenida-390.png).

## Verificación

Build, lint, tipos y formato pasan. `app/bienvenida/browser.test.py` comprueba título visible, bloque por encima del centro a 390 px, cápsulas alineadas, seis casos de reflujo, navegación a ingreso/alta, apertura completa con duración superior a 12 s, salto/Esc, foco, cookie y movimiento reducido. Ahora también captura errores de consola, además de excepciones de JavaScript.

La prueba de bienvenida pasa en desarrollo y producción sin errores de consola ni excepciones. También pasa la regresión de acciones: siete pares AA, estados, teclado y 54 casos de reflujo.

El error de Next reportado por el usuario no se reprodujo en una carga nueva de desarrollo: se observó la apertura completa y no hubo errores ni advertencias de consola. Se solicitó el mensaje exacto para identificarlo; no se afirma que esté corregido. El botón negro con la N de la captura de desarrollo corresponde al indicador del entorno; no se ocultó.

```sh
npm run lint
npm run typecheck
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
npm run start -- --hostname 127.0.0.1 --port 3126
WELCOME_BASE_URL=http://127.0.0.1:3126 WELCOME_ARTIFACT_DIR=docs/design/evidence/bienvenida-cierre-2026-10-26 uv run --with playwright python app/bienvenida/browser.test.py
ACTIONS_BASE_URL=http://127.0.0.1:3126 uv run --with playwright --with pillow python app/design-actions.test.py
```

No se verificaron OAuth real, Safari/Firefox ni hardware móvil. Se reutiliza la coreografía existente y no se vuelve a medir su rendimiento.
