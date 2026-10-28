# Guardado de registros en cuenta · plan de implementación

**Objetivo:** guardar y recuperar registros emocionales de la cuenta autenticada, tanto con Google como con email.

**Arquitectura:** reutilizar el cliente Supabase y `HistoryProvider`. Dos tablas normalizadas (`registros`, `registro_factores`) con claves foráneas y RLS. Una función `guardar_registro`, SECURITY INVOKER, inserta registro y factores en una transacción; un UUID estable hace seguros los reintentos. No se incorporan dependencias, edición, borrado ni sincronización en tiempo real.

**Tecnologías:** Next.js 16 instalado, React, supabase-js/SSR instalados, PostgreSQL 17, pruebas Node y Playwright contra Supabase Docker local.

## 1. Esquema y protección

- Agregar una migración no destructiva en `supabase/migrations/`, generada a partir del esquema local.
- `registros`: UUID, propietario de `auth.users`, fecha con zona, momento restringido a mañana/tarde/noche/libre, ánimo entero 1–7 y emoción del catálogo. Índice por propietario/fecha/ID y por emoción.
- `registro_factores`: clave compuesta registro/factor, referencias al registro y catálogo; RLS basada en el propietario del registro. Sin acceso anónimo ni permisos de actualización/borrado.
- RPC con propietario obtenido de `auth.uid()`, catálogo validado por FK y rollback completo si un factor es inválido. Reintentar el mismo UUID devuelve el registro original sin cambiarlo.
- Probar con dos cuentas sintéticas: lectura propia, lectura ajena vacía, inserción ajena rechazada, anonimato rechazado, valores inválidos rechazados, rollback, idempotencia y cascada al borrar la cuenta de prueba.

## 2. Fuente de datos compartida

- Agregar `app/historial/account.ts` y pruebas: conversión de filas, escritura por RPC, lectura paginada sin truncar el historial, errores sin datos ficticios.
- Extender `RecordEntry.source` con `account`; conservar la restauración estricta del almacenamiento preview.
- Pasar la identidad resuelta de `SessionScope` a `HistoryProvider`; cargar únicamente esa cuenta y reiniciar al cambiar de identidad.
- Hacer `saveRecord` asíncrono. Actualizar el estado y descartar el borrador solo después de confirmar la persistencia. Conservar borrador e ID ante fallos de red.
- Mantener preview explícito y separado. No importar automáticamente ejemplos ni registros temporales a la cuenta.

## 3. Recorrido y consumidores

- `confirmacion.tsx`: habilitar «Guardar registro» para cuentas y esperar respuesta; conservar estados de guardado/error y bloquear doble clic. No completar una navegación de guardado después de desmontarse/cambiar de cuenta.
- `historial/views.tsx`, `analisis/views.tsx`, `exportar/exportar.tsx`, `exportar/report.tsx`: admitir cuenta, conservar estados de carga/error/reintento, identificar la procedencia y mostrar ejemplos solamente en preview.
- Conservar tokens, composición y mascota existentes. Registrar la decisión funcional y evidencia en los documentos de marca y producto.
- Actualizar fixtures de pruebas sin auth: deben mostrar indisponibilidad, nunca simular una cuenta.

## 4. Verificación y despliegue

- Ejecutar las pruebas de historial, análisis y exportación con Node; `npm run lint`, `npm run typecheck` y build.
- Probar en la ruta Next.js real contra Supabase local: guardar emoción y varios factores, recargar, abrir otra pestaña/navegador, consultar calendario/evolución/exportación y verificar aislamiento entre cuentas.
- Simular fallo de lectura/escritura y respuesta perdida después del commit; comprobar borrador conservado y reintento sin duplicado. Probar preview por separado.
- Documentar aplicación de migración antes del build/despliegue del VPS. La verificación OAuth Google y el despliegue remoto solo se afirmarán si se ejecutan realmente.

## Alternativas consideradas

Un JSON de historial por usuario simplificaría la escritura pero perdería validación por claves foráneas y favorecería sobrescrituras concurrentes. Un backend adicional duplicaría la autenticación y permisos disponibles en Supabase. Se eligen tablas/RPC y el provider existente.

## Estado

Implementado y verificado localmente el 27/10/2026, autorizado por el pedido «hace un plan e implementalo».

- `node --test`: 38 pruebas aprobadas.
- `npm run lint`, `npm run typecheck`, `npm run format:check` y builds de producción con cuenta y preview: aprobados.
- `app/app/(paciente)/historial/account.test.py`: aprobado contra Supabase Docker y build de producción. Dos cuentas aisladas, anon bloqueado, validaciones, rollback completo, respuesta perdida seguida de recarga/reintento sin duplicados, persistencia entre navegadores, borrador conservado, limpieza al cambiar de cuenta y exportación de 1003 registros.
- `app/auth/browser.test.py`: aprobado (incluye sesión/recarga/logout, recuperación y aislamiento del perfil).
- `app/frontend.test.py`: aprobado con preview, incluido reintento tras quota, calendario, descargas y PDF multipágina.
- `app/analisis/browser.test.py`: aprobado con preview y sin configuración de cuenta. `app/registro/emociones.test.py`: aprobado sin configuración de cuenta. Las pruebas que requieren otro dev se ejecutaron en una copia temporal aislada para conservar el servidor de desarrollo existente.
- `supabase db lint --local --fail-on warning` y `supabase db advisors --local`: sin hallazgos. Se reprodujo la migración completa dentro de una transacción y se hizo rollback, sin resetear ni perder los datos locales. El diff generado se redujo a los objetos de esta función, eliminando un `drop extension pg_net` ajeno al alcance y preservando las revocaciones explícitas.
- Revisión de código: detectó el UUID temporal del primer intento; se corrigió conservando el intento junto al borrador y se verificó con recarga tras respuesta perdida.
- [Capturas y alcance visual](../design/evidence/registros-cuenta-2026-10-27/README.md).

Desplegado en producción el 27/10/2026 en <https://app.eudila.com>, a pedido explícito del usuario. Se respaldó PostgreSQL, se conservó la imagen anterior, se aplicó la migración y se activó el build Linux verificado. La prueba real con dos cuentas sintéticas confirmó guardado, recarga, consulta desde otro navegador, consumidores, exportación, idempotencia y aislamiento RLS. Las cuentas temporales se eliminaron al terminar. Google permanece habilitado; no se automatizó el consentimiento OAuth personal. [Operación, versión exacta, respaldo y rollback](../ops/vps-eudila.md).

Límite: si `sessionStorage` bloquea la escritura del intento, su ID se conserva solo mientras permanezca abierta la revisión. El historial de cuenta se recupera al abrir/recargar; no hay sincronización en tiempo real entre pestañas.

Referencias consultadas: [RLS oficial](https://supabase.com/docs/guides/database/postgres/row-level-security), documentación instalada de Next.js (`use-client`) y ayuda del CLI Supabase 2.121.0.
