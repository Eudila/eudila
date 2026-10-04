# ANI-64 · Selector de emoción preparado para la base

**Goal:** Integrar y verificar el selector de emoción en Next.js para que ANI-50 pueda habilitarlo al crear las tablas y cargar el catálogo.

**Architecture:** Reutilizar el selector y el lector REST de `agustin-pendientes` (PR #2), tomando solo los archivos de ANI-64 sobre el main actual. El catálogo se obtiene de Supabase; los datos semilla de ANI-96 se utilizan exclusivamente como respuestas interceptadas en pruebas. El borrador existente conserva `emotionId` entre rutas y recargas.

**Tech Stack:** Next.js 16.3.8, React 19, TypeScript, Tailwind, fetch y diálogo HTML nativo. Node y Playwright/Chrome para comprobar contrato y comportamiento.

## Alcance autorizado y decisiones

Pedido: «agarra el ANI 64 planificalo y desarrollalo para que quede listo para que se cree la db». La preparación del frontend es el entregable de esta sesión. ANI-50 sigue siendo responsable de base, migraciones, RLS y semillas; ANI-66 del guardado.

Se evaluó integrar todo PR #2, que también incluye materiales de TechWeek, o recuperar únicamente ANI-64. Se elige la segunda opción para revisar y publicar un cambio acotado sin duplicar trabajo ni incorporar entregables ajenos.

- Usar los seis chips que devuelve `sugerida === true` y todas las filas en el diálogo, sin filtrar por ánimo.
- Buscar por nombre sin distinguir mayúsculas ni tildes. Mostrar selección y permitir cambiarla.
- Usar `showModal()` para fondo inerte y foco dentro del diálogo, cerrar con Escape y devolver foco a «Ver todas las emociones».
- No incorporar el JSON como respaldo en la app: sin configuración o sin catálogo, explicar la indisponibilidad y conservar el borrador.
- Validar las respuestas REST antes de exponerlas, tratar fallos/vacío y ofrecer reintento. Evitar una carga indefinida ante una conexión que no responde.
- Conservar la selección restaurada aunque una lectura falle; bloquear avance si el ID no está en el catálogo devuelto. No eliminar datos elegidos de manera silenciosa.
- Crear el destino `/registro/factores` con el aviso del paso pendiente de ANI-65, sin simular guardado.

## Task 1 · Recuperar la implementación existente

Archivos: `app/registro/emociones.tsx`, `app/registro/emociones.test.py`, `app/registro/registro.tsx`, `app/registro/[paso]/page.tsx`, `prototype/catalog.js`, `prototype/catalog.test.mjs`, `prototype/app.js`, `prototype/sw.js`.

1. Recuperar únicamente los archivos anteriores de `agustin-pendientes`, sin sobrescribir los cambios de Ayuda ni documentos de main.
2. Comprobar `node --test prototype/flow-state.test.mjs data/catalogo.test.mjs` como línea base.
3. Revisar el componente y su consumo del contrato, ajustando búsqueda, selección restaurada y errores según este plan.
4. Mantener el lector compartido con el prototipo y actualizar su precaché para que no falte el módulo offline.

## Task 2 · Preparar la conexión de ANI-50

Archivos: `prototype/catalog.js`, `prototype/catalog.test.mjs`, `.env.example`, `.gitignore`, `README.md`, `docs/content/ani-64-integracion.md`.

1. Documentar el origen del proyecto Supabase, no una URL de tabla, en `NEXT_PUBLIC_CATALOG_URL`, y su clave pública anon en `NEXT_PUBLIC_CATALOG_ANON_KEY`.
2. Crear `.env.example` vacío y permitir versionar solamente ese ejemplo, conservando los archivos locales ignorados.
3. Documentar `GET /rest/v1/emociones?select=id,nombre,sugerida&order=nombre.asc`, campos, lectura pública de catálogo, UUID del JSON y reconstrucción de Next.js al cambiar variables públicas.
4. Probar el lector con contrato correcto, datos inválidos, IDs repetidos, HTTP fallido y cancelación. Ninguna prueba llama a una base externa.

## Task 3 · Verificar experiencia y entregar

Archivos: `app/registro/emociones.test.py`, este plan y la documentación de integración.

1. Usar filas reales de `data/catalogo-v1.json` como fixtures REST en Chrome: seis sugeridas, 21 opciones, alternativas explícitas y UUID guardado.
2. Comprobar búsqueda sin tildes, teclado, Tab/Shift+Tab, Escape, devolución de foco, cambio de selección, rutas y recarga.
3. Comprobar carga, error/reintento, vacío, respuesta inválida, ID retirado del catálogo, storage bloqueado y ausencia de configuración. Verificar móvil y texto al 200%.
4. Ejecutar lint, typecheck, format:check y build; pruebas Node y navegador del selector/prototipo y regresión del acceso a Ayuda.
5. Solicitar revisión de código, resolver hallazgos relevantes y preparar commit/PR con evidencia y lista concreta de pendientes de ANI-50.

## Criterio de entrega

La interfaz queda desarrollada y probada contra el contrato con fixtures. La integración real con Supabase se comprueba cuando ANI-50 publique la base. ANI-64 permanece en curso hasta esa comprobación; la preparación de frontend puede revisarse e integrarse antes.

## Evidencia

Comprobaciones ejecutadas el 04/10/2026 sobre la rama `ani-64-selector`, creada desde `979f5d7` (main). Las tres tareas de preparación quedan completas.

- `npm run lint`, `npm run typecheck`, `npm run format:check` y `npm run build`: exit 0. Build genera las rutas tipo, ánimo, emoción y el destino pendiente de factores.
- `node --test prototype/catalog.test.mjs data/catalogo.test.mjs prototype/flow-state.test.mjs`: 9/9 correctas, sin fallos.
- `uv run --with playwright python app/registro/emociones.test.py`: exit 0, Chrome real. Contrato REST con las filas de ANI-96, seis sugerencias independientes del ánimo, 21 opciones, tres alternativas, búsqueda sin tildes, elección/cambio, foco/teclado/Escape, navegación y recarga, errores/vacío/reintento, UUID fuera del catálogo, storage bloqueado y escenario sin configuración comprobados.
- La prueba de timeout dejó el GET sin respuesta y comprobó carga → error a los 10 s, UUID conservado y reintento exitoso. Los escenarios sin configuración fijan variables vacías para no cargar credenciales de un `.env.local` del desarrollador.
- `uv run --with playwright python data/catalogo.browser.test.py`: exit 0, consumo compartido desde el prototipo y persistencia de UUID de emociones/factores.
- `uv run --with playwright python prototype/splash.test.py`: exit 0, entrada, navegación, movimiento reducido y reflujo, incluido el precaché actualizado.
- `uv run --with playwright python app/ayuda/ayuda.test.py`: exit 0 sobre build de producción. Acceso global, Ayuda offline, recursos, teléfonos y borrador conservado, incluso con red lenta y storage bloqueado.
- Revisión independiente de código: sin bloqueantes. Observaciones de cobertura de timeout y aislamiento del entorno corregidas y comprobadas. El cierre del diálogo quedó al inicio para acceder al abrir la lista.
- `git diff --check`: sin errores. Capturas de selector y lista inspeccionadas visualmente en 390 × 844; navegador comprobó 320/390/520 px y texto al 200%.

La primera ejecución de navegador detectó una carrera en la prueba de storage bloqueado: hacía `go_back` antes de completar la navegación a Ayuda. Se corrigió esperando la URL de destino y la de retorno; la comprobación pasó después. No fue necesario modificar el proveedor de borrador.

No se verificó una base Supabase real. ANI-64 conserva pendiente ANI-50 y su comprobación de integración. La guía `docs/content/ani-64-integracion.md` contiene el contrato y la lista de habilitación.
