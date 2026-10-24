# Momentos de la mascota · F4 · 24/10/2026

Cierra VIS-16 sobre las rutas Next.js reales (`next dev` con vista previa en `127.0.0.1:3130`, rama `147pop/kelpfish`). Tiempos y coreografías de la tabla de momentos del [README de la mascota](../../mascota/README.md).

- [Saludo](saludo.png) a 150, 550, 1050 y 1800 ms en `/`: núcleo con rebote, capas de adentro hacia afuera, destellos, salto y reposo. También en `/bienvenida`. Una vez por sesión (`sessionStorage`), compartido entre las dos rutas; reemplaza al splash sin demorar la tarea (VIS-09 sigue abierta).
- Escucha: ver [F2–F3](../mascota-animo-2026-10-24/README.md).
- [Guardado](guardado.png) a 300, 900 y 1500 ms: al guardar, `/hoy` muestra «Guardamos tu registro.» (`role="status"`) con la mascota del ánimo registrado. Las capas entran al núcleo, destella y se reabre con ojos felices. Es la misma coreografía en los siete estados. Aparece una sola vez, en la navegación posterior al guardado; recargar no la repite. No demora la navegación.
- [Descanso](descanso-hoy.png): en los vacíos de Hoy y Calendario, de día la mascota Neutral está despierta; entre las 22 y las 7 h descansa (ojos cerrados, respiración al doble, brillo 70 %).
- [Ayuda](ayuda.png) a 300, 1300, 2400 y 3200 ms: en el primer uso (`localStorage`) asoma desde abajo junto al título, mira a los costados y sube de un salto. Los teléfonos no esperan a la animación; sin JS, la copia offline muestra el orbe estático.
- Toque: toda mascota reacciona al toque o clic (salto o sacudida); ningún otro evento del puntero.

Con movimiento reducido no se reproduce ningún momento y la mascota queda quieta (verificado por píxeles del canvas). La marca «visto» se guarda después de montar, para que el doble montaje de React no consuma el momento.

Verificación:

- Chromium a 390 × 844 con capturas cuadro a cuadro de cada momento; sin errores JS ni desbordamiento.
- `app/frontend.test.py` (build de producción con vista previa): registro, edición, guardado/reintento, calendario, descargas, PDF y reflujo.
- `app/ayuda/ayuda.test.py`, `app/registro/emociones.test.py` y `app/design-actions.test.py`: exit 0.
- `app/tokens/tokens.test.py` falla por `[@media(max-height:600px)]` en `app/registro/registro.tsx`, que ya existía en `main` (`5b87a71`) y no viene de esta tanda.

No se probó Safari físico.
