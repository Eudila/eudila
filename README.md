# eudila

Repositorio nuevo para la app de registro emocional. El historial empieza acá y no incluye los assets institucionales del prototipo anterior. Licencia: AGPL-3.0, ver `LICENSE` y `NOTICE.md`.

## App Next.js

Requisitos: Git y **Node.js 22 (22.13 o superior) o Node.js 24+**, con npm. No hace falta levantar una base de datos. `.env.example` habilita explícitamente la vista previa del frontend; copiá ese archivo para recorrer todas las pantallas.

```sh
git clone https://github.com/Eudila/eudila.git
cd eudila
npm ci
cp .env.example .env.local
npm run dev
```

Abrí <http://localhost:3000>. Para detener el servidor, presioná Ctrl+C. La app permite completar tipo, ánimo, emoción, factores opcionales y confirmación; consultar Hoy, Calendario, el detalle de cada día, evolución y factores; descargar CSV/JSON e imprimir un informe para guardar como PDF. En vista previa, los registros viven solo en la sesión de esa pestaña. El aviso permanente distingue este modo de una cuenta sincronizada; al abrirlo explica la conservación temporal y la pérdida al cerrar la pestaña. La app Next.js usa App Router, React, TypeScript estricto y Tailwind CSS 4.

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

El layout raíz mantiene la cabecera con **Ayuda ahora** y una barra inferior de tres secciones: **Registrar** (`/`), **Hoy** (`/hoy`) y **Calendario** (`/calendario`). Hoy muestra los registros del día, Calendario permite recorrer meses y abrir cada día. Desde ambas secciones se accede a `/exportar`. Las fechas siguen la zona horaria del navegador. Registrar también se reconoce como sección activa en las rutas `/registro/*`.

El contenido central se desplaza dentro de un shell de ancho teléfono, centrado en desktop. Cabecera y barra reservan su propio espacio, incluyen safe areas y siguen visibles con texto ampliado. Hay enlace de salto al contenido, foco visible y estado activo mediante `aria-current`. Las futuras páginas heredan el layout; deben aportar contenido dentro del `main` compartido.

En `/registro/animo`, el shell usa el ambiente del estado, con tres paradas continuas y controles de navegación de marca; Ayuda, progreso, vista previa y tabs permanecen disponibles. En alturas de hasta 600px, esa pantalla desplaza el lienzo completo para evitar recortar controles al ampliar texto: la cabecera y las tabs quedan dentro del flujo y pueden necesitar desplazamiento. Las otras rutas mantienen su presentación neutra. El [plan de ANI-107/113](docs/plans/2026-10-05-mood-ambient-composition.md) y la [evidencia visual](docs/design/evidence/mood-composition-2026-10-05/README.md) registran decisiones y alcance.

Para verificar ambiente/composición, contraste real de las paradas y del popover, borrador, navegación, teclado, 84 casos de reflujo y movimiento reducido, contra un build de preview servido en el puerto 3118:

```sh
MOOD_BASE_URL=http://127.0.0.1:3118 uv run --with playwright python app/design-mood.test.py
```

`MOOD_ARTIFACT_DIR` permite guardar capturas y mediciones.

El orbe de ánimo tiene cinco capas iluminadas, geometrías propias de los siete estados y núcleo blanco. Forma/color/ambiente/acción cambian juntos en 600ms; respiración de 4s, giro alterno y partículas acompañan el estado. Neutral queda sin partículas. Los ciclos se pausan al ocultar la pestaña y se cancelan al salir; movimiento reducido conserva la escena fija y cambios instantáneos. El historial reutiliza el renderer estático. El slider mantiene range nativo, teclado y ARIA, con espectro, thumb blanco/punto del estado y halo de marca. [Plan](docs/plans/2026-10-05-mood-orb-motion.md) y [evidencia](docs/design/evidence/mood-motion-2026-10-05/README.md).

```sh
node --experimental-strip-types --test app/mood/geometry.test.mjs
MOTION_BASE_URL=http://127.0.0.1:3118 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/motion.test.py
```

Para motores adicionales: `uv run --with playwright playwright install webkit firefox`. El test usa Chrome instalado en macOS o Chromium de Playwright. `MOTION_ARTIFACT_DIR` guarda capturas, grabaciones de la app y mediciones. WebKit automatizado no certifica un dispositivo iOS físico ni la app Safari.

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
| `app/hoy/`, `app/calendario/`           | Resumen diario, calendario mensual y detalle por fecha.                                                               |
| `app/ayuda/page.tsx`                    | Ayuda con teléfonos en HTML y fuentes oficiales.                                                                      |
| `app/registro/`                         | Cinco pasos, catálogos, confirmación y borrador compartido.                                                           |
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

