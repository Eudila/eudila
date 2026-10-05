# ANI-114 · wordmark y Figtree · 05/10/2026

Ruta Next.js real en producción, base `8e522ae`, rama `feat/wordmark-brand`. [Plan](../../../plans/2026-10-05-wordmark-brand.md). Comparación con brandbook v1.0 pp. 3–4 y tipografía p. 9; las fuentes privadas permanecen fuera del repo.

El header usaba Figtree ExtraBold 800 y tracking −0.035em, compartido con todos los títulos. Ahora usa Figtree Bold 700 y `--tracking-wordmark: -0.045em`; preguntas/títulos conservan `--tracking-brand: -0.035em`. La muestra de `/tokens` usa la misma configuración. El tracking −45 del PDF se interpreta como milésimas de em según la [documentación de Adobe](https://helpx.adobe.com/indesign/desktop/format-and-style-text/tabs-indents-and-spacing/about-kerning-and-tracking.html). La especificación de marca prevalece sobre el límite genérico −0.04em de Impeccable y solo se aplica al wordmark.

El nombre del estado ya usa Figtree Bold; se verificaron los siete estados. La Figtree variable local está cargada en los tres motores, con peso 300–900 disponible. El texto conserva minúsculas, estilo normal, tamaño 1.65rem e interlínea 1, sin transformaciones. El header es wordmark tipográfico: no es el lockup completo con símbolo al que corresponden el mínimo 88px y la relación orbe/texto. Se comparó su parte tipográfica con los lockups de p. 3. La entrada/símbolo de inicio sigue en ANI-115.

## Comparación y capturas propias

- Header antes/después: [baseline](before-header.png), [corregido](after-header.png), [wordmark](wordmark.png).
- Lienzo claro: [inicio](home.png); muestra compartida: [galería](tokens-wordmark.png).
- Siete ambientes: [1](mood-1.png), [2](mood-2.png), [3](mood-3.png), [4](mood-4.png), [5](mood-5.png), [6](mood-6.png), [7](mood-7.png).
- Header a texto 200%: [320px](header-320-200.png), [390px](header-390-200.png), [520px](header-520-200.png). En 320px, Ayuda pasa a la segunda fila sin comprimir las letras.
- [Ánimo 320px/200%/reduced motion](mood-320-200-reduced.png), [skip link con foco visible](skip-link-focus.png).

[Mediciones por motor](measurements.json). A 100%, el ancho del wordmark pasa de 68.55px a 65.70px (Chromium), con el mismo tamaño 26.4px. Además de inspección visual, se compararon los orígenes relativos de las letras `e,u,d,i,l,a` del PDF con los de la Figtree del navegador, normalizados por tamaño de fuente. WebKit redondea los límites de `Range` a píxeles enteros; por eso la comparación usa una copia temporal del header a 540px con idéntica familia/peso/tracking, retirada antes de capturas/reflujo. Diferencia máxima respecto del PDF: Chromium 0.000024em, WebKit 0.001593em, Firefox 0.000594em. Se registran también las mediciones del header a su tamaño real, sin confundir el redondeo de límites con otra tipografía.

## Verificación y alcance

132 casos por motor: once superficies (inicio, ingresar, Hoy, galería y siete ánimos) × 320/390/520px × texto 100/200% × alto 844/470px. Sin desborde horizontal, superposición con Ayuda ni recorte del texto; Ayuda conserva ≥44px. Contraste del wordmark sobre Nube y las tres paradas de cada ambiente: mínimo **8.0356:1**. Skip link por teclado y Enter pasa; WebKit en macOS usa Option+Tab para incluir enlaces en su navegación, Chromium/Firefox Tab. La galería y los nombres de los siete estados mantienen Figtree Bold. No se presenta WebKit como prueba de la aplicación Safari; la validación manual de ANI-110 conserva [su registro](../safari-manual-2026-10-05/README.md).

La regresión existente de composición pasa 84 casos, incluido reduced motion, Ayuda, foco, diálogo y almacenamiento. El arrastre continuo pasa en Chromium/WebKit/Firefox: 61 posiciones, 5.25 retenido al soltar, mínimo AA 4.716:1, ondulación orgánica, pausa, navegación y borrador entero; touch en contextos Chromium/WebKit. Los contornos y ciclos aprobados se conservan.

Al verificar la galería se reprodujo un fallo previo al cambio: faltaban las muestras compartidas `--color-mood-bottom` y `--color-mood-secondary`, y el test trataba `--mood-spectrum` (local al range) como token global. Se agregaron las dos muestras y se delimitó el inventario a `@theme static`. La prueba también esperaba que ánimo no desplazara el documento a alto ≤600px: se alineó con la adaptación de DESIGN.md, conservando tamaño/hit-testing y comprobando que los accesos son alcanzables al desplazar. Las comprobaciones de las otras rutas siguen exigiendo shell persistente.

Se actualizaron también dos expectativas anteriores de esa suite: geometría/color se inspeccionan en `.mood-orb`, evitando confundirlo con los SVG de navegación; el paso de emoción verifica el catálogo de demostración cuando la app identifica explícitamente su modo preview, y mantiene el mensaje de catálogo no disponible en la configuración sin preview ni catálogo usada por defecto en la prueba.

La suite completa pasa: 71 tokens cubiertos, 15 pares AA, 16 combinaciones responsive de tema y 90 de shell, navegación/Ayuda, tipos, siete ánimos, recarga, descarte y almacenamiento bloqueado. Build, lint, tipos y formato pasan. Revisión independiente del wordmark y los ajustes de la galería sin problemas bloqueantes.

```sh
npm run lint
npm run typecheck
npm run format:check
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
npm run start -- --port 3120
MOOD_BASE_URL=http://127.0.0.1:3120 uv run --with playwright python app/design-mood.test.py
MOTION_BASE_URL=http://127.0.0.1:3120 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/continuous.test.py
TOKENS_BASE_URL=http://127.0.0.1:3120 uv run --with playwright python app/tokens/tokens.test.py
```
