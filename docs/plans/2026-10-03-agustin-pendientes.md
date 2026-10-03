# Pendientes de Agustín · plan y ejecución

> **Ejecución:** `superpowers:executing-plans`, con verificación antes del cierre. Pedido del 03/10/2026: planificar y ejecutar todas las tareas pendientes de Agustín de punta a punta.

**Goal:** completar los entregables ejecutables y registrar la evidencia y los requisitos que necesitan datos, aprobación clínica o participación humana.

**Architecture:** reutilizar el estado, los tokens y el contrato de catálogo del prototipo en Next.js; conservar el PR de ayuda existente. Preparar materiales externos a la app y una prueba real de instalación desde el repositorio público. No inventar catálogos, historiales, aprobaciones ni pruebas físicas.

**Tech Stack:** Next.js, React, HTML/CSS, JavaScript nativo, Playwright y herramientas de PDF/video disponibles; sin nuevas dependencias de la app.

## Inventario verificado en Linear

Se consultaron todos los issues asignados a Agustin Pedernera, sin filtros de estado: siete abiertos; ANI-91 está cancelado y los demás completados. No se reabren tareas completadas ni se cambia la asignación de dependencias de otras personas.

| Tarea | Secuencia de ejecución | Requisito para cerrar |
| --- | --- | --- |
| ANI-64 · Emociones | Portar chips, búsqueda y diálogo a Next.js; validar datos, conservar selección, errores y reintento; comprobar teclado, recarga y responsive. | Catálogo aprobado de ANI-96 y endpoint/semillas reales de ANI-50. |
| ANI-67 · Ayuda | Revisar PR #1, repetir checks de producción y mantener una sola implementación. | Texto final de ANI-59 y evidencia clínica; integrar la entrega final. |
| ANI-78 · Clonado | Clonar el remoto en carpeta nueva, ejecutar solo README, medir instalación y arranque, comprobar páginas y build; preparar acta para persona externa. | Persona ajena al setup en máquina limpia, menos de 15 minutos y tropiezos registrados. |
| ANI-94 · PDF | Precisar período, fechas locales, cronología, conteos y días sin registro; preparar criterios y casos de prueba para el historial real. | Esquema ANI-50, autenticación ANI-51, guardado ANI-66, historial y revisión clínica documentada. |
| ANI-95 · CSV/JSON | Precisar descarga completa, JSON sin pérdida, escape CSV y neutralización de fórmulas; documentar verificación de aislamiento. | Esquema y fuente autenticada de registros propios disponibles; comprobar con registros reales. |
| ANI-82 · TechWeek | Capturar la app real; producir one-pager A4, QR al repo, video MP4 de 60 s y capturas descargables; validar página, duración, decodificación QR y reproducción sin red. | URL landing y contacto definitivo; impresión, varios teléfonos, video en dos celulares y demo con historial. |
| ANI-87 · Ensayo | Preparar agenda, guion, respuestas difíciles y acta de cronómetro/roles/plan B. | Ensayo humano, dos personas sin leer, roles acordados y plan B físico probado. |

## Decisiones y límites

Se elige integrar el selector existente frente a otra app o biblioteca de componentes. El diálogo nativo aporta foco atrapado, Escape y restitución de foco. El catálogo conserva el contrato ya usado: `emociones(id,nombre,sugerida)`, sin categorías de relleno. La vista de factores anuncia su dependencia pendiente y no finge guardado.

ANI-50 y ANI-66 no tienen migraciones, esquema publicado ni registros guardados. Un exportador con columnas o endpoints inventados no cumpliría que el JSON contenga todo lo existente en la base. Se deja el plan exacto de integración de ANI-94/95; su implementación espera esa fuente real. No se crea otra base, almacenamiento de registros en navegador ni historial ficticio para aparentar su cierre.

El material de TechWeek describe únicamente funciones verificadas. El PDF de trabajo se identifica como borrador mientras falten landing/contacto; no se reemplaza el QR de landing por otro destino mal etiquetado. Las capturas y el video muestran la ausencia de catálogo e historial cuando corresponda.

## Comprobaciones

1. `node --test prototype/flow-state.test.mjs prototype/catalog.test.mjs`.
2. `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`.
3. `uv run --with playwright python app/registro/emociones.test.py`: catálogo simulado solo en el test, teclado, foco, búsqueda, selección, reintento, datos inválidos, recarga y tamaños 320/390/520 px al 100/200 %.
4. Suite existente de tokens/shell/registro contra producción y suite offline del PR #1.
5. Clonado limpio: `npm ci`, `npm run dev`, respuesta y render; luego comandos de verificación del README. Registrar tiempo y SHA.
6. Material: PDF de una página A4, QR decodificado al URL correcto, MP4 de 60 s, capturas sin información personal y recursos locales sin red.

## Implementación de ANI-94/95 cuando esté la fuente

1. Leer migraciones y cliente autenticado reales. Obtener **todo** el historial propio, paginado hasta finalizar; abortar la exportación si una página falla. No confundir borrador con registro guardado. Verificar con dos usuarios que la RLS no permita cruzarlos.
2. JSON: preservar campos y relaciones del historial sin filtrado de período ni recorte; descargar `Blob` desde el navegador. CSV UTF-8: fecha/hora con zona declarada, escala, emoción y factores; entrecomillar campos, duplicar comillas, conservar acentos y saltos de línea y neutralizar celdas que una planilla pueda ejecutar como fórmula. Avisar sobre el archivo sensible en Descargas. Revocar el URL del Blob tras descargar.
3. PDF: semana, mes, tres meses y todo; documentar fechas inclusivas y zona horaria; filtrar por días locales, sin dividir milisegundos por 24 horas (cambios de hora). Contar registros, días distintos, emociones, factores y los siete valores de ánimo; enumerar días sin registros. Cronología con fecha, hora y datos cargados. Generación enteramente local, texto negro y sin gráficos interpretativos.
4. Usar impresión nativa a PDF si cumple paginación/legibilidad y todos los campos; agregar una biblioteca únicamente si esa verificación demuestra que hace falta. Revisar reporte vacío, un registro, límites de fecha, medianoche, cambio de hora, etiquetas largas, muchos registros y escala de grises. Incorporar aviso clínico aprobado, sin interpretación ni recomendaciones.
5. Documentar formatos y ejecutar comparación de ida y vuelta contra la base del usuario, sin límite oculto. Revisión clínica documentada del PDF y lectura en planilla del CSV antes de Done.

