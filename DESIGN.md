---
name: eudila
description: Un espejo tranquilo para cada estado de ánimo.
colors:
  primary: "#0C8A86"
  cloud: "#FBFBFD"
  graphite: "#1D1D1F"
  fog: "#6E6E73"
  white: "#FFFFFF"
  line: "color-mix(in srgb, cloud 40%, surface)"
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

Tema oscuro y neutro fuera de la experiencia de ánimo, por pedido explícito del usuario del 05/10/2026. La pantalla de ánimo usa ambiente oscuro del estado con texto legible, orbe central y acción inferior. El video de presentación es una pieza de marca: no copiar el teléfono dibujado, sus bordes, titulares publicitarios, tiempos del montaje ni barras del sistema dentro de la app.

## Colors

Grafito y base casi negra para el lienzo; Nube para texto, mezcla Nube 72% / Grafito para secundarios, turquesa institucional para identidad/acciones. Niebla conserva su significado en documentos claros, pero no se usa como texto sobre oscuro. El espectro aparece donde hay un estado emocional real; no pintar autenticación, formularios o navegación con colores emocionales arbitrarios.

| Estado            | Acento  | Orbe    | Texto sobre el acento para controles normales |
| ----------------- | ------- | ------- | --------------------------------------------- |
| Muy desagradable  | #892FC9 | #A845DA | Blanco                                        |
| Desagradable      | #5B4CE1 | #8A68D8 | Blanco                                        |
| Algo desagradable | #209AE7 | #3BBADF | Grafito                                       |
| Neutral           | #2EC0BC | #5FD3D0 | Grafito                                       |
| Algo agradable    | #77CB47 | #B6D57A | Grafito                                       |
| Agradable         | #FE9613 | #F2B24A | Grafito                                       |
| Muy agradable     | #FF4A4B | #E65175 | Grafito                                       |

Azul, turquesa y coral usan grafito como adaptación AA: el blanco indicado en el PDF/video no llega a 4.5:1. Conservar los acentos, cambiar tinta antes de desaturar la marca. El turquesa institucional #0C8A86 con blanco da 4.20:1; para enlaces y botones sobre oscuro usar `--color-action` (`color-mix(in srgb, primary 64%, cloud)`), con tinta `--color-action-ink` Grafito en botones, no asumir que primary equivale a action.

Ambiente: degradé vertical de tres paradas, tono del estado arriba, tono apagado al medio, casi negro abajo. Los hex de ambiente actuales (`#32134D`, `#26235B`, `#123F60`, `#0F5654`, `#285B25`, `#6C3B0B`, `#712127`) son traducción técnica existente, no códigos impresos certificados del brandbook. Compararlos con los videos antes de aprobar su fidelidad. La luz pertenece al orbe; no agregar degradados de texto, glassmorphism ni brillo a toda la UI.

Color acompañado por forma, etiqueta y valor accesible. Contraste mínimo: 4.5:1 para texto normal y placeholders; 3:1 para texto grande y controles esenciales. Recalcular frente al fondo real, incluyendo degradés y transparencias.

## Typography

Figtree Bold para wordmark, preguntas y nombres de estados. Sistema/SF Pro o Roboto para cuerpo, controles y datos. Pregunta 28 px equivalentes (`1.75rem`), estado 34 (`2.125rem`), cuerpo/título 17 (`1.0625rem`); rem escalables, no textos fijados que impidan zoom. El rótulo de extremos del PDF es 11 pt, peso alto y tracking +4%; verificar su legibilidad y contraste y permitir crecimiento.

Wordmark siempre `eudila`, minúsculas, sin inclinación ni deformación. Figtree Bold 700 y tracking −45 del PDF, implementado como `--tracking-wordmark: -0.045em`; el header y la galería `/tokens` comparten estas reglas. Tamaño del header 1.65rem e interlínea 1, escalables con el texto. Preguntas/títulos conservan `--tracking-brand: -0.035em`: no cambiar todo el display para corregir solo el wordmark. La regla específica de marca prevalece sobre el límite genérico de tracking de Impeccable. El wordmark del header se compara con la parte tipográfica del lockup; las medidas del lockup completo con símbolo no se aplican a ese texto solo ni al orbe emocional. [Comparación y evidencia de ANI-114](docs/design/evidence/wordmark-brand-2026-10-05/README.md).

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

