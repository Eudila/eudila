# ANI-115 / ANI-118 · Entrada y sistema visual compartido

Validación de producción Next.js (`http://127.0.0.1:3130`, `NEXT_PUBLIC_FRONTEND_PREVIEW=true`) sobre `092c668`, con base aprobada `4172a9e`. Capturas y video propios de la app; no se incluyen PDF, videos ni fotogramas internos de referencia.

## Resultado visual

- [Inicio Next.js, 390 px](home-chromium-390-100.png): símbolo Neutral de 104 px en su propia caja sobre la pregunta, superficie Nube, texto y acciones disponibles desde SSR. Material de cinco capas y núcleo, sin halo/partículas/ciclos continuos en inicio.
- [Entrada real grabada](home-entry.webm): gesto opcional de 600 ms, escala .94→1 y opacidad .6→1; no hay overlay ni espera para usar Empezar/Ayuda. La duración es la del efecto verificado, no una medición del montaje de referencia.
- [320 px / texto 200%](home-chromium-320-200.png) y [acciones tras desplazar el main](home-chromium-320-200-actions.png): el contenido central se desplaza; el símbolo conserva su tamaño, header/tabs se adaptan y los objetivos permanecen alcanzables. Una captura del marco no muestra simultáneamente todo el main ampliado.
- [Foco de Empezar registro](home-chromium-focus.png): contraste y objetivo preservados.
- Comparación por estado, misma geometría/material: [Next 1](next-chromium-1.png) / [prototipo 1](prototype-chromium-1.png), [Next Neutral](next-chromium-4.png) / [prototipo Neutral](prototype-chromium-4.png), [Next Algo agradable](next-chromium-5.png) / [prototipo Algo agradable](prototype-chromium-5.png), [Next 7](next-chromium-7.png) / [prototipo 7](prototype-chromium-7.png). Los siete pares están en esta carpeta. Sus marcos y navegación siguen siendo propios de cada implementación; no se copiaron layouts del prototipo a la app.
- [Historial real con variante compacta](history-compact-chromium.png): siete registros ficticios sembrados para esta prueba. Cinco capas/gradientes/núcleo, 24 px por registro y 48 px en resumen; sin halo/partículas/animación y con fondo neutral. No representa datos guardados en una cuenta.
- [Inicio WebKit](home-webkit-390-100.png) y [Firefox al 200%](home-firefox-320-200.png).

## Fuente técnica

`shared/visual/moods.js` define etiquetas y geometrías sin hex duplicados. `orb.js` define un árbol SVG: el adaptador React en `app/mood/orb.tsx` conserva nodos; el prototipo serializa el mismo árbol escapando atributos. La variante animada agrega halo y partículas; la compacta comparte material/silueta y omite esos elementos. El controlador y las reglas de movimiento, teclado, range y acciones también son comunes. Los reexports antiguos son adaptadores de compatibilidad, no otras implementaciones.

`app/globals.css` continúa como fuente editable de tokens. `npm run visual:tokens` exporta `shared/visual/tokens.css` para el navegador sin Tailwind del prototipo. Es un archivo generado: la prueba de paridad y `prebuild --check` rechazan una exportación desactualizada. No requiere compilación para servir el prototipo ya incluido en el repo.

La política de entrada es compartida: una sola primera visita por sesión, cancelación por puntero, teclado, navegación, pestaña oculta, reduced motion en vivo y desmontaje. Visitas directas a otras rutas, incluida Ayuda del prototipo, consumen la entrada. Si falta almacenamiento, queda estático. No agrega foco ni anuncia un símbolo decorativo.

## Comprobaciones

[Mediciones de entrada/paridad/reflujo](measurements.json) y [registro de verificación](verification.json).

