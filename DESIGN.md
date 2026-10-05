---
name: eudila
description: Un espejo tranquilo para cada estado de ánimo.
colors:
  primary: "#0C8A86"
  cloud: "#FBFBFD"
  graphite: "#1D1D1F"
  fog: "#6E6E73"
  white: "#FFFFFF"
  line: "#B5B5BA"
  mood-1: "#892FC9"
  mood-2: "#5B4CE1"
  mood-3: "#209AE7"
  mood-4: "#2EC0BC"
  mood-5: "#77CB47"
  mood-6: "#FE9613"
  mood-7: "#FF4A4B"
  orb-1: "#A845DA"
  orb-2: "#8A68D8"
  orb-3: "#3BBADF"
  orb-4: "#5FD3D0"
  orb-5: "#B6D57A"
  orb-6: "#F2B24A"
  orb-7: "#E65175"
typography:
  display:
    fontFamily: "Figtree, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.16
  state:
    fontFamily: "Figtree, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    fontSize: "1.0625rem"
    fontWeight: 600
rounded:
  control: "0.875rem"
  pill: "9999px"
spacing:
  unit: "4px"
  touch: "44px"
  action: "50px"
---

# Sistema visual de eudila

## Overview

**Referencia estética: «Un espejo tranquilo para cada estado de ánimo».** Serena, cálida y precisa; acompaña sin opinar. La identidad se expresa en el orbe y en su respuesta al ánimo, no en ilustraciones genéricas de bienestar.

Este archivo es la guía persistente de marca para la app `eudila/`. Leerlo antes de diseñar o modificar una pantalla. Describe la identidad objetivo y las adaptaciones de accesibilidad; **no certifica que todo esté implementado**. El inventario de diferencias está en [la revisión de marca](docs/design/brand-review-2026-10-04.md). Los valores se implementan en `app/globals.css`; evitar mantener nuevas constantes paralelas.

Autoridad: brandbook Eudila v1.0 de septiembre de 2026 → accesibilidad documentada → videos de Eudila para composición/movimiento → sistema actual para integración. Las capturas IMG_2887–2895 orientan funciones, no reemplazan la estética de Eudila. El `PRODUCT.md` del workspace padre describe una recreación anterior de Anima/WhatsApp y no gobierna la identidad de esta app.

Tema claro y neutro fuera de la experiencia de ánimo. La pantalla de ánimo usa ambiente oscuro del estado con texto legible, orbe central y acción inferior. El video de presentación es una pieza de marca: no copiar el teléfono dibujado, sus bordes, titulares publicitarios, tiempos del montaje ni barras del sistema dentro de la app.

## Colors

Nube para superficies claras, grafito para texto, niebla para texto secundario, turquesa institucional para identidad/acciones. El espectro aparece donde hay un estado emocional real; no pintar autenticación, formularios o navegación con colores emocionales arbitrarios.

| Estado            | Acento  | Orbe    | Texto sobre el acento para controles normales |
| ----------------- | ------- | ------- | --------------------------------------------- |
| Muy desagradable  | #892FC9 | #A845DA | Blanco                                        |
| Desagradable      | #5B4CE1 | #8A68D8 | Blanco                                        |
| Algo desagradable | #209AE7 | #3BBADF | Grafito                                       |
| Neutral           | #2EC0BC | #5FD3D0 | Grafito                                       |
| Algo agradable    | #77CB47 | #B6D57A | Grafito                                       |
| Agradable         | #FE9613 | #F2B24A | Grafito                                       |
| Muy agradable     | #FF4A4B | #E65175 | Grafito                                       |

Azul, turquesa y coral usan grafito como adaptación AA: el blanco indicado en el PDF/video no llega a 4.5:1. Conservar los acentos, cambiar tinta antes de desaturar la marca. El turquesa institucional #0C8A86 con blanco da 4.20:1; para enlaces/textos y botones claros usar el token accesible `--color-action` existente (`color-mix(in srgb, primary 72%, graphite)`), no asumir que primary equivale a action.

Ambiente: degradé vertical de tres paradas, tono del estado arriba, tono apagado al medio, casi negro abajo. Los hex de ambiente actuales (`#32134D`, `#26235B`, `#123F60`, `#0F5654`, `#285B25`, `#6C3B0B`, `#712127`) son traducción técnica existente, no códigos impresos certificados del brandbook. Compararlos con los videos antes de aprobar su fidelidad. La luz pertenece al orbe; no agregar degradados de texto, glassmorphism ni brillo a toda la UI.

