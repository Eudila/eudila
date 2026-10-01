# eudila

Un proyecto de código abierto para registrar cómo te sentís y acercarte a recursos de ayuda.

## Un espejo tranquilo para cada estado de ánimo

Un momento para poner en palabras lo que sentís, a tu manera. Estamos construyendo una app web de registro emocional. Ya podés explorar el prototipo y su código.

[Explorar el proyecto](https://github.com/Eudila/eudila#prototipo-de-referencia) · [Ver el código](https://github.com/Eudila/eudila)

## Para gobiernos y equipos de salud

### Una herramienta abierta, una conversación necesaria

En 2025, el SNIC informó una tasa de suicidio de **17,4 en Salta**, frente a **11,8 en el total nacional**, por cada 100.000 habitantes mayores de 5 años. Son cifras del registro policial; su comparación debe considerar diferencias de registro entre jurisdicciones. [Fuente: Ministerio de Seguridad Nacional, SNIC 2025, tabla 138, p. 177; aclaraciones metodológicas, p. 13](https://cloud-snic.minseg.gob.ar/Informes/SNIC/Informe_SNIC_Nacional_2025.pdf#page=177).

Eudila propone una herramienta de registro emocional y acceso a recursos de ayuda que cada equipo pueda estudiar y adaptar. Queremos conversar con provincias, municipios y equipos de salud sobre sus necesidades y sobre el desarrollo de una implementación local.

### Qué podés conocer hoy

Un prototipo web que permite comenzar un registro, elegir el momento y el estado de ánimo, volver sin perder el borrador y abrir la pantalla de ayuda desde el recorrido. El selector de emociones y factores está preparado para un catálogo clínico que aún falta integrar. El borrador permanece en la sesión de la pestaña; todavía no se guarda un historial de registros terminados.

La pantalla de ayuda contiene teléfonos, cobertura y horarios de servicios de atención. Después de la primera carga, se puede volver a abrir sin conexión. La llamada requiere servicio telefónico.

El servicio institucional está en etapa de definición. Las pantallas de dashboard previstas para la demo serán un prototipo visual con datos simulados; no ofrecemos hoy un observatorio ni un tablero operativo.

### Privacidad que se pueda comprobar

El código está publicado para que pueda revisarse. La exportación del historial propio está prevista: un informe PDF que la persona decida compartir y archivos CSV y JSON para llevarse sus registros. Estas funciones todavía no están disponibles.

El diseño previsto genera los archivos en el navegador, sin enviar los datos a un servidor adicional para producirlos. Esto no significa que la app futura carezca de almacenamiento en un servidor. La infraestructura y el acceso a los registros deberán definirse antes de cualquier implementación.

### Registro y ayuda humana

Esta versión no incluye chat con inteligencia artificial. Un estudio publicado en Scientific Reports encontró fallas de respuesta y de información de emergencia en chatbots evaluados con escenarios simulados de ideación suicida. [Fuente: Pichowicz, Kotas y Piotrowski, 2025](https://www.nature.com/articles/s41598-025-17242-4).

Elegimos concentrar este alcance en el registro y el acceso a ayuda humana. Es una decisión del proyecto; el estudio no evalúa Eudila ni demuestra que usarla prevenga suicidios.

### Conversemos sobre tu equipo

Si trabajás en un gobierno o en un equipo de salud, contanos qué herramienta necesitás y qué te gustaría explorar con Eudila.

[Contactar al proyecto en GitHub](https://github.com/Eudila/eudila/issues)

El canal es público: usalo para consultas sobre el proyecto, sin datos personales ni información de salud. No es un canal de atención clínica.

## Para desarrolladores

### Código abierto para construir en conjunto

El repositorio incluye el prototipo de registro y ayuda, el estado y la navegación del borrador, los estilos de Eudila y las comprobaciones disponibles. Usa HTML, CSS y JavaScript nativo, sin dependencias de ejecución. La aplicación definitiva con Next.js y Supabase está prevista y todavía no está integrada.

### Probalo en tu máquina

Necesitás Git y Python 3. Cloná el repositorio y servilo localmente:

```sh
git clone https://github.com/Eudila/eudila.git
cd eudila
python3 -m http.server 8000
```

Abrí [el prototipo local](http://localhost:8000/prototype/). Podés recorrer el inicio, el tipo de registro, la escala de ánimo y la ayuda. El catálogo de emociones y factores todavía no está configurado: la pantalla lo indica y el recorrido no puede completarse ni guardarse. No necesitás credenciales para explorar estas vistas.

### Tus registros, en formatos portables

Está prevista la exportación del historial completo en CSV y JSON, generados en el navegador. El formato se documentará en el README al implementar la exportación, para que otras herramientas puedan leer esos archivos. Hoy todavía no hay exportación, formato publicado ni importador.

### Licencia y contribuciones

El código se publica bajo [AGPL-3.0](https://github.com/Eudila/eudila/blob/main/LICENSE). Los avisos de componentes con otras licencias están en [NOTICE.md](https://github.com/Eudila/eudila/blob/main/NOTICE.md).

Podés abrir un issue con un error reproducible o una propuesta, o enviar un pull request con un cambio acotado y cómo comprobarlo. Para cambios grandes, abrí primero una conversación en los issues. La guía ampliada de contribución está pendiente.

[Leer el README](https://github.com/Eudila/eudila#readme) · [Ver los issues](https://github.com/Eudila/eudila/issues) · [Contribuir con un pull request](https://github.com/Eudila/eudila/pulls)

---

Eudila está en desarrollo. No realiza diagnósticos, no evalúa riesgo individual ni reemplaza la atención profesional. El prototipo no debe usarse para tomar decisiones clínicas.
