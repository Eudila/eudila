# Brechas estéticas de eudila · revisión del 04/10/2026

**Estado:** diagnóstico original conservado como baseline; VIS-05/10/11 verificadas en acciones y contraste (04/10), VIS-01/07 verificadas en ambiente y composición (05/10). VIS-02/03/06 verificadas en material, geometría y movimiento (05/10). VIS-04 resuelta con pruebas automatizadas en Chromium/WebKit/Firefox y prueba manual en Safari confirmada por el usuario (05/10). VIS-08 resuelta con Figtree Bold y fidelidad del wordmark (05/10). VIS-09/12 resueltas con entrada real Next.js y fuente técnica compartida (05/10). Las 12 brechas de este informe están resueltas en su alcance registrado. Baseline: `main` en `414ceca4b31220c2be760ed0cd58daa9cfaa3e5a` (PR #9). Próximas sesiones deben consultar este informe junto con `DESIGN.md`, actualizar estados y conservar evidencia; no repetir la definición de marca desde cero.

## Fuentes y autoridad

| Fuente local revisada | Datos / identidad verificable | Uso |
| --- | --- | --- |
| `Eudila-Brandbook.pdf` (workspace padre) | v1.0, septiembre 2026, 13 páginas; SHA256 `3fdfb738099abcf643a4c2d4252a7c76f99050f0379510aa7ff516c1746feece` | Esencia, logo, paleta, siluetas, tipografía, interfaz, movimiento y voz. |
| `docs/brand/Eudila-Brandbook.pdf` (workspace padre) | Mismo SHA256 que el PDF subido | Es el mismo documento, no otra edición. |
| `Eudila-Presentacion-15s.mp4` (workspace padre) | 15 s, 1080×1920, 30 fps; SHA256 `67c18a7d9d5e636d4ba57d06fdfbd98805f631fce8b61fe212c63adf1daa3a42` | Identidad/promoción: orbe, lockup y lenguaje visual. |
| `Anima-Emocion-Motion.mp4` (workspace padre) | 20 s, 1170×2532, 60 fps; SHA256 `a7bf800b8ed628aabfa50579cd5779664affbba7b2451b7c6327a98d020e8e53` | Composición de ánimo, transiciones, iluminación y partículas. El nombre del archivo no cambia la marca Eudila. |
| `docs/referencias/IMG_2887.PNG` a `IMG_2895.PNG` (ocho archivos) | Revisados previamente, comparación en su README | Referencia funcional; ilustraciones, medallas JBG y caras no gobiernan marca. |
| `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/registro/registro.tsx`, `prototype/moods.js`, `prototype/style.css` | Código de baseline | Distinguir implementación Next.js del prototipo separado. |

El PDF es de uso interno. Los videos y fotogramas de marca permanecen fuera del repo de producto; los hashes y esta descripción permiten identificar las fuentes en otras sesiones. No confundir ausencia del archivo fuente en otro checkout con permiso para improvisar otra identidad.

## Método y límites

Se extrajeron y visualizaron fotogramas de toda la duración: presentación cada segundo (0–14 s), motion cada dos segundos (0–18 s), y secuencia adicional cada 200 ms entre 1.5 y 2.5 s. Las planchas permiten comparar etapas de forma/color/ambiente y posiciones de capas/partículas. Los tiempos de respiración/giro/transición se toman del PDF; no se presentan como medición experimental del video. No se infieren háptica, interacción real ni comportamiento del sistema a partir de una animación renderizada.

Se abrió el build de producción de Next.js en Chrome a 390×844, con preview activo. Se capturaron los siete estados del slider, inicio e ingreso y se inspeccionó su composición. [Plancha de baseline Next.js](evidence/nextjs-brand-baseline-2026-10-04.png). Se revisó además el código que determina las diferencias y se calculó contraste sRGB. Esto no es una auditoría clínica ni una prueba multiplataforma: Safari/Firefox, texto al 200% y movimiento reducido deben verificarse en la implementación de las correcciones.

## Qué comunican los videos

- Presentación 0–2 s: orbe circular iluminado sobre ambiente turquesa y aparición de wordmark; 3–8 s: composición de ánimo dentro del teléfono; 9–11 s: siete estados como sistema; 13–14 s: cierre con símbolo/wordmark. Es narrativa promocional, no un flujo obligatorio de 15 s al abrir la app.
- Motion 0 s y 12/18 s: Neutral sin partículas; 2/4 s: flor coral con destellos; 6 s: estado agradable orgánico; 8/10 s: estado violeta anguloso con puntos; 14 s: estado índigo; 16 s: forma agradable. La atmósfera y acción acompañan el estado.
- Muestreo 1.5–2.5 s: forma, iluminación, ambiente, control y botón progresan juntos. Algunas etiquetas se solapan durante cambios: tomar la transición como referencia, pero preservar una sola etiqueta legible/accesible en la app.

## Registro de brechas

P1: diferencia central de identidad. P2: consistencia/composición. P3: detalles de acabado. La columna de brecha conserva el diagnóstico original; cada estado cerrado remite a evidencia nueva.

| ID | Prioridad / estado | Brecha y evidencia actual | Dirección de corrección / criterio de cierre |
| --- | --- | --- | --- |
| VIS-01 | P1 · resuelta (ambiente 05/10) | **No hay ambiente emocional en Next.js.** Los siete estados mantienen Nube; `app-shell` fuerza `bg-surface` y registro no aplica fondo del estado. Motion muestra toda la pantalla dentro del ambiente. | Ambiente de tres paradas sincronizado con el estado; decidir cómo se integra con header/tabs/preview sin bandas accidentales. Captura de los siete estados, contraste sobre cada parada y acceso a Ayuda conservado. [Evidencia 05/10](evidence/mood-composition-2026-10-05/README.md). |
| VIS-02 | P1 · resuelta (material 05/10) | **Orbe plano y estático.** Cinco paths rellenos con opacidades y círculo uniforme en `registro.tsx`; sin bordes de luz, halo/núcleo radial ni movimiento. La cantidad de capas existe, pero el material del video no. | Renderer compartido de cinco capas/núcleo con iluminación contenida y giros alternos; contraste de capa sobre ambiente, respiración, sin recortes ni distorsión. Revisar neutral y ambos extremos en reposo y movimiento. [Evidencia 05/10](evidence/mood-motion-2026-10-05/README.md). |
| VIS-03 | P1 · resuelta (geometría 05/10) | **Formas agradables demasiado angulosas y gota casi circular.** `shapePath` usa una modulación radial muestreada en 120 puntos para todos los estados; las capturas de 6/7 leen como ondas estrelladas, frente a flores/pétalos más orgánicos del video. | Ajustar geometría por familia, conservar nueve/catorce puntas y siete/nueve pétalos, forma circular Neutral y gota reconocible. No sustituir todo por blobs arbitrarios. Comparación lateral por estado y a tamaños usados en app. [Evidencia 05/10](evidence/mood-motion-2026-10-05/README.md). |
| VIS-04 | P1 · resuelta (Safari manual 05/10) | **Slider nativo monocromático.** `input[type=range]` solo tiene `accent-action`; en la captura pista gris/turquesa y thumb chico. No hay espectro completo, thumb blanco/punto del estado ni halo. | Estilo del range accesible con pista 6 px, siete colores, thumb y halo 9 px; teclado/ARIA/touch conservados. Comprobar Chromium/Safari/Firefox y reduced motion. [Validación manual Safari y evidencia automatizada](evidence/safari-manual-2026-10-05/README.md). |
| VIS-05 | P1 · resuelta (acciones 04/10) | **Botón de ánimo siempre turquesa y no cápsula.** Constante `action` usa `bg-action rounded-control` en todos los estados. Video/PDF cambian su acento y usan cápsula. | Variante emocional que usa acento e ink AA del estado; principal cápsula y 50 px mínimos. Mantener action accesible para otras superficies. Capturas de los siete pares, hover/focus/disabled legibles. |
| VIS-06 | P1 · resuelta (movimiento 05/10) | **Cambios instantáneos sin coordinación ni partículas.** `onChange` actualiza el borrador; paths/color cambian directo. No hay sincronización de 600 ms, partículas ni ciclos en Next.js. | Un estado visual común gobierna ambiente/silueta/acento. Respiración 4 s ±1.8%, giro 0.05 rad/s, partículas con fases 2.5–6 s (ninguna en Neutral), reducido instantáneo/fijo y pausa al ocultar. Prueba en tiempo, no solo screenshot. [Evidencia 05/10](evidence/mood-motion-2026-10-05/README.md). |
| VIS-07 | P2 · resuelta (composición 05/10) | **Composición dividida y controles de navegación ajenos a la pantalla de marca.** Header global, aviso, enlaces «Volver/Cerrar», progreso y tabs rodean el registro. La pregunta se alinea a izquierda; el video la centra y da más protagonismo al orbe. | Composición emocional propia: atrás/cerrar con círculo visual y objetivo ≥44 px, pregunta/orbe/estado/escala/acción ordenados. Definir qué elementos globales siguen visibles sin perder Ayuda, progreso o información de preview; validar alto corto y 200%. [Evidencia 05/10](evidence/mood-composition-2026-10-05/README.md). |
| VIS-08 | P2 · resuelta (wordmark 05/10) | **Tipografía del estado y wordmark divergentes.** Estado usa sans del sistema 600, no `font-display` 700. Header usa Figtree 800/−0.035em frente a Bold/tracking −45 del PDF. | Aplicar Figtree Bold al estado; validar lockup y tracking del wordmark como unidad separada. No romper sistema de controles ni encoger textos para imitar video. [Fuente, proporciones y accesibilidad verificadas](evidence/wordmark-brand-2026-10-05/README.md). |
| VIS-09 | P2 · resuelta (entrada 05/10) | **Inicio sin símbolo y splash de marca en app principal.** `app/page.tsx` muestra pregunta/copy/acciones; implementación de entrada ANI-69 vive en `prototype/`, no en `/` de Next.js. | Integrar símbolo/entrada Neutral coherente si se mantiene la apertura de marca; breve (<2 s), salteable, no repetida por navegación ni bloqueante. No importar montaje completo o títulos publicitarios. No considerar ANI-69 prueba de esta ruta. [Entrega real Next.js](evidence/brand-system-2026-10-05/README.md). |
| VIS-10 | P2 · resuelta (acciones 04/10) | **Vocabulary de acciones inconsistente.** Inicio/registro principales usan radio 14 px; auth cápsula; otras acciones de historial con radio control. | Separar variantes acción principal/secundaria/control/tarjeta en componentes/tokens compartidos y registrar excepciones. Aplicar cápsula a principales sin redondear todo el producto. |
| VIS-11 | P2 · adaptación AA verificada (acciones 04/10) | **Conflicto referencia/AA.** Blanco sobre azul, turquesa y coral no alcanza 4.5:1; primary institucional tampoco lo logra con blanco. El código actual ya adapta algunos inks y oscurece action, lo cual es correcto. | Conservar la adaptación de DESIGN.md al introducir botones emocionales; no «corregir» la tinta a blanco por fidelidad. Esta brecha es de especificación de referencia, no un error a revertir del código. |
| VIS-12 | P3 · resuelta (sistema común 05/10) | **El sistema vive repartido entre prototipo y Next.js.** Colores en `moods.js` y globals, estilos de orbe en prototype, renderer distinto en historial y registro. | Fuente técnica compartida para estado/renderer/variants, tests de paridad y documentación de las representaciones compactas. Reutilizar no significa arrastrar todo el CSS del prototipo. [Paridad y variantes verificadas](evidence/brand-system-2026-10-05/README.md). |

## Adaptaciones ya correctas

- Paleta principal/espectro/orbe, nombres sin juicio y cinco capas + núcleo ya tienen base en código.
- Figtree local cargada para preguntas/wordmark; tipografía del sistema para UI/cuerpo.
- Lienzo Nube/Grafito en auth, historial y formularios es la dirección correcta, no una brecha a volver oscura.
- Ayuda visible, objetivos táctiles de 44 px y estado del slider anunciado deben preservarse.
- El aviso actual de preview es compacto y su explicación está en popover; no es necesario volver al banner largo que muestran capturas anteriores.
- El prototipo tiene ambiente, range con espectro, respiración y giro, pero todavía usa pista 8 px, halo 8 px y otros valores aproximados. Es base útil, no certificado de fidelidad ni reemplazo de la app Next.js.

## Contraste de los acentos

Cálculo con luminancia relativa sRGB y `(Lmax + .05)/(Lmin + .05)`. No se cambian los colores del brandbook. Valores redondeados:

| Acento | Blanco | Grafito #1D1D1F | Tinta adoptada para texto normal |
| --- | --- | --- | --- |
| #892FC9 | 6.34 | 2.66 | Blanco |
| #5B4CE1 | 5.89 | 2.86 | Blanco |
| #209AE7 | 3.07 | 5.48 | Grafito |
| #2EC0BC | 2.24 | 7.52 | Grafito |
| #77CB47 | 2.02 | 8.35 | Grafito |
| #FE9613 | 2.19 | 7.68 | Grafito |
| #FF4A4B | 3.32 | 5.08 | Grafito |
| #0C8A86 | 4.20 | 4.00 | Usar action oscurecido, no este par para texto normal |

La etiqueta blanca sobre ambiente oscuro se evalúa contra el ambiente, no contra el acento del botón. Los rótulos diminutos del video no se copian sin verificar lectura/zoom.

## Orden de implementación recomendado

1. Resolver arquitectura de pantalla emocional y renderer común (VIS-01/02/03/07/12).
2. Slider y botones por estado con AA (VIS-04/05/11).
3. Movimiento y partículas como conjunto con reduced motion (VIS-06).
4. Tipografía, variantes globales e inicio (VIS-08/09/10).
5. Revisión visual conjunta con todas las superficies; no aplicar el ambiente emocional a autenticación/historial por arrastre.

Cada cambio es tarea futura; este informe no autoriza alterar producto ni afirma cerrar sus brechas. La prioridad no compromete una fecha de entrega.

## Cierre y mantenimiento entre sesiones

- `DESIGN.md` fija decisiones de marca; `PRODUCT.md` fija el contexto; `AGENTS.md` obliga a leer ambos y este registro antes de cambios visuales.
- Para cerrar un ID: registrar commit/ruta, captura o video actual, comparación con fuente, resultados de contraste, teclado, 320/390/520 px/200% y reduced motion. Si solo se revisa código, marcar como implementación pendiente de verificación visual.
- No sobrescribir baseline: guardar evidencia nueva con fecha/commit. No quitar un ID porque otro issue esté Done; la ruta real debe cumplir el criterio.
- Cambios futuros de brandbook: registrar edición/hash, diferencias y decisión explícita; no mezclar fuentes silenciosamente.
- Los nuevos módulos ANI-100–106 heredan DESIGN.md, sin adoptar la estética de las imágenes de referencia.

## Seguimiento en Linear

Las doce brechas se registraron en Backlog, sin responsable ni fecha, con prioridades del informe y criterios de cierre:

- VIS-01: [ANI-107 · VIS-01 · Ambiente emocional de tres paradas en Next.js](https://linear.app/anima-org/issue/ANI-107/vis-01-ambiente-emocional-de-tres-paradas-en-nextjs)
- VIS-02: [ANI-108 · VIS-02 · Orbe de cinco capas con iluminación y profundidad](https://linear.app/anima-org/issue/ANI-108/vis-02-orbe-de-cinco-capas-con-iluminacion-y-profundidad)
- VIS-03: [ANI-109 · VIS-03 · Siluetas del orbe fieles a los siete estados de marca](https://linear.app/anima-org/issue/ANI-109/vis-03-siluetas-del-orbe-fieles-a-los-siete-estados-de-marca)
- VIS-04: [ANI-110 · VIS-04 · Slider de ánimo con espectro, thumb y halo de marca](https://linear.app/anima-org/issue/ANI-110/vis-04-slider-de-animo-con-espectro-thumb-y-halo-de-marca)
- VIS-05: [ANI-111 · VIS-05 · Botón principal de ánimo con acento e ink por estado](https://linear.app/anima-org/issue/ANI-111/vis-05-boton-principal-de-animo-con-acento-e-ink-por-estado)
- VIS-06: [ANI-112 · VIS-06 · Movimiento coordinado del orbe, ambiente y partículas](https://linear.app/anima-org/issue/ANI-112/vis-06-movimiento-coordinado-del-orbe-ambiente-y-particulas)
- VIS-07: [ANI-113 · VIS-07 · Composición de ánimo y navegación según la marca](https://linear.app/anima-org/issue/ANI-113/vis-07-composicion-de-animo-y-navegacion-segun-la-marca)
- VIS-08: [ANI-114 · VIS-08 · Tipografía Figtree del estado y fidelidad del wordmark](https://linear.app/anima-org/issue/ANI-114/vis-08-tipografia-figtree-del-estado-y-fidelidad-del-wordmark)
- VIS-09: [ANI-115 · VIS-09 · Integrar símbolo y entrada de marca en el inicio Next.js](https://linear.app/anima-org/issue/ANI-115/vis-09-integrar-simbolo-y-entrada-de-marca-en-el-inicio-nextjs)
- VIS-10: [ANI-116 · VIS-10 · Unificar variantes de acciones y radios de componentes](https://linear.app/anima-org/issue/ANI-116/vis-10-unificar-variantes-de-acciones-y-radios-de-componentes)
- VIS-11: [ANI-117 · VIS-11 · Preservar contraste AA en las adaptaciones del brandbook](https://linear.app/anima-org/issue/ANI-117/vis-11-preservar-contraste-aa-en-las-adaptaciones-del-brandbook)
- VIS-12: [ANI-118 · VIS-12 · Unificar fuente visual entre prototipo y Next.js](https://linear.app/anima-org/issue/ANI-118/vis-12-unificar-fuente-visual-entre-prototipo-y-nextjs)

## Ejecución: acciones y contraste · 04/10/2026

[Plan y agrupación de las 12 brechas](../plans/2026-10-04-visual-actions.md). Grupo ejecutado: ANI-111 / VIS-05, ANI-116 / VIS-10 y ANI-117 / VIS-11, en la rama `feat/visual-actions-aa`, desde `bd7339e` (posterior al baseline del diagnóstico).

- `app/globals.css`: variantes principal/secundaria/texto, controles de selección y radios semánticos. `app/actions.ts` aplica los pares del estado exclusivamente al CTA de ánimo.
- Inicio, pasos del registro, autenticación, cuenta, historial, header y exportación migrados a variantes compartidas; controles/tarjetas conservan radio 14 px.
- Comparación con brandbook p. 10 y el fotograma Neutral del video Motion: se conserva cápsula/acento, se adapta la tinta a AA. Los nueve issues restantes describen diferencias de orbe, ambiente, slider, composición, tipografía y apertura; las capturas de este grupo no acreditan su cierre.
- Evidencia nueva de producción: [siete estados](evidence/visual-actions-2026-10-04/seven-moods.png), [variantes/disabled/loading](evidence/visual-actions-2026-10-04/variants-and-disabled.png), [foco](evidence/visual-actions-2026-10-04/mood-focus.png), [320 px / texto 200% / reduced motion](evidence/visual-actions-2026-10-04/reflow-320-200-reduced.png). [Mediciones](evidence/visual-actions-2026-10-04/measurements.json) y [comandos/alcance](evidence/visual-actions-2026-10-04/README.md).
- Los siete pares de texto/acento dan entre 5.08:1 y 8.35:1; disabled da 4.91:1. Hover/focus/active mantienen tintas/fondos. Se verificaron 54 combinaciones de reflujo de nueve rutas a 320/390/520 px con texto 100/200%, además de alto corto y movimiento reducido.
- Build, lint, typecheck y regresión funcional de frontend/auth verificados. Revisión independiente sin problemas bloqueantes; se reforzó la comprobación exacta del color institucional y del guardado real.
- El slider no cambió: Safari/Firefox no se certifican en este grupo. ANI-110 conserva el requisito de comprobar esos motores cuando se modifique el range nativo. Los fotogramas/PDF internos no se publican ni se importan a la app.

## Ejecución: ambiente y composición · 05/10/2026

[Plan](../plans/2026-10-05-mood-ambient-composition.md). ANI-107 / VIS-01 y ANI-113 / VIS-07 implementadas sobre `60211f4`, rama `feat/mood-ambient-composition`. El diagnóstico de la tabla se conserva como baseline.

- Shell cliente dentro de providers existentes; ruta/borrador derivan ambiente exclusivamente en ánimo. Las tres paradas reales computadas se comprueban en navegador, junto con retorno a Nube al navegar a tipo, emoción, Ayuda, Hoy, Calendario e inicio.
- Comparación con brandbook p. 10 y Motion 0s: ambiente vertical continuo, pregunta centrada, círculos visuales 32px al 14% con objetivo 44px y acción inferior. Ayuda, preview, progreso y tabs se conservan sobre el ambiente. No se importan el teléfono/marketing del video ni sus assets internos. La luz/geometría del orbe y el slider siguen divergentes y no se declaran resueltos.
- Contraste mínimo del texto secundario sobre las tres paradas: 6.53:1; blancos >=8.03:1. El CTA conserva pares AA del grupo anterior. Popover y diálogo verificados sobre Nube; se reprodujo y corrigió una fuga de blanco hacia el botón de cerrar preview.
- 84 combinaciones: siete estados × 320/390/520px × texto 100/200% × alto 844/470px; controles comprobados dentro del viewport después de desplazamiento. En alturas <=600px se permite scroll del lienzo completo para evitar un main de apenas 40px entre chrome ampliado. Ayuda/preview/tabs permanecen en el flujo, por lo que pueden necesitar desplazamiento. En alturas normales mantienen la estructura persistente anterior.
- Figtree Bold del estado adelantado como coherencia de composición; VIS-08 sigue abierta por wordmark. VIS-02/03/04/06/09/12 conservan alcance y estado.
- Build, lint, typecheck, formato y regresiones de frontend/auth/acciones verificadas. Revisión independiente encontró el cierre del popover con contraste 1.03:1; corregido y cubierto por prueba que primero falló. [Capturas, mediciones y comandos](evidence/mood-composition-2026-10-05/README.md).

## Ejecución: orbe y movimiento · 05/10/2026

[Plan](../plans/2026-10-05-mood-orb-motion.md). ANI-108 / VIS-02, ANI-109 / VIS-03 y ANI-112 / VIS-06 verificadas desde `31d84b0`, rama `feat/mood-orb-motion`. ANI-110 / VIS-04 implementada; la validación automatizada cubre Chromium, WebKit y Firefox, pero la app Safari queda pendiente. [Capturas, grabaciones, mediciones y alcance](evidence/mood-motion-2026-10-05/README.md).

- Renderer compartido en ánimo/historial, cinco capas iluminadas y núcleo blanco. Geometrías propias por familia; historial estático con símbolo mínimo de 24px. Comparación de siete estados y extremos con brandbook pp. 6/10/11 y Motion 0–18s. No se publican fuentes internas.
- Controlador de 600ms sincroniza silueta, tinte, ambiente, acento y partículas; interrupción parte del cuadro visible. Respiración de 4s ±1.8%, giro alterno 0.05rad/s, puntos/destellos con fases independientes 2.5–6s y Neutral sin partículas. Pausa de pestaña, desmontaje y reduced motion en vivo comprobados. Origen SVG corregido para mantener capas/núcleo centrados.
- Duraciones observadas 603–610.9ms; diferencia de progreso forma/colores menor a 0.009. AA ≥4.5:1 por cuadro muestreado. Negro transitorio documentado para mezclas en las que blanco/Grafito no alcanzan AA; siete estados asentados conservan la adaptación anterior.
- Range nativo con pista 6px/espectro, thumb 30px blanco/centro 16px/halo 9px y objetivo ≥44px. Teclado y puntero pasan en los tres motores; tap en contextos táctiles Chromium/WebKit. 42 casos al 200% por motor y 84 casos de composición Chromium. WebKit no se presenta como Safari ni como dispositivo iOS físico. El intento de sesión safaridriver no respondió en 20s; VIS-04 permanece pendiente de esa comprobación.
- Build/lint/types/formato/unidades y regresiones funcionales de frontend, auth, análisis y acciones pasan. Revisión independiente sin críticos/importantes; su observación menor sobre medición temporal quedó cubierta.
- En el checkpoint de material de este apartado seguían pendientes VIS-08/09 y la migración completa de VIS-12. Los cierres posteriores de ANI-114/115/118 se registran al final del informe.

## Corrección de Algo agradable · 05/10/2026

Pedido explícito de ajustar solo ese estado; los otros seis fueron aceptados. Se amplía/redondea la gota del estado 5 para evitar lectura triangular durante el giro, comparando con brandbook p.6 y Motion alrededor de 7s. No se cambian ciclos, colores ni renderer. Prueba de proporción falló antes del cambio y pasa después; hashes acreditan los seis contornos anteriores sin modificaciones. Build/lint/formato, geometría/morph/AA y regresión de movimiento en Chromium/WebKit/Firefox pasan. Capturas de cuatro fases de giro, entrada/salida por estados vecinos, reduced motion y reflujo 320px/200%: [evidencia nueva](evidence/algo-agradable-2026-10-05/README.md). Las brechas pendientes conservan su estado.

## Aclaración: transición completa y slider continuo · 05/10/2026

El usuario señaló que la revisión debía cubrir la transición completa y que la barra no debía detenerse por categorías. Se inspeccionaron entrada/permanencia/salida del video en fotogramas cada 100/167ms. La posición visual ahora es continua (`step=any`) e interpola vecinos directamente durante arrastre, sin snap al soltar; teclado mantiene transición de marca y categoría entera de registro. Solo Algo agradable agrega ondulación orgánica por capa; los otros seis contornos/ritmos/colores se conservan. Valores técnicos de ondulación (8s, fases 0.7rad, amplitud máxima 8 unidades) quedan documentados como traducción visual, sin atribuirlos al PDF.

61 posiciones distintas observadas por motor; 5.25 retenido al soltar, contraste mínimo 4.716:1 y borrador válido entero 5. Teclado/puntero Chromium/WebKit/Firefox y tap Chromium/WebKit; pausa/reduced motion, navegación/recarga, build/lint/types/formato/unidades y recorrido completo de frontend pasan. Se corrigió pausa indebida de destellos en posiciones vecinas a Neutral. Revisión independiente sin problemas concretos. [Capturas y grabaciones de transición completa](evidence/mood-continuous-2026-10-05/README.md). Safari y VIS-08/09/12 conservan sus pendientes anteriores.

## Cierre: slider y Safari manual · 05/10/2026

El usuario confirmó haber realizado la prueba manual en Safari y pidió dar por hecha la comprobación pendiente. ANI-110 / VIS-04 queda resuelta sobre `ea62e0b`, con las pruebas automatizadas anteriores y esta validación manual del usuario. [Registro y alcance](evidence/safari-manual-2026-10-05/README.md). No se recibieron capturas ni mediciones de la sesión manual; no se presentan como resultados de safaridriver. El bloqueo de automatización queda como antecedente histórico y deja de impedir el cierre. VIS-08/09/12 son las tres brechas estéticas restantes.

## Ejecución: wordmark y Figtree · 05/10/2026

[Plan](../plans/2026-10-05-wordmark-brand.md). ANI-114 / VIS-08 completa el trabajo tipográfico desde `8e522ae`, rama `feat/wordmark-brand`. Estado Figtree Bold ya estaba implementado; header y muestra `/tokens` pasan de 800/−0.035em a 700/−0.045em mediante un token exclusivo. El tracking de preguntas/títulos y las animaciones aprobadas se conservan.

Se revisó el wordmark y su parte tipográfica en los lockups del PDF p. 3. Fuente local realmente cargada, sin transformaciones ni cambios de tamaño para simular la referencia. Orígenes de letras normalizados por tamaño: diferencia máxima 0.001593em entre PDF y los tres motores, con medición ampliada para limitar redondeo de `Range` en WebKit. [Capturas propias y método](evidence/wordmark-brand-2026-10-05/README.md).

132 casos por motor en Chromium/WebKit/Firefox, 320/390/520px, texto 100/200% y alto 844/470px: header y Ayuda sin superposición ni desbordes; objetivo ≥44px y contraste mínimo 8.0356:1. Skip link por teclado y galería verificados. Se mantienen las 84 combinaciones de composición y la regresión de slider continuo en los tres motores. La galería incorpora dos colores compartidos omitidos en baseline; su prueba distingue tokens globales de variables locales y respeta el scroll documentado de ánimo en alturas cortas. En este checkpoint de ANI-114, VIS-09/12 seguían pendientes; su cierre posterior se registra debajo.


## Cierre de ANI-115/118 · VIS-09/12 · 05/10/2026

Implementación `092c668`: `/` Next.js incorpora símbolo Neutral compartido y gesto opcional de 600 ms. Visible desde SSR, sin bloquear texto/CTA/Ayuda, una primera visita por sesión y salteable por interacción, salida, reduced motion o visibilidad. Visitas directas a otras rutas consumen la entrada. No se importaron montaje publicitario ni fuentes privadas.

`shared/visual/` unifica estados/geometría, árbol SVG/material y sus variantes, controlador, movimiento/teclado, entrada y CSS de acciones/range. React mantiene nodos; el prototipo monta una vez y conserva posiciones fraccionarias al navegar, con borrador entero. `app/globals.css` conserva autoridad sobre tokens; exportación generada al prototipo y guard de build/prueba impiden deriva. No se copió su CSS de pantalla a la app.

[Capturas, video y mediciones nuevas](evidence/brand-system-2026-10-05/README.md): Chromium/WebKit/Firefox, 12 reflows por motor a 320/390/520px, texto 100/200% y alto 844/470px; diez posiciones de paridad por motor, siete estados compactos reales, ciclos e identidad de nodos. Contraste inicial 6.3046:1, mínimo capturado de paridad 5.0755:1 y regresión de arrastre de 61 posiciones/motor 4.7165:1. Se conservan geometrías/movimiento aprobados y regresiones de tokens, 84 reflows de composición y flujo/guardado/exportación. Prototipo validado hasta emoción/factores, recarga/descarte y offline, con catálogo interceptado.

La revisión independiente detectó regresiones de extracción del prototipo; se reprodujeron y corrigieron, agregando cobertura del recorrido completo. Segunda revisión sin hallazgos importantes. WebKit se registra como motor; la validación manual de Safari de ANI-110 no se reabre ni se atribuyen nuevas mediciones automatizadas a Safari.
