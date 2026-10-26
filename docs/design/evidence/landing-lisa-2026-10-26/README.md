# Landing ANI-76 · adopción de Lisa · 26/10/2026

## Decisión aplicada

La landing separada adopta la identidad vigente del producto sin definir una marca paralela:

- lienzo Lisa: base `#1A1626` a `#100D18` y una única luz coral al 12 % en la parte superior;
- texto `#F4F1FA`, secundario `#DAD5EA`, superficies `#18151F` y líneas lavanda;
- acciones con relleno coral `#E65175`, tinta Grafito y enlaces/contornos `#F6C2CF`;
- logo principal estático `public/brand/logo-mascota.svg`: Muy agradable, con carita y sin destellos;
- Figtree para wordmark y titulares; tipografía del sistema para cuerpo y controles.

Fuentes revisadas antes del cambio: `PRODUCT.md`, `DESIGN.md`, `docs/design/brand-review-2026-10-04.md`, `docs/design/mascota/README.md` y tokens de `app/globals.css` sobre `origin/main` `7d98557`.

## Activos y procedencia

- `landing/assets/app-registro.png`: captura real de `/registro/animo`, 390 × 844.
- `landing/assets/app-hoy.png`: captura real de `/hoy` con datos ficticios identificados, 390 × 844.
- `landing/assets/og-eudila.png`: composición social real de 1200 × 630 generada desde `landing/scripts/og-source.html`.
- Procedencia detallada: `landing/assets/provenance.json`.

Las capturas se regeneran con `landing/scripts/capture-app.cjs`. El build de producción de la app principal se intentó y falló por un error interno de Turbopack al crear el proceso CSS; las capturas se tomaron desde `next dev`, ocultando solo el indicador de desarrollo. No se modificó el contenido de la app para producirlas.

## Verificación

- 6 pruebas Node de contacto y adaptador Vercel: pasan.
- Build estático local de la landing: pasa.
- 6 reflows Chromium: 320, 390, 768 y 1440 px; 320 y 390 px con texto al 200 %.
- Sin desborde horizontal, imágenes rotas ni errores de consola.
- Formulario simulado: 2xx limpia campos; 502 conserva datos y anuncia el error.
- Contraste sRGB: texto/superficie 16,13:1; secundario/superficie 12,60:1; acción/superficie 11,61:1; Grafito/coral 4,65:1.
- Evidencia visual: `landing/evidence/landing-390-full.png` y `landing/evidence/landing-1440-full.png`.
- `git diff --check`: pasa.

## Alcance conservado

La actualización resuelve solamente la coherencia visual local. No acredita dominio, despliegue público, analítica activa ni entrega real del formulario. ANI-76 conserva esos pendientes externos.
