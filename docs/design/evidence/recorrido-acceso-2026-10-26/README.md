# Recorrido principal · 26/10/2026

Decisión del usuario: bienvenida → ingresar/registrarse → registrar la emoción.

Los destinos de ingreso, alta con sesión, confirmación de email y callback OAuth abren `/registro/tipo`. Una sesión existente que entra a ingreso/alta también llega al registro. El inicio ya no consulta la finalización del onboarding para bloquear el acceso. El nombre y la introducción siguen disponibles desde «Personalizar mi cuenta» en Cuenta. No se cambian esquema, políticas ni motor de animación.

El registro conserva sus pasos: momento → ánimo → emoción → factores opcionales → revisión. La confirmación de email sigue siendo necesaria cuando Auth la exige; recuperación continúa en `/actualizar-clave`.

## Verificación

Build de producción con Supabase local, lint, tipos y formato pasan; 37 pruebas Node pasan. `app/auth/browser.test.py` pasa contra el build real, sin interceptar APIs: alta y confirmación en otro contexto, reenvío, ingreso directo al registro, sesión existente en ingreso/alta, acceso al inicio sin personalización, personalización opcional desde Cuenta, una segunda cuenta sin nombre, recuperación/cambio de contraseña, enlaces inválidos, cookies falsas, aislamiento RLS y limpieza de borrador/logout entre pestañas. Se prueban 18 casos de reflujo. Las cuentas sintéticas se eliminan al terminar.

También pasa `app/bienvenida/browser.test.py` contra este build: apertura, salto/Esc, cookie, movimiento reducido, foco, opciones y navegación a los formularios.

Comprobación adicional con cuenta sintética confirmada: bienvenida → ingreso → momento → ánimo → emoción «Calma» → factores sin seleccionar → revisión, sin errores JS. El aviso de guardado en cuenta pendiente está presente. La cuenta se eliminó al terminar.

- [Registro inmediatamente después de ingresar](registro-tras-ingresar.png).
- [Selección de emoción](emocion.png).
- [Revisión del registro](revision.png).

```sh
npm run lint
npm run typecheck
npm run build
AUTH_BASE_URL=http://127.0.0.1:3119 AUTH_ARTIFACT_DIR=/tmp/eudila-recorrido-auth uv run --with playwright python app/auth/browser.test.py
WELCOME_BASE_URL=http://127.0.0.1:3119 uv run --with playwright python app/bienvenida/browser.test.py
node --test
```

Para el build y servidor de prueba se tomaron las variables públicas de `supabase status -o json` solo en el entorno del proceso, con preview desactivado; no se escribió `.env.local` ni se expusieron claves administrativas en el frontend. Solo se usan servicios en loopback.

Límites: Google externo sigue sin credenciales y no se verificó OAuth real. El guardado emocional en cuenta continúa pendiente; la revisión lo informa y conserva el borrador en la pestaña. No se probaron Safari/Firefox ni un celular físico.