**Checkpoint histórico del grupo ANI-111/116/117 (04/10/2026; variantes oscuras actualizadas al final):** `.action` define tamaño, alineación y tipografía compartidos; `.action-primary` usa cápsula ≥50 px y `.action-secondary` cápsula con contorno sobre Nube. `.action-text` reserva un objetivo ≥44 px para navegación/acciones de texto. `app/actions.ts` conecta acento/tinta de los siete estados con tokens existentes, exclusivamente en el CTA de `/registro/animo`. No introduce una paleta paralela.

Hover subraya sin cambiar el par de color; active marca un contorno interior. Foco de teclado en ese checkpoint: anillo interior Nube y exterior Grafito, sin sombra decorativa. Disabled en ese checkpoint: Niebla sobre Nube (4.91:1), borde discontinuo y sin reducir opacidad del texto. Loading usa etiqueta explícita, `aria-busy` y disabled nativo durante el guardado. `.action-label` reserva el espacio de guardar/reintentar/guardando en una sola celda; solo la etiqueta activa permanece visible y accesible, evitando saltos de altura al 200%. Estos estados no agregan animaciones; reduced motion conserva cambios instantáneos mientras VIS-06 siga abierta. El relleno horizontal de 20 px evita multiplicar el marco al ampliar el texto al 200%.

`--radius-field` y `--radius-card` son alias semánticos de `--radius-control` (14 px), independientes de la cápsula. `.control-choice` identifica opciones de registro/emoción/factores y comparte la selección institucional AA. Excepciones deliberadas: Ayuda del header y el control de contraseña mantienen objetivo ≥44 px; tabs, celdas de calendario, tarjetas de llamada, enlaces dentro de prosa y acciones de texto existentes mantienen su forma/jerarquía con tinta institucional accesible. Auth e historial permanecen neutrales (oscuros desde el pedido actual). Ejemplos de todas las variantes, disabled y loading en `/tokens`; evidencia y resultados en [acciones y contraste](docs/design/evidence/visual-actions-2026-10-04/README.md).

### Composición y navegación

En ánimo: atrás izquierda, cerrar derecha, pregunta, orbe, estado, escala/extremos y acción inferior. Círculos visuales de navegación de 32 px con blanco al 14% sobre ambiente, dentro de objetivo táctil mínimo de 44 px. Una pregunta principal por pantalla; el orbe tiene espacio para respirar. Ayuda sigue en un toque, accesible; integrar su presentación sin eliminarla para imitar el video.

Header/tabs/banner no deben partir el ambiente en bandas claras por accidente. La vista previa se identifica honestamente con aviso compacto; su explicación puede vivir en un popover. No ocultar el aviso para embellecer capturas ni imponerlo cuando la configuración no es de preview. Historial, exportación y acceso usan el lienzo neutro y controles familiares.

