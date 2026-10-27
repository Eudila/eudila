# Entrada antes del acceso · 26/10/2026

Pedido: después de la animación, mostrar solo Google, Ingresar y Registrarse; pedir datos después de elegir.

Se reutiliza `/bienvenida`, la apertura de `app/empezar/intro.tsx` y su cookie de sesión `eudila-intro`. La apertura se retira de `/empezar`; Google se traslada desde los formularios a `app/bienvenida/welcome.tsx`, manteniendo callback, PKCE, espera, bloqueo de solicitudes repetidas y manejo de errores. Los formularios conservan sus campos, validación y recuperación.

[Captura de la entrada en Next.js de producción, 390 × 844](bienvenida-390.png). Lisa, logo estático, Ayuda y acciones coral conservan sus tokens. Después de la apertura no aparecen campos ni texto promocional; el título y la descripción de Google deshabilitado son accesibles, ocultos visualmente. Google sigue sin configurar en este entorno.

## Comprobaciones

- Build de producción, lint, tipos y formato pasan. 37 pruebas Node pasan.
- `app/bienvenida/browser.test.py` pasa en desarrollo y producción: apertura completa, salto con botón/Esc, foco al terminar, persistencia de la cookie sin repetición al recargar y omisión con movimiento reducido. Opciones `inert` durante la apertura.
- Tres opciones alineadas sin campos; navegar a Ingresar o Registrarse muestra email y contraseña. Volver al inicio devuelve a las opciones.
- Sin desborde horizontal a 320/390/1440 px con texto al 100/200 %; cápsulas de al menos 50 px. Sin errores de JavaScript.
- La regresión de acciones pasa: siete pares AA, hover/focus/active/disabled, teclado, loading y 54 casos de reflujo. La medición espera a que termine la revelación de las opciones después de saltar la apertura.

```sh
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
npm run start -- --hostname 127.0.0.1 --port 3126
WELCOME_BASE_URL=http://127.0.0.1:3126 WELCOME_ARTIFACT_DIR=docs/design/evidence/entrada-acceso-2026-10-26 uv run --with playwright python app/bienvenida/browser.test.py
ACTIONS_BASE_URL=http://127.0.0.1:3126 uv run --with playwright --with pillow python app/design-actions.test.py
npm run lint
npm run typecheck
node --test
```

Se actualizó la prueba existente de autenticación para elegir Registrarse desde bienvenida. No se ejecutó el flujo completo con email/cuenta real ni OAuth externo; no se probaron Safari/Firefox o hardware móvil. La coreografía no cambia y no se repitió su medición de rendimiento. El entorno no contiene credenciales de Google.
