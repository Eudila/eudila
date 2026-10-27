# Validación de la estructura · 27/10/2026

Se validó el árbol con `app/supabase/` y `app/infra/`, tanto en el workspace como en una copia temporal limpia. La copia excluyó node_modules, builds, archivos de entorno, PRODUCT.md, DESIGN.md y los assets generados de marca/mascota.

## Resultados

- Instalación real desde cero con `npm ci`: correcta. Lockfile y workspaces coherentes.
- Lint, tipos, formato y 45 pruebas Node: correctos.
- Builds de app y landing: correctos. Los assets eliminados se regeneraron desde packages.
- Servidor standalone de producción: correcto, con public/static en `app/`, tal como requiere el Dockerfile.
- Navegador: registro, edición, guardado/reintento, historial, exportación CSV/JSON, PDF paginado, datos corruptos y reflujo correctos.
- Ayuda offline: recarga, pestaña nueva, teclado, estilos y almacenamiento bloqueado correctos.
- Bienvenida: apertura, saltar/Esc, foco, sesión y movimiento reducido correctos.
- Análisis: rangos, evolución, factores, UUID, vacíos, fechas y navegación correctos.
- Landing: seis casos de reflujo, imágenes, consola y estados de éxito/error del formulario correctos. El transporte del formulario se simuló; no se enviaron consultas externas.
- Supabase real: alta, confirmación por email local, recuperación, sesión, logout entre pestañas, cookies falsas, permisos RLS entre dos cuentas sintéticas y catálogos correctos; incluye 18 casos de reflujo. La prueba eliminó sus propias cuentas al finalizar.
- CLI de Supabase: start/stop desde app correctos; las plantillas apuntan a app/supabase. El SQL no se modificó.
- Scripts shell, archivos Python y enlaces locales de los README: correctos.

## Problema de entorno encontrado

Docker estaba apagado. Tras iniciarlo, el gateway guardado todavía montaba plantillas desde otro workspace (`ladyfish/supabase/templates`) y no arrancaba. `supabase start` encontraba la base existente pero no reconstruía ese contenedor, por lo que status no devolvía API_URL.

Se ejecutó `npm run supabase:stop` y luego `npm run supabase:start` desde la ubicación actual, conservando los datos. El gateway se recreó con los montajes correctos y respondió HTTP 200. El README de la app documenta este paso cuando se mueve el repositorio.

La suite de Auth se detuvo inicialmente en la aserción Cache-Control bajo next dev. Se repitió sin debilitar la prueba contra el build de producción, donde pasó completa. La configuración de preview del workspace original se conservó; los servidores de app y landing en 3000/4173 continuaron disponibles.

## Límites

No se verificó Google OAuth real, envío externo de correo, despliegue remoto ni una reconstrucción completa de la pila de Docker del VPS. Se probó su servidor standalone local. El dashboard sigue pendiente de implementación. La autenticación no agrega persistencia de registros emocionales por cuenta.
