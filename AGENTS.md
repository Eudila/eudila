# Identidad visual persistente de eudila

Antes de cualquier cambio de frontend, leer [brechas de marca](docs/design/brand-review-2026-10-04.md) y [mascota eudila](docs/design/mascota/README.md). Si están disponibles localmente, leer también PRODUCT.md y DESIGN.md: son documentos internos ignorados por Git. Las fuentes versionadas de marca y los tokens compartidos permiten trabajar desde un clon público. El PRODUCT.md del workspace padre corresponde a una recreación anterior y no reemplaza esta identidad.

Usar tokens de `packages/brand/tokens.css`, importados por `app/app/globals.css`. Las capturas de `docs/referencias/` definen funcionalidades; el brandbook y los videos revisados definen estética. No marcar una brecha como resuelta solo por agregar tokens o reutilizar código de `docs/historia/prototype/`: comprobar la ruta Next.js real. Registrar cambios de decisión y evidencia en los documentos de marca para futuras sesiones.

Branding vigente desde el 23/10/2026: la mascota eudila (el orbe con carita) y el logo Muy agradable. Su código de referencia es `docs/design/mascota/eudila-viva.html` y el logo estático `packages/brand/assets/logo-mascota.svg`. Reglas fijas: la mascota nunca sigue al puntero, cada mascota se mueve con reloj propio, Neutral tiene tres capas, sin cachetes ni boca, y movimiento reducido la deja quieta.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
