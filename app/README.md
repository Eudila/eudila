# App de eudila

Aplicación Next.js para registrar momento, ánimo, emoción y factores opcionales; consultar Hoy, Calendario, evolución y factores; exportar CSV/JSON e imprimir un informe para guardar como PDF.

## Estructura

```text
app/
├── app/                 Convención App Router de Next.js
│   ├── (paciente)/      Registro, historial, análisis, exportación y cuenta
│   ├── (auth)/          Bienvenida, acceso, recuperación y personalización
│   ├── auth/            Clientes y manejo de sesión
│   ├── ayuda/           Ayuda pública con soporte offline
│   ├── tokens/          Galería del sistema visual
│   ├── layout.tsx       Cabecera y navegación
│   └── globals.css      Composición e importación de tokens compartidos
├── supabase/            Base local, migraciones, RLS y plantillas
├── infra/               Docker, nginx y scripts de herramientas
├── lib/                 Lectura HTTP del catálogo
├── public/              Recursos públicos y Service Worker de Ayuda
├── proxy.ts             Validación de sesión y protección de rutas
├── next.config.mjs
└── .env.example
```

Los grupos de rutas no forman parte de las URL: el registro sigue en `/registro/tipo`, el historial en `/hoy` y `/calendario`, y el callback en `/auth/callback`. El directorio interior `app/` sigue la convención de Next.js.

## Vista previa

Desde la raíz del repositorio:

```sh
npm ci
cp app/.env.example app/.env.local
npm run dev
```

Abrí <http://127.0.0.1:3000>. La vista previa usa el catálogo versionado y guarda los registros en `sessionStorage`. Cerrar la pestaña pierde ese historial. Los ejemplos ficticios se cargan mediante una acción explícita.

## Autenticación local

Con Docker activo, desde la raíz:

```sh
npm run supabase:start
npm run dev
```

La CLI usa `app/` como directorio de trabajo; las credenciales de proveedores se configuran en `app/.env`. El script conserva la instancia local y actualiza la configuración pública en `app/.env.local`. Desactiva la vista previa y habilita Auth y catálogo locales. El buzón de prueba está en <http://127.0.0.1:54324> y Supabase Studio en <http://127.0.0.1:54323>. Los correos locales no se envían a destinatarios externos.

Si moviste el repositorio o su carpeta `supabase/`, ejecutá `npm run supabase:stop` y después `npm run supabase:start` para recrear los montajes de Docker desde la ubicación nueva. La detención normal conserva los datos; evitá `--no-backup` y `db reset` si querés mantenerlos.

Las cuentas, preferencias y registros emocionales se guardan en PostgreSQL con RLS por usuario. La confirmación guarda el registro y sus factores en una transacción; conserva el borrador y el UUID del intento ante errores. Hoy, Calendario, análisis y exportaciones recuperan el historial de esa cuenta al abrir o recargar, también en otro navegador. El preview permanece separado. Requiere la migración `app/supabase/migrations/20261027031110_registros_cuenta.sql`. `npm run supabase:stop` detiene los servicios y conserva sus datos.

Google requiere configurar un cliente OAuth propio, el proveedor de Supabase y `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`. Sin esas credenciales permanece deshabilitado. Nunca colocar secretos en variables `NEXT_PUBLIC_`.

## Verificación

Desde la raíz, con el build servido en el puerto 3000:

```sh
FRONTEND_BASE_URL=http://127.0.0.1:3000 uv run --with playwright --with pypdf python app/app/frontend.test.py
HELP_BASE_URL=http://127.0.0.1:3000 uv run --with playwright python app/app/ayuda/ayuda.test.py
ANALYSIS_BASE_URL=http://127.0.0.1:3000 uv run --with playwright python 'app/app/(paciente)/analisis/browser.test.py'
```

Requieren `uv` y Chrome o Chromium instalado para Playwright. Con Supabase local activo y un build de producción servido en el puerto 3000, `npm run test:auth` verifica las cuentas sintéticas, confirmación, recuperación y aislamiento de datos. Solo opera sobre localhost.

Para comprobar guardado, RLS entre dos cuentas, reintentos tras una respuesta perdida y exportación de más de 1000 registros, contra Supabase local y el build sin preview:

```sh
AUTH_BASE_URL=http://127.0.0.1:3000 uv run --with playwright python 'app/app/(paciente)/historial/account.test.py'
```

## Publicación automática

Un CI exitoso de `main` dispara `Deploy` hacia <https://app.eudila.com>. Compila una release en el VPS, prueba la imagen y recrea solo `web`; ante un error de activación restaura la versión anterior. Las migraciones pendientes frenan el despliegue y deben aplicarse antes, con revisión y respaldo. [Operación y rollback](../docs/ops/vps-eudila.md).

[Arquitectura](../docs/arquitectura/README.md) · [Despliegue](infra/app/README.md) · [Marca y mascota](../docs/design/mascota/README.md).