**Implementación ANI-107/113 (05/10/2026):** Como checkpoint de la implementación original, `app/shell.tsx` activa el ambiente emocional exclusivamente en `/registro/animo` y lee el mismo borrador que el orbe/CTA. El fondo continuo usa ambiente a 0%, mezcla ambiente 72% / Grafito a 56% y `--color-mood-bottom` (#071416) a 100%; son traducciones técnicas conservadas del prototipo, no nuevos hex certificados del PDF. Cabecera, preview y tabs transparentes; texto blanco y `--color-mood-secondary` (#E2E9E9) para lectura secundaria. Ayuda tiene contorno blanco; popover/diálogo conservaban Nube en ese checkpoint; el pedido actual los adapta a superficies oscuras AA. La excepción de Ayuda se limita al header para no pintar blanco el cierre del popover.

Pregunta centrada y estado Figtree Bold; orbe actual cuadrado, sin distorsión, limitado por alto/ancho. Atrás/cerrar usan símbolos dentro de círculo blanco al 14%, visual 32px / objetivo 44px. La fila tiene columnas 44px / flexible / 44px y conserva los extremos con texto ampliado. En altura >600px se mantiene main desplazable; a <=600px el lienzo entero se desplaza en el documento para permitir leer acciones al 200%, con Ayuda, preview y tabs en el flujo. Es una adaptación explícita de accesibilidad: en esas alturas los accesos pueden necesitar desplazamiento, sin ocultar funciones ni reducir texto.

Este primer grupo conservó cambios instantáneos y el slider nativo. El grupo siguiente incorpora orbe, geometría, espectro y movimiento descritos abajo. [Evidencia de composición y ambiente](docs/design/evidence/mood-composition-2026-10-05/README.md).

### Orbe animado implementado · 05/10/2026

`shared/visual/orb.js` define el renderer que `app/mood/orb.tsx` adapta a React para ánimo, historial e inicio y que consume también el prototipo: cinco capas con gradientes radiales, borde de luz y núcleo blanco estable. La escena de ánimo agrega halo y partículas; la representación compacta es estática y sin filtro/partículas, con mínimo de 24px. `shared/visual/moods.js` comparte siete geometrías muestreadas en 252 puntos para interpolar sin cambiar topología: puntas 9/14, onda corta, círculo, gota asimétrica y pétalos redondeados 7/9. La variante animada y la estática comparten una sola definición técnica; los reexports previos conservan compatibilidad.

`shared/visual/controller.js` (reexportado por `app/mood/controller.ts`) lee los tokens CSS reales y coordina silueta, tinte del orbe, ambiente, acento del CTA/slider y familias de partículas. Las selecciones por teclado/programáticas usan un único RAF de 600ms con easing de marca; el arrastre continuo sigue la posición directamente, según la corrección posterior descrita abajo. Si cambia el destino durante el movimiento, parte del cuadro visible. El borrador y la etiqueta se actualizan inmediatamente; la interacción no espera al renderer. La tinta se calcula sobre el acento redondeado que realmente se pinta: blanco/Grafito y, solo durante mezclas donde ambos fallan 4.5:1, negro transitorio. Los siete estados asentados conservan la tabla AA.

Ciclos CSS: respiración 4s entre 0.982 y 1.018; giro de capas alterno, período 125.663706s; titileo 2.5–6s con fases independientes. Origen SVG explícito (110,110) mantiene todas las capas y núcleo centrados; no usar `center` de la caja expandida para alojar el halo. Neutral no muestra partículas; desagradables usan puntos y agradables destellos de cuatro puntas. Al ocultarse se pausan ciclos/RAF; desmontar cancela listeners/RAF. Reduced motion en vivo termina la transición inmediatamente y desactiva los ciclos.

`.mood-range` conserva `input[type=range]` nativo, valores 1–7, ARIA y flechas/Home/End: pista de 6px con los siete tokens, thumb blanco de 30px con centro coloreado de 16px y halo de 9px, objetivo ≥44px. `touch-action: pan-y` permite desplazar verticalmente el lienzo y seleccionar horizontalmente. Estilos WebKit y Gecko separados. [Evidencia, mediciones por motor y alcance](docs/design/evidence/mood-motion-2026-10-05/README.md). Wordmark completado en ANI-114; inicio y fuente visual común completados en ANI-115/118.

**Corrección de Algo agradable (05/10/2026):** la gota usa diez apoyos suaves y amplios, comparados con brandbook p.6/Motion alrededor de 7s. Evita el cuello estrecho que hacía leer triángulos al alternar capas. Conserva asimetría, 252 puntos y el núcleo centrado; radio máximo/mínimo 1.20 frente a 1.35 anterior. Los otros seis contornos se conservan exactamente; ritmo, fases, tintes y transiciones compartidas permanecen aprobados. [Evidencia de giro y cambios vecinos](docs/design/evidence/algo-agradable-2026-10-05/README.md).

**Transición completa y arrastre continuo (05/10/2026):** el usuario aclaró que hay que revisar entrada/permanencia/salida y eliminar detenciones del selector. Se revisaron fotogramas cada 100ms entre 5.8–7.4s y cada 167ms entre 15–17s. El range ahora usa `step=any`; posición visual y categoría guardada son distintas. Forma/tinte/ambiente/CTA/partículas interpolan entre vecinos mientras el thumb acompaña el puntero, sin reiniciar 600ms por cada movimiento ni redondear al soltar. Teclado sigue recorriendo categorías con flechas/PageUp/PageDown/Home/End. La etiqueta y el registro conservan la categoría más cercana 1–7. La posición fraccionaria se conserva al navegar durante esta sesión de la app; recargar recupera la categoría guardada. No se modifica el modelo de historial/exportación.

Solo Algo agradable agrega ondulación radial suave de cada capa y del halo exterior: ciclo técnico de 8s, fases separadas por 0.7 rad y desplazamiento máximo 8 unidades antes de escalar capas. Es una traducción de la fluidez observada, no un parámetro impreso del brandbook ni una medición del video. El núcleo sigue fijo; respiración/giro/titileo conservan sus valores. La participación orgánica se mezcla gradualmente al entrar/salir, sin saltar entre gota y pétalos/círculo. El RAF continuo existe únicamente cuando participa ese estado y se pausa/cancela junto al controlador. Reduced motion congela el contorno y mantiene arrastre directo. Las partículas se pausan en Neutral exacto, no en posiciones vecinas que comparten su etiqueta. [Evidencia de transición completa y slider](docs/design/evidence/mood-continuous-2026-10-05/README.md).

**Cierre de ANI-110 / VIS-04 (05/10/2026):** el usuario confirmó la prueba manual en Safari y solicitó dar por completa esa comprobación. Complementa las pruebas automatizadas existentes en Chromium/WebKit/Firefox; se registra con su procedencia y sin atribuir mediciones automatizadas a Safari. [Registro de validación manual](docs/design/evidence/safari-manual-2026-10-05/README.md). La automatización de Safari deja de bloquear este issue.

**Cierre de ANI-114 / VIS-08 (05/10/2026):** header y galería usan la Figtree local Bold con tracking exclusivo del wordmark. La comparación de posiciones relativas de letras con el PDF confirma sus proporciones; 132 casos por motor, contraste mínimo 8.03:1, teclado y siete nombres de estado verificados. [Evidencia](docs/design/evidence/wordmark-brand-2026-10-05/README.md). La integración de inicio/sistema común se documenta debajo.

### Entrada y sistema visual compartido · ANI-115/118 · 05/10/2026

El inicio Next.js muestra el símbolo Neutral en una caja de 104 px sobre la pregunta. Es decorativo, estático por defecto y no forma un lockup con el wordmark del header. La entrada opcional dura 600 ms (opacidad .6→1, escala .94→1, curva de marca), una sola primera visita por sesión. Puntero, teclado, cambio de ruta, pestaña oculta o reduced motion la terminan sin afectar foco/interacción. Visitar otra ruta directamente consume la entrada; almacenamiento bloqueado conserva el símbolo estático. Texto, Empezar y Ayuda existen desde SSR. No hay pantalla intermedia ni montaje de publicidad.

`shared/visual/` contiene estados/geometría, árbol SVG/material/variantes, controlador, reglas de movimiento/teclado, entrada y CSS de acciones/range. React adapta el árbol conservando nodos; el prototipo serializa la misma definición y monta la escena una vez por pantalla. Ambas implementaciones conservan 5.25 en memoria al navegar, redondean solo el borrador y restauran su categoría al recargar. La variante compacta mantiene cinco capas/gradientes/núcleo, mínimo 24 px, sin halo, partículas ni movimiento. No imponer el layout ni navegación del prototipo a Next.js.

Los tokens editables siguen en `app/globals.css`. `npm run visual:tokens` genera `shared/visual/tokens.css` para el prototipo; prueba de paridad y `prebuild --check` detectan desactualización. No editar esa exportación ni añadir hex a los estados. La galería también obtiene etiquetas de la escala compartida.

Entrada y paridad verificadas en Chromium/WebKit/Firefox: 36 reflows de inicio, 30 posiciones comparadas entre consumidores, siete compactos reales por motor, ciclos/nodos conservados y contraste de CTA inicial 6.30:1. Se mantienen las regresiones de movimiento/arrastre/composición y el flujo completo; el prototipo incorpora cobertura del recorrido hasta emoción/factores y arranque offline. [Capturas propias, video, mediciones y alcance](docs/design/evidence/brand-system-2026-10-05/README.md). Las 12 brechas de la revisión estética están resueltas en su alcance registrado; las futuras funcionalidades se enumeran a continuación.

### Próximas funcionalidades

Diario, sueño, fotos y Logros (ANI-100–106) heredan esta identidad. Los relatos y fotos del usuario son contenido, no ilustraciones de marca. Medallas deben integrarse al sistema, sin importar los assets JBG de la referencia ni premiar emociones agradables. Cambiar identidad o reglas requiere decisión documentada, no reinterpretación por sesión.

## Do's and Don'ts

- Leer `PRODUCT.md`, este archivo y brechas abiertas antes de trabajo visual; consultar `app/globals.css` y componentes existentes.
- Mantener neutral oscuro fuera de ánimo y ambiente emocional dentro; cinco capas, núcleo y estado sincronizados.
- Conservar las adaptaciones AA; la fidelidad no justifica texto ilegible, objetivos pequeños o movimiento forzado.
- No copiar ilustraciones, caras emoji, trofeos, teléfono renderizado o estética de las capturas funcionales como identidad.
- No cambiar colores por paletas de Impeccable, categorías genéricas o gusto personal; la marca ya existe.
- No capitalizar el wordmark, rotarlo, desaturar el símbolo ni llenar todo de espectro emocional.
- No declarar cerrada una brecha sin captura actual, comparación con fuente y pruebas de teclado/reduced motion/reflujo.
- Al adoptar una decisión visual, actualizar este documento y su implementación; registrar excepciones y evidencia en el informe de brechas.

### Lienzo oscuro, iconos e icono de app · pedido del usuario 05/10/2026

El usuario solicitó extender la estética oscura del selector y agregar iconos e icono de app. Esta decisión reemplaza el tema claro anterior; no reabre las brechas históricas cerradas. El brandbook admite lienzo neutro claro u oscuro (p. 2) y Grafito como fondo oscuro (p. 8). La mezcla institucional tenue no representa un ánimo seleccionado.

`shared/visual/canvas.css` pinta el lienzo de tres paradas: 18% ambiente Neutral / Grafito arriba, 70% Grafito / base oscura al medio y base oscura abajo. Los controles usan la superficie 94% Grafito / Nube y bordes 40% Nube / superficie. El texto es Nube y el secundario 72% Nube / Grafito. Acción institucional 64% primary / Nube con tinta Grafito; no alterar los siete acentos ni las tintas del selector. Diálogos/popover y campos también son oscuros. Al imprimir, el informe recupera papel blanco, tinta Grafito/negra y Niebla secundaria. La navegación y Ayuda mantienen foco blanco visible, con anillo interior Grafito en cápsulas.

`app/icons.tsx` reúne iconos lineales locales de 24 px, trazo 1.8, esquinas redondeadas y currentColor. Son decorativos junto a etiquetas conservadas: Registrar/Hoy/Calendario, Ayuda, teléfono, registro/avance/edición, historial/exportaciones y análisis. La contraseña usa ojo con nombre accesible explícito. No sustituir emociones por caras ni eliminar rótulos del tab bar. Las pantallas de alto <=600 px desplazan el documento completo para mantener accesible el texto al 200% con la barra ahora más alta.

El icono de app deriva del renderer Neutral aprobado: cinco capas, núcleo y gradientes propios, sin partículas ni halo extra; diámetro exactamente 64% del cuadrado y centro (50%,50%), sobre ambiente turquesa. `scripts/brand-icon.mjs` obtiene colores del CSS canónico y genera SVG, PNG 180/192/512 y manifiesto; `npm run visual:icon` actualiza y `prebuild --check` impide assets viejos. Los archivos son cuadrados/opacos sin máscara baked-in; iOS/navegador aplica su máscara. Los bounds se derivan del contorno compartido (diámetro actual 176 unidades), no del viewBox expandido del orbe. El header muestra el asset con una máscara CSS de 10 px sobre caja 40 px, manteniendo diámetro 25.6 px y separación 14 px del wordmark. El orbe de inicio conserva la entrada aprobada de 600 ms. El skip link se revela de manera absoluta sobre el header para que foco/blur no desplace Ayuda entre pointerdown y pointerup.

`app/icon.svg` y `app/apple-icon.png` usan las convenciones metadata de Next.js; `app/manifest.json` incluye iconos 192/512 y color base. Ayuda offline almacena su icono local junto con CSS/fuente; el prototipo adopta lienzo/tokens/icono para conservar identidad común. Ver [plan](docs/plans/2026-10-05-dark-icons.md) y [evidencia](docs/design/evidence/dark-icons-2026-10-06/README.md).
