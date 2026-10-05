# Referencias de la app · comparación con eudila

Análisis del 04/10/2026. Ocho capturas aportadas por el usuario y movidas a esta carpeta. Son material de referencia; no se incorporan como assets de la aplicación.

| Captura | Contenido visible | Estado en el frontend actual |
| --- | --- | --- |
| IMG_2887.PNG | Selección de emoción, nueve opciones y siguiente | Cubierto por selector de emociones con catálogo, sugerencias y búsqueda; conservar identidad y catálogo de Eudila. |
| IMG_2888.PNG | Causa de la emoción y pensamiento asociado; dos textos de hasta 250 caracteres | Faltan campos de texto libre. Los factores actuales son categorías y no sustituyen estos relatos. |
| IMG_2889.PNG | Horas dormidas con selector de 1 a 10 | Falta registro de sueño. La captura mide horas, aunque el título mencione higiene; no acredita medir calidad ni hábitos. |
| IMG_2890.PNG | Aprendizaje del día, texto hasta 250 caracteres | Falta reflexión/aprendizaje opcional. Adaptar al voseo y tono sin juicio. |
| IMG_2892.PNG | Mejor momento con foto de galería y opción omitir | Falta adjuntar foto opcional y su presentación posterior. |
| IMG_2893.PNG | Mis Apuntes, calendario mensual con emociones | Calendario emocional ya implementado; no es un módulo faltante completo. |
| IMG_2894.PNG | Detalle diario: emoción, sueño, aprendizaje y mejor momento; añadir | Detalle diario existe para ánimo, emoción y factores. Faltan los nuevos contenidos y la acción de añadir al día. |
| IMG_2895.PNG | Mis Logros, divisiones bronce/plata/oro/diamante | No implementado. La gamificación está fuera del alcance actual documentado; la captura no define reglas para ganar divisiones. |

## Navegación

Las referencias muestran seis destinos mediante iconos: Hoy, apuntes, logros, lectura, información y cuenta. Lectura/información/cuenta se infieren de los iconos, sin pantallas que permitan conocer su contenido. La app actual usa Registrar, Hoy y Calendario, con enlaces adicionales a evolución/factores/exportación. Falta resolver cómo acceder de forma consistente a cuenta y a los contenidos nuevos; no copiar seis pestañas sin definir sus tareas.

## Prioridad propuesta

1. Textos opcionales de contexto y pensamiento dentro del registro; mantener camino corto con omitir.
2. Aprendizaje/reflexión opcional y actualización de Hoy/detalle diario para mostrar esos contenidos.
3. Horas de sueño como dato del día, definiendo si se registra una sola vez y cómo corregirlo. Evitar limitar el dato a 1–10 solo por reproducir la captura.
4. Foto opcional del momento, con selección, previsualización, reemplazo/eliminación y su inclusión en el detalle.
5. Navegación coherente entre registrar, historial y cuenta.
6. Decisión separada sobre logros; no deducir reglas de medallas de una imagen.

## Modelo y alcance

`eudila/app/historial/records.ts` contiene fecha, tipo, ánimo, emoción, factores y fuente de vista previa. No contiene relatos, horas, reflexión ni foto. Agregar pantallas sin extender borrador, guardado de vista previa, detalle y exportaciones dejaría el recorrido incompleto. Separar información por registro (contexto/pensamiento) de información por día (sueño/reflexión/momento) antes de implementar para no duplicar datos con varios registros diarios.

Esta comparación es de capturas y código actual, no una validación del backend. Se conserva la marca de Eudila: voseo, orbe, neutros y catálogo aprobado. No copiar ilustraciones, logos ni categorías de la referencia como assets del producto.

## Backlog en Linear

- [ANI-100 · Contexto y pensamientos](https://linear.app/anima-org/issue/ANI-100)
- [ANI-101 · Horas de sueño](https://linear.app/anima-org/issue/ANI-101)
- [ANI-102 · Reflexión diaria](https://linear.app/anima-org/issue/ANI-102)
- [ANI-103 · Foto de un momento](https://linear.app/anima-org/issue/ANI-103)
- [ANI-104 · Mis Apuntes y detalle diario](https://linear.app/anima-org/issue/ANI-104)
- [ANI-105 · Navegación ampliada](https://linear.app/anima-org/issue/ANI-105)
- [ANI-106 · Logros, divisiones y medallas](https://linear.app/anima-org/issue/ANI-106)

Las capturas se conservan por solicitud del usuario como documentación de referencia, no como recursos del producto. Su inclusión no les atribuye la licencia AGPL del código; no se declara titularidad ni permiso de reutilización de sus ilustraciones o marcas.
