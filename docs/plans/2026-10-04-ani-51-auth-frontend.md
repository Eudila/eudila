# ANI-51 · Frontend de autenticación

**Goal:** implementar las pantallas de ingreso, alta y cuenta con email y contraseña, siguiendo el brandbook.

**Architecture:** formularios React locales sin backend, solicitudes de autenticación, almacenamiento de credenciales ni sesión ficticia. Ayuda sigue pública. Las rutas actuales del prototipo siguen disponibles; no se agrega protección de rutas de cliente como sustituto de autenticación.

**Tech Stack:** Next.js 16, React 19, TypeScript y tokens Tailwind existentes.

## Alcance confirmado

El usuario confirmó el 04/10/2026: «solo email y contraseña nada de backend todo front». Se omiten magic link, recuperación de acceso, Supabase, cookies, middleware y persistencia de identidad. ANI-51 completo sigue pendiente de integración real; esta entrega cubre frontend y no modifica el issue.

## Marca y experiencia

Brandbook interno `docs/brand/Eudila-Brandbook.pdf` como referencia, sin copiarlo al repo publicable. Fondo nube, grafito, turquesa de acción con contraste AA, wordmark en minúsculas, Figtree en títulos y sistema en controles. Voseo, sin colores emocionales ni animaciones decorativas. Impeccable instalado localmente mediante `npx impeccable install --yes --providers=codex --project --no-hooks`; `.agents/` excluido de Git, lint y formato porque contiene tooling de terceros.

## Implementación

1. `app/auth/auth-form.tsx` y `auth.css`: ingreso y alta compartidos con email/contraseña, etiquetas, autocomplete, mostrar/ocultar, validación nativa del email, campos requeridos y foco al primer error. Sin política de longitud inventada: se definirá al integrar Auth.
2. `app/ingresar/page.tsx`, `app/crear-cuenta/page.tsx`: rutas enlazadas, mensaje permanente de disponibilidad y resultado anunciado. El envío válido limpia la contraseña y explica que no se inició sesión ni creó cuenta. No enviar ni persistir credenciales.
3. `app/cuenta/page.tsx`: ausencia de sesión, cierre deshabilitado y acceso a ingreso. No simular una operación de cierre exitosa.
4. `app/page.tsx`: entrada «Ingresar o crear cuenta». `app/navigation.tsx`: ocultar pestañas en las tres pantallas de cuenta, conservando servicio de Ayuda y navegación existente en el resto.
5. `app/auth/browser.test.py`: validación, foco, mostrar/ocultar, navegación, mensajes, ausencia de POST, cierre deshabilitado y reflujo móvil/escritorio al 200%.

## Integración futura

Sustituir el resultado de indisponibilidad de `submit` por un adaptador real, con estados de envío, errores y éxito según el contrato de Auth acordado. Agregar sesión verificada y cierre real antes de habilitar el botón de cuenta. Los registros de vista previa no acreditan persistencia autenticada. No cerrar ANI-51 hasta verificar sus criterios con Supabase y registros reales.

## Evidencia de entrega

- Test de navegador escrito antes de implementar: falló por ausencia de `/ingresar`; después pasa en desarrollo y producción.
- Chrome: validación y foco, mostrar/ocultar, email conservado/contraseña limpia tras enviar, navegación ingreso/alta, cierre deshabilitado, cero solicitudes POST y reflujo de las tres rutas a 320/390/520/1280 px con texto al 200%: pasan.
- Capturas móvil/escritorio inspeccionadas. La inspección independiente de escritorio en producción confirma un solo encabezado y altura del documento de 900 px para viewport de 900 px.
- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` y `git diff --check`: pasan.
- No se implementó ni probó autenticación real; ANI-51 conserva pendientes sus criterios de integración.
