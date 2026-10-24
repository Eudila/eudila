# Onboarding y auth · 19/10/2026

Implementación en la copia local de `eudila/ladyfish`, sobre las rutas Next.js reales. Supabase CLI 2.121.0 en Docker, PostgreSQL 17, Auth y Mailpit. Ninguna API de auth, perfil o catálogo está interceptada en la prueba principal. Las cuentas de prueba se eliminan al terminar; los emails de las capturas son sintéticos.

## Resultado comprobado

- Bienvenida → alta con email y contraseña → confirmación en otro contexto de navegador → nombre opcional → introducción → inicio. Cuenta con nombre/email reales y finalización persistida en PostgreSQL.
- Reenvío, contraseña incorrecta, confirmación obligatoria, login posterior sin repetir onboarding, recarga, logout y limpieza del borrador. Un borrador anónimo anterior a Auth se conserva al abrir la app; la limpieza ocurre al cambiar de identidad. Otra pestaña con Cuenta abierta también vuelve a bienvenida al salir.
- Recuperación por correo, confirmación de nueva contraseña, contraseña anterior rechazada y nueva aceptada. Enlaces usados, código inválido y token inválido muestran reintento, sin redirecciones externas.
- Cookies corruptas no habilitan cuenta. Cuenta usa `Cache-Control: private, no-store`. Ayuda queda pública.
- RLS: otra cuenta no puede leer, insertar ni modificar el perfil ajeno; anónimo tampoco puede leer perfiles. El constraint rechaza nombre de más de 60 caracteres. El catálogo público devuelve 21 emociones y 15 factores.
- Nombre opcional omitido: onboarding se completa sin heredar el nombre de otra cuenta.
- Foco en campos inválidos, control de mostrar contraseña, Ayuda visible y ausencia de overflow horizontal a 320/390/520 px con texto al 200% en seis rutas (18 casos). Chrome con reduced motion; bienvenida usa orbe estático.

## Comandos ejecutados

```sh
npm run supabase:start
npm run dev -- --hostname 127.0.0.1
npm run test:auth
npm run build
npm run start -- --hostname 127.0.0.1 --port 3119
AUTH_BASE_URL=http://127.0.0.1:3119 AUTH_ARTIFACT_DIR=/tmp/eudila-auth-production npm run test:auth
npm run lint
npm run typecheck
npm run format:check
node --test
```

Build, lint, tipos y formato: exit 0. También se verificó el build de CI con preview=true y variables de Auth vacías. 31 pruebas Node: 31 pasan. Auth real: exit 0 en desarrollo y producción; la comprobación ampliada de cookies falsas y logout entre pestañas se ejecutó en producción.

Regresión adicional con un servidor de desarrollo en 3000 y variables `NEXT_PUBLIC_FRONTEND_PREVIEW=true`, `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`:

```sh
FRONTEND_BASE_URL=http://127.0.0.1:3000 uv run --with playwright --with pypdf python app/frontend.test.py
ACTIONS_BASE_URL=http://127.0.0.1:3000 uv run --with playwright --with pillow python app/design-actions.test.py
```

Ambas pasan: registro/edición/guardado/reintento, calendario, CSV/JSON/PDF, corrupción y reflujo; siete pares de acción AA, estados, teclado, loading y 54 combinaciones de reflujo. El control disabled de auth ahora se comprueba en Google sin configurar: logout ya requiere una cuenta real.

## Capturas de producción

- [Bienvenida 390 px](bienvenida.png).
- [Ingreso 390 px](ingresar.png).
- [Crear cuenta en desktop](crear-cuenta-desktop.png).
- [Confirmación de email](confirmacion.png).
- [Introducción del onboarding](onboarding.png).
- [Cuenta real de prueba](cuenta.png).
- [Recuperación, 320 px y texto 200%](recuperar-320-200.png).

Comparación con DESIGN.md: Nube/Grafito, pregunta Figtree, logo y Neutral compartidos, cápsulas action AA y ausencia de ambiente emocional en auth. Se reutiliza el renderer estático en bienvenida, sin prometer resolver VIS-09 ni agregar la animación de entrada histórica. No se cierran brechas globales por esta entrega.

## Correcciones detectadas por la prueba

1. Reenvío inmediato recibe HTTP 429 por la frecuencia mínima del servidor; UI muestra aviso recuperable. La prueba espera el intervalo local de 2 s antes de reenviar.
2. Next.js normaliza el origen de `request.url` a localhost dentro del callback de desarrollo, aun entrando por 127.0.0.1. Redirigir con esa URL dejaba la cookie en otro origen. El callback ahora responde con un destino relativo fijo, conservando host/puerto del navegador y sin aceptar `next` arbitrario. Validado en desarrollo y producción, incluida confirmación en otro navegador.

## Límites

Google OAuth está implementado con PKCE pero deshabilitado hasta configurar un Client ID y secret propios. No hubo login real con Google. No se desplegó Cloud ni se verificó envío SMTP externo. No se certifica Safari/Firefox ni hardware móvil en esta entrega. La persistencia de registros emocionales sigue pendiente y está explicitada en onboarding/cuenta; solo cuenta y perfil tienen persistencia real.

`npm audit` detectó cinco avisos high en la cadena de herramientas de desarrollo existente (`eslint-config-next` → fast-glob/micromatch/braces); no afectan a los SDK agregados. El comando propone un downgrade mayor de Next ESLint y no se aplicó dentro de este alcance.
