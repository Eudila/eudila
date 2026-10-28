# Arquitectura de eudila

La organización adopta la lámina «Organización propuesta» del archivo **Panel del psicólogo.html** entregado el 27/10/2026. Las otras seis láminas describen sistema, módulos, registro, sesión, despliegue y datos propuestos para el panel.

```text
app/                   Next.js, configuración y .env.local
  app/                 Rutas y pantallas
  supabase/            Migraciones, RLS, seed, plantillas y configuración local
  infra/
    app/               Docker, gateway y servicios de la app
    landing/           Docker y nginx de la landing
    scripts/           Assets, Supabase local y despliegues
    architecture.test.mjs
landing/               Sitio estático y endpoint de contacto
dashboard/             Panel del psicólogo: vista previa con datos ficticios
packages/              Dominio, mascota y marca compartidos
docs/                  Arquitectura, decisiones, diseño e historia
.github/               CI
```

Las aplicaciones importan paquetes por `@eudila/*`. Los paquetes nunca importan apps ni el prototipo. `domain` no depende de React ni de Next; usa las etiquetas de los estados de `mood/moods.js`. La lectura HTTP del catálogo vive en `app/lib/catalog.js`, fuera del dominio. El dashboard es el workspace `@eudila/dashboard`: una vista previa con datos ficticios que usa `brand` y `mood`, sin acceso a datos reales ([decisión](../decisiones/2026-10-27-panel-vista-previa.md)).

Los grupos de rutas no cambian las URL. `/auth/callback`, `/registro/tipo`, `/hoy` y el resto de los destinos conservan sus contratos. `SessionScope`, `RegistroProvider` e `HistoryProvider` conservan su ciclo y claves de almacenamiento. Auth sigue validando con `getUser`; perfiles siguen protegidos por RLS. No se migran ni borran datos.

`app/app/globals.css` importa los tokens canónicos de `packages/brand/tokens.css`. El layout carga Figtree del paquete. `sync:assets` materializa los logos bajo `/brand` y la fuente de la landing; esos archivos servidos no son fuentes de edición. `sync:mascota` compila el motor de `packages/mood` para el navegador sin un segundo motor manual. Se ejecuta antes del build estático.

Comandos desde la raíz: `npm ci`, `npm run dev`, `npm run build`, `npm run start`, `npm run build:landing`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`. Para preview: `cp app/.env.example app/.env.local`. Para Auth local: `npm run supabase:start`; conserva el proyecto Supabase y escribe la configuración pública en `app/.env.local`. Los secretos del CLI de Supabase se configuran en `app/.env`; su directorio de trabajo es `app/`.

Docker activa `EUDILA_STANDALONE=true`. El servidor generado está en `.next/standalone/app/server.js`; el contexto incluye los paquetes trazados desde la raíz. Despliegues: `app/infra/scripts/deploy-app.sh` y `app/infra/scripts/deploy-landing.sh`. El refactor no ejecuta despliegues.

## Alcance propuesto del panel

El HTML marca como **propuestos** `/panel`, registros en PostgreSQL, roles, vínculos, invitaciones y `media_poblacion`. Esta reorganización no implementa esas funciones ni habilita acceso clínico a datos. Una futura entrega necesita persistencia real, autorización por rol no editable por el cliente, consentimiento/revocación del paciente y pruebas RLS; la media requiere definir el mínimo de población antes de exponer agregados. La autenticación actual no implica sincronización de registros.

## Organización para publicación

La raíz se presenta con `README.md`, `app/`, `landing/` y `dashboard/`. El App Router vive en `app/app/`. PRODUCT.md y DESIGN.md se conservan solo como archivos locales ignorados por Git; la marca versionada permanece en `packages/brand` y `docs/design`. Esta exclusión no modifica el historial previo de Git.
