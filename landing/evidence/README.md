# Evidencia local · ANI-76 · actualizada 26/10/2026

Reconstrucción desde `main` porque la entrega informada del 07/10 no estaba en GitHub ni en las carpetas locales accesibles. Esta evidencia no acredita publicación, dominio, email real ni analítica de producción.

## Alcance comprobado

- Proyecto estático separado del runtime Next.js, dentro de `landing/` para revisión y recuperación.
- Gobiernos antes que desarrolladores; contacto y repositorio visibles.
- Identidad actualizada al sistema Lisa: lienzo violeta con una luz coral, acción coral y logo estático Muy agradable con carita y sin destellos.
- Fuentes de marca: `PRODUCT.md`, `DESIGN.md`, `docs/design/brand-review-2026-10-04.md`, `docs/design/mascota/README.md`, `app/globals.css` y `public/brand/logo-mascota.svg`.
- Capturas reales de las rutas Next.js con procedencia en `assets/provenance.json`.
- Imagen social propia de 1200×630, inspeccionada localmente.
- Formulario visible pero deshabilitado en la entrega local, porque todavía no existe una casilla monitoreada.
- Con configuración simulada, conserva datos ante errores, anuncia el resultado y evita envíos activos duplicados.
- Transporte preparado para una casilla monitoreada mediante Resend; sin secretos ni destinatario inventados.
- Umami se carga solo con configuración explícita y respeta Do Not Track. El código no agrega cookies ni almacenamiento del navegador.

## Comprobaciones

- 6 pruebas Node del validador, honeypot, ausencia de configuración, adaptador Vercel y entrega simulada: pasan.
- 6 reflows con Chromium: 320/390/768/1440 px al 100% y 320/390 px con fuente raíz al 200%; sin desborde horizontal, imágenes rotas ni errores de consola.
- En navegador: entrega 2xx limpia el formulario y anuncia éxito; entrega 502 conserva todos los campos y ofrece reintento.
- Capturas completas: `landing-390-full.png` y `landing-1440-full.png`.
- `git diff --check`: pasa.
- El build normal produce `dist/`; el build de publicación rechaza variables obligatorias ausentes.
- Contraste sRGB medido: texto/superficie 16,13:1; secundario/superficie 12,60:1; acción/superficie 11,61:1; Grafito sobre coral 4,65:1.

## Actualización visual · 26/10/2026

- Las capturas antiguas claras fueron reemplazadas por capturas reales a 390 × 844 de `/registro/animo` y `/hoy` sobre `origin/main` `7d98557`.
- La captura de Hoy usa datos ficticios identificados; no representa una cuenta ni datos reales.
- `scripts/capture-app.cjs` permite regenerarlas desde la app actual y oculta únicamente el indicador de desarrollo de Next.js.
- La imagen social 1200 × 630 se regeneró con Lisa y el logo vigente mediante `scripts/capture-og.cjs`.
- El build de producción de la app principal se intentó para capturar sin herramientas de desarrollo, pero Turbopack falló al crear su proceso CSS. Se usó `next dev` y se verificó la ausencia del indicador en los PNG finales. La landing sí compila correctamente.

## Rediseño en movimiento · 26/10/2026

Nueva narrativa (psicólogos e inversión), mascota viva con el motor de la app y pieza de video de 32 s. Evidencia, capturas y verificación en [docs/design/evidence/landing-showreel-2026-10-26/README.md](../../docs/design/evidence/landing-showreel-2026-10-26/README.md). `landing-390-full.png` y `landing-1440-full.png` se regeneraron con `npm run check:visual` (movimiento reducido: la versión quieta).

## Pendientes externos

1. Confirmar el dominio comprado y conectarlo al proyecto Vercel correcto.
2. Confirmar la casilla monitoreada, un remitente verificado y configurar el secreto de Resend.
3. Configurar el sitio Umami elegido y verificar que no coloque cookies.
4. Probar un envío real de punta a punta, HTTPS y recepción/reply-to.
5. Verificar la imagen social desde el dominio público y hacer revisión editorial del responsable de contenido.

Hasta completar esos puntos, ANI-76 debe permanecer In Progress.
