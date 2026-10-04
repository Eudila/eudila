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

Abrí <http://localhost:3000>. Para detener el servidor, presioná Ctrl+C. La pantalla inicial permite empezar el registro en Next.js: tipo, ánimo y entrada al paso de emoción. El selector completo de emoción y los pasos siguientes continúan en el prototipo independiente hasta integrar el catálogo y el guardado. La app Next.js usa App Router, React, TypeScript estricto y Tailwind CSS 4.

Para comprobar el código y generar la versión de producción:

```sh
npm run lint
npm run typecheck
npm run format:check
npm run build
npm run start
```

`npm run start` sirve el build en <http://localhost:3000>; detené primero el servidor de desarrollo para liberar ese puerto. `npm run format` aplica la configuración compartida de Prettier al scaffold. ESLint y Prettier conservan el prototipo independiente; Prettier también deja los documentos de referencia sin modificar.

### Navegación y ayuda

El layout raíz mantiene la cabecera con **Ayuda ahora** y una barra inferior de tres secciones: **Registrar** (`/`), **Hoy** (`/hoy`) y **Calendario** (`/calendario`). Hoy y Calendario son destinos provisionales; el resumen y el calendario real siguen en ANI-68/ANI-71. Registrar también se reconoce como sección activa en las rutas `/registro/*`.

El contenido central se desplaza dentro de un shell de ancho teléfono, centrado en desktop. Cabecera y barra reservan su propio espacio, incluyen safe areas y siguen visibles con texto ampliado. Hay enlace de salto al contenido, foco visible y estado activo mediante `aria-current`. Las futuras páginas heredan el layout; deben aportar contenido dentro del `main` compartido.

`/ayuda` diferencia peligro inmediato (911) de las líneas de orientación y apoyo (135 y los dos 0800). Contiene los teléfonos, coberturas y horarios del prototipo, contrastados nuevamente con las fuentes enlazadas el 04/10/2026. Se abre en un toque, sin sesión ni consulta a la base. El texto v2 y la revisión documental asistida por IA fueron aceptados explícitamente por Agustín para cerrar ANI-67; no hubo aprobación clínica profesional.

En producción, al abrir cualquier página de la app se prepara una copia local de Ayuda, sus estilos y la fuente. Una vez preparada, permite consultar los teléfonos sin internet, incluso sin haber visitado antes `/ayuda`, tras recargar o en otra pestaña. Las llamadas requieren señal telefónica. La preparación inicial necesita conexión, HTTPS (o localhost) y un navegador que permita Service Worker, Cache Storage y Web Locks; puede perderse si el navegador borra el almacenamiento. Sin esas capacidades, Ayuda sigue disponible online. El servidor de desarrollo no instala esta copia.

La copia se actualiza al volver a abrir la app con conexión; una falla conserva la versión anterior. Solo se guardan la página pública de Ayuda y sus recursos de presentación: no se cachean registros, borradores, APIs ni respuestas RSC. Next.js conserva su navegación online; cuando falla la solicitud de Ayuda, el navegador abre el HTML local con enlaces telefónicos que funcionan sin JavaScript. El [plan de cierre de ANI-67](docs/plans/2026-10-04-ani-67-cierre.md) registra requisitos, verificación y el alcance de revisión aceptado.

Para comprobar la preparación, acceso global, enlaces telefónicos, recarga y nueva pestaña offline, estilos, teclado, texto al 200 %, renovación concurrente de la copia, cachés ajenas, fallback cuando el navegador impide el worker y conservación del borrador ante una red lenta con Storage bloqueado:

```sh
npm run build
uv run --with playwright python app/ayuda/ayuda.test.py
```

La comprobación inicia y detiene su servidor de producción en un puerto libre. `HELP_BASE_URL=http://localhost:3000` permite usar un build servido previamente con `npm run start`. Usa Chrome en macOS y acepta `CHROME_BIN`, como la comprobación de tokens descrita abajo.

### Tokens de diseño

`app/globals.css` define los tokens de Tailwind con `@theme static`: paleta de marca, siete estados de ánimo, tipografía, espaciado, anchos, radios y sombra. Los componentes usan utilidades como `bg-surface`, `text-muted`, `text-question`, `max-w-phone` y `rounded-control`, o variables CSS para las muestras. Los valores provisionales siguen el brandbook interno; se revisan juntos en <http://localhost:3000/tokens>.

Cambiar `--color-primary` en ese archivo actualiza la muestra institucional y la variante `--color-action`, usada por enlaces y acciones. El color institucional se reserva para acentos; la variante de acción permite texto blanco legible. Cada estado tiene un token `-ink` con el color de texto adecuado para su acento. El prototipo independiente conserva su propia hoja de estilos.

Para comprobar cobertura de tokens, contraste AA, propagación del color primario, navegación con mouse/teclado, historial del navegador, ayuda en todas las rutas, reflujo con texto al 200 % y los pasos de tipo/ánimo (selección, anuncios accesibles, recarga y descarte):

```sh
uv run --with playwright python app/tokens/tokens.test.py
```

El script inicia y detiene su servidor de desarrollo. Para comprobar un build servido por `npm run start`, indicá `TOKENS_BASE_URL=http://localhost:3000` delante del comando. Usa Chrome en macOS; `CHROME_BIN` permite elegir otro Chromium. En otros sistemas, instalá el navegador con `uv run --with playwright playwright install chromium`. Playwright solo se usa en la comprobación.