Color acompañado por forma, etiqueta y valor accesible. Contraste mínimo: 4.5:1 para texto normal y placeholders; 3:1 para texto grande y controles esenciales. Recalcular frente al fondo real, incluyendo degradés y transparencias.

## Typography

Figtree Bold para wordmark, preguntas y nombres de estados. Sistema/SF Pro o Roboto para cuerpo, controles y datos. Pregunta 28 px equivalentes (`1.75rem`), estado 34 (`2.125rem`), cuerpo/título 17 (`1.0625rem`); rem escalables, no textos fijados que impidan zoom. El rótulo de extremos del PDF es 11 pt, peso alto y tracking +4%; verificar su legibilidad y contraste y permitir crecimiento.

Wordmark siempre `eudila`, minúsculas, sin inclinación ni deformación. El PDF especifica Bold y tracking −45; el header actual usa 800/−0.035em y debe compararse con el lockup de marca. No cambiar todo el display para corregir solo el wordmark ni simular un logo alterando el espaciado al azar.

Preguntas breves, voseo rioplatense, títulos balanceados. Escala de desagradable a agradable; evitar bueno/malo, feliz/triste como equivalencias de ánimo. Sin felicitaciones por estados agradables ni reproches por ausencias.

## Elevation

Superficies sobrias. Separaciones y contornos para grupos que lo necesitan, sin convertir cada párrafo en una tarjeta. `--shadow-shell` existe pero no obliga a proyectar sombras en todos los elementos.

El orbe sí tiene profundidad propia: cinco capas translúcidas, bordes de luz sutiles y núcleo blanco luminoso; no sustituirlo por cinco manchas planas, ni agregar brillo extra al icono de app. Los halos del selector y del orbe son señales explícitas de la marca, no un permiso para halos decorativos en botones/cards.

## Components

### Orbe

Cinco capas más núcleo blanco estable; no usar una sola silueta como logo. Neutral circular sin partículas; estados desagradables con formas angulosas y puntos finos; agradables con formas orgánicas y destellos de cuatro puntas. Siluetas: estrella de nueve puntas, estrella suave de catorce, onda corta, círculo, gota orgánica, flor de siete y flor de nueve pétalos.

Escala/posición: protagonista en ánimo, sin recortar ni estirar; adaptar al alto disponible. Si se reduce en calendario/historial, conservar su significado y no presentarlo como lockup de marca. Símbolo mínimo 24 px, lockup mínimo 88 px, área de respeto de medio diámetro, relación orbe:texto 1.2:1 en altura de x (brandbook pp. 3–4). Icono de app: orbe Neutral al 64% sobre ambiente turquesa, sin texto.

### Movimiento de marca

Cambio coordinado de silueta/color/ambiente: 600 ms, `cubic-bezier(.32,.72,0,1)`. Respiración: 4 s, escala ±1.8%. Giro alterno de capas: 0.05 rad/s (vuelta aproximada de 126 s). Partículas: titileo de 2.5–6 s con fases independientes. No inferir estos parámetros de un montaje: vienen del brandbook.

Con `prefers-reduced-motion: reduce`, orbe fijo y cambios instantáneos. Pausar ciclos en pestaña oculta/desmontaje; no bloquear interacción, no esconder contenido hasta que termine una animación. La transición mantiene una sola etiqueta de estado, sin superponer palabras como ocurre durante algunos cuadros del video.

Movimiento continuo solo donde expresa la marca/estado; no hacer respirar historial, inputs, tarjetas o páginas de acceso. Splash: breve, salteable, no repetido en navegación y sin demorar el registro. Háptica es una capacidad opcional del dispositivo, no una promesa de navegador.

### Control y acción

Slider de ánimo: espectro completo de siete colores, pista visual de 6 px, thumb blanco con punto del estado y halo de 9 px. Mantener semántica de `input[type=range]`, flechas, `aria-valuetext` y área táctil de 44 px o más. Verificar estilos en Chromium, Safari y Firefox al implementar.

