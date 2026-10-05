# Identidad visual persistente de eudila

Antes de cualquier cambio de frontend, leer [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) y [brechas de marca](docs/design/brand-review-2026-10-04.md). Estas fuentes describen esta app; el PRODUCT.md del workspace padre corresponde a una recreación anterior y no reemplaza su identidad.

Usar tokens de `app/globals.css`. Las capturas de `docs/referencias/` definen funcionalidades; el brandbook y los videos revisados definen estética. No marcar una brecha como resuelta solo por agregar tokens o reutilizar código de `prototype/`: comprobar la ruta Next.js real. Registrar cambios de decisión y evidencia en los documentos de marca para futuras sesiones.

Estado/geometría, árbol SVG, variantes de material, movimiento, entrada, acciones y range viven en `shared/visual/`; Next.js y el prototipo son consumidores. No crear otra paleta o renderer. `shared/visual/tokens.css` es generado desde `app/globals.css`: al cambiar tokens, ejecutar `npm run visual:tokens`; `prebuild` y la prueba de paridad verifican que esté actualizado. El prototipo debe servirse desde raíz del repo para cargar los módulos compartidos.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
