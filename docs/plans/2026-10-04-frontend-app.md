# Frontend de eudila · registro, historial y exportación

**Objetivo:** completar ANI-65, ANI-66, ANI-68, ANI-71, ANI-72, ANI-94 y ANI-95 de principio a fin en el alcance de frontend autorizado, asignadas a Agustín y cerradas con evidencia.

**Arquitectura:** mantener Next.js/React/Tailwind y la identidad existente. Agregar un modo explícito de vista previa (`NEXT_PUBLIC_FRONTEND_PREVIEW=true`) que usa el catálogo editorial de ANI-96 y conserva registros únicamente en sessionStorage de la pestaña. El mismo modelo de vista alimenta registro, Hoy, calendario, detalle y exportación; no se inventan endpoints de historial ni se presenta el almacenamiento local como Supabase. Fuera de este modo, el catálogo REST existente permanece y el guardado no se habilita hasta la integración real.

**Base:** rama `frontend-app`, desde `1157ec9` (ANI-64, PR #6). Se conserva la implementación de selector ya revisada.

**Alcance en Linear:** ANI-98 conserva guardado/lectura autenticados, RLS, paginación y comparación de exportaciones con Supabase. ANI-99 conserva revisión clínica documentada de calendario/informe antes del lanzamiento público. Los siete issues originales se cierran exclusivamente por sus entregables de frontend; la especificación anterior permanece como referencia.

## Decisiones de experiencia

- Una pregunta por paso; factores opcionales (cero/uno/varios), confirmación con enlaces para corregir y guardado de la vista previa que lleva a Hoy. El borrador no se descarta si falla el almacenamiento.
- Mostrar «Vista previa» y su conservación solo en esta pestaña de manera persistente. Los ejemplos se cargan únicamente por una acción explícita en una vista vacía, identificados como ficticios, y no sustituyen registros existentes.
- Usar semillas aprobadas solo cuando el modo de vista previa esté activado. Nunca hacer fallback silencioso desde una falla REST.
- Calendario con lunes como primer día, fecha local, meses hasta el actual, ánimo promedio redondeado en la escala existente y número/etiqueta además de color. Días sin registro diferenciados sin juicios. Detalle con anterior/siguiente y regreso al mes correcto.
- Exportaciones reales de la vista previa: JSON completo y CSV UTF-8 descargados con Blob; informe HTML imprimible mediante el diálogo nativo «Imprimir / guardar PDF». No enviar registros al servidor para generar archivos.
- Períodos del informe: últimos 7, 30, 90 días y todo, con límites inclusivos por fecha local. Solo cronología y conteos; alternativas de ANI-96 separadas de emociones específicas, sin interpretaciones. Pie que explica la vista previa y alcance descriptivo.
- No incorporar gamificación, tendencias, gráficos (ANI-73) ni análisis de ánimo por factor (ANI-74). El informe de ANI-94 incluye únicamente conteos descriptivos de factores en esta entrega.

## Contrato interno del frontend

En `app/historial/records.ts`:

```ts
type CatalogItem = { id: string; nombre: string };
type RecordEntry = {
  id: string;
  recordedAt: string; // instante ISO; agrupación y presentación por fecha local
  type: string; // opciones existentes de flow-state
  mood: number; // entero 1..7
  emotion: CatalogItem;
  factors: CatalogItem[];
  source: "preview" | "example";
};
```

Helpers públicos acordados: `localDayKey(Date | string): string`, `parseDayKey(string): Date | null` (fecha local al mediodía), `entriesForDay(RecordEntry[], string): RecordEntry[]` (cronología ascendente), `averageMood(RecordEntry[]): number | null`, `restoreRecords(string | null): RecordEntry[]` (error ante datos inválidos, nunca filtrar silenciosamente), `createExamples(now?: Date): RecordEntry[]`. Exportar también los tipos `CatalogItem`, `RecordEntry` y `Draft` (type/mood/emotionId/factors).

En `app/historial/state.tsx`: `HistoryProvider`, `useHistory()` con `{ records, ready, problem, preview, saveRecord(entry): void, loadExamples(): void, retry(): void }`. `saveRecord` conserva ID y rechaza la operación sin alterar estado si sessionStorage falla; permite que el componente conserve el borrador y reintente. Impedir sobreescritura si falló la restauración. Semillas en `app/frontend-preview.ts`: `previewEnabled`, `previewEmotions`, `previewFactors`. Ninguno de estos objetos equivale al esquema de DB.

## Bloque 1 · Flujo y datos comunes (ANI-65 / ANI-66)

Archivos: `app/frontend-preview.ts`, `app/historial/records.ts`, `app/historial/records.test.mjs`, `app/historial/state.tsx`, `app/layout.tsx`, `app/registro/{registro,emociones,factores,confirmacion}.tsx`, `app/registro/[paso]/page.tsx`, `prototype/flow-state.js`, `.env.example`.

1. Definir/validar el modelo común y fechas locales; comprobar resta de días, calendarios y corrupción.
2. Implementar proveedor de vista previa con restauración segura, guardado y carga explícita de ejemplos.
3. Habilitar el catálogo de vista previa en selector y factores sin alterar lectura REST con preview desactivado.
4. Completar factores, confirmación, edición, carga/error/reintento y navegación a Hoy. Reintento sin duplicación; borrar el borrador solamente tras guardado exitoso.
5. Mantener la entrada a Ayuda disponible y la navegación existente; completar los cinco pasos.

## Bloque 2 · Hoy, calendario y detalle (ANI-68 / ANI-71 / ANI-72)

Archivos propios: `app/historial/views.tsx`, `app/hoy/page.tsx`, `app/calendario/page.tsx`, `app/calendario/[fecha]/page.tsx`.

1. Construir Hoy con lista cronológica, resumen del día, vacío y acceso a registrar/exportar.
2. Construir calendario mensual accesible, navegación limitada y números/etiquetas además de color.
3. Construir detalle de día con todos sus registros, vacío, anterior/siguiente y leyenda descriptiva de escala; regreso al mes del día visitado.
4. Consumir exclusivamente el proveedor acordado; mostrar carga/problema/ausencia de fuente sin inventar datos sincronizados.

## Bloque 3 · Exportaciones (ANI-94 / ANI-95)

Archivos propios: `app/exportar/page.tsx`, `app/exportar/exportar.tsx`, `app/exportar/export.ts`, `app/exportar/export.test.mjs`, `app/exportar/report.tsx`.

1. Implementar períodos y agregación deterministas por día local, denominadores y alternativas explícitas.
2. Construir descarga CSV con escape, acentos, comillas y neutralización de fórmulas; JSON completo sin pérdida de campos.
3. Construir informe imprimible con período, generación, cantidad/días, cronología, conteos, distribución, días sin registro y pie. Imprimir/guardar PDF mediante navegador; estilos para A4/grises y paginación sin recortar texto.
4. Implementar pantalla accesible de período/formato, vacío/error y aviso de archivos personales; sin requests de registros al exportar.

## Bloque 4 · Revisión, comprobaciones y Done

1. Revisión de cumplimiento de cada bloque y revisión de calidad del conjunto, resolviendo fallos antes de cerrar.
2. Node: estado existente, semillas/lector, modelo temporal y exportaciones. Checks: lint, typecheck, formato y build.
3. Chrome sobre build de producción con preview: flujo completo, cero/múltiples factores, editar, guardar, recargar, Hoy/calendario/detalle, ejemplos, períodos y descargas CSV/JSON; impresión PDF inspeccionada con extracción de texto. Vacío, falla de storage/reintento, datos corruptos, días locales, cambio de mes, teclado, móvil 320/390/520 y texto al 200%.
4. Regresión del selector con preview desactivado, catálogo del prototipo, splash y Ayuda offline.
5. Publicar el plan/evidencia, abrir PR revisable e integrar el cambio verificado; registrar cierre frontend de los siete issues como Done con enlace y pendientes ANI-98/ANI-99. Actualizar checkout local para poder continuar en la app.

## Registro de ejecución

- Las siete tareas fueron asignadas a Agustín Pedernera.
- ANI-98 y ANI-99 creados para conservar los pendientes reales sin cerrarlos como realizados.
- Implementados los tres bloques; el frontend comparte un solo proveedor de historial y el borrador conserva las elecciones al editar o fallar.
- Revisión técnica de especificación y calidad completada. Se corrigieron dos hallazgos: compartir el quinto paso rompía el prototipo de cuatro pasos (ahora `steps` y `nextSteps` están separados), y faltaba el atributo que oculta el banner de vista previa al imprimir.
- Node: 17 comprobaciones pasan (`node --experimental-strip-types --test app/historial/records.test.mjs app/exportar/export.test.mjs prototype/catalog.test.mjs data/catalogo.test.mjs prototype/flow-state.test.mjs`). Incluyen UUID, integridad/corrupción, bisiestos/DST/medianoche, intervalos inclusivos, CSV con fórmulas y JSON íntegro.
- `npm run lint`, `npm run typecheck`, `npm run format:check`, `git diff --check` y build de producción con `NEXT_PUBLIC_FRONTEND_PREVIEW=true`: pasan en Node 26.8.1.
- Chrome en producción (`uv run --with playwright --with pypdf python app/frontend.test.py`): registro con cero/múltiples factores, edición, escritura fallida conservando borrador, reintento con mismo ID sin duplicado, recarga, Hoy/calendario/detalle, límites de meses y fechas inválidas/futuras, ejemplos explícitos, períodos, descargas reales CSV/JSON, corrupción preservada y reflujo 320/390/520 al 100/200%: pasan.
- PDF generado e inspeccionado: caso de 60 registros produce 14 páginas A4 en Chrome; extracción comprueba los 60 registros y el pie completo, sin cabecera/navegación de la app. Primera y última página inspeccionadas visualmente en grises. La impresión usa el diálogo nativo; guardar el archivo PDF es una acción del usuario en ese diálogo.
- Regresiones: lector REST y selector Next con preview desactivado, catálogo del prototipo, splash, Ayuda offline y tokens/layout/primeros pasos: pasan. El test antiguo de tokens se actualizó para incluir el 911 ya presente en Ayuda; sus 90 combinaciones de layout y 15 contrastes AA pasan.
- CSV documentado con columnas y relaciones; JSON documentado con modelo completo. Aviso breve de información personal junto a las descargas.
- No se realizó integración con Supabase ni revisión clínica profesional. ANI-98/ANI-99 conservan esos pendientes abiertos.
- El PR integrado y el cierre de los issues se registran con sus enlaces en el [documento de ejecución en Linear](https://linear.app/anima-org/document/frontend-completo-plan-y-criterios-de-done-04102026-c7f50ede2cbb).
