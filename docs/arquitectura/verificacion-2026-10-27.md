# Verificación · 27/10/2026

Referencia: archivo local «Panel del psicólogo.html», siete láminas. Se aplicó su organización de apps/paquetes/infraestructura; el panel y sus tablas estaban marcados como propuestos y siguen documentados como tales.

## Comprobaciones realizadas

- `npm ci --ignore-scripts --no-audit --no-fund`: instalación única del monorepo y resolución de workspaces. `npm ci --dry-run` confirma coherencia final del lockfile.
- `npm run lint`, `npm run typecheck`, `npm run format:check`: correctos.
- `npm test`: 45 pruebas correctas, incluidas reglas de dependencia y paridad de tokens de la landing.
- `NEXT_PUBLIC_FRONTEND_PREVIEW=true EUDILA_STANDALONE=true npm run build`: Next.js genera todas las rutas previas sin cambios de URL.
- Servidor standalone real en localhost:3127, con public y static en apps/web. El navegador carga módulos, fuente, logo y estilos fuera del árbol original.
- `FRONTEND_BASE_URL=http://127.0.0.1:3127 uv run --with playwright --with pypdf python apps/web/app/frontend.test.py`: registro, edición, guardado/reintento, calendario, descargas CSV/JSON, PDF paginado, datos corruptos y reflujo correctos.
- `HELP_BASE_URL=http://127.0.0.1:3127 uv run --with playwright python apps/web/app/ayuda/ayuda.test.py`: ayuda offline, teclado, recarga/nueva pestaña, almacenamiento bloqueado y conservación del borrador correctos.
- `npm run build:landing`: genera motor, tokens, fuente y logo desde los paquetes compartidos.
- `LANDING_URL=http://127.0.0.1:4175 npm run check:visual --workspace @eudila/landing`: seis casos de reflujo (incluido texto al 200 %), imágenes, consola y éxito/error del formulario con transporte simulado correctos.
- `WELCOME_BASE_URL=http://127.0.0.1:3127 uv run --with playwright python "apps/web/app/(auth)/bienvenida/browser.test.py"`: apertura, saltar/Esc, cookie, foco, movimiento reducido, ingreso/alta y seis casos de reflujo correctos.
- `npm run prebuild --workspace @eudila/web`: genera los assets al ejecutar directamente el workspace.
- Capturas de las rutas Next.js reales `/hoy` y `/registro/animo`, y de la landing, en `docs/design/evidence/arquitectura-2026-10-27/`.
- `bash -n` en ambos scripts de despliegue y arranque Docker; `git diff --check`: correctos.
- Revisión independiente de imports, rutas, sesión, lockfile y empaquetado: resueltos el build de Vercel que omitía prebuild y la generación de assets al ejecutar el workspace web directamente.

La prueba de PDF detectó un defecto previo (también ausente en HEAD): faltaba el aviso «No representa el historial de una cuenta». Se restauró en Report y el recorrido completo pasó sin debilitar la aserción existente. Es el único ajuste de contenido de la app además de la reorganización.

## Límites

No se desplegó en VPS ni Vercel. Se comprobó el servidor standalone local, no una reconstrucción completa de la pila Docker. No se ejecutaron autenticación contra Supabase/Google ni correo real; no cambian su lógica, migraciones ni políticas. Los formularios de la landing usaron respuestas simuladas. No se certifican Safari físico ni revisión clínica. Ninguna brecha estética se cierra por esta reorganización.


## Arranque local solicitado

Se creó `apps/web/.env.local` desde el ejemplo, con vista previa habilitada y sin credenciales externas. Se ejecutaron nuevamente lint, typecheck, formato, las 45 pruebas Node y los builds de ambas apps. La app de producción quedó en `http://127.0.0.1:3000` (`npm run start -- --hostname 127.0.0.1 --port 3000`); la landing estática en `http://127.0.0.1:4173` (`python3 -m http.server 4173 --bind 127.0.0.1 --directory apps/landing/dist`). Ambas responden HTTP 200.

Contra el servidor local pasaron el recorrido completo de registro, historial, exportaciones/PDF y reflujo; Ayuda offline; evolución, factores y rangos. También pasaron bienvenida/apertura y el selector de emociones (REST simulado, sugerencias, búsqueda, teclado/foco, errores y almacenamiento bloqueado). La validación detectó y corrigió comillas de los docstrings de tres pruebas Python al documentar sus nuevas rutas; todos los archivos Python de apps y packages se analizaron con `ast.parse`. No hubo cambios de comportamiento en la app por esta corrección.

Docker no estaba activo: no se validó Auth real ni Google. La vista previa guarda los registros solo en la sesión de la pestaña, sin sincronización de cuenta.

La nueva comprobación visual de la landing también pasó: seis casos de reflujo, imágenes, consola y estados del formulario con respuestas simuladas. Los dos servidores siguen activos en loopback.
