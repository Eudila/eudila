# Transición completa y slider continuo

**Goal:** revisar la transición completa de Algo agradable y permitir deslizar el selector sin detenciones, según la corrección explícita del usuario.

**Architecture:** posición visual continua 1–7 separada de la categoría entera del registro. El controlador interpola geometría/tinte/ambiente/acción/partículas entre estados vecinos y sigue directamente el puntero; las selecciones por teclado conservan transición de marca de 600ms. Solo Algo agradable agrega una ondulación orgánica suave e independiente por capa, con el núcleo fijo y pausa/reduced motion compartidos.

**Tech Stack:** Next/React existentes, SVG, RAF, range nativo `step=any`, Playwright.

## Referencia y causa

Video pausado mediante fotogramas de entrada/permanencia/salida: secuencia 5.8–7.4s cada 100ms y 15–17s cada 167ms. Se observa contracción gradual de pétalos hacia el contorno orgánico, ondulación durante permanencia y salida hacia círculo; el selector atraviesa posiciones intermedias. Fuentes privadas conservadas en `/tmp`, sin incorporarlas al repo.

La corrección anterior solo ajustó el contorno estático. `step=1` restringe el thumb y la transición temporal se reinicia al cruzar cada categoría. Quitar el step sin separar posición/categoría rompería índices de geometría y persistencia. No se cambia el esquema de registros: se guarda la categoría más cercana (1–7), mientras la posición visual fraccionaria se mantiene durante esta sesión de la app.

## Pasos

1. Pruebas rojas: pesos de posiciones fraccionarias, contorno orgánico acotado/continuo y prueba navegador de arrastre con múltiples posiciones, sin snap al soltar y sin retraso de color/forma.
2. `app/mood/motion.ts` agrega interpolación por posición y ondulación orgánica suave; `controller.ts` combina frames vecinos y mantiene RAF de contorno únicamente donde Algo agradable participa. Misma línea de tiempo para selección discreta; pausa y reduced motion desactivan la ondulación.
3. `RegistroProvider` guarda posición visual y modo de interacción; persiste categoría entera. Slider `step=any`, arrastre directo, teclado por categorías/Home/End. `shell.tsx` transmite posición/modo al controlador. Otros seis contornos/ritmos se mantienen.
4. Build/lint/types/formato, unidades, arrastre/teclado en Chromium/WebKit/Firefox, captura de transición completa hacia/desde 5 y regresiones de registro/guardar. Documentación, revisión independiente, commit local y preview actualizada.

## Resultado

Implementado. Pruebas nuevas rojas antes del arreglo y verdes después; 61 posiciones distintas en cada motor, 5.25 sostenido al soltar y contraste observado ≥4.716:1. Tap fraccionario Chromium/WebKit. Pausa/reduced motion, teclado, persistencia/navegación y transiciones pasan; también regresión de movimiento/reflujo en tres motores y recorrido completo de registro/exportación. Se corrigió pausa de partículas cerca de Neutral exacto con regresión roja/verde. Build/lint/types/formato y seis tests de geometría/morph/AA pasan. Revisión independiente sin problemas concretos. [Evidencia propia](../design/evidence/mood-continuous-2026-10-05/README.md).
