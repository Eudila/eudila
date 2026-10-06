# Dark canvas, navigation icons and app identity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aplicar el lienzo oscuro solicitado, mejorar reconocimiento de acciones con iconos e incorporar el icono de app definido en el brandbook.

**Architecture:** Tokens semánticos oscuros editables en `app/globals.css`, exportados al prototipo; lienzo compartido y variantes de acción conservan una sola fuente. Iconos lineales de 24 px acompañan etiquetas existentes. Los assets del icono se generan desde el orbe Neutral compartido, centrado al 64%, sin texto, halo ni máscara en los archivos para iOS.

**Tech Stack:** Next.js 16.3.8, React, CSS/Tailwind, SVG local, Sharp para exportar assets, Playwright.

---

## Decisión de diseño

Pedido explícito del usuario: fondo oscuro parecido al selector, más iconos y símbolo del brandbook. Se adopta grafito con una mezcla turquesa tenue y base casi negra; el espectro emocional conserva su alcance en ánimo. Alternativas evaluadas: grafito plano sería más sobrio pero menos cercano al ambiente solicitado; extender el color de cada emoción a todas las rutas confundiría contenido y estado. El lienzo oscuro institucional da continuidad sin esa ambigüedad. Esta autorización actual reemplaza el lienzo claro anterior documentado. No hace falta redefinir producto, funcionalidades ni animaciones aprobadas.

## Task 1 · Protección de contraste e identidad

- Crear `app/brand/dark.test.py`: comprobar lienzo oscuro real en inicio/acceso/historial/registro/ayuda, contraste AA de texto, controles y selección, nav con iconos y nombres conservados, icono servido y metadata de navegador/iOS, reflujo 320/390/520 al 200%, modo impresión claro.
- Ejecutar primero sobre producción anterior (3130): debe fallar por color-scheme claro.
- Mantener pruebas actuales de slider/entrada; adaptar únicamente expectativas históricas de color claro, no debilitar teclado, contrastes ni paridad.

## Task 2 · Lienzo y superficies

- Modificar `app/globals.css` y `shared/visual/actions.css`: superficie grafito, tinta Nube, secundarios legibles, borde >=3:1 en campos, action institucional aclarado y tinta Grafito; foco visible en ambos ambientes. Nueva `shared/visual/canvas.css` comparte fondo neutral.
- Actualizar auth, gráfico analítico, diálogos y PDF (`app/auth/auth.css`, `app/analisis/chart.tsx`, `app/exportar/exportar.css`); conservar impresión en blanco/negro y emoción/movimiento sin cambios.
- Generar `shared/visual/tokens.css` con `npm run visual:tokens`; adaptar `prototype/style.css` y actualizar cache offline.

## Task 3 · Iconos e identidad

- Crear `app/icons.tsx`: SVG local, currentColor, trazos consistentes, aria-hidden/focusable=false, tamaño fijo sin encoger, etiquetas conservadas.
- Integrar en `app/navigation.tsx`, `app/layout.tsx`, inicio, registro, auth, historial, análisis, exportación y Ayuda. Nunca asignar a cada emoción una carita o juicio.
- Crear `scripts/brand-icon.mjs`: serializar el renderer compartido sin cambiar material; resolver colores desde tokens; SVG opaco cuadrado y PNG 180/192/512. Archivos `app/icon.svg`, `app/apple-icon.png`, `public/brand/icon.svg`, `public/brand/icon-192.png`, `public/brand/icon-512.png`, manifest y themeColor. Mostrar el icono en header junto al wordmark conservando el orbe de inicio y su entrada.
- Incluir asset en copia offline de Ayuda y prototipo; verificar instalación metadata sin prometer persistencia offline de registros.

## Task 4 · Verificación y entrega

- `npm run lint`, `npm run typecheck`, `npm run format:check`, `NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build`.
- `DARK_BASE_URL=http://127.0.0.1:3132 uv run --with playwright --with pillow python app/brand/dark.test.py` en Chromium/WebKit/Firefox, capturas propias y contraste/reflujo.
- Regresiones `app/frontend.test.py`, `app/tokens/tokens.test.py`, `app/brand/brand.test.py`, `app/mood/continuous.test.py`, `app/mood/motion.test.py`, pruebas offline de Ayuda y prototipo y unitarias correspondientes.
- Revisión de código independiente con skill requesting-code-review; resolver hallazgos.
- Actualizar PRODUCT.md/DESIGN.md/informe de marca con decisión autorizada, fuente de icono y evidencia. Commit/push de rama existente autorizado en conversación, conservar preview disponible y mostrar captura actual.


## Correcciones de verificación

- El foco del skip link revelado en el flujo empujaba Ayuda de y=12 a y=64; al hacer pointerdown, su blur devolvía el botón a y=12 antes del pointerup. Se comprobó con log de eventos. Ahora el skip link aparece absoluto sobre header relativo, sin mover objetivos.
- Extender documento desplazable a pantallas bajas expuso el min-content de la galería (1024 px). Una columna `minmax(0,1fr)` mantiene el shell dentro del viewport.
- El generador inicialmente asumió un diámetro de 200 unidades; el Neutral aprobado mide 176. El test de bounds reales detectó 56.32% y pasó en tres motores al derivar el viewBox desde `shapePoints`.
- El buscador del prototipo conservaba blanco; la cobertura del diálogo reprodujo el problema y verificó la superficie oscura en tres motores.
- Se actualizan expectativas históricas de superficie clara/cache v1; se preservan nombres accesibles, teclado, hit-tests, AA y continuidad del slider. El reflujo tolera 1 px de redondeo al comprobar límites de viewport, conservando dimensiones táctiles y hit-test estrictos.


## Entrega verificada

Completadas las cuatro tareas. 15 rutas y 84 reflows por motor (252 total), AA mínimo 5.0755:1; símbolo al 64% verificado en tres motores. Tokens: 73, entrada/paridad, movimiento/slider continuo, composición, recorrido completo con PDF/CSV/JSON y Ayuda offline pasaron. Las suites largas se ejecutaron con Chromium 153 Headless Shell tras aislar interrupciones del Chrome 154 del sistema, sin contar como pasados los intentos interrumpidos. Lint/typecheck/formato/build y revisión independiente completados. Capturas propias y resultados en `docs/design/evidence/dark-icons-2026-10-06/`.
