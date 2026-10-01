# eudila

Repositorio nuevo para la app de registro emocional. El historial empieza acá y no incluye los assets institucionales del prototipo anterior. Licencia: AGPL-3.0, ver `LICENSE` y `NOTICE.md`.

## Prototipo de referencia

`prototype/` permite probar el flujo, la identidad visual y la pantalla de ayuda mientras se integra la app definitiva. Para abrirlo, ejecutá `python3 -m http.server 8000` y visitá `http://localhost:8000/prototype/`. No requiere instalar dependencias. La ayuda queda disponible sin conexión después de la primera carga.

Este prototipo no es el scaffold Next.js de ANI-48 que Joaco tiene asignado. El borrador vive en `sessionStorage` y aún no se guarda como registro terminado. El paso de tipo usa provisionalmente las opciones enumeradas en ANI-63 hasta que Noelia las confirme. Falta integrar el esquema y catálogo de ANI-50/ANI-96, y la confirmación y guardado de ANI-66. `prototype/config.js` espera la URL y la clave pública de lectura de la base; no usa categorías del mock viejo. La pantalla de ayuda contiene teléfonos y horarios contrastados con fuentes oficiales; falta incorporar el texto final de ANI-59 cuando Noelia lo entregue.

La identidad sigue el brandbook Eudila v1.0 de uso interno, guardado fuera del repositorio público. Las ocho capturas de `fotos inspiracion/` del checkout original orientan la estructura de una pregunta por pantalla y acciones al pie. Sus ilustraciones y categorías de muestra no se distribuyen acá.

El inicio muestra el orbe Neutral con una entrada de 600 ms una sola vez por pestaña. Un toque o una tecla la terminan sin consumir la acción; el registro y Ayuda siguen disponibles durante la entrada. Volver o recargar muestra el estado final. Con movimiento reducido, almacenamiento inaccesible o pestaña inicialmente oculta, el orbe aparece estático. Una pestaña nueva permite ver nuevamente la entrada.

Para comprobar ANI-69 en un navegador real: `uv run --with playwright python prototype/splash.test.py`. El script inicia su propio servidor local y usa Chrome en macOS; `CHROME_BIN` permite indicar otro ejecutable Chromium. En otros sistemas, se puede instalar el navegador de Playwright con `uv run --with playwright playwright install chromium`. Playwright se usa solo en la comprobación, no en la app. El estado del registro se comprueba con `node --test prototype/flow-state.test.mjs`.

## Integración

Joaco puede crear la app Next.js en la raíz sin sobrescribir este prototipo. Agustín puede portar desde `prototype/app.js` el estado único, las rutas y el selector de emoción, y desde `prototype/ayuda.html` la pantalla de ayuda. La barra global de ANI-61 debe mantener visible el acceso a ayuda en todas las rutas. El repositorio anterior queda donde está; el trabajo nuevo sigue en `Eudila/eudila`.
