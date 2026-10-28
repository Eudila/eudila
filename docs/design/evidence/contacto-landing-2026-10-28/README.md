# Contacto de la landing · 28/10/2026

Cambio realizado en una copia aislada de `main` (`2272900`) porque el workspace original tiene estructura anterior y cambios pendientes de la app. No se trasladaron ni sobrescribieron esos cambios.

## Implementación y decisión visual

Se conserva el formulario y sus tokens. Turnstile Managed usa tema claro y tamaño **compacto**, antes del botón. `flexible` exige al menos 300 px y no cabe dentro de los márgenes a 320 px; la revisión detectó ese caso y se corrigió. No cambia la mascota. La confirmación dice «Guardamos tu consulta» solo después de insertar en PostgreSQL; ante errores conserva los campos y renueva el token.

La landing llama a la ruta Next.js `/api/contact` de app.eudila.com con CORS explícito. El servidor valida Turnstile (success, hostname y acción contact), consume el límite persistente de 5 intentos/IP/15 minutos y escribe en `public.contact_messages`. RLS y privilegios impiden lectura/escritura a anon/authenticated. La credencial del servidor tiene INSERT, sin SELECT. Tokens e IP no se guardan en mensajes; el contador usa HMAC.

## Evidencia comprobada

- 11 pruebas del handler: validación/consentimiento, límite/Retry-After, honeypot, tokens ausentes/fallidos/repetidos, hostname/acción, servicios caídos, JSON/cuerpo real de 16 KiB, CORS e IP/configuración ausentes.
- Suite general: 74 pruebas aprobadas. Las dos pruebas de integración opcionales se ejecutaron aparte con sus variables explícitas.
- PostgreSQL 17 real descartable: migración, RLS activo, privilegios denegados a otras cuentas, validaciones de columnas, 12 procesos concurrentes (5 permitidos/7 limitados), IP distinta, expiración y purga.
- PostgREST v16.4 real: handler HTTP insertó una consulta sintética; fila confirmada por administración. SELECT con service_role: 403; consulta anónima: 401. Siteverify se simuló exclusivamente en esa prueba.
- Build de Next.js 16.3.8 aprobado en Linux/Node 24 Docker. Ruta real compilada: OPTIONS 204 con CORS permitido, origen ajeno 403, POST sin secretos 503 y GET 405. El build nativo macOS no pudo abrir el puerto interno de Turbopack por restricciones del entorno; no se cambió el bundler.
- Lint, tipos de app/panel, formato y sintaxis del script CD aprobados. Build local y build de publicación de la landing aprobados; `runtime-config.js` contiene solo sitekey/endpoint y opciones públicas.
- Chrome: seis reflows (320/390/768/1440 y 320/390 al 200%), imágenes y consola, éxito/error conservando campos, expiración/error del widget y reset tras cada intento. El chequeo automatizado representa las dimensiones del widget activado para detectar recortes.
- Widget oficial cargado en localhost con clave pública **de pruebas**, token generado y envío interceptado. Formato compacto comprobado a 320/390 px y texto al 200%. [Captura del formulario](formulario-390.png): el aviso rojo pertenece a la clave de pruebas y no aparecerá con la clave real.

## Producción pendiente

Widget real creado en la cuenta Cloudflare de eudila: `0x4AAAAAAFpbyBWDyMPwazeV`, dominios eudila.com/www.eudila.com, Managed y no_clearance. No se recuperó ni imprimió su secret.

Falta acceso administrativo al VPS. El host está identificado en el workflow (`169.58.232.26`); las claves locales probadas no permiten entrar como root. No se aplicaron migraciones ni cambios de configuración a producción. Antes de integrar/desplegar: respaldar/aplicar/registrar migración, configurar secretos del contenedor web, instalar Compose/script CD revisados y las variables públicas de build descritas en `landing/README.md`.

No se verificó un token de producción por el endpoint protegido ni su replay real; esa comprobación, el guardado en la base desplegada y 429 sobre HTTPS quedan pendientes. El canal público sigue en su estado previo hasta completar esos pasos.

No se agregaron emails ni bandeja de administración. Un reintento con token nuevo después de perder una respuesta puede duplicar la consulta.

## Ajuste horizontal solicitado · 28/10/2026

A pedido del usuario se reemplaza el cuadrado compacto por `size: "flexible"`: franja horizontal de 65 px de alto, ancho del formulario y mínimo nativo de 300 px. El grid permite achicar su pista y el contenedor se centra, usando parte del margen a 320 px y con texto al 200%, sin escalar el contenido de Cloudflare ni recortarlo. La cabecera también permite envolver GitHub y «Hablemos»: juntos provocaban un desborde de 366 px al ampliar texto.

El chequeo existente exige ahora 65 px de alto, ancho mínimo y ambos bordes dentro del viewport. Se prueba el widget oficial con clave de pruebas y se conserva el flujo de envío, expiración y renovación. [Formulario horizontal a 390 px](turnstile-horizontal-390.png); el aviso rojo corresponde a la clave de pruebas.