### Estructura

| Ruta                                    | Contenido                                                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                        | Shell raíz con cabecera, ayuda persistente, contenido y navegación; idioma, metadata y Figtree local.                 |
| `app/navigation.tsx`                    | Tres secciones y estado activo a partir de la ruta.                                                                   |
| `app/hoy/`, `app/calendario/`           | Destinos provisionales del resumen y calendario.                                                                      |
| `app/ayuda/page.tsx`                    | Ayuda con teléfonos en HTML y fuentes oficiales.                                                                      |
| `app/registro/`                         | Pasos de tipo y ánimo, entrada a emoción y proveedor del borrador compartido.                                         |
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

El prototipo sigue separado de la app Next.js. El borrador vive en `sessionStorage` y aún no se guarda como registro terminado. El paso de tipo comparte las opciones de ANI-63, documentadas y revisadas contra el ticket en su plan de implementación. Falta integrar el esquema y cargar en la base el catálogo de ANI-50, definido en ANI-96, y la confirmación y guardado de ANI-66. `prototype/config.js` espera la URL y la clave pública de lectura de la base; no usa categorías del mock viejo. La pantalla de ayuda del prototipo conserva su contenido factual de referencia. La app Next.js entrega el texto v2 y el acceso offline de ANI-67 documentados abajo.

La identidad sigue el brandbook Eudila v1.0 de uso interno, guardado fuera del repositorio público. Las ocho capturas de `fotos inspiracion/` del checkout original orientan la estructura de una pregunta por pantalla y acciones al pie. Sus ilustraciones y categorías de muestra no se distribuyen acá.

El inicio muestra el orbe Neutral con una entrada de 600 ms una sola vez por sesión de pestaña. Un toque o una tecla la terminan sin consumir la acción; el registro y Ayuda siguen disponibles durante la entrada. Volver o recargar muestra el estado final. Con movimiento reducido, almacenamiento inaccesible o pestaña inicialmente oculta, el orbe aparece estático. Una pestaña nueva independiente permite ver nuevamente la entrada; las pestañas duplicadas o abiertas con un `opener` pueden heredar la marca de sesión y omitirla.

Para comprobar ANI-69 en un navegador real: `uv run --with playwright python prototype/splash.test.py`. El script inicia su propio servidor local y usa Chrome en macOS; `CHROME_BIN` permite indicar otro ejecutable Chromium. En otros sistemas, se puede instalar el navegador de Playwright con `uv run --with playwright playwright install chromium`. Playwright se usa solo en la comprobación, no en la app. La comprobación del splash también arranca el prototipo sin red y verifica la escala y Ayuda. El estado del registro se comprueba con `node --test prototype/flow-state.test.mjs`.

## Integración

El [texto de Ayuda y su revisión documental](docs/content/ayuda.md) y el [plan de cierre de ANI-67](docs/plans/2026-10-04-ani-67-cierre.md) fijan la versión exacta, fuentes contrastadas el 04/10/2026 y evidencia técnica. Agustín aceptó explícitamente integrar y cerrar con revisión documental asistida por IA, dejando constancia de que no hubo aprobación clínica profesional.

El [catálogo de emociones y factores de vida](docs/content/catalogo-emociones-factores.md) de ANI-96 define las etiquetas, seis sugerencias iniciales, alternativas de respuesta y criterios con fuentes. Los [datos semilla JSON](data/catalogo-v1.json) están listos para ANI-50; la base y sus endpoints siguen pendientes. Comprobaciones: `node --test data/catalogo.test.mjs` y `uv run --with playwright python data/catalogo.browser.test.py`. Esta última simula respuestas REST dentro de la prueba, sin agregar listas al frontend.

El [contenido de la landing](docs/content/landing.md) y su [plan de verificación y aprobación](docs/plans/2026-10-01-ani-75-contenido-landing.md) están preparados para ANI-75/ANI-76. El texto distingue el prototipo disponible de las funciones previstas; su aprobación editorial se registra en el plan antes del cierre de ANI-75.

El [guion del prototipo comercial](docs/content/prototipo-comercial.md) de ANI-79 define seis pantallas para ANI-80, con indicadores, un mapa ficticio, datos simulados consistentes y los límites de lo que puede presentarse. Distingue los pasos que ya funcionan en la app del servicio institucional propuesto; su dashboard todavía es una maqueta por construir.

La base Next.js de ANI-48, el layout de ANI-61 y los primeros pasos de ANI-63 están en `app/`. `/registro/tipo` ofrece Mañana, Tarde, Noche y Registro libre, sin horarios obligatorios. `/registro/animo` usa la escala nativa de siete niveles y anuncia el valor elegido. El borrador se conserva entre rutas y en `sessionStorage`, con aviso si el navegador bloquea ese almacenamiento. Cerrar pide confirmación y descarta; Ayuda y las tabs conservan el borrador. Las opciones y su revisión están documentadas en [el plan de ANI-63](docs/plans/2026-10-02-ani-63-registro.md). `/registro/emocion` muestra el catálogo pendiente de cargar en la base: ANI-64 integra su selector cuando ANI-50 publique las filas definidas en ANI-96. El prototipo y Next.js comparten el estado, su validación y la escala del orbe. `/ayuda` integra el texto v2, la revisión documental aceptada y el funcionamiento offline de ANI-67. El repositorio anterior queda donde está; el trabajo nuevo sigue en `Eudila/eudila`.
