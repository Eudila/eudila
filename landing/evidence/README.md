# Evidencia local · ANI-76 · 15/10/2026

Reconstrucción desde `main` porque la entrega informada del 07/10 no estaba en GitHub ni en las carpetas locales accesibles. Esta evidencia no acredita publicación, dominio, email real ni analítica de producción.

## Alcance comprobado

- Proyecto estático separado del runtime Next.js, dentro de `landing/` para revisión y recuperación.
- Gobiernos antes que desarrolladores; contacto y repositorio visibles.
- Identidad tomada de `DESIGN.md`, `app/globals.css`, `public/brand/logo.svg` y Figtree local.
- Capturas reales de las rutas Next.js con procedencia en `assets/provenance.json`.
- Imagen social propia de 1200×630, inspeccionada localmente.
- Formulario visible pero deshabilitado en la entrega local, porque todavía no existe una casilla monitoreada.
- Con configuración simulada, conserva datos ante errores, anuncia el resultado y evita envíos activos duplicados.
- Transporte preparado para una casilla monitoreada mediante Resend; sin secretos ni destinatario inventados.
- Umami se carga solo con configuración explícita y respeta Do Not Track. El código no agrega cookies ni almacenamiento del navegador.

## Comprobaciones

- 5 pruebas Node del validador, honeypot, ausencia de configuración y entrega simulada: pasan.
- 6 reflows con Chromium: 320/390/768/1440 px al 100% y 320/390 px con fuente raíz al 200%; sin desborde horizontal, imágenes rotas ni errores de consola.
- En navegador: entrega 2xx limpia el formulario y anuncia éxito; entrega 502 conserva todos los campos y ofrece reintento.
- Capturas completas: `landing-390-full.png` y `landing-1440-full.png`.
- `git diff --check`: pasa.
- El build normal produce `dist/`; el build de publicación rechaza variables obligatorias ausentes.

## Pendientes externos

1. Confirmar el dominio comprado y conectarlo al proyecto Vercel correcto.
2. Confirmar la casilla monitoreada, un remitente verificado y configurar el secreto de Resend.
3. Configurar el sitio Umami elegido y verificar que no coloque cookies.
4. Probar un envío real de punta a punta, HTTPS y recepción/reply-to.
5. Verificar la imagen social desde el dominio público y hacer revisión editorial del responsable de contenido.

Hasta completar esos puntos, ANI-76 debe permanecer In Progress.
