# eudila

Repositorio nuevo para la app de registro emocional. El historial empieza acá y no incluye los assets institucionales del prototipo anterior. Licencia: AGPL-3.0, ver `LICENSE` y `NOTICE.md`.

## Prototipo de referencia

`prototype/` permite probar el flujo, la identidad visual y la pantalla de ayuda mientras se integra la app definitiva. Para abrirlo, ejecutá `python3 -m http.server 8000` y visitá `http://localhost:8000/prototype/`. No requiere instalar dependencias. La ayuda queda disponible sin conexión después de la primera carga.

Este prototipo no es el scaffold Next.js de ANI-48 que Joaco tiene asignado. El borrador vive en `sessionStorage` y aún no se guarda como registro terminado. Falta integrar el paso de tipo de registro de ANI-63, el esquema y catálogo de ANI-50/ANI-96, y la confirmación y guardado de ANI-66. `prototype/config.js` espera la URL y la clave pública de lectura de la base; no usa categorías del mock viejo. La pantalla de ayuda contiene teléfonos y horarios contrastados con fuentes oficiales; falta incorporar el texto final de ANI-59 cuando Noelia lo entregue.

La identidad sigue el brandbook Eudila v1.0 de uso interno, guardado fuera del repositorio público. Las ocho capturas de `fotos inspiracion/` del checkout original orientan la estructura de una pregunta por pantalla y acciones al pie. Sus ilustraciones y categorías de muestra no se distribuyen acá.

## Integración

Joaco puede crear la app Next.js en la raíz sin sobrescribir este prototipo. Agustín puede portar desde `prototype/app.js` el estado único, las rutas y el selector de emoción, y desde `prototype/ayuda.html` la pantalla de ayuda. La barra global de ANI-61 debe mantener visible el acceso a ayuda en todas las rutas. El repositorio anterior queda donde está; el trabajo nuevo sigue en `Eudila/eudila`.