## Evidencia de ejecución

### 03/10/2026

- Rama `agustin-pendientes`, base pública `9b1f5332862b093f09981f83481ef14cd2ba0063`, worktree aislado. La ayuda existente permanece en `ani-67-ayuda-offline`, PR #1; no se duplica ni se mezcla su cierre clínico.
- ANI-64: implementados chips sugeridos, búsqueda, diálogo nativo, selección anunciada, preservación entre rutas/recarga, errores, vacío y reintento. El lector valida filas completas e IDs únicos y se comparte con el prototipo. El service worker del prototipo pasa a v7 e incluye el módulo nuevo para conservar funcionamiento offline.
- `node --test prototype/flow-state.test.mjs prototype/catalog.test.mjs`: 2/2 archivos, cero fallos. `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`: exit 0. Sin dependencias nuevas de la app.
- `app/registro/emociones.test.py`: exit 0 en Chrome. Comprueba sugeridas/lista completa, teclado en ambos sentidos, fondo inerte, Escape con texto buscado, restitución de foco, recarga, Ayuda, vuelta desde factores, errores HTTP/filas inválidas/catálogo vacío/reintento y seis combinaciones responsive (320/390/520 al 100/200 %). Las etiquetas ficticias viven solo en el test. El test reprodujo que el input nativo de búsqueda consumía Escape para limpiar texto; se corrigió para que el primer Escape cierre la lista.
- `TOKENS_BASE_URL=http://127.0.0.1:3068 uv run --with playwright python app/tokens/tokens.test.py`: exit 0 contra producción. Mantiene 66 tokens, 15 pares AA (mínimo 5,08:1), shell y registro, nueve rutas y 90 combinaciones responsive. `prototype/splash.test.py`: exit 0; incluye recorrido offline tras agregar `catalog.js` a precache.
- ANI-67: reejecutados lint, tipos, formato y build del PR #1: exit 0. `app/ayuda/ayuda.test.py`: exit 0; workers concurrentes, HTML/CSS/fuente disponibles offline, acceso en un toque, recarga/nueva pestaña, caché sin registros y red lenta con Storage bloqueado. Se verificó de nuevo ANI-59 y comentarios/documentos del proyecto: no hay texto ni revisión clínica adjuntos. El requisito sigue pendiente.
- ANI-78: clon nuevo del remoto público, instalación en 3 s según npm y servidor listo en 235 ms según Next. Chrome renderiza inicio y Ayuda; HTTP 200 y lint/tipos/formato/build con exit 0. Resultado y limitaciones en `docs/techweek/clonado.md`; sigue faltando persona externa/máquina limpia/cronómetro humano.
- ANI-82: `docs/techweek/preparar.py` genera cuatro capturas reales, QR al repo decodificado al destino exacto, PDF A4 de una página y MP4 H.264/yuv420p de 60 s. PDF inspeccionado visualmente, sin contenido recortado. MP4 decodificado íntegro por ffmpeg y reproducido/seek al final desde `respaldo.html` con navegador offline y cero peticiones HTTP. No se afirma prueba física.
- ANI-80 ya está Done: se descargó el HTML adjunto **fuera del repo de producto**, se confirmó SHA256 `6b015534c6040967cbd1e65748750bb1547d100deb068d29dddda11b8493d9e1` y apertura local offline con cero peticiones HTTP. Las referencias de materiales y ensayo se actualizaron al estado real de la maqueta.
- ANI-87: agenda de 45 minutos, pitch de trabajo de 85 s, respuestas propuestas y acta de dos presentadores/roles/plan B preparadas en `docs/techweek/ensayo.md`. El pitch oficial y el acuerdo humano siguen en ANI-81; el ensayo del 22/10 no se acredita como ocurrido el 03/10.
- Revisión independiente `review_pending`: sin hallazgos funcionales/de seguridad ni bloqueantes. Se corrigieron referencias obsoletas en README y se documentaron variables públicas de catálogo antes del build. `git diff --check`: sin errores.

### Requisitos que siguen abiertos

1. ANI-64: catálogo aprobado de Noelia y endpoint/semillas de Pablo, ANI-96/ANI-50.
2. ANI-67: texto final y revisión clínica documentada de ANI-59.
3. ANI-94/95: esquema ANI-50, autenticación ANI-51 y guardado ANI-66; integración real y, para PDF, revisión clínica. Solo plan de implementación; no se afirma que los exportadores estén construidos.
4. ANI-78: prueba de una persona externa en máquina limpia y menos de 15 minutos.
5. ANI-82: landing/contacto definitivos, QR landing, impresión, teléfonos y cuenta de demo con historial/calendario (ANI-66/ANI-71).
6. ANI-87: ensayo de dos personas, respuestas acordadas, roles y respaldo físico probado.

Ninguno de los siete issues se marca Done con criterios incumplidos. Un test automatizado de instalación no sustituye a la persona externa; un archivo listo para imprimir no acredita impresión; un MP4 local no acredita dos celulares.
