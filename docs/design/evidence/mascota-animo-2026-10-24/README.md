# Mascota en ánimo y Neutral de tres capas · F2–F3 · 24/10/2026

Cierra VIS-14 (Neutral con tres capas) y VIS-15 (mascota con carita) sobre `/registro/animo`, servida con `next dev` en `127.0.0.1:3130`, rama `147pop/kelpfish`.

- [Siete estados](siete-estados.png) a 390 × 844: ojos con párpado más bajo del lado externo en lo desagradable, Neutral con tres capas y ojos simples, arcos felices desde Agradable. Temperamentos de la tabla del README (respiración, hundimiento, tiritona, balanceo, saltito).
- [Neutral](neutral-390.png): las capas .52 y .36 no se dibujan; aparecen con `clamp(|ánimo − 4| × 1,5)` durante el arrastre.
- [Escucha](escucha.png): mientras se arrastra el slider se agacha, mira hacia abajo y emite tres ondas. Se dispara con el `input` del slider (también con teclado), nunca con el movimiento del puntero.

Implementación: `<Mascota>` reemplaza al SVG animado y recibe la posición continua del slider. El controller conserva el ambiente y la tinta AA del CTA a 600 ms con la curva de marca; dejó de dibujar formas. `MoodOrb` queda como «Orbe vivo» estático (sin cara, con giros alternos de capas) para los usos compactos y como fallback sin JS. Se eliminaron el SVG animado, sus animaciones CSS y `organicPoints`/`mixPoints`; la ondulación de Algo agradable vive en el motor.

Verificación:

- `node --test app/mood/*.test.mjs`: tres capas en Neutral, cinco en los demás; dos mascotas desincronizadas; movimiento reducido quieto; la mascota no lee el puntero (solo `onPointerDown`).
- `app/mood/motion.test.py` y `app/mood/continuous.test.py`, reescritas sobre el canvas, en Chromium, WebKit y Firefox: mascota viva, AA del CTA cuadro a cuadro (mínimo 4,72:1), transición de 600 ms coordinada, retargeting, pausa con pestaña oculta y movimiento reducido (canvas quieto), arrastre continuo de 61 posiciones, teclado, táctil y reflujo al 200 %.
- `app/design-mood.test.py` con vista previa: 7 ambientes, contraste, 84 casos de reflujo. El canvas sobresale de su caja para las ondas; `.mood-screen` usa `overflow-x: clip` para no agregar scroll horizontal.
- Lint, typecheck y formato: exit 0.