La [verificación del clonado y arranque](docs/techweek/clonado.md) de ANI-78 registra el quickstart comprobado desde un clon nuevo de este equipo, el commit probado y los resultados. Agustín aceptó esta verificación como criterio de cierre y omitió expresamente la prueba humana externa; no se presenta como realizada.

El [texto de Ayuda y su revisión documental](docs/content/ayuda.md) y el [plan de cierre de ANI-67](docs/plans/2026-10-04-ani-67-cierre.md) fijan la versión exacta, fuentes contrastadas el 04/10/2026 y evidencia técnica. Agustín aceptó explícitamente integrar y cerrar con revisión documental asistida por IA, dejando constancia de que no hubo aprobación clínica profesional.

El [catálogo de emociones y factores de vida](docs/content/catalogo-emociones-factores.md) de ANI-96 define las etiquetas, seis sugerencias iniciales, alternativas de respuesta y criterios con fuentes. Los [datos semilla JSON](data/catalogo-v1.json) están listos para ANI-50; la base y sus endpoints siguen pendientes. Comprobaciones: `node --test data/catalogo.test.mjs` y `uv run --with playwright python data/catalogo.browser.test.py`. Esta última simula respuestas REST dentro de la prueba, sin agregar listas al frontend.

El [contenido de la landing](docs/content/landing.md) y su [plan de verificación y aprobación](docs/plans/2026-10-01-ani-75-contenido-landing.md) están preparados para ANI-75/ANI-76. El texto distingue el prototipo disponible de las funciones previstas; su aprobación editorial se registra en el plan antes del cierre de ANI-75.

El [guion del prototipo comercial](docs/content/prototipo-comercial.md) de ANI-79 define seis pantallas para ANI-80, con indicadores, un mapa ficticio, datos simulados consistentes y los límites de lo que puede presentarse. Distingue los pasos que ya funcionan en la app del servicio institucional propuesto; su dashboard todavía es una maqueta por construir.

La base Next.js de ANI-48, el layout de ANI-61 y los primeros pasos de ANI-63 están en `app/`. `/registro/tipo` ofrece Mañana, Tarde, Noche y Registro libre, sin horarios obligatorios. `/registro/animo` usa la escala nativa de siete niveles y anuncia el valor elegido. El borrador se conserva entre rutas y en `sessionStorage`, con aviso si el navegador bloquea ese almacenamiento. Cerrar pide confirmación y descarta; Ayuda y las tabs conservan el borrador. Las opciones y su revisión están documentadas en [el plan de ANI-63](docs/plans/2026-10-02-ani-63-registro.md). `/registro/emocion` integra el selector de ANI-64: sugerencias, lista completa con búsqueda, teclado y conservación del UUID en el borrador. Con `NEXT_PUBLIC_FRONTEND_PREVIEW=false`, se habilita al configurar las variables públicas de catálogo y publicar ANI-50; sin base muestra indisponibilidad y conserva el borrador. La [guía de conexión de ANI-64](docs/content/ani-64-integracion.md) documenta el endpoint y la comprobación pendiente sobre Supabase real. `/registro/factores` permite elegir ninguno, uno o varios factores; `/registro/confirmacion` permite editar las elecciones y guardar en la vista previa. El prototipo y Next.js comparten el estado, su validación y la escala del orbe. `/ayuda` integra el texto v2, la revisión documental aceptada y el funcionamiento offline de ANI-67. El repositorio anterior queda donde está; el trabajo nuevo sigue en `Eudila/eudila`.

### Selector de emoción · ANI-64

Copiá `.env.example` a `.env.local` y completá `NEXT_PUBLIC_CATALOG_URL` (origen del proyecto Supabase) y `NEXT_PUBLIC_CATALOG_ANON_KEY` (clave pública anon JWT) cuando esté lista ANI-50. Las variables públicas se incorporan al build: reiniciá desarrollo o reconstruí producción al cambiarlas. Con `NEXT_PUBLIC_FRONTEND_PREVIEW=false` no se usa el archivo de semillas como catálogo de respaldo. Con el modo de vista previa habilitado explícitamente, las pantallas usan las semillas versionadas de ANI-96.

La [guía de integración](docs/content/ani-64-integracion.md) fija campos, permisos, datos semilla y pruebas sobre la base real. Comprobación previa con respuestas REST interceptadas de ANI-96: `node --test prototype/catalog.test.mjs data/catalogo.test.mjs prototype/flow-state.test.mjs` y `uv run --with playwright python app/registro/emociones.test.py`. La segunda arranca y detiene Next.js automáticamente; no requiere base ni credenciales.

### Frontend completo · vista previa

`NEXT_PUBLIC_FRONTEND_PREVIEW=true` habilita el recorrido sin DB con el catálogo versionado de ANI-96. El historial se guarda en `sessionStorage`, exclusivamente en esta pestaña: no hay autenticación ni sincronización. Un fallo de escritura conserva el borrador y permite reintentar; datos corruptos no se borran ni sobrescriben. Los ejemplos se cargan solo mediante una acción explícita cuando el historial está vacío.