Acción principal: cápsula de 50 px mínimos, relleno del acento actual en ánimo y tinta AA de la tabla. Fuera de ánimo, usar action accesible. Inputs/tarjetas/dialogs pueden conservar radio control de 14 px; no confundirlo con el radio de la acción principal. Unificar estados hover/focus/disabled/loading sin cambiar vocabulario entre rutas.

**Implementación del grupo ANI-111/116/117 (04/10/2026):** `.action` define tamaño, alineación y tipografía compartidos; `.action-primary` usa cápsula ≥50 px y `.action-secondary` cápsula con contorno sobre Nube. `.action-text` reserva un objetivo ≥44 px para navegación/acciones de texto. `app/actions.ts` conecta acento/tinta de los siete estados con tokens existentes, exclusivamente en el CTA de `/registro/animo`. No introduce una paleta paralela.

Hover subraya sin cambiar el par de color; active marca un contorno interior. Foco de teclado: anillo interior Nube y exterior Grafito, sin sombra decorativa. Disabled: Niebla sobre Nube (4.91:1), borde discontinuo y sin reducir opacidad del texto. Loading usa etiqueta explícita, `aria-busy` y disabled nativo durante el guardado. `.action-label` reserva el espacio de guardar/reintentar/guardando en una sola celda; solo la etiqueta activa permanece visible y accesible, evitando saltos de altura al 200%. Estos estados no agregan animaciones; reduced motion conserva cambios instantáneos mientras VIS-06 siga abierta. El relleno horizontal de 20 px evita multiplicar el marco al ampliar el texto al 200%.

`--radius-field` y `--radius-card` son alias semánticos de `--radius-control` (14 px), independientes de la cápsula. `.control-choice` identifica opciones de registro/emoción/factores y comparte la selección institucional AA. Excepciones deliberadas: Ayuda del header y el control de contraseña mantienen objetivo ≥44 px; tabs, celdas de calendario, tarjetas de llamada, enlaces dentro de prosa y acciones de texto existentes mantienen su forma/jerarquía con tinta institucional accesible. Auth e historial permanecen neutrales. Ejemplos de todas las variantes, disabled y loading en `/tokens`; evidencia y resultados en [acciones y contraste](docs/design/evidence/visual-actions-2026-10-04/README.md).

### Composición y navegación

En ánimo: atrás izquierda, cerrar derecha, pregunta, orbe, estado, escala/extremos y acción inferior. Círculos visuales de navegación de 32 px con blanco al 14% sobre ambiente, dentro de objetivo táctil mínimo de 44 px. Una pregunta principal por pantalla; el orbe tiene espacio para respirar. Ayuda sigue en un toque, accesible; integrar su presentación sin eliminarla para imitar el video.

Header/tabs/banner no deben partir el ambiente en bandas claras por accidente. La vista previa se identifica honestamente con aviso compacto; su explicación puede vivir en un popover. No ocultar el aviso para embellecer capturas ni imponerlo cuando la configuración no es de preview. Historial, exportación y acceso usan el lienzo neutro y controles familiares.

### Próximas funcionalidades

Diario, sueño, fotos y Logros (ANI-100–106) heredan esta identidad. Los relatos y fotos del usuario son contenido, no ilustraciones de marca. Medallas deben integrarse al sistema, sin importar los assets JBG de la referencia ni premiar emociones agradables. Cambiar identidad o reglas requiere decisión documentada, no reinterpretación por sesión.

## Do's and Don'ts

- Leer `PRODUCT.md`, este archivo y brechas abiertas antes de trabajo visual; consultar `app/globals.css` y componentes existentes.
- Mantener neutral fuera de ánimo y ambiente emocional dentro; cinco capas, núcleo y estado sincronizados.
- Conservar las adaptaciones AA; la fidelidad no justifica texto ilegible, objetivos pequeños o movimiento forzado.
- No copiar ilustraciones, caras emoji, trofeos, teléfono renderizado o estética de las capturas funcionales como identidad.
- No cambiar colores por paletas de Impeccable, categorías genéricas o gusto personal; la marca ya existe.
- No capitalizar el wordmark, rotarlo, desaturar el símbolo ni llenar todo de espectro emocional.
- No declarar cerrada una brecha sin captura actual, comparación con fuente y pruebas de teclado/reduced motion/reflujo.
- Al adoptar una decisión visual, actualizar este documento y su implementación; registrar excepciones y evidencia en el informe de brechas.
