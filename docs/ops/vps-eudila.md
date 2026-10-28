# Despliegue de app.eudila.com

Verificado el 27/10/2026. Este es el VPS de la app Next.js; la página estática de la mascota en el VPS Oracle es otro despliegue.

## Ubicación y servicios

- URL: <https://app.eudila.com>.
- Carpeta de operación: `/opt/eudila-app`.
- Docker Compose: proyecto `eudila-app`; servicios `web`, `auth` (GoTrue), `rest` (PostgREST), `db`, `gateway` (nginx) y `cloudflared`.
- PostgreSQL 17; las migraciones aplicadas se registran en `public.eudila_migrations`. Es Supabase autohospedado, no un proyecto Cloud vinculado al CLI.
- Configuración y claves en `.env`, token del túnel en `secrets/`. No copiar sus valores a Git ni a logs.
- `src` y `web-ctx` son enlaces a una versión dentro de `releases/`.

## Guardado de cuenta desplegado

Versión: `20261027T095058Z-records-39af816c`.

Se desplegó una instantánea del workspace con el guardado de cuenta, basada en `81c5e01ead600d17df4a7470c201f2e6d3d9acd1`. Incluye cambios sin commit; `DEPLOYED_COMMIT` identifica la base, y `DEPLOYED_RELEASE.json` identifica el artefacto exacto (`working_tree: true`). SHA-256 del archivo fuente: `39af816cd76bee107450554e0df423630c1c5ed9fbba7c563f09879c67dd4804`.

En `/opt/eudila-app/releases/20261027T095058Z-records-39af816c/` se conservan:

- `source.tar.gz`, `release.json`, `src/` y `web-ctx/`.
- `before.dump`: respaldo de PostgreSQL previo a la migración, en una carpeta privada del servidor.
- Referencias al código y contexto anteriores y copia de la configuración previa.
- Scripts de construcción, aplicación y activación; `smoke-report.json` con los resultados de producción, sin credenciales ni datos personales.

La imagen de esa versión se conserva como `eudila-app-web:20261027T095058Z-records-39af816c`. La anterior se conserva como `eudila-app-web:rollback-20261027T095058Z-records-39af816c`.

Se aplicó `20261027031110_registros_cuenta.sql` en una transacción junto con su entrada en `eudila_migrations`, con `lock_timeout=5s`. Se comprobó RLS en ambas tablas, denegación anónima y ejecución de la RPC con los permisos del usuario. No se cambiaron las credenciales, la configuración de Google, las cuentas existentes ni los demás servicios del VPS.

## Actualización visual de Google

Versión visual: `20261027T230211Z-google-white-2fbee686`, posterior al despliegue del guardado. Incluye el botón blanco y la G oficial de Google. El archivo fuente tiene SHA-256 `2fbee686988964c897e22a7bced7d27c1549fad08e203792a8477bb77062f6b3`; se conservan el build, la imagen previa y el respaldo dentro de su carpeta de versión. Esta actualización solo requiere reemplazar `web`; no incorpora migraciones. La activación y comprobación se registran en [la evidencia visual](../design/evidence/google-blanco-2026-10-27/README.md).

## Construcción y cambio de versión

Compilar en una versión nueva, sin sobrescribir la que sirve tráfico. Reutilizar las variables públicas de `.env`: URL y clave anon para Auth y catálogo, preview desactivado y Google según la configuración existente. Nunca incorporar `SERVICE_ROLE_KEY` al build del navegador.

Se utiliza Node 24 con `output: "standalone"` en un `next.config.mjs` exclusivo del despliegue. Declarar el objeto en una variable antes de exportarlo para respetar ESLint. Ejecutar lint, tipos, pruebas y build antes de activar.

El contexto Docker incluye standalone, `.next/static` y `public`. El proceso corre como `node`, sin privilegios. Normalizar permisos de lectura/recorrido dentro de la imagen (`RUN chmod -R a+rX /app` antes de `USER node`): el empaquetado con umask privado puede producir directorios `700`, y la caché de COPY puede conservar sus permisos. No aplicar esa normalización a `.env`, secretos ni respaldos.

Probar la imagen candidata antes de activarla. Aplicar las migraciones aditivas a la base de este mismo proyecto. Recrear solo `web` y recargar nginx para resolver nuevamente su dirección interna:

```sh
cd /opt/eudila-app
docker compose up -d --no-deps --no-build web
docker compose exec -T gateway nginx -s reload
```

Mantener los enlaces de código/contexto y `DEPLOYED_RELEASE.json` alineados con la imagen activa. No volver a ejecutar automáticamente todo `up.sh` si solo cambia la app: también administra otros servicios.

## Verificación realizada

