# 27/10/2026 · Organización para publicación

A pedido del usuario, los workspaces se presentan directamente en la raíz: `app/` (antes `apps/web/`), `landing/` (antes `apps/landing/`) y `dashboard/` (documentación del panel futuro). Se mantienen `packages`, `supabase` e `infra`. El workspace Next.js se llama `@eudila/app`; el dashboard todavía no tiene código ejecutable.

El README principal es la entrada pública y enlaza a las guías de cada área. Las rutas de las pantallas y los tokens visuales no cambian.

PRODUCT.md y DESIGN.md se conservan localmente, se agregan a .gitignore y se retiran del índice con `git rm --cached`. No se reescribe el historial de Git: versiones previas siguen en commits anteriores. AGENTS.md permite trabajar desde un clon público con las fuentes de marca versionadas.

Verificación: 45 pruebas Node, lint, tipos, formato, sintaxis Python y shell, enlaces locales de los cuatro README, build de ambas aplicaciones y coherencia del lockfile.

También pasó el recorrido completo en navegador contra `http://127.0.0.1:3000`: registro, edición, guardado/reintento, calendario, exportaciones CSV/JSON, PDF, corrupción y reflujo. La app y la landing quedaron nuevamente encendidas en los puertos 3000 y 4173.
