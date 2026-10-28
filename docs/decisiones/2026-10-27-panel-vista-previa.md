# 27/10/2026 · Panel del psicólogo como vista previa

Pedido del usuario: subir el dashboard del diseño «Panel del psicólogo» como vista previa con datos de ejemplo, en tema claro.

Decisión: `dashboard/` pasa a ser el workspace `@eudila/dashboard` (Next.js 16) con tres pantallas: Tus pacientes, Ficha del paciente y Dar de alta. Para `dashboard/` queda sin efecto la regla de [2026-10-27-monorepo](2026-10-27-monorepo.md) de no fingir un panel operativo; en la app de pacientes sigue vigente.

Límites que se mantienen:

- Todos los pacientes, registros, invitaciones y la media de la población son ficticios y viven en `dashboard/lib/demo-data.ts`. Cada pantalla muestra «Vista previa con datos ficticios» y el sitio no se indexa.
- Sin inicio de sesión, sin acceso a Supabase, sin tablas nuevas ni API. «Dar de alta» no envía emails y «Reenviar» tampoco.
- Los cálculos de `dashboard/lib/panel.ts` son puros y probados para poder reutilizarse cuando haya datos reales.

Pendiente para un panel real: registros sincronizados, rol de psicólogo no editable por el cliente, `vinculos` e `invitaciones` con aceptación y revocación del paciente, RLS que solo permita leer con un vínculo activo y `media_poblacion` con un mínimo de pacientes por grupo definido antes de exponer agregados.

Verificación: pruebas Node de los cálculos contra los números del diseño, lint, tipos, formato, build del dashboard y recorrido en navegador a 1440 y 390 px (sin desbordes horizontales).
