# Logo y navegación · iteración local · 11/10/2026

Pedido: logo arriba a la izquierda e iconos sobre las etiquetas existentes de la barra inferior. La entrega integra main `5f4374b`, el ánimo de `feat/mood-orb-motion` hasta `8e522ae` y esta iteración, en `feat/logo-navigation-local`. El usuario autorizó su integración y publicación en el remoto; el PR identifica los commits finales.

- [Registro a 390 × 844](registro-390.png).
- [Registro a 320 × 568](registro-320.png).

Capturas de la ruta Next.js `/registro/emocion` servida en `http://127.0.0.1:3000`, con preview=true. No se oculta el aviso de vista previa ni la insignia de desarrollo de Next.js.

Referencia: brandbook v1.0 pp.3–4 y 9, revisado visualmente. Logo Neutral de cinco capas translúcidas y núcleo blanco, en vector estático sin máscara de app; material tomado del renderer existente del repositorio. Wordmark Figtree Bold y tracking −0.045em. En Chrome: símbolo visible 24 px y altura de x 20 px, relación 1.2:1; padding/separación cumplen medio diámetro de respeto. Las tintas del asset son las de marca; la UI conserva sus tokens.

Lápiz, reloj y calendario reutilizan los trazos convencionales del repo, con color heredado. Las palabras siguen siendo Registrar/Hoy/Calendario; los SVG son decorativos, sin foco ni nombre duplicado. Se mantienen destinos y `aria-current`. La altura nueva de la barra se compensa en emoción con espacios compactos para pantallas bajas y navegación atrás/progreso/cerrar en una fila; las seis sugerencias siguen visibles a 320 px, con objetivos ≥44 px.

Verificación:

- Chrome: iconos sobre las palabras, nombres accesibles, selección de las tres rutas con teclado, foco y una única pestaña activa. Sin errores JavaScript.
- Ocho combinaciones: 320/390/520/1280 px y texto al 100/200%, sin desbordamiento horizontal y con el main desplazable disponible. Seis sugerencias visibles y táctiles a tamaño normal; reduced motion probado.
- Catálogo `/tokens`: todas las variables CSS expuestas, incluido el tracking específico del wordmark.
- Lint, typecheck, formato, diff y build de producción: exit 0.
- Prueba de concurrencia del worker y suite de Ayuda en producción: exit 0. El SVG queda en la copia offline y se comprueba su carga tras cortar red y recargar. No se agregan datos personales a la caché.
- Recorrido frontend existente sobre localhost: exit 0, registro/edición, preview, historial, exportaciones y reflujo.
- Revisión independiente de código y capturas: sin bloqueantes.

Estas capturas se tomaron durante la revisión local, antes de la publicación. No se cerraron issues/brechas globales por esta iteración. No se probó Safari físico ni se conectó Supabase Cloud.
