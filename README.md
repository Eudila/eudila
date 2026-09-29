# eudila

Registro emocional en el navegador. Este repositorio tiene historial nuevo y no incluye los assets del prototipo anterior.

## Ejecutar

Serví esta carpeta con un servidor estático local (por ejemplo, `python3 -m http.server 8000`) y abrí `http://localhost:8000`. No requiere instalar dependencias. La pantalla `ayuda.html` y la app se guardan para uso sin conexión después de la primera carga.

## Estado

- El borrador del registro vive en `sessionStorage`; sobrevive a una recarga de la pestaña y se borra al descartarlo. Todavía no se envía ni se guarda como registro terminado.
- El selector de emoción espera el catálogo de ANI-96 y el endpoint de lectura de ANI-50. Configurá `config.js` cuando Pablo entregue URL y clave pública de lectura. La app no usa las emociones de muestra del prototipo viejo.
- La pantalla de ayuda usa datos telefónicos contrastados con el prestador. El texto clínico final de ANI-59 debe incorporarse cuando Noelia lo entregue.
- La identidad visual sigue el brandbook Eudila v1.0, guardado fuera de esta carpeta por estar marcado “uso interno”. Figtree está incluida con su licencia propia. Las ocho capturas de `fotos inspiracion/` del checkout original orientan la estructura de una pregunta por pantalla y acciones al pie; sus ilustraciones y categorías de muestra no se distribuyen aquí.

## Publicación

Revisar `git log --all --name-only` antes de abrirlo al público. Mantener el repositorio antiguo privado como archivo. Licencia: AGPL-3.0, ver `LICENSE`.
