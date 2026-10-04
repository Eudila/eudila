# Catálogo de emociones y factores de vida · v1.0.0

Entrega de ANI-96 para ANI-50, ANI-64 y ANI-65. Responsable: Agustín Pedernera, por reasignación solicitada el 04/10/2026. Idioma: español argentino (`es-AR`).

El [JSON de datos semilla](../../data/catalogo-v1.json) es la fuente de las etiquetas, los identificadores y las sugerencias. Contiene **18 etiquetas afectivas, tres alternativas de respuesta y 15 factores de vida**. Este documento explica las decisiones y el contrato de integración.

## Criterios y fuentes

El catálogo es un vocabulario editorial para describir la propia experiencia. Las etiquetas son propuestas originales informadas por investigación; no forman una escala clínica validada, un diagnóstico ni una traducción de un cuestionario. “Emoción” se usa en la interfaz en un sentido cotidiano que incluye estados afectivos como calma y preocupación.

- **Russell (1980), *A circumplex model of affect*.** Su estudio organiza el afecto alrededor de agrado/desagrado y activación. Lo usamos como fundamento para incluir experiencias de distinta activación y para conservar la escala de ánimo como una respuesta separada de la palabra elegida. No permite calcular el ánimo individual a partir de una etiqueta. [Artículo original](https://pdodds.w3.uvm.edu/research/papers/others/1980/russell1980a.pdf), DOI `10.1037/h0077714`.
- **Cowen y Keltner (2017), *Self-report captures 27 distinct categories of emotion bridged by continuous gradients*.** El análisis de respuestas a videos encuentra categorías con transiciones graduales y matices que no se reducen a dos dimensiones. Informa la decisión de ofrecer más vocabulario que una lista inicial corta. Nuestra selección de 18 etiquetas y sus nombres en español son decisiones editoriales: no reproducen las 27 categorías ni suponen validación para registros cotidianos o población argentina. [Artículo original en PNAS](https://www.pnas.org/doi/10.1073/pnas.1702247114), DOI `10.1073/pnas.1702247114`.
- **OMS, Clasificación Internacional del Funcionamiento, de la Discapacidad y de la Salud (CIF).** Incluye el contexto y los factores ambientales al describir funcionamiento y salud. Informa la separación entre experiencia afectiva y ámbitos de la vida. No usamos códigos CIF ni afirmamos equivalencias con sus categorías. [Descripción oficial](https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health).
- **OMS, WHOQOL-BREF, versión original en inglés.** Sus ámbitos abarcan salud, sueño, actividades cotidianas, trabajo, relaciones, recursos, vivienda, entorno y ocio. Informa la cobertura contextual, sin copiar preguntas, traducciones, puntuación ni período de evaluación. Estudio, cuidados, actividad física y pantallas son ampliaciones editoriales para el registro cotidiano; no categorías validadas por ese instrumento. [Instrumento original](https://cdn.who.int/media/docs/default-source/publishing-policies/whoqol-bref/english_whoqol_bref.pdf?sfvrsn=3facbb3b_1) y [página oficial](https://www.who.int/tools/whoqol/whoqol-bref).

Fuentes consultadas el 04/10/2026. Se usan como fundamento conceptual, sin reproducir escalas. Las explicaciones de las tablas son criterios de contenido, no definiciones diagnósticas ni instrucciones para interpretar a otra persona.

## Selección inicial y lista completa

Se muestran primero **Alegría, Calma, Tristeza, Enojo, Miedo y Preocupación**: seis palabras cortas que permiten expresar experiencias variadas sin llenar la primera pantalla. Es una decisión de usabilidad, no una afirmación de frecuencia poblacional ni una prescripción de lo que alguien debería sentir.

Todas las opciones, incluidas esas seis, aparecen en la lista completa; no se ocultan por el valor de ánimo. El lector actual ordena por `nombre.asc`, por lo que el orden visible de las sugerencias es Alegría, Calma, Enojo, Miedo, Preocupación y Tristeza. No se agrega un campo de orden.

Se elige una opción para el registro actual. Se puede cambiar antes de guardar. Es una simplificación de la interfaz: una persona puede experimentar varias emociones a la vez. No se combinan ni se suman etiquetas para inferir intensidad, salud o riesgo.

| Clave estable | Etiqueta | Sugerida | Criterio de inclusión |
| --- | --- | --- | --- |
| `alegria` | Alegría | Sí | Experiencia de disfrute o bienestar. |
| `calma` | Calma | Sí | Tranquilidad; incluye un estado afectivo de menor activación. |
| `entusiasmo` | Entusiasmo | No | Energía o ilusión ante algo que interesa. |
| `interes` | Interés | No | Curiosidad o atención hacia algo. |
| `carino` | Cariño | No | Afecto hacia una persona, un ser vivo o algo significativo. |
| `gratitud` | Gratitud | No | Apreciación por algo recibido o vivido. |
| `orgullo` | Orgullo | No | Satisfacción por un esfuerzo, logro o algo valioso para la persona. |
| `alivio` | Alivio | No | Disminución de una tensión o preocupación. |
| `tristeza` | Tristeza | Sí | Pena o desánimo, sin equipararlos con un diagnóstico. |
| `enojo` | Enojo | Sí | Malestar ante algo que molesta o se vive como injusto. |
| `miedo` | Miedo | Sí | Respuesta ante una amenaza percibida, sin juzgar si está justificada. |
| `preocupacion` | Preocupación | Sí | Inquietud por algo que puede pasar o que ocupa la atención. |
| `frustracion` | Frustración | No | Malestar cuando algo esperado o intentado no sale como se quería. |
| `soledad` | Soledad | No | Sensación subjetiva de falta de conexión; no equivale a estar sin compañía. |
| `culpa` | Culpa | No | Malestar por algo hecho o no hecho; no afirma responsabilidad real. |
| `verguenza` | Vergüenza | No | Sensación de exposición o incomodidad ante la mirada propia o ajena. |
| `sorpresa` | Sorpresa | No | Respuesta ante algo inesperado, agradable o desagradable. |
| `aburrimiento` | Aburrimiento | No | Falta de interés o de conexión con la actividad o el momento. |
| `otra-emocion` | Otra emoción | No | Alternativa: la experiencia no está representada en la lista. |
| `no-se-como-nombrarlo` | No sé cómo nombrarlo | No | Alternativa: dificultad para encontrar una palabra, sin exigir precisión. |
| `prefiero-no-indicarlo` | Prefiero no indicarlo | No | Alternativa: elección explícita de no compartir una emoción. |

Las tres alternativas son respuestas válidas para avanzar, no emociones específicas. No abren un campo de texto: ese campo no forma parte del contrato actual. No se exige a la persona que justifique su elección. Los informes conservan el valor elegido y, al calcular distribuciones de emociones, separan estas respuestas en una categoría de “sin emoción específica”, informando su cantidad y el denominador utilizado. No se las convierte en ánimo neutro, ausencia de emoción o ausencia de malestar.

Identificadores de alternativas para filtrar sin depender de las etiquetas:

| Clave | UUID | Tipo de respuesta |
| --- | --- | --- |
| `otra-emocion` | `eceefb9f-2dec-58f4-b1a6-609a7e7c36ca` | Otra emoción |
| `no-se-como-nombrarlo` | `f0d3a478-e3fa-5503-a6e2-3b58df5a9c15` | No sé cómo nombrarlo |
| `prefiero-no-indicarlo` | `5ef2f8bc-a656-5d50-852f-67db0486cac4` | Prefiero no indicarlo |

## Factores de vida

Se pueden elegir **cero, uno o varios**. Son ámbitos que la persona considera relacionados con su experiencia; no prueban una causa. Cada ámbito puede asociarse con experiencias agradables, desagradables, mixtas o cambiantes. No hay signos, pesos ni jerarquías de importancia preasignados.

| Clave estable | Etiqueta | Alcance editorial |
| --- | --- | --- |
| `sueno-descanso` | Sueño y descanso | Dormir, descansar o recuperar energía. |
| `salud-cuerpo` | Salud y cuerpo | Experiencias de salud, sensaciones físicas o relación con el cuerpo. |
| `trabajo` | Trabajo | Empleo, búsqueda de trabajo o tareas laborales. |
| `estudio` | Estudio | Aprendizaje, cursadas, evaluaciones u otras actividades educativas. |
| `familia` | Familia | Vínculos o situaciones familiares, según cómo la persona define su familia. |
| `pareja` | Pareja | Vínculos de pareja, su ausencia o cambios en ellos. |
| `amistades` | Amistades | Vínculos de amistad y apoyo entre pares. |
| `cuidados-responsabilidades` | Cuidados y responsabilidades | Cuidado de otras personas y responsabilidades cotidianas, remuneradas o no. |
| `dinero` | Dinero | Ingresos, gastos, deudas o acceso a recursos económicos. |
| `vivienda` | Vivienda | Hogar, convivencia y condiciones o estabilidad de alojamiento. |
| `entorno-comunidad` | Entorno y comunidad | Barrio, comunidad, seguridad, transporte o condiciones del entorno. |
| `tiempo-libre` | Tiempo libre | Ocio, actividades personales, creatividad o posibilidades de disfrutarlos. |
| `actividad-fisica` | Actividad física | Movimiento, ejercicio, deporte o posibilidades de realizarlos. |
| `uso-pantallas` | Uso de pantallas | Experiencias con redes, mensajes, noticias, juegos u otros medios digitales. |
| `otro-factor` | Otro factor | Un ámbito que la persona reconoce y que no está en la lista. |

La selección vacía `[]` significa “sin factores seleccionados”; no distingue entre omisión, preferencia de privacidad y no haber reconocido un factor. No se interpreta como “nada influyó”. “Otro factor” permite indicar un ámbito no representado sin exigir texto libre. Familia, pareja y amistades pueden seleccionarse juntas: no son categorías excluyentes.

## Contrato de datos semilla para ANI-50

`data/catalogo-v1.json` contiene `version`, `idioma`, `emociones` y `factores_vida`. Los metadatos raíz pertenecen al archivo, no son columnas de las tablas. Los slugs de las tablas anteriores documentan la identidad; no son columnas adicionales ni etiquetas visibles.

- Importar `emociones` como filas `{id: UUID, nombre: string, sugerida: boolean}`.
- Importar `factores_vida` como filas `{id: UUID, nombre: string}`.
- No importar el objeto raíz como una fila ni convertir `sugerida` en un string.
- Usar los UUID entregados como claves primarias. Se calcularon con UUID v5, namespace estándar URL, y nombre `https://github.com/Eudila/eudila/catalogo/{tabla}/{clave-estable}`. Ese nombre es un namespace de identidad, no un enlace a un recurso web. No incluye la versión para preservar la identidad entre versiones.
- Crear las tablas y la migración versionada en ANI-50. Cargar ambas listas con un upsert por `id`, en una transacción: la repetición no genera duplicados. No hacer `TRUNCATE` ni reemplazar claves existentes referenciadas por registros.
- Si ya hubiera un catálogo con otros identificadores, preparar una migración explícita de correspondencias antes de cargar: no agregar filas duplicadas por nombre ni romper referencias históricas. En la entrega actual no se inspeccionó una base desplegada.
- Exponer lectura a los clientes con las políticas previstas en ANI-50; escritura del catálogo solo por migración o administración autorizada. El JSON público contiene categorías, nunca registros personales ni claves.

El lector ya usa estos endpoints y campos:

```text
GET /rest/v1/emociones?select=id,nombre,sugerida&order=nombre.asc
GET /rest/v1/factores_vida?select=id,nombre&order=nombre.asc
```

Cada endpoint devuelve su array de filas, no el archivo completo. La UI toma las sugerencias de `sugerida === true`, permite elegir cualquier ID de la lista completa y guarda el ID, no el nombre, en el borrador. Factores usan múltiples IDs. El guardado y las claves foráneas son parte de ANI-50/ANI-66.

Cambiar una redacción conserva su UUID; un concepto nuevo recibe una clave nueva. No se reutilizan UUID para significados distintos ni se borran categorías con registros históricos. Un retiro futuro debe resolver primero las referencias y la visualización histórica en la migración correspondiente; no se inventa hoy una columna `activa` que el lector no consume.

## Revisión y comprobación

Antes de publicar una modificación, revisar claridad, cobertura, duplicados, sugerencias y efectos sobre registros existentes. Conservar la distinción entre fundamento conceptual y evidencia de uso: esta primera versión no cuenta con pruebas de comprensión con personas usuarias ni validación psicométrica. No se atribuye aprobación clínica o autoría a Noelia.

Para comprobar el formato, las identidades, las alternativas, el borrador y la correspondencia con este documento:

```sh
node --test data/catalogo.test.mjs
```

Para comprobar la lectura de estas filas en el prototipo, las sugerencias, el listado completo, una alternativa, la selección múltiple y la recarga:

```sh
uv run --with playwright python data/catalogo.browser.test.py
```

La segunda comprobación simula respuestas REST únicamente dentro del navegador de prueba. No configura una base real ni introduce categorías de respaldo en el frontend. La implementación del esquema y la disponibilidad del endpoint continúan en ANI-50; la entrega editorial y los datos semilla de ANI-96 quedan completos.
