# Apertura del onboarding · 26/10/2026

Segunda versión de la apertura de `/empezar` (pedido: «una animación inicial que muestre lo que puede hacer un motion designer, como un showreel»). Reemplaza a la versión de Sonnet 5.5, que queda en la rama `147pop/intro-sonnet` (commit `a8f045b`) para comparar. Coreografía y reglas en la fila «Apertura» del [README de la mascota](../../mascota/README.md).

Archivos:

- [apertura-390.webm](apertura-390.webm): la pieza completa a 390 × 844, desde la carga de la página.
- [comparacion-sonnet-opus.webm](comparacion-sonnet-opus.webm): las dos versiones lado a lado, mismas condiciones.
- [cuadros-390.png](cuadros-390.png) cada 0,5 s · [cuadros-390-sonnet.png](cuadros-390-sonnet.png) para comparar.
- [320-texto-200.png](320-texto-200.png): el péndulo a 320 × 568 con texto al 200 %.
- [escritorio-1440.png](escritorio-1440.png): 1440 × 900.
- [reducido-y-saltar.png](reducido-y-saltar.png): primer cuadro con movimiento reducido (sin apertura) y página tras saltar.

## Qué cambia frente a la versión anterior

- **Arranca y termina en el logo del header.** El logo estático se reemplaza por el del lienzo en el mismo cuadro (sin salto visible), guarda el wordmark dentro del orbe, se pliega a su núcleo y cae como chispa. Al final el lockup vuela de vuelta al header, escala y posición medidas en la página real, y se intercambia por el SVG en el cuadro de llegada. El giro de capas se programa para aterrizar en el mismo ángulo que `logo-mascota.svg`.
- **Péndulo en lugar de recorrido.** Desde Neutral, un estado por pulso de marca (600 ms, `cubic-bezier(.32,.72,0,1)`), alternando lados: 4 → 3 → 5 → 2 → 6 → 1 → 7. Ningún extremo es la meta y todos duran lo mismo. Nombre del estado que entra del lado hacia el que va el orbe y el slider real en miniatura (pista de 6 px, pulgar con halo de 9 px).
- **Los siete juntos.** Cada estado sube desde su lugar en el slider y queda en fila, mismo tamaño, cada uno con su reloj, sobre un reflejo («un espejo tranquilo»). Después se funden en un solo núcleo con un anillo por estado.
- **Cámara y profundidad.** Polvo en profundidad con paralaje y estelas por velocidad de cámara; empuje lento en la chispa, golpe en cada impacto, alejamiento para ver a los siete y empuje rápido al fundirse.
- **Contraste de tempos:** silencio inicial, aceleración de la chispa, impacto, pulso regular, pausa, aceleración y un respiro con el núcleo solo antes de la marca.
- **Saltar deja el foco en el título** (la anterior lo dejaba en `body`: enfocaba antes de que la sección dejara de ser `inert`).
- **El formulario no destella** antes de la apertura: el servidor ya la renderiza (cookie de sesión `eudila-intro`), y el formulario aparece escalonado cuando el lockup llega al header.

## Verificación (Chromium headless, Playwright, `next dev` en `localhost:3111`, Supabase local)

| Caso | Resultado |
| --- | --- |
| 390 × 844, carga completa | 788 cuadros, mediana 59,9 fps, p95 16,7 ms, máximo 16,8 ms; sin errores; foco final en el título; sin desborde horizontal |
| 1440 × 900 | p95 16,8 ms, máximo 33,5 ms (antes de limitar el lienzo a ~2,6 Mpx: p95 33,4 ms) |
| 320 × 568 | sin desborde; fila de siete y lockup dentro de la pantalla |
| 320 × 568 y 390 × 844, texto al 200 % | sin desborde; nombres de estado completos, sin cortar palabras ni tapar «Saltar» |
| Movimiento reducido | se omite, como todos los momentos (regla 5 del README de la mascota): el CSS la oculta antes del script y el formulario se ve y se completa desde el primer cuadro, igual que espera `app/auth/browser.test.py`; si se activa a mitad, corta en el acto |
| Saltar (Esc) | sale en 300 ms; foco al título (la versión anterior lo dejaba en `body`) |
| Teclado durante la apertura | Ir al contenido → Ayuda ahora → Saltar la presentación; el formulario queda `inert` |
| Ayuda | «Ayuda ahora» queda encima y responde durante toda la apertura |
| Una vez por sesión | navegación cliente y carga completa la reproducen una vez; recargar después no la repite |
| Contraste (píxeles del video) | «Saltar» ≥ 10,2:1 en todo el recorrido; nombre del estado ≥ 4,4:1 en el peor cuadro (texto grande, mínimo 3:1) |

Además: `tsc`, `eslint app --max-warnings=0`, `prettier --check .` y las 12 pruebas de `app/mood/*.test.mjs` pasan.

Límites honestos:

- El rendimiento se midió en Chromium headless en una Mac (Apple Silicon). **No se probó en un celular real** ni con CPU limitada; en equipos lentos el reloj propio estira la pieza en vez de saltar pulsos.
- No se probaron Safari, Firefox ni iOS.
- Las capturas al 200 % fijan el `font-size` del `<html>` antes de hidratar, lo que produce un aviso de hidratación propio de la prueba, no de la app.
- Se probó y se descartó un cuadro fijo con «Continuar» para movimiento reducido: agregaba un paso y contradecía la regla de omitir los momentos.
- `app/auth/browser.test.py` no se corrió completo (sus enlaces de email apuntan al puerto 3000); se verificó por separado el paso que usa: con movimiento reducido el campo «Nombre o apodo» se completa enseguida.
- Los nombres de estado crecen con el texto hasta el 10 % del ancho: son decorativos (`aria-hidden`) y duran un pulso; la pantalla de ánimo real sigue escalando sin tope.
- El contraste se estimó sobre cuadros de video comprimido, no con el color calculado de cada píxel del lienzo.
