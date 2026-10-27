# eudila

Un espacio para registrar cómo te sentís y consultar tu historial emocional.

El repositorio reúne la app, la landing pública y el espacio previsto para el dashboard del psicólogo. Usa npm workspaces y un único lockfile.

## Estructura

```text
.
├── README.md
├── app/                 App Next.js: registro, historial, análisis y cuenta
│   ├── supabase/        Migraciones, políticas de acceso y datos semilla
│   └── infra/           Docker, nginx y scripts de arranque y despliegue
├── landing/             Sitio público estático y formulario de contacto
├── dashboard/           Documentación del futuro panel del psicólogo
├── packages/
│   ├── domain/          Borrador, registros, análisis, exportación y catálogo
│   ├── mood/            Mascota, estados de ánimo y movimiento
│   └── brand/           Tokens visuales, logos y Figtree
├── docs/                Arquitectura, decisiones, diseño e historia
├── .github/             Integración continua
├── package.json         Comandos comunes y definición de workspaces
└── package-lock.json    Dependencias de todo el repositorio
```

| Área      | Estado                                                                                                            | Documentación                    |
| --------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| App       | Registro, historial, análisis y exportación disponibles en vista previa; autenticación configurable con Supabase. | [App](app/README.md)             |
| Landing   | Sitio estático con formulario de contacto configurable.                                                           | [Landing](landing/README.md)     |
| Dashboard | Pendiente de implementación.                                                                                      | [Dashboard](dashboard/README.md) |

Las aplicaciones consumen `packages/`. Los paquetes compartidos no dependen de las aplicaciones. Las pruebas se mantienen junto al código que verifican. [Detalles de arquitectura](docs/arquitectura/README.md).

## Inicio rápido

Requisitos: Node.js 22.13 o superior de la rama 22, o Node.js 24+, y npm.

```sh
npm ci
cp app/.env.example app/.env.local
npm run dev
```

Abrí <http://127.0.0.1:3000>. El ejemplo habilita la vista previa: los registros se guardan solo en la sesión de la pestaña y no se sincronizan con una cuenta.

Para compilar y servir la app de producción:

```sh
npm run build
npm run start
```

Para compilar y abrir la landing, con Python 3 instalado:

```sh
npm run build:landing
python3 -m http.server 4173 --bind 127.0.0.1 --directory landing/dist
```

Abrí <http://127.0.0.1:4173>.

## Validación

```sh
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npm run build:landing
```

CI ejecuta estas comprobaciones en Node.js 24. Las pruebas de navegador y la configuración de Supabase local se detallan en el [README de la app](app/README.md).

## Configuración

La configuración de la app vive en `app/.env.local`. Los ejemplos públicos se versionan; los archivos `.env`, las claves y los documentos internos `PRODUCT.md` y `DESIGN.md` están ignorados por Git. Los tokens y assets compartidos de marca se mantienen en `packages/brand/`.

## Licencia

[AGPL-3.0-only](LICENSE). Las licencias de recursos de terceros se detallan en [NOTICE.md](NOTICE.md).
