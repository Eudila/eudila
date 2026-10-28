# Despliegue de la app completa · app.eudila.com

La app Next.js con cuentas reales: Supabase Auth (GoTrue), PostgREST y Postgres, en un VPS con Docker y publicada con un túnel de Cloudflare. Es un proyecto aislado (`eudila-app`): red y volúmenes propios, **ningún puerto publicado** y sin tocar el nginx del host ni otros servicios.

```
Cloudflare (HTTPS) ──túnel──▶ gateway (nginx) ──▶ /auth/v1/* → auth (GoTrue) ─┐
   app.eudila.com                              ├─▶ /rest/v1/* → rest (PostgREST) ─┤▶ db (Postgres 17)
                                               └─▶ /*         → web (Next.js)
```

Todo vive bajo un solo dominio, así que el navegador solo conoce `https://app.eudila.com`. Las versiones son las del Supabase CLI local (`postgres 17.11.0.004`, `gotrue v2.197.0`, `postgrest v16.4`).

## Login con Google

En Google Cloud Console → APIs y servicios → Credenciales → cliente OAuth de tipo «Aplicación web»:

| Campo                                 | Valor                                     |
| ------------------------------------- | ----------------------------------------- |
| Orígenes autorizados de JavaScript    | `https://app.eudila.com`                  |
| URI de redireccionamiento autorizados | `https://app.eudila.com/auth/v1/callback` |

En la pantalla de consentimiento: dominio autorizado `eudila.com` y, si la app está en modo «Testing», los usuarios de prueba. La app inicia el login con `redirectTo = <origen>/auth/callback`; esa URL ya está en la lista de redirecciones permitidas de GoTrue (`GOTRUE_URI_ALLOW_LIST`) y **no** va en Google. Para probar en local se pueden dejar además `http://127.0.0.1:54321/auth/v1/callback` y `http://127.0.0.1:3000`.

Para conectar las credenciales (viajan por stdin y quedan solo en el `.env` del servidor):

```sh
GOOGLE_CLIENT_ID='…apps.googleusercontent.com' GOOGLE_CLIENT_SECRET='GOCSPX-…' \
VPS_HOST=usuario@ip-del-vps SSHPASS='…' bash app/infra/scripts/deploy-app.sh
```

`NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` se fija al compilar, así que habilitar Google exige recompilar la app. En un servidor que ya despliega por releases, guardá `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_ENABLED=true` en el `.env` del servidor (lo leen `up.sh` y el `build.sh` de cada release), recreá `auth` para que tome las variables y compilá una release nueva desde el código activo en lugar de correr `deploy-app.sh`.

## Desplegar y actualizar

> **Una sola forma de desplegar por servidor.** `app/infra/scripts/deploy-app.sh` sube el código local a `src/` y lo compila. Si otra sesión desplegó por releases (`releases/<commit>/` con `src` y `web-ctx` como enlaces y un archivo `DEPLOYED_COMMIT`), el script se detiene para no pisar esa versión; `FORCE=1` lo omite. Antes de cambiar cualquier cosa en `/opt/eudila-app`, mirá `DEPLOYED_COMMIT` y quién está conectado (`who`).

```sh
VPS_HOST=usuario@ip-del-vps SSHPASS='…' bash app/infra/scripts/deploy-app.sh    # o con clave SSH, sin SSHPASS
```

El script sube los archivos versionados (sin `node_modules`, `landing` ni `docs`), crea `/opt/eudila-app/.env` con secretos nuevos **solo la primera vez**, compila la app en un contenedor con límites de memoria y CPU (para no desplazar a otros servicios) y ejecuta `up.sh`: levanta la base, espera a GoTrue, aplica las migraciones de `app/supabase/migrations` y el catálogo de `app/supabase/seed.sql` (una sola vez, con registro en `public.eudila_migrations`) y arranca el resto. Es idempotente.

El túnel: `cloudflared tunnel create eudila-app`, token en `/opt/eudila-app/secrets/tunnel-token` (propietario uid 65532, modo 600) y un `CNAME app` en la zona `eudila.com` hacia `<id-del-túnel>.cfargotunnel.com` con proxy activado.

## Email

Está apagado (`EMAIL_AUTH_ENABLED=false`): confirmar cuentas y recuperar claves necesita SMTP, y sin él habría que aceptar cuentas sin verificar. Con el login por email apagado, la app muestra su mensaje genérico de error si alguien lo intenta. Para habilitarlo: `EMAIL_AUTH_ENABLED=true` y `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL` al correr el script. Las plantillas de `app/supabase/templates` ya están conectadas.

## Datos y respaldo

Los datos viven en el volumen `eudila-app_db-data`: usuarios, perfiles, catálogo y registros emocionales privados por cuenta. Respaldo manual:

```sh
docker compose -p eudila-app exec -T db pg_dump -U postgres -h localhost postgres | gzip > eudila-$(date +%F).sql.gz
```

## Prueba local

`compose.test.yaml` publica la puerta de entrada en `127.0.0.1:8090`. Se usó para validar el despliegue completo antes de subirlo: generar un `.env` con `node gen-env.mjs http://127.0.0.1:8090`, copiar el código a `src/` y correr `COMPOSE_TEST=1 bash up.sh`.

El build usa npm workspaces y `EUDILA_STANDALONE=true`; el servidor resultante es `app/server.js` dentro de standalone. Código Next, sus variables locales y Supabase viven en `app/`.

## Despliegue continuo del VPS existente

El flujo vigente es `.github/workflows/deploy.yml` y los scripts `app/infra/scripts/deploy-release.sh` y `deploy-ssh.sh`, instalados como `/usr/local/sbin/eudila-deploy` y `/usr/local/sbin/eudila-deploy-ssh`. `up.sh` y `deploy-app.sh` sirven para el arranque inicial; no se ejecutan para una actualización de la app ya publicada.

`Deploy` solo sigue ejecuciones exitosas de CI de `main` por push o ejecución manual; no ejecuta código de pull requests en el VPS. Usa secretos del entorno `production`, limitado a `main`: `EUDILA_VPS_SSH_KEY` y `EUDILA_VPS_KNOWN_HOSTS`. La pública se instala en `authorized_keys` con `restrict,command="/usr/local/sbin/eudila-deploy-ssh"`: solo admite `deploy <SHA de main>`, sin shell ni forwarding. La contraseña y secretos de Auth permanecen fuera de GitHub.

Se conserva la configuración del servidor. El build recibe solo variables públicas y preview desactivado; las nuevas migraciones deben aplicarse previamente con revisión y respaldo. La publicación mantiene las releases previas y restaura imagen, enlaces y metadatos si falla la activación. [Operación, evidencia y rollback](../../../docs/ops/vps-eudila.md).