`/exportar` ofrece un informe descriptivo para 7, 30, 90 días o todo el historial. **Imprimir / guardar PDF** abre el diálogo nativo del navegador: elegí guardar como PDF. CSV y JSON incluyen todo el historial de la pestaña, sin aplicar el período del informe. El PDF no formula diagnósticos ni recomendaciones. La integración de cuentas y Supabase sigue en ANI-98; la revisión clínica profesional del texto sigue en ANI-99.

Comprobación del recorrido completo, errores de almacenamiento, navegación, descargas reales, impresión y PDF:

```sh
node --experimental-strip-types --test app/historial/records.test.mjs app/exportar/export.test.mjs
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
uv run --with playwright --with pypdf python app/frontend.test.py
```

El script inicia un servidor de producción en un puerto libre y lo detiene al terminar. Acepta `FRONTEND_BASE_URL` y `CHROME_BIN`. El [plan y evidencia](docs/plans/2026-10-04-frontend-app.md) registra el alcance de ANI-65/66/68/71/72/94/95 y los criterios para Done del frontend.

El CSV contiene una fila por registro y las columnas `id`, `recorded_at` (instante UTC ISO), `fecha_local` (AAAA-MM-DD), `hora_local` (HH:mm:ss), `tipo`, `escala` (1–7), `escala_etiqueta`, `emocion_id`, `emocion`, `factor_ids`, `factores` y `origen`. `factor_ids` y `factores` contienen arrays JSON en el mismo orden; están vacíos (`[]`) cuando no hay factores. `origen` distingue `preview` de `example`. El archivo usa UTF-8 con BOM, coma, comillas dobles y líneas CRLF. Para evitar fórmulas de planilla, se antepone un apóstrofo a valores que empiezan con `=`, `+`, `-` o `@`, incluso tras espacios; para una importación exacta, preferí JSON.

El JSON es un array de registros sin envoltorio, con `id`, `recordedAt`, `type`, `mood`, `emotion: {id, nombre}`, `factors: [{id, nombre}]` y `source`. Conserva las selecciones y sus IDs íntegros. Este formato corresponde al modelo de vista previa, no al esquema pendiente de Supabase. Los nombres de archivo siguen `eudila-vista-previa-historial-AAAA-MM-DD.csv|json|pdf`.

### Evolución y factores · ANI-73 / ANI-74

Desde Hoy y Calendario, **Ver evolución** abre `/evolucion` y **Ver factores de vida** abre `/factores`. Ambas vistas comparten un selector de últimos 7/30/90 días, incluido hoy, y conservan la selección en `?rango=7|30|90` (por defecto 30). La navegación interna, los detalles y el historial del navegador conservan el rango.

El gráfico muestra promedios diarios observados de la escala 1–7. La tabla accesible presenta los mismos valores/conteos y permite abrir cada día. Fechas y horas siguen la zona del navegador; no se incluyen instantes futuros, incluso del mismo día. Un día sin registro no se estima ni se convierte en cero. Los registros originales siguen disponibles.

La regla **provisional de presentación** permite unir puntos solamente con al menos 14 registros distribuidos en 7 fechas distintas dentro del rango. Aun cumpliéndola, solo se unen días consecutivos con registros: los huecos quedan separados. Con menos datos se muestran puntos sin líneas. No es un umbral clínico validado ni una detección de tendencias; su revisión profesional, junto con los textos de análisis, sigue en ANI-99.

Los factores se agrupan por UUID, con una aparición por registro/factor y conteos en cada uno de los siete ánimos. Un registro puede aparecer en varios factores; también se informa cuántos no tienen factores. `/factores/[id]?rango=...` muestra la cronología de ese factor y su gráfico. Los conteos describen las selecciones y no establecen causas ni patrones. Los ejemplos permanecen identificados como ficticios; la fuente real autenticada sigue en ANI-98.

Comprobación de lógica, UI, URL/rangos, fechas, detalle, teclado, texto ampliado y ausencia de envío de registros:

```sh
node --experimental-strip-types --test app/analisis/data.test.mjs
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
uv run --with playwright python app/analisis/browser.test.py
ANALYSIS_PREVIEW=false uv run --with playwright python app/analisis/browser.test.py
```

La comprobación inicia/detiene producción para preview; el último comando inicia desarrollo con preview y catálogo desactivados para verificar la ausencia de análisis de una cuenta ficticia. Acepta `ANALYSIS_BASE_URL`, `ANALYSIS_ARTIFACT_DIR` y `CHROME_BIN`. El [plan y evidencia](docs/plans/2026-10-04-ani-73-74.md) registra los criterios de Done frontend y los pendientes conservados.
