# Carita consistente y colores del estado en el registro · 24/10/2026

Pedido del usuario: «que en todas las pantallas el eudila con los ojos aparezca de forma consistente y adaptá los colores de cada estado de ánimo al registrarlo: el fondo y los botones cuando se elige ese estado». Rutas Next.js reales con `next dev` y vista previa en `127.0.0.1:3130`.

- [Antes](registro-antes.png) y [después](registro-despues.png), Muy desagradable (arriba) y Agradable (abajo): ánimo, emoción, factores, revisión y Hoy. Antes, al salir del slider el fondo caía al violeta base sin luces (casi negro) y la selección seguía en turquesa. Ahora el ambiente del estado se mantiene hasta la revisión; la emoción y el factor elegidos usan el acento del estado con su tinta AA, y los enlaces el tono claro del orbe. Hoy vuelve a Aurora porque el registro terminó.
- [Caritas en fichas](caritas-fichas.png) (1, 3, 6 y 7) e [historial](caritas-historial.png) (resumen y lista): misma expresión que la mascota viva, quieta, con la cara ×1,75 en tamaños compactos.

Causa del fondo: React fijaba `--mood-ambient` en el shell y el controller del slider escribía la misma propiedad por cuadro y la borraba al desmontarse; como React veía el mismo valor, no la volvía a escribir. Ahora React escribe `--mood-base`, el controller `--mood-live`, y el CSS resuelve `--mood-ambient: var(--mood-live, var(--mood-base, canvas))`.

Verificación:

- `app/design-mood.test.py` suma una regresión: después de la navegación cliente del slider a emoción, `--mood-ambient` coincide con el ambiente del estado. Falla con el código anterior y pasa con el arreglo. También 7 ambientes, contraste y 84 casos de reflujo.
- `app/mood/motion.test.py` y `app/mood/continuous.test.py` en Chromium, WebKit y Firefox; `app/design-actions.test.py` (7 pares AA, que son los mismos que usa la selección); `node --test app/mood/*.test.mjs`.
- Tono de enlaces `color-mix(orbe 45%, blanco)`: el peor caso da 5,43:1 entre los siete ambientes, el medio, el piso y la tarjeta.

## Acción coral por defecto

[Inicio, Hoy vacío y con datos, Calendario, Evolución, Ayuda, momento del registro y bienvenida](accion-coral.png) con la acción coral: rellenos `#E65175` con tinta Grafito (4,65:1) y texto o contorno `#F6C2CF`, que mantiene ≥4,6:1 en la luz más clara de Aurora sobre tarjeta. Dentro del registro, después de elegir el ánimo, siguen mandando el acento del estado y su tono claro. `app/design-actions.test.py` ahora compara el relleno con `--color-action-fill`: 7 pares AA, estados y 54 casos de reflujo. `design-mood`, `motion` y `continuous` pasan en los tres motores.
