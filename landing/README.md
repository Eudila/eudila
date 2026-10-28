# Landing pública de eudila · ANI-76

Proyecto estático separado de la aplicación Next.js. Usa la identidad, la mascota y capturas reales del repositorio principal, pero no comparte su runtime.

**Rediseño del 26/10/2026:** misma narrativa que el pitch (psicólogos e inversión), minimalista y en movimiento. La mascota es el motor de la app, sincronizado en `mascota.js`, y respeta [docs/design/mascota/README.md](../docs/design/mascota/README.md): nunca sigue al puntero, cada una tiene su reloj y con movimiento reducido queda quieta. Detalle y evidencia en [docs/design/evidence/landing-showreel-2026-10-26/README.md](../docs/design/evidence/landing-showreel-2026-10-26/README.md).

## Archivos

- `index.html`, `styles.css`: página y estilos.
- `escena.js`: movimiento de la página (portada con reflejo y selector, semana, pasos, gráfico, video, Noainova).
- `mascota.js`, `moods.js`: **generados** por `npm run sync:mascota` desde `packages/mood/critter.ts` y `packages/mood/moods.js`. No editarlos a mano.
- `film/pelicula.js`: guion de la pieza de video; `film/render.html` la reproduce en un navegador (servida desde `landing/`).
- `main.js`: formulario de contacto y analítica opcional.
- `privacidad.html`, `terminos.html`: política de privacidad y condiciones del servicio (26/10/2026), publicadas en `/privacidad` y `/terminos`. Las pide el consentimiento OAuth de Google. Describen lo que la app hace hoy (la cuenta de Google y un perfil mínimo; los registros emocionales no se guardan en servidores); si eso cambia, hay que actualizarlas antes. El contacto es `privacidad@eudila.com`: debe existir como reenvío en Namecheap.

## Revisión local

```sh
cd ..
npm ci
cd landing
npm test
npm run build
npx serve dist
```

El build local deja el formulario visible pero deshabilitado. El build de publicación lo habilita al configurar el endpoint y la sitekey pública. El motivo elegido se guarda separado del mensaje. La analítica es opcional e independiente del contacto.

## Regenerar activos

- `npm run sync:mascota`: vuelve a copiar el motor de la mascota si cambió en la app (usa el `typescript` de la raíz).
- `npm run render:film`: renderiza `assets/eudila-film.mp4` (1920 × 1080, 60 fps) y su póster. Requiere `ffmpeg`. `-- --stills` guarda un cuadro por segundo en `outputs/film/` para revisar; `-- --at=2,10.7` guarda solo esos segundos.
- `EUDILA_APP_URL=http://localhost:3000 npm run capture:app`: capturas de los cinco pasos con la app en vista previa (`NEXT_PUBLIC_FRONTEND_PREVIEW=true`).
- `npm run capture:og`: imagen social.
- `LANDING_URL=http://127.0.0.1:4173/ npm run check:visual`: reflujo a 320/390/768/1440 px, texto al 200 %, imágenes, consola y estados del formulario.

## Despliegue en el VPS (Docker + Cloudflare Tunnel)

`app/infra/landing/` tiene un nginx mínimo (`Dockerfile`, `nginx.conf`, `compose.yaml`) que sirve `dist/`. Vive en su propia carpeta (`/opt/eudila-landing`) y su propio proyecto de Docker: no usa el nginx del host, no publica puertos (solo `127.0.0.1:8081` para comprobarlo) y no cambia el firewall, así que convive con otros servicios.

```sh
VPS_HOST=usuario@ip-del-vps SSHPASS='…' npm run deploy:vps   # o sin SSHPASS si usás clave SSH
```

