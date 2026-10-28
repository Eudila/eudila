# Dashboard del psicólogo

Vista previa del panel para psicólogos: **Tus pacientes**, **Ficha del paciente** y **Dar de alta**, en tema claro, según el diseño «Panel del psicólogo» (27/10/2026).

> [!IMPORTANT]
> Todo lo que muestra es **ficticio**. No hay inicio de sesión, no lee registros de la app ni de Supabase y no envía emails. Cada pantalla lo avisa arriba.

## Probalo en local

Desde la raíz del repo, después de `npm ci`:

```sh
npm run dev:dashboard
```

Abrí <http://127.0.0.1:3001>. Para el build de producción: `npm run build:dashboard` y `npm run start --workspace @eudila/dashboard`.

## Publicación

Se publica en https://dashboard.eudila.com con el despliegue continuo de `main`, como proyecto Docker propio (`/opt/eudila-dashboard`, sin acceso a la app ni a su base) y su propio túnel de Cloudflare. Imagen: [`app/infra/dashboard/Dockerfile`](../app/infra/dashboard/Dockerfile); proyecto: [`compose.yaml`](../app/infra/dashboard/compose.yaml). Instalación única y Cloudflare: [operación del VPS](../docs/ops/vps-eudila.md#landing-y-panel-en-el-despliegue-continuo--27102026).

## Qué hay

| Ruta              | Pantalla                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`               | Lista de pacientes con media, población, últimos 7 días, sin registros e invitaciones. Período de 7, 30 o 90 días (`?periodo=`), búsqueda y orden. |
| `/pacientes/[id]` | Ficha: media, población, período anterior, evolución diaria, calendario, estados, factores, emociones y registros recientes. Exporta CSV.          |
| `/alta`           | Invitación por email. En la vista previa no se envía: queda en `sessionStorage` y aparece en la lista mientras dure la pestaña.                    |

- **Datos de ejemplo:** [`lib/demo-data.ts`](lib/demo-data.ts). El «hoy» es fijo, lunes 26/10/2026, para que las fechas coincidan con el diseño. Los últimos 30 días de Lucía M. y los resúmenes de la lista reproducen el diseño; el resto del historial sale de una semilla fija.
- **Cálculos:** [`lib/panel.ts`](lib/panel.ts), funciones puras sin zona horaria (medias ponderadas por registro, promedios diarios, período anterior, porcentajes por estado, factores, emociones y calendario). Sus pruebas están en `lib/panel.test.mjs` y corren con `npm test`.
- **Marca:** tokens de `@eudila/brand`, Figtree y la mascota quieta con carita de `@eudila/mood` (`MoodOrb`), como en historial y fichas de la app.

## Qué falta para usarlo con pacientes reales

Ver [la decisión](../docs/decisiones/2026-10-27-panel-vista-previa.md) y el [alcance del panel](../docs/arquitectura/README.md#alcance-propuesto-del-panel):

- Registros sincronizados con la cuenta del paciente.
- Rol de psicólogo en `profiles`, no editable por el cliente.
- Tablas `vinculos` e `invitaciones` (email, token, vencimiento), con aceptación y revocación por parte del paciente.
- Reglas RLS: el psicólogo lee registros solo con un vínculo activo.
- `media_poblacion` como vista de agregados sin identidades, con un mínimo de pacientes por grupo definido antes de exponerla.
