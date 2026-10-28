# Brechas estéticas de eudila · revisión del 04/10/2026

**28/10/2026 · rueda de emociones:** se integra el recorrido por capas aprobado por el usuario sobre el tema claro vigente, conservando slider, mascota y tokens compartidos. Listas de 18 emociones positivas y seis sentimientos por color, filtro por ánimo, recorrido editable y selección final requerida también al volver a revisión. No cierra brechas estéticas globales. [Decisión y publicación](../decisiones/2026-10-28-rueda-emociones.md).

**Integración para CD del 28/10/2026:** se conservaron en los workspaces actuales el guardado de cuenta y el botón Google blanco ya publicados. No cambia la identidad visual ni el estado de las brechas. Se comprobó el recorrido Next.js real con dos cuentas locales: guardar, recargar, otro navegador, consumidores, exportación, aislamiento y reintento tras respuesta perdida. La prueba generó nuevamente las capturas en `evidence/registros-cuenta-2026-10-27/`. [Plan del despliegue continuo](../plans/2026-10-28-vps-cd.md).

**Estado:** desde el 23/10/2026 el branding vigente incluye la mascota eudila y el logo Muy agradable ([especificación](mascota/README.md)); sus brechas de implementación VIS-13 a VIS-17 quedaron resueltas el 24/10/2026 en las rutas Next.js reales (evidencias `mascota-logo`, `mascota-animo` y `mascota-momentos` de esa fecha). Diagnóstico original conservado como baseline; VIS-05/10/11 verificadas en acciones y contraste (04/10), VIS-01/07 verificadas en ambiente y composición (05/10). VIS-02/03/06 verificadas en material, geometría y movimiento (05/10). VIS-04 resuelta con pruebas automatizadas en Chromium/WebKit/Firefox y prueba manual en Safari confirmada por el usuario (05/10). VIS-08/09/12 siguen abiertas; VIS-08 y VIS-12 tienen avance parcial. Baseline: `main` en `414ceca4b31220c2be760ed0cd58daa9cfaa3e5a` (PR #9). Próximas sesiones deben consultar este informe junto con `DESIGN.md`, actualizar estados y conservar evidencia; no repetir la definición de marca desde cero.

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

**27/10/2026 · botón Google blanco:** excepción solicitada por el usuario para el proveedor: blanco/Grafito y G oficial multicolor. Conserva el recorrido, foco y movimiento reducido. [Evidencia en la bienvenida real](evidence/google-blanco-2026-10-27/README.md); no cierra otras brechas de marca.

**28/10/2026 · informe PDF con marca:** a pedido del usuario el informe de Exportar deja de imprimirse en blanco y negro: lockup `logo-mascota.svg` + wordmark Figtree, acento coral `--color-mood-7-orb`, tarjetas sobre `--color-canvas`, barras de distribución y bordes de cronología con los siete colores de ánimo y la mascota quieta con carita (`MoodOrb compact`) por estado. Se imprime con `print-color-adjust: exact`. Se quitó la descarga JSON; queda solo CSV. El período suma «Elegir fechas»: dos `input type="date"` nativos (Desde/Hasta) acotados al historial; un rango invertido o fuera del historial deshabilita el PDF y explica por qué. Verificado generando el PDF A4 desde `/exportar` en Chromium.

**27/10/2026 · persistencia de cuenta:** la confirmación, Hoy y Exportar se integran con el historial privado de Supabase conservando composición y tokens. Las cuentas usan «Guardar registro», los errores preservan el borrador y los ejemplos quedan exclusivos del preview. [Evidencia local sobre Next.js real](evidence/registros-cuenta-2026-10-27/README.md). Este cambio funcional no cierra brechas de marca ni certifica el despliegue remoto.

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
| VIS-08 | P2 · abierta | **Tipografía del estado y wordmark divergentes.** Estado usa sans del sistema 600, no `font-display` 700. Header usa Figtree 800/−0.035em frente a Bold/tracking −45 del PDF. | Aplicar Figtree Bold al estado; validar lockup y tracking del wordmark como unidad separada. No romper sistema de controles ni encoger textos para imitar video. |
| VIS-09 | P2 · abierta | **Inicio sin símbolo y splash de marca en app principal.** `app/page.tsx` muestra pregunta/copy/acciones; implementación de entrada ANI-69 vive en `prototype/`, no en `/` de Next.js. | Integrar símbolo/entrada Neutral coherente si se mantiene la apertura de marca; breve (<2 s), salteable, no repetida por navegación ni bloqueante. No importar montaje completo o títulos publicitarios. No considerar ANI-69 prueba de esta ruta. |
| VIS-10 | P2 · resuelta (acciones 04/10) | **Vocabulary de acciones inconsistente.** Inicio/registro principales usan radio 14 px; auth cápsula; otras acciones de historial con radio control. | Separar variantes acción principal/secundaria/control/tarjeta en componentes/tokens compartidos y registrar excepciones. Aplicar cápsula a principales sin redondear todo el producto. |
| VIS-11 | P2 · adaptación AA verificada (acciones 04/10) | **Conflicto referencia/AA.** Blanco sobre azul, turquesa y coral no alcanza 4.5:1; primary institucional tampoco lo logra con blanco. El código actual ya adapta algunos inks y oscurece action, lo cual es correcto. | Conservar la adaptación de DESIGN.md al introducir botones emocionales; no «corregir» la tinta a blanco por fidelidad. Esta brecha es de especificación de referencia, no un error a revertir del código. |
| VIS-12 | P3 · abierta | **El sistema vive repartido entre prototipo y Next.js.** Colores en `moods.js` y globals, estilos de orbe en prototype, renderer distinto en historial y registro. | Fuente técnica compartida para estado/renderer/variants, tests de paridad y documentación de las representaciones compactas. Reutilizar no significa arrastrar todo el CSS del prototipo. |
| VIS-13 | P1 · resuelta (24/10, [evidencia](evidence/mascota-logo-2026-10-24/README.md)) | **Logo de la app sigue siendo el Neutral sin cara.** `app/layout.tsx` usa `public/brand/logo.svg` en una caja de 32 px con símbolo de 24 px; `public/help-sw.js` y los tests de Ayuda guardan ese archivo para uso offline. | Header con la mascota Muy agradable animada según [mascota](mascota/README.md): caja de 72 px, wordmark Figtree 700 `2.25rem`, ojos felices, destellos y reloj propio. Sin JS o con movimiento reducido, `public/brand/logo-mascota.svg`. Actualizar copia offline de Ayuda y sus tests. Reflujo a 320 px y texto al 200%. |
| VIS-14 | P1 · resuelta (24/10, [evidencia](evidence/mascota-animo-2026-10-24/README.md)) | **Neutral con cinco capas.** `app/mood/orb.tsx` dibuja las cinco capas en todos los estados. | Neutral con tres capas: las de escala .52 y .36 con opacidad `clamp(\|ánimo − 4\| × 1,5)`, también durante el arrastre continuo y en la versión compacta de historial. |
| VIS-15 | P2 · resuelta (24/10, [evidencia](evidence/mascota-animo-2026-10-24/README.md)) | **La mascota con carita no existe en la app.** El orbe de ánimo no tiene ojos, parpadeo, mirada autónoma ni temperamentos. | Ojos, expresiones, parpadeo, mirada autónoma y temperamentos según la especificación. Prueba de que el puntero no altera la mascota (solo el toque) y de que dos mascotas no van sincronizadas. Movimiento reducido quieto. |
| VIS-16 | P2 · resuelta (24/10, [evidencia](evidence/mascota-momentos-2026-10-24/README.md)) | **Momentos de la mascota ausentes.** No hay Saludo, Escucha, Guardado, Descanso, Ayuda ni Toque. | Saludo en splash/inicio (junto con VIS-09), Escucha en el slider, Guardado en la confirmación (igual en los siete estados), Descanso en vacíos, Ayuda en el primer uso. Tiempos de la tabla de momentos; ninguno bloquea la interacción. |
| VIS-17 | P3 · resuelta (24/10: el usuario eligió la mascota Muy agradable; [evidencia](evidence/mascota-logo-2026-10-24/README.md)) | **Icono de app y favicon.** No hay manifest ni favicon propios; DESIGN.md describe un icono Neutral al 64% sobre turquesa. | Confirmar con el usuario si el icono adopta la mascota Muy agradable. Hasta entonces no inventar uno. |

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

## Verificación acotada del selector · ANI-64 · 11/10/2026

Sobre main `bd7339e`, el selector conserva Nube/Grafito y el action institucional adaptado a AA; no adopta ilustraciones ni categorías del mock. Se corrigió «Siguiente» a cápsula con `rounded-pill`, conservando ≥50 px, y el título de lista a Figtree Bold con `font-display`, según brandbook pp.9–10 y DESIGN.md. Los chips mantienen ≥44 px; se ajustan espacios del paso emoción para mostrar las seis sugerencias completas a 320 × 568 sin desplazar. El resto de pasos conserva su espaciado.

La prueba falló antes de las correcciones por radio de 14 px y por la última sugerencia fuera del main. Después pasan cápsula, tipografía, visibilidad/tamaño táctil en 320/390/520 px, teclado/foco, búsqueda y reflujo con texto al 200%. La prueba separada contra Supabase local real obtiene las 21 opciones del endpoint; no usa respuestas interceptadas. [Plan y resultados](../plans/2026-10-11-ani-64-cierre.md) · [Capturas y procedencia](evidence/ani-64-2026-10-11/README.md).

Esta evidencia corresponde exclusivamente al selector en la ruta Next.js. Las brechas globales VIS-01–12 conservan sus estados: el ajuste de esta cápsula no certifica la unificación de todas las acciones, el orbe ni el wordmark. No se verificó el destino Supabase Cloud ni persistencia de cuenta.

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
- VIS-08 pendiente de wordmark; VIS-09 de inicio. VIS-12 avanza con geometría común y renderer Next compartido, pero el prototipo conserva material/ciclos propios; ANI-118 continúa abierta.

## Corrección de Algo agradable · 05/10/2026

Pedido explícito de ajustar solo ese estado; los otros seis fueron aceptados. Se amplía/redondea la gota del estado 5 para evitar lectura triangular durante el giro, comparando con brandbook p.6 y Motion alrededor de 7s. No se cambian ciclos, colores ni renderer. Prueba de proporción falló antes del cambio y pasa después; hashes acreditan los seis contornos anteriores sin modificaciones. Build/lint/formato, geometría/morph/AA y regresión de movimiento en Chromium/WebKit/Firefox pasan. Capturas de cuatro fases de giro, entrada/salida por estados vecinos, reduced motion y reflujo 320px/200%: [evidencia nueva](evidence/algo-agradable-2026-10-05/README.md). Las brechas pendientes conservan su estado.

## Aclaración: transición completa y slider continuo · 05/10/2026

El usuario señaló que la revisión debía cubrir la transición completa y que la barra no debía detenerse por categorías. Se inspeccionaron entrada/permanencia/salida del video en fotogramas cada 100/167ms. La posición visual ahora es continua (`step=any`) e interpola vecinos directamente durante arrastre, sin snap al soltar; teclado mantiene transición de marca y categoría entera de registro. Solo Algo agradable agrega ondulación orgánica por capa; los otros seis contornos/ritmos/colores se conservan. Valores técnicos de ondulación (8s, fases 0.7rad, amplitud máxima 8 unidades) quedan documentados como traducción visual, sin atribuirlos al PDF.

61 posiciones distintas observadas por motor; 5.25 retenido al soltar, contraste mínimo 4.716:1 y borrador válido entero 5. Teclado/puntero Chromium/WebKit/Firefox y tap Chromium/WebKit; pausa/reduced motion, navegación/recarga, build/lint/types/formato/unidades y recorrido completo de frontend pasan. Se corrigió pausa indebida de destellos en posiciones vecinas a Neutral. Revisión independiente sin problemas concretos. [Capturas y grabaciones de transición completa](evidence/mood-continuous-2026-10-05/README.md). Safari y VIS-08/09/12 conservan sus pendientes anteriores.

## Cierre: slider y Safari manual · 05/10/2026

El usuario confirmó haber realizado la prueba manual en Safari y pidió dar por hecha la comprobación pendiente. ANI-110 / VIS-04 queda resuelta sobre `ea62e0b`, con las pruebas automatizadas anteriores y esta validación manual del usuario. [Registro y alcance](evidence/safari-manual-2026-10-05/README.md). No se recibieron capturas ni mediciones de la sesión manual; no se presentan como resultados de safaridriver. El bloqueo de automatización queda como antecedente histórico y deja de impedir el cierre. VIS-08/09/12 son las tres brechas estéticas restantes.

## Iteración local: logo y barra inferior · 11/10/2026

Pedido del usuario sobre localhost: incorporar el logo arriba a la izquierda y un icono sobre las palabras de navegación. Se agrega el símbolo Neutral con material de cinco capas/núcleo, sin máscara de icono de app, y se usa Figtree Bold con tracking propio en el wordmark. Relación comprobada en Chrome: símbolo 24 px / altura de x 20 px = 1.2; respeto de medio diámetro conservado, fuente y símbolo escalan con zoom. Los tres iconos reutilizan los trazos convencionales del repositorio; etiquetas, destinos y foco accesible se conservan.

[Evidencia y capturas](evidence/logo-navigation-2026-10-11/README.md). Iteración sobre main `5f4374b`, incluida en la integración de ánimo/logo/navegación autorizada por el usuario. No se cierran brechas ni issues por esta iteración: VIS-08 también incluye la tipografía de estado y VIS-09 la experiencia de entrada. No se cambia la identidad general ni el renderer emocional.

## Corrección de la versión servida en localhost · 11/10/2026

El usuario detectó que `/registro/animo` mostraba la versión anterior. El servidor estaba sobre main `5f4374b`, que entonces no incluía los seis commits de `feat/mood-orb-motion` hasta `8e522ae`. Se incorporó esa entrega a la misma copia local, conservando ANI-64, logo e iconos. El usuario autorizó integrar y publicar esta versión combinada en main. La entrega de `feat/logo-navigation-local` reúne ambos trabajos y conserva su evidencia; el PR identifica el resultado final. La vista local en `http://127.0.0.1:3000` sirve el mismo contenido integrado.

Los módulos de orbe/controlador/movimiento/shell/geometría se conservaron idénticos a la rama aprobada. Los conflictos de registro y selector se resolvieron preservando su estado, validación, almacenamiento y navegación, así como la compactación del selector y las acciones compartidas. Se comprobó la ruta real con ambiente, cinco capas, slider `step=any`, logo e iconos. Chrome: 61 posiciones, 5.25 retenido al soltar, contraste mínimo 4.716:1, giro/respiración, retargeting, partículas, pausa/reduced motion, teclado, navegación y recarga correctos. Pasan también lint, tipos, formato, siete pruebas Node de geometría/worker y el recorrido completo de frontend en localhost. Revisión independiente sin bloqueantes; las comprobaciones Cloud y publicación conservan su alcance separado.

## Auditoría Impeccable y pulido de producto · 18/10/2026

Recorrido completo en `next dev` con vista previa (`.env.local` copiado de `.env.example`; sin él, `/registro/emocion` bloquea el registro de forma deliberada). Cambios dentro de la marca, sin colores nuevos:

- Scroll: `<main>` es el contenedor desplazable y Next no lo reiniciaba; cada paso abría con el scroll del anterior. `app/shell.tsx` lo vuelve a cero en cada ruta.
- Foco programático en `h1`/`main` (`tabindex=-1`) sin anillo; los controles conservan el suyo.
- Atrás/cerrar usan en todos los pasos el mismo control circular de 32/44 px: tinte Grafito 7% sobre Nube, blanco 14% sobre ambiente. Reemplaza los enlaces de texto «Volver/Cerrar» fuera de ánimo; nombres accesibles sin cambios.
- Factores: chips con wrap (vocabulario de emociones), con checkbox nativo visible. CTA visible sin desplazar a 390 × 844.
- Emoción: «Siguiente» queda abajo y «Cambiar ánimo» debajo, en lugar de dos `mt-auto` compitiendo.
- Revisión: filas etiqueta/valor con «Cambiar» a la derecha (nombre accesible completo con `sr-only`), momento con mayúscula y orbe compacto del ánimo.
- Hoy/Calendario/Día: CTA a ancho completo y enlaces secundarios en una lista alineada al borde. «Ver otros días» se agrupa con ellos.
- Calendario: los días pasados sin registros pierden el marco; solo hoy y los días con datos lo tienen. Gutter de 24 px como en el resto de las rutas (análisis también pasa de 16 a 24 px); la grilla conserva su ancho.
- Evolución: los puntos se rellenan con el acento del estado redondeado y borde Grafito; número, tabla y etiqueta siguen acompañando al color.
- Exportar: singular correcto («1 registro», «el único registro»).
- VIS-09, avance parcial: orbe Neutral estático de 144 px en `/` y composición centrada. El splash no se integra; la brecha sigue abierta.

Verificación: lint, tipos, formato, `node --test` (30/30), `frontend.test.py`, `design-actions.test.py` y `design-mood.test.py` contra el build en 3118, y `emociones.test.py`. Reflujo sin desborde horizontal en diez rutas a 320 px, con texto al 100% y al 200%. `app/analisis/browser.test.py` falla con la misma aserción en `3fb9335` sin estos cambios (`main` de 86 px a 320 × 568 con texto al 200%): es preexistente y queda pendiente.

## Decisión: tema oscuro, menos texto y movimiento de interfaz · 18/10/2026

El usuario pidió tema oscuro como en el slider de emociones, menos texto a la vista, más desplegables, íconos y animaciones. La decisión queda registrada en `DESIGN.md` y en `PRODUCT.md`.

- Lienzo: degradé Neutral en todas las rutas. Emoción, factores y revisión conservan el ambiente del ánimo elegido, con el CTA en su acento. Al salir vuelve al Neutral en 600 ms.
- Tokens oscuros AA (secundario ≥4.95:1 y acción ≥4.87:1 contra la parada superior de los siete ambientes, también sobre tarjeta). Campos y diálogos opacos. Impresión clara.
- Texto: las explicaciones de Evolución, Factores, gráfico, calendario y Exportar pasan a `Disclosure`. Se quitan los textos redundantes de la revisión, del tipo de registro y de factores. El estado «Elegiste» queda solo para lectores de pantalla. La tabla «Datos por día» y Ayuda siguen visibles.
- Íconos: momentos del día, atajos de Hoy/Calendario (Otros días, Evolución, Factores, Exportar), pestañas de análisis segmentadas, descargas/impresión, teléfono en Ayuda y en el header, aviso de vista previa.
- Movimiento: entrada por pantalla y por paso, listas escalonadas, selección/press, desplegables y tab activa. El fundido se conserva con movimiento reducido.
- Correcciones durante la verificación: el aviso de vista previa vuelve a ser transparente (generaba una banda sobre el ambiente). El CTA del slider ya no transiciona color: rompía el AA por cuadro (1.36:1). El chip de ánimo en emoción se compacta para mantener seis sugerencias visibles a 320 × 568.
- Test actualizado: `design-mood.test.py` ahora espera degradé Neutral sin `data-mood` fuera del slider, en lugar de `background-image: none`.

Verificación: lint, tipos, formato, `node --test` 30/30. Pasan `frontend`, `design-actions`, `design-mood`, `mood/motion`, `mood/continuous`, `emociones` y `ayuda`. Siguen fallando con la misma aserción que en `HEAD`: `analisis/browser` (main de 86 px a 320 × 568 al 200%) y `tokens` (`height:6` del selector de `max-height:600px` en `registro.tsx`). Ambas son preexistentes.

## Ajuste: lienzo Grafito · 18/10/2026

Al usuario no lo convenció que el fondo tuviera el mismo turquesa que el logo. Se compararon en vivo, sobre Hoy, grafito, azul noche e índigo grafito; se eligió Grafito (`#2A2A2E` → `#0B0B0C`). Es color del brandbook, deja el color al logo, al orbe y al ánimo, y evita que el fondo lea como Neutral. El azul noche se descartó porque se confunde con los estados 2–3. Los pasos del registro conservan ambiente y piso `#071416` del ánimo, con transición de vuelta a Grafito. Superficie opaca neutra `#161618`. Pasan `design-mood`, `design-actions`, `mood/motion`, `mood/continuous`, `frontend` y `ayuda`.

## Ajuste: lienzo «Aurora» · 18/10/2026

Al usuario el Grafito le pareció «muy triste» y habilitó cambiar el brandbook. Se compararon en vivo, sobre Hoy, cuatro opciones: Aurora, Atardecer (azul → violeta), Ciruela con halo rosado y Laguna (petróleo con luz aguamarina). Eligió Aurora: base #1A1626 → #100D18 con luces radiales estáticas de los tonos del orbe (violeta 32%, celeste 26%, ámbar 22%). En el registro las luces se apagan con `--glow` y aparece el ambiente del ánimo; al salir vuelven en 600 ms. El slider conserva su degradé aprobado sin luces, de modo que el test de paradas sigue vigente. Contraste en el peor punto (luces superiores superpuestas en su pico y sobre tarjeta): secundario 4.96:1, acción 4.88:1. Superficie opaca #18151F. Pasan lint, tipos, `node --test` 30/30, `design-mood`, `design-actions`, `mood/motion`, `mood/continuous`, `frontend` y `ayuda`.

## Ajuste: neutrales teñidos de violeta · 18/10/2026

Tras Aurora quedaban colores del lienzo turquesa: texto secundario gris verdoso (#CFDADA), líneas y tarjetas blancas neutras y enlaces en menta pálida (#9BE3E1). Se tiñeron hacia el violeta de la base: texto #F4F1FA, secundario #DAD5EA, tarjetas y líneas lavanda #D6D0E6 (6% / 30% / 48%), texto sobre el slider #E6E2F0. La acción pasa a #8EE2DF, más saturada, y se conserva como único turquesa (color del logo). Contraste en el peor punto de Aurora sobre tarjeta: texto 6.4, secundario 5.0, acción 4.8. Pasan `design-mood`, `design-actions`, `mood/motion`, `mood/continuous`, `frontend` y `ayuda`.

## Onboarding y acceso real · 19/10/2026

Se implementan `/bienvenida`, alta/ingreso, confirmación de email, recuperación, `/empezar` y cuenta sobre Supabase Auth local real. Nombre opcional y finalización del onboarding se guardan en perfiles aislados por RLS; no se presenta el historial emocional como sincronizado. Google usa el flujo OAuth del mismo proveedor y queda anunciado como no habilitado hasta contar con credenciales externas.

Se conserva la superficie neutra, Figtree en preguntas, logo existente, Neutral estático de bienvenida y acciones institucionales AA. Ayuda permanece pública y visible; las tabs se omiten durante acceso/onboarding. Se comprobaron las rutas Next.js en build de producción con capturas, 18 casos de reflujo al 200%, foco/teclado y reduced motion. Regresión de acciones: siete pares AA y 54 combinaciones de reflujo. [Evidencia, comandos y límites](evidence/auth-onboarding-2026-10-19/README.md).

No se cierran VIS-08/09/12: esta bienvenida nueva no certifica la animación histórica del inicio ni la migración completa del prototipo. Google real, SMTP externo y publicación Cloud no se verificaron.

## Decisión: mascota eudila y logo Muy agradable · 23/10/2026

El usuario pidió ideas para convertir a eudila en mascota o avatar. Se exploraron cuatro direcciones en una página interactiva (Orbe vivo, Mirada, Chispa y Tu eudila), construidas con la geometría, el material y los tiempos reales del orbe. Después la iteró y la aprobó como nuevo branding.

- Aprobado: estética de la exploración; Neutral con tres capas («sacale círculos del medio»); logo principal en el estado «más alegre» (Muy agradable); logo con carita, más visible y con detalles.
- Rechazado: cachetes rojos; cualquier seguimiento del mouse, directo o indirecto (mirada al puntero, saltos por hover, mirada hacia el pulgar del slider); movimientos sincronizados entre mascotas.
- Excepción documentada: DESIGN.md descartaba caras tipo emoji. La carita de la mascota es la única cara permitida y no habilita otras ilustraciones.
- Referencia: [`mascota/eudila-viva.html`](mascota/eudila-viva.html), [especificación](mascota/README.md), [`public/brand/logo-mascota.svg`](../../public/brand/logo-mascota.svg) y [capturas](mascota/capturas/). Publicada en https://eudila.agustinpedernera.com (VPS Oracle, Cloudflare Tunnel `eudila-site`).

Verificación de la referencia: sin desborde horizontal en Chromium y WebKit a 320, 375, 414, 768, 1024 y 1440 px; tabla apilada y franja de temperamentos desplazable con aviso en celular; script sin errores. La ausencia de dependencia del puntero se verificó en el código: solo los toques leen el puntero. Una comparación de cuadros con y sin mouse no fue concluyente porque la página no es determinista entre corridas. No se probó Safari físico ni la app Next.js, que no cambió.

## Ajuste: lienzo «Lisa» · 24/10/2026

Con la acción y la mascota en coral, el usuario pidió un fondo más limpio que acompañe ese color. Se compararon sobre `/hoy` (390 × 844, con un registro de ejemplo) cinco fondos: Aurora (actual), Coral solo (una luz coral arriba a la izquierda), Brasa (base ciruela con coral arriba y ámbar abajo), Lisa (luz coral tenue arriba) y Coral y violeta. Eligió Lisa: una sola luz `--color-mood-7-orb` al 12% sobre la base violeta existente, sin las luces violeta, celeste y ámbar. Tokens de base, `--glow` y el registro no cambian. Contraste en el punto más claro del lienzo sobre tarjeta: texto 11,9, secundario 9,3, acción 8,6 (antes 8,2 / 6,4 / 5,9 en la misma medición). Después, a pedido del usuario para la raíz `/`, la página alrededor de la columna en pantallas anchas también usa Lisa (antes era el piso plano `#100D18`) y la columna fija su fondo a la ventana para que la luz coral continúe sin costura; la impresión quita ambos fondos. Verificado en build de producción: `design-mood`, `design-actions` y `mood/motion` pasan.

## Ajuste: logo sin destellos · 24/10/2026

A pedido del usuario («sacale los brillos al logo principal»), el logo Muy agradable deja de mostrar los destellos de cuatro puntas. Se probó además agrandar el disco blanco ×1,3, pero el usuario prefirió el tamaño anterior («mismo tamaño de cara»): núcleo y ojos quedan como estaban. Aplica al logo animado del header (`Critter` con `particles: 0`), al SVG estático `public/brand/logo-mascota.svg`, al favicon `app/icon.svg` (mismo archivo) y a los íconos `apple-icon.png`, `icon-192.png` e `icon-512.png`, regenerados desde el SVG al 64 % sobre `#1A1626`. La referencia viva `eudila-viva.html` usa el mismo valor. Las demás mascotas conservan sus partículas.

## Apertura del onboarding · 26/10/2026

Pedido del usuario: una animación inicial del onboarding «como un showreel» de motion design. Hubo dos versiones: la de Sonnet 5.5 (rama `147pop/intro-sonnet`, commit `a8f045b`) y la vigente, hecha a partir de sus debilidades documentadas en `docs/design/handoff-intro-opus.md`. Especificación en la fila «Apertura» del [README de la mascota](mascota/README.md).

- Dentro de la marca: solo el orbe y su carita, Figtree en wordmark y nombres, lienzo «Lisa» con las luces bajas, ambientes de la tabla, slider con sus medidas reales. Sin gamificación, glassmorphism ni degradés de texto. Los siete estados pesan lo mismo: el péndulo alterna lados desde Neutral, cada estado dura un pulso de 600 ms y la fila final los muestra iguales. El coral del final es el logo, separado del recorrido por la fusión en un núcleo blanco.
- Nunca lee el puntero; cada mascota de la fila tiene su reloj. Neutral con tres capas, sin cachetes ni boca (motor sin cambios de dibujo; se agregaron `still` y `spinA` públicos).
- Accesibilidad: «Ayuda ahora» queda encima y responde; «Saltar» (y Esc) en todo momento; formulario `inert` y foco al título al terminar o saltar; con movimiento reducido se omite; reflujo a 320 px y texto al 200 %.
- Corrección encontrada en la verificación: la entrada de ruta (`.route-enter`, con `transform`) encerraba la capa fija dentro de `<main>`; en esta página la entrada la hace la apertura. `SessionScope` vuelve a montar la página al resolver la sesión, así que la marca de «vista» se guarda al terminar o saltar.
- Verificado en Chromium headless (Playwright) a 320, 390 y 1440 px, con texto al 200 %, movimiento reducido, saltar, teclado y Ayuda. No se probó un celular real, Safari ni Firefox. [Evidencia, mediciones y límites](evidence/apertura-2026-10-26/README.md).

## Ajuste del acceso · 26/10/2026

A pedido del usuario se ordenan las pills del login: email primero, recuperación junto a contraseña, ingreso coral, Google debajo del separador y alta en una cápsula secundaria del mismo ancho. Introducción centrada y control «Mostrar» integrado al campo. Se aplica al componente `AuthForm`; bienvenida, cuenta y onboarding conservan su composición. Build de producción, lint, tipos, teclado, validaciones, 36 casos de reflujo/movimiento y regresión existente de acciones AA verificados. [Evidencia y límites](evidence/login-2026-10-26/README.md). No cambia el estado de las brechas globales.

Refinamiento posterior del mismo día: «Mostrar/Ocultar» se reemplaza por ojo/ojo tachado, con nombre accesible, tooltip y objetivo mínimo de 44 px. Se conservan los textos de las demás acciones y campos. Verificados teclado, visibilidad de contraseña y 12 casos de reflujo en ingreso/alta en desarrollo; lint, tipos y formato pasan. [Captura actual](evidence/login-2026-10-26/iconos-390.png).

## Entrada antes del acceso · 26/10/2026

El usuario pidió una pantalla posterior a la animación con solo Google, Ingresar y Registrarse, antes de pedir datos. `/bienvenida` reutiliza la apertura existente; `/ingresar` y `/crear-cuenta` quedan para los campos, y `/empezar` ya no repite la presentación. Se conservan Lisa, la mascota/coreografía, el logo estático y Ayuda. Verificados apertura completa/salto/Esc, cookie, foco, movimiento reducido, navegación y seis casos de reflujo en Next.js real de desarrollo y producción. Build, lint, tipos, formato y 37 pruebas Node pasan. [Captura, comandos y límites](evidence/entrada-acceso-2026-10-26/README.md). No se cierran brechas globales por esta reorganización.

## Cierre pausado y bienvenida elevada · 26/10/2026

A pedido del usuario, el último tramo de la apertura (desde el florecimiento coral) corre al 70 % de velocidad: duración total ≈12,67 s. La entrada muestra «Un momento para vos.» y «Elegí cómo querés entrar.» sobre las tres opciones, con el bloque centrado horizontalmente y más arriba en la pantalla. Se mantienen el motor, las reglas de mascota, Lisa y acciones existentes. Build, lint, tipos y formato pasan; se amplía la prueba de bienvenida para duración, posición y errores de consola. [Captura y comprobaciones](evidence/bienvenida-cierre-2026-10-26/README.md). El error de Next reportado no se reprodujo en una sesión nueva y queda pendiente del mensaje exacto; no se declara corregido.

## Recorrido principal · 26/10/2026

El usuario define bienvenida → ingreso/alta → registro emocional. Se unifican los destinos de acceso/confirmación en `/registro/tipo` y se quita la personalización obligatoria del inicio; nombre e introducción quedan opcionales desde Cuenta. Validado en producción con Supabase local: alta/confirmación/reenvío, ingreso, cuenta sin nombre, recuperación, sesiones, RLS, cookies falsas, logout entre pestañas y 18 casos de reflujo. Build, lint, tipos, formato, 37 pruebas Node y prueba de bienvenida pasan. [Evidencia y límites](evidence/recorrido-acceso-2026-10-26/README.md). La sincronización emocional en cuenta continúa pendiente y la UI conserva el aviso.


## Organización técnica · 27/10/2026

La arquitectura solicitada separa `apps/web` y `apps/landing`. La fuente canónica de tokens pasa a `packages/brand/tokens.css`, importada por `apps/web/app/globals.css`; logos y Figtree viven en `packages/brand`. Mascota, controlador y geometría pasan a `packages/mood`; la landing genera su motor desde ese paquete. `docs/historia/prototype` conserva la referencia histórica, sin dependencia desde producción. Los valores visuales, temperamentos, carita y comportamiento de movimiento reducido se conservan. Las rutas públicas no cambian. No se cierra ninguna brecha estética por mover código; la validación de esta entrega se registra en `docs/arquitectura/verificacion-2026-10-27.md`. Las rutas de las evidencias anteriores describen la estructura de su fecha.


### Organización para publicación · 27/10/2026

Las aplicaciones ahora viven en `app/` y `landing/`, directamente en la raíz. El código compartido conserva `packages/mood` y `packages/brand`; `app/app/globals.css` importa sus tokens. PRODUCT.md y DESIGN.md quedan como documentos internos locales ignorados por Git. Esta mudanza no cambia decisiones visuales ni cierra brechas de marca.

## Modo claro por defecto · 27/10/2026

A pedido del usuario, la app, la landing y el panel usan el tema claro del canvas «Panel del psicólogo» (página Claro) como predeterminado: Nube teñida de violeta, tinta de «Lisa», acción coral oscurecida para AA y ambientes pastel por estado, con la misma luz coral arriba. La mascota, el logo y los siete colores de estado no cambian. La apertura conserva su escenario oscuro y devuelve la luz al aterrizar. [Decisión, contrastes y excepciones](../decisiones/2026-10-27-modo-claro.md). No se cierra ninguna brecha global por este cambio.


## Contacto de la landing · 28/10/2026

El formulario conserva su diseño y tokens, agrega Turnstile Managed claro y compacto antes del botón y comunica guardado solo tras confirmación del servidor. El mensaje queda en tabla privada; los errores conservan campos y renuevan el token. No cambia la mascota ni se cierra una brecha visual por integrar protección. Evidencia local y estado de producción en [contacto de la landing](evidence/contacto-landing-2026-10-28/README.md).

## Turnstile horizontal · 28/10/2026

A pedido del usuario, el widget de contacto pasa de compacto (cuadrado) a flexible horizontal. Se conserva el tema claro; el contenedor ocupa todo el ancho disponible, con mínimo de 300 px centrado. En 320 px y con texto al 200% puede usar parte del margen de la sección para quedar completo, sin escalar ni recortar el iframe. Se mantiene la validación de tokens y el guardado. La comprobación de reflujo verifica 65 px de alto y ambos bordes dentro de la pantalla. La navegación de la cabecera permite salto de línea: el ícono GitHub agregado recientemente y «Hablemos» desbordaban juntos al ampliar el texto; no cierra otras brechas visuales.
