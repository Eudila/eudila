# ANI-96 · Catálogo de emociones y factores de vida

**Responsable:** Agustín Pedernera, reasignado por pedido explícito del 04/10/2026.

**Objetivo:** entregar un vocabulario breve de autoobservación, con fundamentos y etiquetas en español argentino, listo para que ANI-50 cargue los datos y ANI-64/ANI-65 los lean. Completar la investigación y la entrega de ANI-96.

**Arquitectura:** un documento editorial y un JSON versionado con dos arrays. Se conserva el contrato ya presente en `prototype/app.js`: emociones con `id`, `nombre`, `sugerida`; factores con `id`, `nombre`. No hay listas nuevas dentro del frontend. La base y su despliegue corresponden a ANI-50.

**Herramientas:** Markdown, JSON, UUID v5 y comprobaciones con Node.js; navegador real para consumir las filas mediante el lector existente. No se agrega ninguna dependencia de producción.

## Decisiones

- Usar fuentes primarias sobre afecto, categorías emocionales y contexto vital. Distinguir sus resultados de nuestras decisiones editoriales: las fuentes no validan este catálogo como escala clínica.
- Elegir seis sugerencias fijas, para cubrir experiencias variadas sin inferir emoción a partir del ánimo. El listado completo tendrá más matices y alternativas para otra emoción, dificultad para nombrarla o preferencia de no indicarla.
- Proponer factores como ámbitos de la vida, sin atribuirles un efecto favorable, desfavorable o causal. Selección múltiple opcional.
- Dar identificadores UUID estables, criterios por etiqueta y reglas de importación/actualización. Un cuestionario estandarizado exigiría otro objetivo y validación; no se adapta ni copia ninguno.

## Ejecución

1. Revisar ANI-96/ANI-50 y el contrato del lector; contrastar fuentes originales. Reasignar a Agustín y pasar a In Progress.
2. Escribir catálogo, fuentes, selección inicial, alternativas, límites y guía de datos semilla. Generar `data/catalogo-v1.json` y enlazarlo desde el README.
3. Comprobar esquema, unicidad, identidades y coherencia documental. Probar que el lector existente presenta las seis sugerencias, la lista completa y los factores, y conserva los identificadores elegidos.
4. Solicitar revisión independiente de fuentes y entrega técnica; corregir observaciones importantes. Registrar resultados reales abajo.
5. Publicar los archivos en la rama principal, adjuntar documento y evidencia a ANI-96, enlazar la entrega desde ANI-50/ANI-64/ANI-65 y comprobar responsable y estado Done por lectura de Linear.

## Criterios de cierre

- Catálogo y criterios escritos con fuentes verificables.
- Sugerencias y listado completo explícitos, lenguaje sin diagnósticos ni juicios.
- JSON importable sin que Pablo deba decidir categorías, identificadores o banderas.
- Entrega publicada y vinculada al ticket; reasignación y Done confirmados.

La mención original a Noelia como autora se actualiza a Agustín por la reasignación solicitada. No se atribuye una revisión a Noelia ni se agrega una aprobación externa que el ticket no exige. La validación clínica de una escala y la implementación de la base no son criterios de este ticket.

## Evidencia

- Línea base: `node --test prototype/flow-state.test.mjs`, 1/1 correcto.
- `node --test data/catalogo.test.mjs prototype/flow-state.test.mjs`: 4/4 correctos. Comprueba forma de filas, UUID, nombres únicos, seis sugerencias, correspondencia documental, identidades derivadas de las claves y conservación de alternativas/factores en el borrador.
- `uv run --with playwright python data/catalogo.browser.test.py`: correcto en Chrome. El lector solicita los campos y headers esperados; muestra seis sugerencias incluso con ánimo 2/7, 21 respuestas y 15 factores; conserva UUID de una alternativa, múltiples factores y recarga; permite quitar todos los factores sin errores de JavaScript.
- Prettier sobre JSON y prueba Node: correcto. `git diff --check`: correcto. No cambian código de la app, dependencias ni configuración de producción.
- La primera ejecución del driver de navegador leyó una clave de almacenamiento equivocada. Se contrastó con `DRAFT_KEY` en `prototype/app.js`, se corrigió el driver a `eudila-draft-v1` y se volvió a ejecutar con resultado correcto.
- Revisión independiente y publicación: pendientes de registrar.
