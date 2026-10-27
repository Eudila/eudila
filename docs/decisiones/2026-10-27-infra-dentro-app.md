# 27/10/2026 · Infraestructura y Supabase dentro de app

Pedido del usuario: mover `supabase/` e `infra/` a `app/`. Se mantienen el proyecto local `eudila-ladyfish`, migraciones, seed y plantillas. La CLI se ejecuta con `app/` como directorio de trabajo, y sus secretos de proveedores van en `app/.env`.

Se actualizan scripts npm, generación de assets, comandos de despliegue, rutas de migraciones y plantillas en el despliegue, prueba de autenticación y documentación. La infraestructura de la landing también queda bajo `app/infra/landing`, conforme al movimiento solicitado.

Verificación: 45 pruebas Node, lint, tipos, formato, build de la landing, sintaxis shell/Python, coherencia del lockfile y enlaces de los README. Comparación contra Git: SQL de migraciones y seed idéntico; rutas de plantillas y seed válidas. No se ejecuta ninguna migración ni se modifican datos.

El build de Next.js también pasó y el servidor local se reinició en el puerto 3000. Docker/Supabase real no se levantaron; no se probó un despliegue remoto.
