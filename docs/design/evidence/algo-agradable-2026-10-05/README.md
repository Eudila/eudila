# Algo agradable · corrección 05/10/2026

Pedido: corregir únicamente la animación del estado 5; los otros seis están aceptados. Preview Next.js de producción en `/registro/animo`, desde `a0f13ba`. [Plan y diagnóstico](../../../plans/2026-10-05-algo-agradable.md).

La gota estrecha anterior hacía que las capas giratorias leyeran como triángulos. Se comparó con brandbook p.6 y Motion alrededor de 7s: contorno amplio y orgánico. Diez apoyos suaves sustituyen ocho; radio mínimo 84 / máximo 100.81, proporción 1.20 frente a 1.35 anterior. Se conserva asimetría y topología para morph. Los otros seis paths son idénticos al baseline mediante SHA256; renderer, fases, ciclos y colores no cambian.

- [Antes](../mood-motion-2026-10-05/mood-5.png), [ahora en movimiento](algo-agradable-live.png).
- Giro inspeccionado en fases [0s](algo-agradable-turn-0.png), [30s](algo-agradable-turn-30.png), [60s](algo-agradable-turn-60.png), [90s](algo-agradable-turn-90.png). Las fases se buscaron con Web Animations API, conservando los offsets alternos.
- [Grabación propia](algo-agradable-motion.webm): cambios 4→5→6→5→4→5, inspección de giro y accesibilidad; no contiene fotogramas de referencia.
- [Movimiento reducido](algo-agradable-reduced.png), [320×470 / texto 200% / acción desplazada](algo-agradable-320-200.png).

La prueba nueva de amplitud falla antes del arreglo y pasa después. Los cuatro tests de geometría/familias/morph/AA/conservación pasan. Build, lint y formato pasan. Regresión `app/mood/motion.test.py` pasa en Chromium, WebKit y Firefox (transición/interrupción, contraste por frame, pausa/reduced motion, teclado/puntero, navegación y 42 casos de reflujo al 200% por motor). La comprobación específica del estado 5 verifica los cambios vecinos, cinco capas centradas (desviación máxima <0.00001 unidades SVG), cuatro fases de giro y reflujo 320px/200%. No se afirma prueba en Safari ni hardware móvil físico.

Revisión independiente aprobada sin problemas concretos: lectura amplia/orgánica durante giro, alcance limitado al estado 5 y conservación de los seis contornos/ciclos/colores aceptados.

```sh
node --experimental-strip-types --test app/mood/geometry.test.mjs
npm run lint
npm run format:check
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
MOTION_BASE_URL=http://127.0.0.1:3118 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/motion.test.py
```
