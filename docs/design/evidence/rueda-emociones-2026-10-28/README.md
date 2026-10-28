# Rueda de emociones · integración de producción · 28/10/2026

La rueda aprobada se integra sobre main `7b3ea2799316aca39bb3d1bcc895ed79971237c1`, conservando los workspaces, el tema claro y el resto de las funciones publicadas.

Comprobaciones antes de la candidata:

- Baseline: 62 pruebas Node aprobadas.
- Cambio integrado: lint, tipos de app/panel, formato, 68 pruebas Node y builds de app, panel y landing aprobados.
- Selector Next.js: 36 ramas, filtros por ánimo, 18 emociones positivas compartidas y seis sentimientos por color, búsqueda, foco, recarga, errores y reflujo.
- Build de preview: recorrido completo, edición, guardado/reintento, historial/calendario, CSV/JSON/PDF y reflujo aprobados.
- Revisión independiente: se detectó y corrigió la posibilidad de guardar un nivel incompleto al usar Atrás. Factores y revisión validan sentimiento final o alternativa, con prueba de regresión aprobada.
- Artefacto standalone con preview desactivado y Supabase local real: 96 etiquetas, 36 sentimientos guardados y leídos, Fuerza → Optimista → Curioso, persistencia entre recargas/navegadores, exportación >1000 registros, RLS, rollback y reintentos sin duplicados aprobados. Cuentas sintéticas eliminadas al finalizar.

[Decisión y publicación](../../../decisiones/2026-10-28-rueda-emociones.md). La prueba de candidata y la verificación posterior del despliegue se registran por separado cuando terminan. La otra carpeta de trabajo y sus cambios pendientes no forman parte de esta rama.

## Candidata en el VPS y DB de producción

La candidata `1c5345634b85d8353484e9f732d12bcf1de05861` se compiló con Node 24/Linux, standalone, preview desactivado y las URLs reales de Auth y catálogo. Se ejecutó en un contenedor privado conectado a la red de producción, accesible únicamente por un túnel SSH de prueba. La versión pública no se reemplazó durante esta comprobación.

La migración `20261028000000_rueda_emociones.sql` se aplicó a PostgreSQL de producción con respaldo previo y su entrada en `public.eudila_migrations` en la misma transacción. Se verificó catálogo 21 → 96, conservando las 21 filas anteriores completas. El respaldo privado se conserva en la release `qa-wheel-1c5345634b85`, dentro de `/opt/eudila-app/releases/`; no se copia al repositorio.

[Resultado de la candidata](candidate-smoke.json): 36 sentimientos guardados/leídos, RLS entre cuentas y denegación anónima, reintento sin duplicados, recorrido Fuerza → Optimista → Curioso con listas 18/6, persistencia, segundo navegador, exportación de 37 registros y filtro desagradable aprobados. Sin errores JavaScript. Las dos cuentas sintéticas y todos sus registros se eliminaron al finalizar.

Producción tiene deshabilitado el proveedor de email. Las sesiones sintéticas se generaron mediante `admin/generate_link` y se verificaron con GoTrue, sin enviar correos ni cambiar esa configuración. Las cookies se prepararon con el cliente oficial `@supabase/ssr`. No se automatizó consentimiento de una cuenta Google personal. El cliente HTTP de prueba usa un User-Agent compatible con Cloudflare, que rechaza Python-urllib con código 1010.

Durante la validación llegaron cambios ajenos a main (landing y mascota sin temblor). Se integraron sin sobrescribirlos; la rama combinada pasó nuevamente lint, tipos, formato, **69 pruebas Node** y los builds de app, panel y landing. El CI del PR y el despliegue verifican ese commit combinado.