- Lint, tipos, 38 pruebas unitarias y build Linux aprobados en el VPS.
- Imagen candidata: bienvenida HTTP 200 y acceso Google renderizado.
- Prueba sobre HTTPS real con dos cuentas sintéticas: guardado de ánimo/emoción/dos factores, recarga, segundo contexto de navegador, calendario, evolución, factores y exportación JSON.
- Lectura ajena vacía; lectura anónima y escritura con propietario ajeno denegadas; reintento sin duplicados.
- Botón Google habilitado; no se automatizó un consentimiento OAuth de una cuenta personal.
- Se revocaron las sesiones temporales y eliminaron sus dos cuentas; los registros de prueba se eliminaron por cascada.

## CI y límite para automatizar el despliegue

Revisión por SSH el 27/10/2026 (28/10 UTC): los seis servicios del proyecto están activos, PostgreSQL está saludable y <https://app.eudila.com> responde HTTP 200 tras redirigir a `/bienvenida`. La imagen activa coincide con `DEPLOYED_RELEASE.json` de la versión visual de Google.

El repositorio ya tiene `.github/workflows/ci.yml`: GitHub Actions verifica pull requests y pushes a `main` con Node 24, instalación reproducible, lint, tipos, formato, pruebas unitarias y compilaciones de app y landing. También admite ejecución manual. La nueva [ejecución de verificación](https://github.com/Eudila/eudila/actions/runs/40612703757) del commit `a657a15fd88fd3033cf4860daddf863a1bb7e6c2` terminó correctamente: todos los pasos aprobados, 49 segundos.

En la revisión inicial, `main` ya usaba workspaces (`app/`, `landing/`, `packages/`), pero no incluía el guardado de cuenta de producción. Para habilitar CD se integraron `account.ts`, la migración `20261027031110_registros_cuenta.sql`, todos sus consumidores y el botón Google blanco en la estructura actual. El build de producción y la prueba Next.js con Supabase local verificaron RLS, guardado, respuesta perdida/reintento sin duplicados, recarga, otro navegador y exportación de más de 1000 registros.

## Despliegue continuo

Autorizado por el usuario el 27/10/2026 (28/10 UTC). `.github/workflows/deploy.yml` sigue únicamente un CI exitoso de `main`, por push o ejecución manual; las ejecuciones de PR no acceden al VPS. El entorno GitHub `production` admite solo `main` y contiene la clave dedicada `EUDILA_VPS_SSH_KEY` y el host verificado `EUDILA_VPS_KNOWN_HOSTS`. No contiene la contraseña de root ni secretos de Supabase.

La clave pública usa `restrict,command="/usr/local/sbin/eudila-deploy-ssh"`. Solo admite `deploy <SHA de main>`; se comprobó que rechaza comandos de shell. Los scripts versionados en `app/infra/scripts/deploy-release.sh` y `deploy-ssh.sh` están instalados como `/usr/local/sbin/eudila-deploy` y `/usr/local/sbin/eudila-deploy-ssh`, root:root 755. Para actualizarlos, revisar el diff e instalarlos por una sesión administrativa; el pipeline no sustituye sus propios permisos.

El script bloquea despliegues concurrentes, omite commits superados, archiva el SHA exacto desde GitHub, comprueba que las migraciones de esa versión ya estén aplicadas y compila en un contenedor limitado a 2,5 GB/1,5 CPU. Solo recibe variables públicas de la configuración existente, con preview desactivado. Una migración nueva requiere revisión, respaldo y aplicación manual antes de volver a ejecutar el CI; el pipeline nunca resetea ni restaura la base.

La imagen candidata se prueba antes del cambio. Solo se recrea `web`; se espera que responda y se recarga nginx, comprobando HTTPS. Si falla la activación se restauran imagen, enlaces y metadatos, se espera el servidor anterior y se recarga nginx. Los tests simulan fallos de build, activación, HTTPS y migración pendiente. El VPS conserva ambos mounts de caché (`/app/.next/cache` para rollback anterior y `/app/app/.next/cache` para workspaces).

Se eliminan `node_modules` y `.next` del código fuente después del intento; se conservan código, contexto Docker, imágenes y metadatos de las releases. No hay borrado automático de versiones: vigilar el espacio en `/opt` y conservar la activa y las necesarias para rollback al limpiar. Para repetir una publicación, ejecutar manualmente el workflow CI en `main`; si ya está activa, se omite.

## Landing y panel en el despliegue continuo · 27/10/2026

Hasta acá `eudila-deploy` solo publicaba la app: la landing se subía a mano con `npm run deploy:vps` y por eso eudila.com siguió oscura después del modo claro. Desde esta versión del script, cada despliegue de `main` también publica:

- **Landing** (`/opt/eudila-landing`, proyecto `eudila-landing`): compila `landing/dist`, arma la imagen nginx con `Dockerfile`, `nginx.conf` y `security-headers.conf` del commit, la prueba como candidata y cambia solo el servicio `web`. Si no responde, vuelve la imagen anterior.
- **Panel** (`/opt/eudila-dashboard`, proyecto `eudila-dashboard`): compila el dashboard en modo standalone, arma la imagen con `app/infra/dashboard/Dockerfile`, la prueba y cambia solo `web`. Si existe `secrets/tunnel-token`, deja corriendo su túnel. Publica dashboard.eudila.com.

Cada proyecto es opcional: se publica solo si su carpeta tiene `compose.yaml`, y anota su commit en `DEPLOYED_COMMIT` dentro de esa carpeta. Si la app ya sirve el commit y falta alguno de los otros, el script compila y publica solo lo que falta. Del repositorio solo se toman código y contextos de imagen: los `compose.yaml` de los tres proyectos son los del servidor, así que un commit no puede cambiar montajes, redes ni privilegios. Un fallo de la landing o del panel marca el despliegue como fallido pero no revierte la app.

### Instalación (una vez, como root en el VPS)

1. Revisar e instalar el script nuevo:

   ```sh
   cd /opt/eudila-app
   git --git-dir=repository.git fetch --quiet origin main:refs/heads/main
   git --git-dir=repository.git show main:app/infra/scripts/deploy-release.sh > /tmp/eudila-deploy
   diff -u /usr/local/sbin/eudila-deploy /tmp/eudila-deploy | less
   install -o root -g root -m 755 /tmp/eudila-deploy /usr/local/sbin/eudila-deploy
   ```

2. Confirmar que la landing vive en este VPS: `ls /opt/eudila-landing/compose.yaml` y `docker ps --filter name=eudila-landing`. Si eudila.com se sirve desde otro lado, esta parte no aplica.

3. Crear el proyecto del panel con el `compose.yaml` revisado y el token de su túnel (ver Cloudflare abajo):

   ```sh
   install -d -m 700 /opt/eudila-dashboard /opt/eudila-dashboard/secrets
   git --git-dir=repository.git show main:app/infra/dashboard/compose.yaml > /opt/eudila-dashboard/compose.yaml
   install -o 65532 -m 600 /dev/null /opt/eudila-dashboard/secrets/tunnel-token
   read -rs TOKEN   # pegar el token y Enter; no queda en el historial
   printf '%s' "$TOKEN" > /opt/eudila-dashboard/secrets/tunnel-token && unset TOKEN
   ```

4. Publicar el commit actual de `main`: `eudila-deploy "$(git --git-dir=repository.git rev-parse main)"`, o en GitHub, Actions → CI → Run workflow sobre `main`. Como la app ya sirve ese commit, solo se compilan y publican la landing y el panel.

5. Comprobar: `cat /opt/eudila-landing/DEPLOYED_COMMIT /opt/eudila-dashboard/DEPLOYED_COMMIT`, `docker ps --filter name=eudila-` y https://eudila.com y https://dashboard.eudila.com en una ventana privada.

### Cloudflare

El panel usa un túnel propio, como la landing: su `cloudflared` está en la red del proyecto `eudila-dashboard` y no ve a la app ni a su base.

1. Zero Trust → Networks → Tunnels → **Create a tunnel** → Cloudflared. Nombre: `eudila-dashboard`.
2. En «Install and run connectors» elegir Docker y copiar solo el token (el texto largo después de `--token`). No correr el comando: el token va en `/opt/eudila-dashboard/secrets/tunnel-token` (paso 3).
3. **Public hostname**: subdominio `dashboard`, dominio `eudila.com`, sin path. Service: tipo `HTTP`, URL `web:3000`. Cloudflare crea solo el registro DNS `dashboard` (CNAME al túnel, con proxy).
4. El túnel pasa a «Healthy» cuando el VPS levanta `eudila-dashboard-tunnel` (paso 4).

Opcional: para que la vista previa no sea pública, Zero Trust → Access → Applications → Self-hosted con el dominio `dashboard.eudila.com` y una política con los emails del equipo. El sitio ya pide no indexarse.

La landing no cambia en Cloudflare. Las capturas del teléfono llevan `?v=claro` para no salir de la caché vieja. Si a los cinco minutos la página sigue oscura, purgar la caché: Caching → Configuration → Purge Everything.

## Volver a la versión anterior

Revertir solo la app. La migración es aditiva y debe conservarse para no perder registros que se hayan guardado desde el despliegue.

```sh
cd /opt/eudila-app
release=$(python3 -c 'import json; print(json.load(open("DEPLOYED_RELEASE.json"))["release"])')
docker image tag "eudila-app-web:rollback-$release" eudila-app-web:latest
docker compose up -d --no-deps --no-build web
docker compose exec -T gateway nginx -s reload
```

Restaurar también los enlaces `src` y `web-ctx` según `previous-src` y `previous-web-ctx` del directorio de esta versión, y sus metadatos. No restaurar automáticamente `before.dump`: sobrescribiría cambios posteriores al respaldo.
