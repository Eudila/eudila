# Contacto de la landing: base, Turnstile y rate limit

**Objetivo:** guardar consultas privadas desde eudila.com en PostgreSQL, con protección contra bots y abuso.

**Decisión:** reutilizar `/api/contact` y alojar el handler en la app Next.js existente. La landing estática llama a `https://app.eudila.com/api/contact` mediante CORS limitado a los hostnames configurados. Así se conserva la IP que Cloudflare entrega al gateway de la app, sin otro servicio ni compartir redes Docker. Un proxy adicional exigiría infraestructura y podría convertir todas las IP en la del proxy; un contador en memoria se perdería al reiniciar.

**Alcance:** handler y adaptador existentes, ruta Next.js pública, formulario y su configuración/build, migración de mensajes y contador, variables privadas del contenedor web, pruebas unitarias/de navegador y documentación operativa/de marca. No se agregan notificaciones ni una bandeja de administración.

1. Agregar migración aditiva: tabla privada de mensajes con RLS y escritura solo del servidor; RPC privada de rate limit atómico (5 intentos / 15 minutos). Guardar HMAC de IP, nunca IP ni token en los mensajes; purgar contadores vencidos.
2. Handler: CORS estricto; límite real de 16 KiB; validar campos y consentimiento; consumir límite antes de Siteverify; comprobar success, hostname y acción `contact`; confirmar inserción antes de responder. Responder 429 con Retry-After; fallar cerrado ante indisponibilidad.
3. Reutilizar handler desde ruta Next.js. Configurar secretos solo en runtime, no en build ni navegador.
4. Agregar widget explícito al formulario, expiración/error y reset tras cada intento; conservar campos ante fallo. El build solo publica endpoint y sitekey; analítica es independiente.
5. Probar validación, permisos/RLS, concurrencia del límite, token inválido/repetido, fallos externos, guardado, ciclo del widget, reflujo y build/lint/tipos. Separar evidencia local de producción.

**Operación:** aplicar migración revisada y respaldada; configurar widget para eudila.com/www.eudila.com y secretos del contenedor; instalar actualización del script CD y variables públicas de la landing. Comprobar envío y repetición del token en HTTPS antes de declarar activación.