Desde el 27/10/2026 el despliegue continuo de `main` también publica la landing cuando `/opt/eudila-landing/compose.yaml` existe en el VPS ([cómo](../docs/ops/vps-eudila.md#landing-y-panel-en-el-despliegue-continuo--27102026)); este script queda para la instalación inicial o un servidor sin despliegue continuo. El script compila, sube `dist/` y `app/infra/landing/` y corre `docker compose up -d --build`. La contraseña va solo por entorno y no se guarda. El tráfico público llega por un túnel de Cloudflare: poné el token en `/opt/eudila-landing/secrets/tunnel-token` en el VPS y el siguiente despliegue levanta también `cloudflared` (perfil `tunnel`). Cloudflare termina el HTTPS.

## Contacto: PostgreSQL y Turnstile

El formulario envía a `https://app.eudila.com/api/contact`. La ruta Next.js reutiliza `api/contact.mjs`; nginx de la landing sigue sirviendo archivos estáticos. No requiere Resend, otra aplicación ni acceso anónimo a la base.

Antes de habilitarlo:

1. Respaldar la base y aplicar `app/supabase/migrations/20261028090000_contacto_landing.sql`; registrar el nombre en `public.eudila_migrations`, como las migraciones anteriores.
2. Configurar en **runtime del contenedor web** `TURNSTILE_SECRET`, `TURNSTILE_HOSTNAMES=eudila.com,www.eudila.com`, `CONTACT_DATABASE_URL=http://rest:3000` y `SUPABASE_SERVICE_ROLE_KEY` (mapeada desde `SERVICE_ROLE_KEY` en Compose). Para Supabase Cloud/local, la URL de PostgREST termina en `/rest/v1`. No poner secretos en variables públicas ni en el build.
3. Revisar e instalar el Compose y `deploy-release.sh` actualizados: el CD no reemplaza estos archivos operativos automáticamente.
4. Configurar en `/opt/eudila-app/.env` las variables **públicas de build** siguientes y reconstruir ambos proyectos:

```dotenv
EUDILA_RELEASE=true
LANDING_SITE_URL=https://eudila.com
CONTACT_ENDPOINT=https://app.eudila.com/api/contact
TURNSTILE_SITEKEY=0x4AAAAAAFpbyBWDyMPwazeV
TURNSTILE_HOSTNAMES=eudila.com,www.eudila.com
```

En el script manual de la landing, usar `SITE_URL` en lugar de `LANDING_SITE_URL`. `EUDILA_RELEASE=true` exige `SITE_URL`, `CONTACT_ENDPOINT` y `TURNSTILE_SITEKEY`; no requiere secretos de backend ni analítica. El widget está creado en Cloudflare, modo Managed, dominios eudila.com/www.eudila.com y sin pre-clearance. Su secret se recupera directamente al destino privado, nunca por chat.

La API valida campos y consentimiento, limita el cuerpo real a 16 KiB y consume un intento antes de Siteverify. El límite compartido es **5 intentos por IP cada 15 minutos**, incluso para solicitudes inválidas; responde `429` con `Retry-After`. PostgreSQL actualiza el contador atómicamente y purga los vencidos al recibir otra solicitud. La clave es un HMAC de IP; no se guardan IP ni tokens con el mensaje. Solo el servidor puede insertar mensajes; anon/authenticated no pueden leer ni escribir, y la credencial del servidor tampoco puede leerlos. El equipo consulta con acceso administrativo a la base:

```sql
select created_at, name, email, organization, interest, message
from public.contact_messages order by created_at desc;
```

El gateway debe reemplazar `X-Forwarded-For` con la IP que Cloudflare autentica, como hace `app/infra/app/gateway.conf`. No exponer Next.js directamente a Internet con encabezados de IP arbitrarios. El adaptador Vercel se conserva, pero no es el despliegue validado; requiere una fuente de IP igualmente confiable.

La verificación exige `success === true`, acción `contact` y hostname permitido. El token se renueva después de cada intento. Un fallo conserva los campos y no confirma guardado. CORS solo admite los orígenes HTTPS del widget. El formulario no envía emails ni agrega una bandeja de administración. Si el servidor confirma la escritura pero se pierde su respuesta, un reintento con un token nuevo puede duplicar la consulta.

Pruebas:

```sh
node --test landing/api/contact.test.mjs
LANDING_URL=http://127.0.0.1:4173/ npm run check:visual --workspace @eudila/landing
# PostgreSQL descartable, sin puertos ni volumen; nunca producción:
docker run -d --rm --name eudila-contact-test --tmpfs /var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine
docker exec eudila-contact-test psql -U postgres -c 'create role anon; create role authenticated; create role service_role bypassrls;'
CONTACT_TEST_CONTAINER=eudila-contact-test node --test landing/api/contact.sql.test.mjs
docker stop eudila-contact-test
```

La prueba HTTP opcional `CONTACT_TEST_REST_URL=http://127.0.0.1:55439 node --test landing/api/contact.rest.test.mjs` exige PostgREST conectado a esa misma base descartable, con `PGRST_DB_ANON_ROLE=anon` y la clave JWT ficticia definida en la prueba. Solo acepta loopback y comprueba INSERT real sin SELECT.

La prueba SQL recrea únicamente las tablas de contacto del contenedor descartable indicado. Las pruebas del navegador simulan Turnstile para comprobar expiración, errores y renovación; no certifican tokens reales. Antes de considerar el canal activado, verificar en HTTPS un envío real, su fila en la base, el rechazo de replay y `429`. Las comprobaciones locales y pendientes de producción se registran en `docs/design/evidence/contacto-landing-2026-10-28/README.md`.
