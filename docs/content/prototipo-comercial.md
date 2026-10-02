# eudila · Guion del prototipo comercial

Entrega de [ANI-79](https://linear.app/anima-org/issue/ANI-79/definir-el-guion-del-prototipo-comercial) para construir [ANI-80](https://linear.app/anima-org/issue/ANI-80/prototipo-visual-del-dashboard-institucional). Versión: 02/10/2026. Recorrido orientativo: **seis pantallas, 85 segundos**. El ensayo del pitch corresponde a ANI-81.

## Qué se presenta

Una conversación con un equipo municipal hipotético de Salta Capital: cómo podría explorar una herramienta de registro emocional y leer información agregada si se acordara una implementación. La pregunta inicial es una hipótesis de trabajo, no el diagnóstico de una jurisdicción.

El servicio institucional se presentará como una **maqueta navegable con datos inventados**, por construir en ANI-80, sin backend ni conexión a registros reales. La app open source sí tiene código funcionando; hoy ofrece tipo de registro, escala de ánimo, borrador y ayuda. Todavía no completa el catálogo clínico, el guardado ni el historial. El documento describe este estado, no da por terminado el MVP del 27/10.

En todas las pantallas institucionales, mantener visible, también en celular, capturas y vista sin conexión:

> Maqueta · Datos simulados · Sin conexión a registros reales

Cada gráfico, tabla, mapa y detalle lleva además «Datos simulados» dentro de su propio bloque. En el teléfono de la pantalla 2, distinguir «Captura de la app actual». No animar una transferencia de datos entre ese teléfono y el tablero: esa integración no existe.

El presentador dice «maqueta» antes de mostrar el primer indicador. Si una pregunta exige una función pendiente, indicar su estado y volver al guion; no inventar una respuesta del sistema.

## Pantalla 1 · Una pregunta para el equipo de salud

**Propósito:** partir del problema que se quiere explorar sin atribuir resultados a Eudila.

**Mostrar:** wordmark `eudila`, título «¿Cómo acompañar el registro emocional en tu comunidad?» y la pregunta «¿Qué información necesita tu equipo y con qué límites?». No usar cifras de suicidio, sellos públicos ni testimonios ficticios.

**Decir — 12 s:** «¿Cómo acompañar el registro emocional en una comunidad? Eudila tiene una app abierta en desarrollo. Lo institucional que vamos a mostrar es una maqueta con datos simulados.»

**Acción:** «Ver la propuesta» abre la pantalla 2. **Salida:** el interlocutor sabe desde el comienzo qué se está demostrando.

## Pantalla 2 · El punto de partida real

**Propósito:** mostrar lo que ya existe antes de presentar el servicio propuesto.

**Mostrar:** una captura real de `/registro/animo`, con el estado Neutral, el slider y «Ayuda ahora». Una leyenda debajo dice «App actual: tipo y ánimo, borrador y ayuda. Catálogo, guardado e historial pendientes». La captura no incluye datos personales.

**Decir — 14 s:** «Este registro sí existe: permite elegir el momento y el ánimo, conservar un borrador y acceder a ayuda. Aún faltan catálogo, guardado e historial. El tablero siguiente es una propuesta visual.»

**Acción:** «Ver el tablero simulado» abre la pantalla 3. La captura tiene un enlace secundario al [código del registro](https://github.com/Eudila/eudila/tree/main/app/registro); no simular un envío al gobierno. **Salida:** app actual y futura integración quedan diferenciadas.

## Pantalla 3 · Un período, con su denominador

**Propósito:** mostrar qué podría leerse en un resumen agregado y qué no permite concluir.

**Mostrar:** «Salta Capital · Escenario simulado · 01–28 septiembre 2026», **120 participantes ficticios** y **840 registros ficticios**. Un gráfico de siete barras muestra la distribución de ánimo y otro, el volumen de registros por semana. Las tablas equivalentes quedan disponibles junto a los gráficos.

**Decir — 14 s:** «El ejemplo reúne 120 participantes ficticios y 840 registros en cuatro semanas. Leemos distribución y volumen de registros. Estos números no describen a toda la población ni demuestran resultados del servicio.»

**Acción:** «Ver por zona» abre la pantalla 4. Período fijo, sin filtros de edad, sexo ni menús con alternativas sin datos. **Salida:** la unidad de lectura es el registro; las personas pueden aportar varios.

## Pantalla 4 · Participación en un territorio de ejemplo

**Propósito:** explorar un corte territorial sin presentar un mapa de riesgo.

**Mostrar:** un esquema ilustrativo de Salta Capital con tres polígonos ficticios, «Zona Norte», «Zona Centro» y «Zona Sur», con rótulos **280**, **315** y **245 registros**. Debajo: «Zonas ficticias para la demo de Salta. No representan límites oficiales ni ubicaciones de personas». Una tabla complementa los participantes y registros de cada zona.

La métrica del mapa es únicamente **cantidad de registros**. Usar relleno neutro, etiquetas numéricas y borde para la selección; el mapa no depende del color para leerse. Ordenar la tabla Norte, Centro, Sur, sin ranking de barrios ni lenguaje de mejor/peor zona. La relación espacial de los polígonos es ilustrativa; no necesita mapas de terceros, coordenadas ni geolocalización.

**Decir — 14 s:** «El mapa muestra cantidad de registros por tres zonas ficticias. Sirve para explorar participación en el ejemplo. La app actual no recoge ubicación: cualquier agrupación territorial futura queda por definir con el equipo.»

**Acción:** tocar «Zona Sur» o activarla con teclado abre la pantalla 5; las otras zonas usan el mismo detalle con sus propios datos. **Salida:** queda claro qué representa el mapa y de dónde proviene su agrupación ficticia.

## Pantalla 5 · Leer una zona sin identificar personas

**Propósito:** pasar del total a su composición y explicitar el límite de interpretación.

**Mostrar:** «Zona Sur · Datos simulados», **35 participantes**, **245 registros** y las siete barras de esa zona. Texto visible: «95 de 245 registros (38,8 %) están en niveles 1–3 de la escala. Es una distribución del ejemplo, sin diagnóstico ni evaluación de riesgo individual». No mostrar nombres, perfiles, textos libres, domicilios, horarios individuales ni botones para buscar personas.

**Decir — 16 s:** «En Zona Sur vemos 245 registros de 35 participantes ficticios. El 38,8 por ciento está en los primeros tres niveles. Esto describe registros del ejemplo; no diagnostica ni identifica personas. Una implementación requeriría acordar acceso y privacidad.»

**Acción:** «Volver al mapa» conserva el período y la zona; «Conversar sobre una implementación» abre la pantalla 6. **Salida:** el detalle sirve para formular preguntas, sin ofrecer decisiones clínicas o listas de personas.

## Pantalla 6 · Qué acordar antes de una implementación

**Propósito:** terminar en una conversación concreta y proporcionada al estado del proyecto.

**Mostrar:** título «Definamos una implementación juntos» y tres preguntas: «¿Qué necesita tu equipo?», «¿Qué datos tendría sentido reunir y quién podría verlos?» y «¿Cómo se ofrecería acceso a ayuda?». Leyenda: «Servicio institucional en definición. Esta maqueta no recibe datos ni gestiona atención».

**Decir — 15 s:** «Queremos conversar sobre necesidades, datos, acceso y ayuda. El código se puede revisar hoy; este tablero sigue siendo una maqueta. Una implementación y su evaluación se definirían con el equipo, sin prometer resultados clínicos.»

**Acción:** «Ver el código» abre [Eudila/eudila](https://github.com/Eudila/eudila). «Consultar sobre el proyecto» abre [los issues de GitHub](https://github.com/Eudila/eudila/issues), con el texto «Canal público del proyecto; no envíes datos personales o de salud. No es atención clínica». No inventar una casilla: el contacto definitivo de ANI-76 sigue por configurar. **Salida:** acceso real al proyecto y preguntas para un siguiente encuentro, sin contratación ni promesa de piloto listo.

## Datos simulados para construir las pantallas

Conjunto ficticio fijo para una conversación situada en Salta Capital, creado para esta maqueta; sin datos de usuarios, organismos o del mock anterior. Los valores no cambian al recargar. El período cubre 28 días y cada participante aporta en promedio siete registros, sin sugerir una obligación de registrar todos los días.

Cada participante ficticio pertenece a una única zona durante este período; por eso los participantes por zona suman 120. Los totales semanales cuentan registros, no personas únicas. No derivar participantes semanales ni cruces zona × semana: no se definieron esos datos.

### Escala compartida con la app

Los siete niveles corresponden a `prototype/moods.js` y los colores a `app/globals.css`. Las etiquetas expresan el estado elegido, no categorías clínicas. No usar la escala 0–100 ni las seis categorías del mock anterior.

| Nivel | Etiqueta           | Registros simulados | Token de color   |
| ----- | ------------------ | ------------------- | ---------------- |
| 1     | Muy desagradable   | 45                  | `--color-mood-1` |
| 2     | Desagradable       | 75                  | `--color-mood-2` |
| 3     | Algo desagradable  | 125                 | `--color-mood-3` |
| 4     | Neutral            | 240                 | `--color-mood-4` |
| 5     | Algo agradable     | 185                 | `--color-mood-5` |
| 6     | Agradable          | 115                 | `--color-mood-6` |
| 7     | Muy agradable      | 55                  | `--color-mood-7` |

### Corte por zona · período completo

Las columnas 1–7 contienen **cantidades de registros** en cada nivel. La última es `(nivel 1 + nivel 2 + nivel 3) / registros de la zona × 100`, redondeada a un decimal.

| Zona   | Participantes | Registros | 1  | 2  | 3   | 4   | 5   | 6   | 7  | Niveles 1–3 (%) |
| ------ | ------------- | --------- | -- | -- | --- | --- | --- | --- | -- | --------------- |
| Norte  | 40            | 280       | 15 | 25 | 40  | 80  | 60  | 40  | 20 | 28,6            |
| Centro | 45            | 315       | 10 | 20 | 40  | 90  | 80  | 50  | 25 | 22,2            |
| Sur    | 35            | 245       | 20 | 30 | 45  | 70  | 45  | 25  | 10 | 38,8            |
| Total  | 120           | 840       | 45 | 75 | 125 | 240 | 185 | 115 | 55 | 29,2            |

### Corte semanal · todas las zonas

Fechas fijas; no usar la fecha actual del dispositivo para cambiar el período de la demo.

| Semana | Fechas de septiembre 2026 | Registros | 1  | 2  | 3   | 4   | 5   | 6   | 7  |
| ------ | ------------------------- | --------- | -- | -- | --- | --- | --- | --- | -- |
| 1      | 01–07                     | 180       | 10 | 20 | 25  | 55  | 40  | 20  | 10 |
| 2      | 08–14                     | 220       | 10 | 20 | 30  | 60  | 50  | 35  | 15 |
| 3      | 15–21                     | 200       | 10 | 15 | 30  | 60  | 45  | 25  | 15 |
| 4      | 22–28                     | 240       | 15 | 20 | 40  | 65  | 50  | 35  | 15 |
| Total  | 01–28                     | 840       | 45 | 75 | 125 | 240 | 185 | 115 | 55 |

### Reglas de lectura

- Los conteos son la fuente del gráfico. Un porcentaje siempre muestra su denominador; usar coma decimal y un decimal, sin presentar la precisión como validación científica.
- La distribución general proviene de sumar registros, no de promediar porcentajes de zonas. Niveles 1–3: `245 / 840 = 29,2 %` al redondear.
- La variación del volumen entre semanas no mide mejora o empeoramiento de salud. Tampoco los participantes representan una muestra de toda la población municipal.
- No mostrar promedio de ánimo, índice de riesgo, predicciones, umbrales clínicos, correlaciones ni prioridades automáticas. Las barras conservan los siete niveles y sus rótulos.
- La ausencia de datos se explica como «Sin datos en esta maqueta», nunca como cero riesgo o cero necesidad. El diseño no simula otras zonas o períodos al tocar filtros.

## Qué queda afuera de la conversación y de ANI-80

| Tema                                    | Estado y respuesta del presentador                                                                                                    |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Tablero institucional operativo          | Es una maqueta. No consulta una base, no integra fuentes públicas y no monitorea una comunidad.                                         |
| Conexión del registro al gobierno        | No implementada. La pantalla 2 muestra una captura real; las demás cifras se escribieron para la demo.                                  |
| Riesgo individual o prevención demostrada | No se evalúan ni se afirma eficacia clínica. No hay alertas, triaje ni un sistema que recomiende intervenciones.                        |
| Catálogos de emociones y factores        | Pendientes de ANI-96/ANI-50; no introducir categorías del mock ni factores en el tablero antes de contar con ese catálogo.               |
| Guardado, autenticación e historial      | Pendientes de integración; el código actual conserva un borrador en la sesión de la pestaña.                                          |
| Calendario, gráficos personales e informe | Previstas en ANI-71/ANI-73/ANI-94/ANI-95; no presentar PDF, CSV o JSON como disponibles.                                                 |
| Geolocalización, datos de edad o sexo     | No se recopilan en la app actual ni se proponen filtros de estos datos en la maqueta.                                                   |
| Dispositivos, sueño o frecuencia cardíaca | Apple Health, Samsung Health e integraciones de sensores están fuera del alcance del 27/10.                                             |
| Chat, LLM, gamificación y recordatorios   | Fuera del alcance. La ayuda ofrece teléfonos; Eudila no opera un servicio de atención.                                                  |
| Producción, precio, calendario y piloto   | No se prometen acuerdos, infraestructura lista, plazos ni acceso garantizado a datos institucionales; son temas para definir en conjunto. |

## Entrega para ANI-80

Construir únicamente estas seis pantallas y la navegación descrita, en Figma o HTML estático externo al repositorio de producto, según ANI-80. El guion es documentación versionada; la maqueta no se implementa en Next.js ni se incorpora a este repo. Usar wordmark propio, tokens existentes, una pregunta o decisión principal por pantalla y contenido legible en celular. El material viejo sirve para la composición de mapa, barras y detalle; no reutilizar su identidad, logos, categorías o índices.

La captura de la pantalla 2 se obtiene de la app Next.js con un borrador nuevo y Neutral (4), sin inventar una pantalla de historial. El mapa se dibuja como tres zonas esquemáticas propias, sin tiles ni assets institucionales. Cada zona tiene un detalle basado en la tabla completa; el único período disponible es 01–28 septiembre de 2026.

La pantalla 6 y el regreso al mapa no deben introducir filtros nuevos. No hay formularios que simulen entregar mensajes, transferir registros o guardar decisiones. GitHub es el único destino externo del guion actual.

Para revisar la maqueta de ANI-80: recorrer 1 → 2 → 3 → 4 → cada detalle de zona → 6; volver desde el detalle; comprobar teclado, texto ampliado y celular; comprobar que todos los bloques conservan «Datos simulados» incluso al capturarlos por separado. El prototipo debe poder abrirse sin red después de descargado, con la captura y geometría incluidas; los enlaces de GitHub requieren conexión. Esa construcción y su comprobación corresponden a ANI-80.
