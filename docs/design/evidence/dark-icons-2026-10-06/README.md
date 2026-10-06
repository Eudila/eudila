# Lienzo oscuro, iconos e icono de app

Pedido del usuario del 05/10/2026, completado el 06/10. La app usa un lienzo neutro oscuro con profundidad turquesa tenue, superficies y diálogos oscuros, iconos lineales con rótulos y el icono Neutral del brandbook. El ambiente emocional y el movimiento aprobado del selector se conservan. El informe impreso mantiene papel blanco.

## Fuentes y decisiones

Brandbook v1.0 pp. 2/4/8: lienzo claro u oscuro, Grafito oscuro e icono Neutral centrado al 64%, sin texto ni brillo adicional. Se revisó visualmente la página 4 del PDF privado; no se publica el PDF ni su captura. Los archivos de esta carpeta son capturas propias de la implementación.

Tokens y superficies: `app/globals.css` y exportación generada `shared/visual/tokens.css`. Lienzo neutral: `shared/visual/canvas.css`. Iconos de interfaz: `app/icons.tsx`, SVG local de 24 px/currentColor, sin nueva dependencia de iconos. Icono de app: `scripts/brand-icon.mjs` obtiene bounds/material de la geometría Neutral y colores de tokens; genera favicon SVG, Apple PNG de 180 px, manifiesto e iconos PNG de 192/512 px. No hay máscara baked-in ni halo extra. El asset aparece también en header y Ayuda offline.

## Resultados

[Mediciones reales por motor](measurements.json): Chromium 153.0.8010.12, WebKit 26.6 y Firefox 155.0; 15 rutas por motor, 84 combinaciones de reflujo por motor (252 total), contraste mínimo de muestras de texto/acciones 5.0755:1. Se conserva nombre de las tres secciones y SVG decorativos; objetivos >=44 px, foco visible, bordes de campos >=3:1, selección AA, metadatos/favicon/Apple/manifiesto servidos, impresión clara y slider en 5.25 sin snap. Las capturas incluyen inicio, registro/tipo, ánimo, Hoy, calendario, acceso, Ayuda y galería.

Prueba del icono en tres motores: bounds del contorno pintado al 64% del lienzo, centrado en 50%/50%, cinco capas/núcleo, sin filtro/partículas/movimiento. La primera implementación medía 56.32%; la prueba falló y pasó tras derivar el viewBox real de 176 unidades.

La regresión de entrada/paridad pasó en tres motores: primera visita de 600 ms salteable, almacenamiento bloqueado, SSR/sin JavaScript, navegación, reduced motion, 36 reflows, 30 posiciones comparadas y representación compacta estática. Movimiento pasó en tres motores (ciclos/600ms/retargeting/AA/pausa/teclado). Slider continuo pasó 61 posiciones por motor, conserva 5.25, categoría guardada 5 y contraste mínimo 4.7165:1 durante mezclas. Composición emocional: siete ambientes, popover/diálogo, borrador, teclado/Ayuda, 84 reflows y reduced motion.

Tokens: 73 documentados, 15 pares AA, tema variable, navegación/teclado/historia y 90 combinaciones de shell. Flujo del prototipo pasó en tres motores incluyendo buscador oscuro, registro/emoción/factores, navegación fraccionaria, recarga y descarte. Entrada/offline del prototipo pasó. Unitarias de geometría/tokens/registro/historial/exportación/análisis/worker: 23 pasadas. Lint, typecheck, formato y build de producción con preview activo pasaron.

## Regresiones corregidas

El skip link visible ocupaba una fila y desplazaba Ayuda entre pointerdown y pointerup; se reprodujo con log de eventos. Ahora se revela absoluto sobre el header. El lienzo desplazable de alturas bajas expuso el min-content de la galería (1024px): `minmax(0,1fr)` lo mantiene dentro del viewport. El buscador del prototipo conservaba blanco y se corrigió a superficie oscura con prueba roja/verde. Los tests adaptan únicamente expectativas históricas de superficie clara/cache v1 y toleran 1 px de redondeo de viewport manteniendo hit-tests y tamaños estrictos.

Revisión independiente: correcciones aprobadas, bounds al 64% verificados y seis rutas a 320×470/200% con Ayuda/foco/impresión comprobados. WebKit automatizado no equivale a Safari físico. No se atribuye una nueva prueba manual de Safari al usuario.

## Reproducción y entorno

```sh
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
npm run start -- --hostname 127.0.0.1 --port 3132
DARK_BASE_URL=http://127.0.0.1:3132 uv run --with playwright --with pillow python app/brand/dark.test.py
uv run --with playwright python app/brand/icon.test.py
BRAND_BASE_URL=http://127.0.0.1:3132 uv run --with playwright python app/brand/brand.test.py
TOKENS_BASE_URL=http://127.0.0.1:3132 uv run --with playwright python app/tokens/tokens.test.py
MOTION_BASE_URL=http://127.0.0.1:3132 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/motion.test.py
MOTION_BASE_URL=http://127.0.0.1:3132 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/continuous.test.py
MOOD_BASE_URL=http://127.0.0.1:3132 uv run --with playwright python app/design-mood.test.py
```

`CHROME_BIN` permite elegir Chromium. El Chrome 154 instalado tuvo interrupciones de arranque/RAF/navegación/scroll en suites largas; la comprobación de tokens pasó al usar Chromium 153 Headless Shell de Playwright, igual que entrada, composición y las mediciones finales. Los primeros resultados interrumpidos no se cuentan como pasados. Se instalan binarios con `uv run --with playwright playwright install chromium webkit firefox`. Las suites de navegadores se ejecutaron en serie para evitar competencia entre procesos de renderizado.

La vista previa usa almacenamiento de la pestaña y ejemplos ficticios elegidos explícitamente. Auth y persistencia reales conservan su alcance pendiente; las capturas no contienen datos personales.
