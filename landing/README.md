# Landing pública de eudila · ANI-76

Proyecto estático separado de la aplicación Next.js. Usa la identidad y capturas reales del repositorio principal, pero no comparte su runtime.

La revisión del 26/10/2026 adopta el branding vigente: lienzo oscuro Lisa, acción coral, logo estático de la mascota Muy agradable y capturas reales de la app actual.

## Revisión local

```sh
npm test
npm run build
npx serve dist
```

El build local no envía formularios ni carga analítica. El formulario queda visible pero deshabilitado, con un aviso explícito de que todavía no existe una casilla monitoreada. La lógica de entrega se habilita únicamente en un build de publicación con toda la configuración requerida.

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
