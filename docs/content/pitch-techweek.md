# eudila · Pitch para TechWeek

Versión de ensayo: 15/10/2026. El objetivo es una conversación de pie de 60 a 90 segundos, repetible y sin depender de leer este documento.

## Pitch base

Registrar cómo nos sentimos parece simple, pero muchas personas llegan a una consulta sin una forma clara de reconstruir qué les pasó entre encuentros. Eudila es una aplicación web abierta para registrar ánimo, emociones y factores de vida en pocos pasos, sin juzgar lo que la persona siente.

La persona puede revisar su historia, generar un informe para llevar a su psicólogo y descargar sus datos en PDF, CSV o JSON. Los archivos se crean en el navegador, sin enviarlos a otro servidor para exportar. Una cuenta sí requiere almacenamiento seguro, que estamos integrando con Supabase.

Para equipos públicos, Eudila puede desplegarse y adaptarse con reglas claras de acceso y privacidad. Para profesionales, sirve como apoyo descriptivo entre consultas, no como diagnóstico ni sistema de crisis.

Buscamos aliados para probar el enfoque, revisar el producto y construir implementaciones responsables. El código ya puede auditarse en GitHub y la demo institucional usa solo datos simulados.

**Cierre:** «¿Desde qué lugar te interesa: implementación, práctica profesional, inversión o código?»

## Pedido según la persona

### Funcionario o equipo público

«Queremos entender qué necesitaría tu equipo para evaluar una implementación local: qué datos tendría sentido reunir, quién podría acceder y cómo se ofrecería ayuda. Buscamos una reunión de trabajo para revisar esas condiciones; no estamos ofreciendo hoy un tablero operativo.»

### Inversor o incubadora

«Buscamos validar un modelo de servicios alrededor del software abierto: despliegue, adaptación, infraestructura y soporte. Nos sirve conversar sobre pilotos responsables, llegada a instituciones y sostenibilidad sin vender datos personales.»

### Desarrollador

«El repositorio es público bajo AGPL-3.0. Buscamos revisión y contribuciones acotadas en accesibilidad, seguridad, integración con Supabase y experiencia móvil. Si te interesa, te mostramos el issue concreto antes de escribir código.»

### Profesional de la salud

«Queremos revisar si el registro y el informe resultan útiles entre consultas, si el lenguaje es prudente y qué límites deben quedar visibles. No pedimos que valides eficacia clínica: buscamos una revisión profesional del contenido y del recorrido.»

## Respuestas acordadas

### ¿Por qué open source si quieren venderlo?

El código es abierto para que pueda auditarse, adaptarse y no encierre a una institución en un proveedor. El negocio no es vender el código ni los datos personales: son el despliegue, la adaptación, la infraestructura y el soporte. Una organización también puede operarlo por su cuenta respetando la licencia.

### ¿Qué pasa si alguien está en crisis usando la app?

Eudila no diagnostica, no evalúa riesgo y no reemplaza atención profesional. La ayuda humana debe estar disponible en un toque, con recursos y alcances claros. No usamos un chatbot para intervenir en una crisis. Ante una urgencia, la respuesta es contactar servicios de emergencia o atención de crisis de la jurisdicción.

### ¿Tienen datos reales?

No para la demo institucional. Sus gráficos usan un conjunto fijo de datos simulados y están rotulados como tales. La app puede trabajarse en modo de vista previa; la persistencia autenticada y sus reglas de acceso deben verificarse antes de una implementación real. No presentamos resultados clínicos ni poblacionales.

### ¿Cuál es el modelo de negocio?

Servicios sobre una base abierta: implementación, configuración, integraciones, alojamiento administrado, mantenimiento, capacitación y soporte. El modelo todavía debe validarse con organizaciones. No depende de publicidad ni de vender información personal o de salud.

### ¿En qué se diferencian de otras apps?

Portabilidad y auditabilidad: la persona puede llevar un informe a su profesional y descargar los datos completos en formatos abiertos. La exportación se genera en el navegador sin un servidor adicional de archivos. El producto evita diagnósticos automáticos, gamificación del ánimo y promesas clínicas; pone el registro, la ayuda humana y los límites en primer plano.

## Precisión técnica que no debe variar

- PDF, CSV y JSON se generan en el navegador. Esto evita enviar los registros a un servidor adicional para crear el archivo.
- Una versión con cuenta puede almacenar registros remotamente; Supabase, autenticación, RLS y acceso al historial deben verificarse antes de presentarlos como producción.
- La demo institucional es una maqueta con datos simulados, sin conexión a registros reales.
- Eudila no diagnostica, no estima riesgo individual ni opera un servicio de crisis.
- El modelo comercial no incluye venta de datos personales o de salud.

## Roles para la weekly del 22/10

Completar nombres antes de ensayar:

| Rol | Persona | Responsabilidad |
| --- | --- | --- |
| Conversación con gobierno/salud | Pendiente | Pitch, límites clínicos y pedido de reunión |
| Conversación con inversión/incubadora | Pendiente | Modelo de servicios y pedido concreto |
| Conversación técnica | Pendiente | Open source, arquitectura y contribuciones |
| Operación de la demo | Pendiente | Abre rutas, mantiene el flujo y no improvisa datos |
| Respaldo sin conexión | Pendiente | Capturas locales, QR y recuperación si falla la red |

La misma persona puede cubrir más de un rol, pero siempre debe haber alguien hablando y otra persona manejando la demo. Quien opera no completa formularios ni usa información real durante la conversación.

## Ensayo medido · 22/10

Hacer tres rondas por persona: limpia, con ruido/interrupción y con una pregunta difícil. Cronometrar desde la primera palabra hasta el pedido final.

| Persona | Ronda | Tiempo | Sin leer | Pedido claro | Límites correctos | Observaciones |
| --- | ---: | ---: | :---: | :---: | :---: | --- |
| Pendiente | 1 |  |  |  |  |  |
| Pendiente | 2 |  |  |  |  |  |
| Pendiente | 3 |  |  |  |  |  |
| Pendiente | 1 |  |  |  |  |  |
| Pendiente | 2 |  |  |  |  |  |
| Pendiente | 3 |  |  |  |  |  |

ANI-81 puede pasar a Done cuando al menos dos personas completen una ronda en menos de 90 segundos sin leer, las cinco respuestas estén acordadas y los roles de conversación, demo y respaldo tengan nombre.
