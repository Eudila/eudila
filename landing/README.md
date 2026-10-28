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

El build local no envía formularios ni carga analítica. El formulario queda visible pero deshabilitado, con un aviso explícito de que todavía no existe una casilla monitoreada. La lógica de entrega se habilita únicamente en un build de publicación con toda la configuración requerida. El motivo elegido en «Te escribo por» viaja como primera línea del mensaje; la API conserva sus cuatro campos.

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

Mientras no haya casilla monitoreada y Resend, el formulario sigue deshabilitado y remite al canal de GitHub: nginx no ejecuta `api/contact.mjs`.

## Variables para publicar en Vercel

- `EUDILA_RELEASE=true`
- `SITE_URL=https://dominio-del-proyecto`
- `CONTACT_TO`: casilla monitoreada que recibe las consultas.
- `CONTACT_FROM`: remitente verificado en Resend, por ejemplo `Eudila <web@dominio>`.
- `RESEND_API_KEY`: credencial de entrega; configurar únicamente como secreto de Vercel.
- `UMAMI_SCRIPT_URL`: script del proveedor Umami elegido.
- `UMAMI_WEBSITE_ID`: identificador del sitio en Umami.

El build de publicación falla si falta cualquiera de estas variables. La analítica respeta Do Not Track, no conserva query/hash y este sitio no agrega cookies ni almacenamiento del navegador.

Antes de considerar ANI-76 terminada hay que comprobar entrega real a `CONTACT_TO`, dominio propio, HTTPS, captura móvil, navegación con teclado y el fetch público de `og-eudila.png` por un depurador social.

En Vercel, configurar Root Directory `landing` y permitir archivos fuera de ese directorio (paquetes compartidos). El comando `npm run build` ejecuta la sincronización antes del build; no invocar `node scripts/build.mjs` directamente.
