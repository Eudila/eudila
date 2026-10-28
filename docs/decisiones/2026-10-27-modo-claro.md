# 27/10/2026 · Modo claro por defecto

Pedido del usuario: que todo eudila (app, landing y panel) use el modo claro por defecto.

Decisión: los tokens canónicos de `packages/brand/tokens.css` pasan a los valores claros del diseño «Panel del psicólogo» (página Claro): lienzo `#f6f4fa` → piso `#ece8f4`, superficie blanca, texto `#1a1626` (la tinta de «Lisa»), secundario `#4f4862`, acción coral oscurecida `#a62a54` y ambientes pastel por estado (`#efe3fa` … `#fce1e7`). Se conservan la luz coral de arriba, el relleno coral con tinta Grafito y los colores de los siete estados. La app y la landing toman los tokens del paquete; las reglas que asumían fondo oscuro (anillos de foco, Ayuda, flechas del ánimo, halo del slider, acción teñida por el ánimo, botón de Google, `theme-color`) se ajustaron al claro.

Contraste medido (WCAG 2.x): texto ≥ 15:1, secundario ≥ 6,5:1, acción ≥ 5,2:1 sobre lienzo, piso y tarjetas; la acción teñida por el ánimo ≥ 6,7:1 en los siete ambientes; bordes de campos 3,06:1; relleno coral con Grafito 4,65:1.

Excepciones deliberadas:

- La apertura de `/bienvenida` conserva el escenario oscuro «Lisa» con las luces bajas: chispas, anillos y núcleos son luz blanca. La tinta de nombres, lema, wordmark, Saltar y Ayuda sigue a las luces (`--intro-dim`) y la página clara vuelve cuando el logo aterriza en el header. Ya no sube las luces al 60 % en el florecimiento: sobre claro se veía gris.
- La película, su póster, la imagen OG y los íconos de la app siguen oscuros: son piezas renderizadas aparte.
- El informe impreso ya era claro.

No hay selector de tema ni se sigue `prefers-color-scheme`. Los valores oscuros quedan en el historial de Git y en la página Oscuro del canvas de diseño.

Las capturas del teléfono de la landing se regeneraron en claro con `landing/scripts/capture-app.cjs`, que ahora elige la tinta de la barra de estado según el fondo.

Verificación: lint, tipos, formato, pruebas Node, build de app, dashboard y landing; capturas de 18 pantallas de la app a 390 px, la apertura cuadro a cuadro y la landing a 1440 y 390 px.
