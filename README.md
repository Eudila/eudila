# eudila

Repositorio nuevo para la app de registro emocional. El historial empieza acá y no incluye los assets institucionales del prototipo anterior. Licencia: AGPL-3.0, ver `LICENSE` y `NOTICE.md`.

## App Next.js

Requisitos: Git y **Node.js 22 (22.13 o superior) o Node.js 24+**, con npm. No hace falta configurar variables de entorno ni levantar una base de datos para ejecutar este scaffold.

```sh
git clone https://github.com/Eudila/eudila.git
cd eudila
npm ci
npm run dev
```

Abrí <http://localhost:3000>. Para detener el servidor, presioná Ctrl+C. La pantalla inicial usa la identidad y los textos del prototipo; el registro y la ayuda todavía se ejecutan en el prototipo independiente. La app Next.js usa App Router, React, TypeScript estricto y Tailwind CSS 4.

Para comprobar el código y generar la versión de producción:

```sh
npm run lint
npm run typecheck
npm run format:check
npm run build
npm run start
```

`npm run start` sirve el build en <http://localhost:3000>; detené primero el servidor de desarrollo para liberar ese puerto. `npm run format` aplica la configuración compartida de Prettier al scaffold. ESLint y Prettier conservan el prototipo independiente; Prettier también deja los documentos de referencia sin modificar.

### Tokens de diseño

`app/globals.css` define los tokens de Tailwind con `@theme static`: paleta de marca, siete estados de ánimo, tipografía, espaciado, anchos, radios y sombra. Los componentes usan utilidades como `bg-surface`, `text-muted`, `text-question`, `max-w-phone` y `rounded-control`, o variables CSS para las muestras. Los valores provisionales siguen el brandbook interno; se revisan juntos en <http://localhost:3000/tokens>.

Cambiar `--color-primary` en ese archivo actualiza la muestra institucional y la variante `--color-action`, usada por enlaces y acciones. El color institucional se reserva para acentos; la variante de acción permite texto blanco legible. Cada estado tiene un token `-ink` con el color de texto adecuado para su acento. El prototipo independiente conserva su propia hoja de estilos.

Para comprobar cobertura de tokens, contraste AA, navegación por teclado, reflujo con texto al 200 % y propagación del color primario:

```sh
uv run --with playwright python app/tokens/tokens.test.py
```

El script inicia y detiene su servidor de desarrollo. Para comprobar un build servido por `npm run start`, indicá `TOKENS_BASE_URL=http://localhost:3000` delante del comando. Usa Chrome en macOS; `CHROME_BIN` permite elegir otro Chromium. En otros sistemas, instalá el navegador con `uv run --with playwright playwright install chromium`. Playwright solo se usa en la comprobación.

### Estructura

| Ruta                                    | Contenido                                                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                        | Layout raíz, idioma `es`, metadata y Figtree local.                                                                   |
| `app/page.tsx`                          | Pantalla inicial de Next.js. Las futuras rutas del registro e historial se agregan dentro de `app/` según App Router. |
| `app/globals.css`                       | Tokens compartidos de marca, estados de ánimo, tipografía y composición.                                              |
| `app/tokens/page.tsx`                   | Galería de todos los tokens en `/tokens`.                                                                             |
| `prototype/`                            | Prototipo independiente y sus comprobaciones. No es una ruta de Next.js.                                              |
| `prototype/fonts/`                      | Figtree y su licencia OFL. El layout reutiliza este archivo sin descargar fuentes durante el build.                   |
| `docs/`                                 | Planes y contenido editorial.                                                                                         |
| `eslint.config.mjs`, `.prettierrc.json` | Configuración compartida de lint y formato.                                                                           |
| `postcss.config.mjs`, `tsconfig.json`   | Tailwind/PostCSS y TypeScript estricto con alias `@/*`.                                                               |
| `package.json`, `package-lock.json`     | Comandos y dependencias reproducibles mediante `npm ci`.                                                              |

`AGENTS.md` y `CLAUDE.md` contienen las indicaciones que genera Next.js para agentes de código; remiten a la documentación de la versión instalada dentro de `node_modules/next/dist/docs/`.

Next.js genera `.next/` y `next-env.d.ts`; no se versionan. No se crean carpetas para componentes o servicios hasta que haya una implementación que las necesite. La landing de ANI-76 se construye aparte de esta app.

## Prototipo de referencia

`prototype/` permite probar el flujo, la identidad visual y la pantalla de ayuda mientras se integra la app definitiva. Para abrirlo, ejecutá `python3 -m http.server 8000` y visitá `http://localhost:8000/prototype/`. No requiere instalar dependencias. La ayuda queda disponible sin conexión después de la primera carga.

El prototipo sigue separado de la app Next.js. El borrador vive en `sessionStorage` y aún no se guarda como registro terminado. El paso de tipo usa provisionalmente las opciones enumeradas en ANI-63 hasta que Noelia las confirme. Falta integrar el esquema y catálogo de ANI-50/ANI-96, y la confirmación y guardado de ANI-66. `prototype/config.js` espera la URL y la clave pública de lectura de la base; no usa categorías del mock viejo. La pantalla de ayuda contiene teléfonos y horarios contrastados con fuentes oficiales; falta incorporar el texto final de ANI-59 cuando Noelia lo entregue.

La identidad sigue el brandbook Eudila v1.0 de uso interno, guardado fuera del repositorio público. Las ocho capturas de `fotos inspiracion/` del checkout original orientan la estructura de una pregunta por pantalla y acciones al pie. Sus ilustraciones y categorías de muestra no se distribuyen acá.

El inicio muestra el orbe Neutral con una entrada de 600 ms una sola vez por sesión de pestaña. Un toque o una tecla la terminan sin consumir la acción; el registro y Ayuda siguen disponibles durante la entrada. Volver o recargar muestra el estado final. Con movimiento reducido, almacenamiento inaccesible o pestaña inicialmente oculta, el orbe aparece estático. Una pestaña nueva independiente permite ver nuevamente la entrada; las pestañas duplicadas o abiertas con un `opener` pueden heredar la marca de sesión y omitirla.

Para comprobar ANI-69 en un navegador real: `uv run --with playwright python prototype/splash.test.py`. El script inicia su propio servidor local y usa Chrome en macOS; `CHROME_BIN` permite indicar otro ejecutable Chromium. En otros sistemas, se puede instalar el navegador de Playwright con `uv run --with playwright playwright install chromium`. Playwright se usa solo en la comprobación, no en la app. El estado del registro se comprueba con `node --test prototype/flow-state.test.mjs`.

## Integración

El [contenido de la landing](docs/content/landing.md) y su [plan de verificación y aprobación](docs/plans/2026-10-01-ani-75-contenido-landing.md) están preparados para ANI-75/ANI-76. El texto distingue el prototipo disponible de las funciones previstas; su aprobación editorial se registra en el plan antes del cierre de ANI-75.

La base Next.js de ANI-48 está en `app/`. Agustín puede portar desde `prototype/app.js` el estado único, las rutas y el selector de emoción, y desde `prototype/ayuda.html` la pantalla de ayuda. La barra global de ANI-61 debe mantener visible el acceso a ayuda en todas las rutas. El repositorio anterior queda donde está; el trabajo nuevo sigue en `Eudila/eudila`.