- Chromium/WebKit/Firefox: 12 reflows de inicio por motor (320/390/520, alto 844/470, texto 100/200%) y 10 posiciones de paridad (1–7, 4.25, 4.8, 5.25). Árbol SVG/atributos/material, paleta, acento/tinta/radio/peso del CTA y ARIA iguales entre consumidores. Se normalizan IDs y serialización de estilos; se espera el siguiente frame de pintura para comparar `currentColor` de SVG. No se relajan geometrías ni colores.
- Entrada en los tres motores: 600 ms, salto por puntero/teclado/navegación/visibilidad/reduced motion, natural finalización, no repetición al volver o recargar, acceso directo por otra ruta, storage bloqueado y HTML sin JavaScript. Contraste de Empezar en inicio **6.3046:1**.
- Paridad por las posiciones capturadas: contraste mínimo del CTA **5.0755:1**. La regresión de arrastre real prueba 61 posiciones por motor, mínimo **4.7165:1**, conserva 5.25 al soltar y borrador 5; incluye touch en Chromium/WebKit. No se usa el mínimo de diez capturas como mínimo de todas las mezclas.
- Ciclos, transición/retargeting, AA por frame, pausa/reduced motion, ondulación de Algo agradable y teclado: regresión en tres motores. Respiración 4 s, rotación 125.663706 s, fases y geometrías aprobadas conservadas. Se comprueba identidad de capa/animación al arrastrar en ambos consumidores.
- Prototipo, tres motores: flujo completo con catálogo público **interceptado**, CTA ≥50 px y diálogo ≥44 px, 5.25 conservado al navegar, emoción/factores/selección preservadas, recarga recupera entero 5 y descarte reinicia 4. Offline: inicio, módulos/CSS compartidos, control y Ayuda después de primera carga.
- Next: 84 casos de composición/reflujo; galería 71 tokens y 15 pares AA, 16 reflows de tema y 90 de shell; flujo completo con edición, guardado/reintento, calendario y descargas CSV/JSON/PDF.
- 22 pruebas Node de geometría, morph/AA, tokens exportados, fechas/restauración, análisis/exportación y estado del prototipo. Build de producción, lint, typecheck y formato pasan.

WebKit acredita su motor de Playwright, no una sesión automatizada de Safari. La prueba manual de Safari ya confirmada por el usuario en ANI-110 se conserva con [su procedencia](../safari-manual-2026-10-05/README.md); no se inventaron nuevas mediciones de Safari. Los mocks de catálogo y los registros del historial son exclusivamente de la prueba; no se valida aquí una conexión Supabase real.

## Reproducción

Desde raíz del repo:

```sh
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
npm run start -- --hostname 127.0.0.1 --port 3130
```

En otra terminal:

```sh
BRAND_BASE_URL=http://127.0.0.1:3130 BRAND_ARTIFACT_DIR=docs/design/evidence/brand-system-2026-10-05 uv run --with playwright python app/brand/brand.test.py
MOTION_BASE_URL=http://127.0.0.1:3130 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/motion.test.py
MOTION_BASE_URL=http://127.0.0.1:3130 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/continuous.test.py
uv run --with playwright python prototype/visual-flow.test.py
uv run --with playwright python prototype/splash.test.py
MOOD_BASE_URL=http://127.0.0.1:3130 uv run --with playwright python app/design-mood.test.py
TOKENS_BASE_URL=http://127.0.0.1:3130 uv run --with playwright python app/tokens/tokens.test.py
FRONTEND_BASE_URL=http://127.0.0.1:3130 uv run --with playwright --with pypdf python app/frontend.test.py
node --experimental-strip-types --test app/mood/geometry.test.mjs shared/visual/tokens.test.mjs app/analisis/data.test.mjs app/exportar/export.test.mjs app/historial/records.test.mjs prototype/flow-state.test.mjs
npm run lint
npm run typecheck
npm run format:check
```

Las pruebas rojas demostraron la falta de símbolo Next y la cuantización del prototipo antes de la extracción. La revisión independiente detectó y se reprodujeron tres regresiones de la extracción (helper de emoción, CTA sin variante y posición reiniciada), más la política de entrada de Ayuda; quedaron corregidas y cubiertas. La segunda revisión no dejó hallazgos importantes pendientes.
