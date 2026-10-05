# ANI-114 · Figtree y fidelidad del wordmark · Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corregir el peso y tracking del wordmark `eudila` en Next.js, conservar Figtree Bold del estado y cerrar VIS-08 con evidencia de la ruta real.

**Architecture:** Mantener texto HTML y la Figtree variable local ya cargada con `next/font/local`. Separar el tracking del wordmark mediante `--tracking-wordmark`, sin modificar `--tracking-brand` usado por preguntas y títulos. Header y muestra de `/tokens` comparten peso Bold y el nuevo token; no cambian orbe, slider ni sus animaciones aprobadas.

**Tech Stack:** Next.js 16.3.8, React 19, Tailwind 4, Figtree local; navegador real mediante Playwright para inspección y capturas.

---

## Diseño y alcance

Base `8e522ae`, rama `feat/wordmark-brand`, worktree separado en el directorio global ya utilizado por el proyecto. Usuario autoriza planificar y ejecutar la próxima tarea respetando el trabajo anterior. Se elige ANI-114 antes de ANI-115 (inicio) y ANI-118 (paridad del prototipo), por prioridad y porque completa la tipografía que quedó parcial al componer ánimo.

Referencia: brandbook v1.0 pp. 3–4 (wordmark/lockups) y p. 9 (tipografía), con identidad de los videos ya revisada. El PDF incrusta Figtree Bold. Su tracking −45 se traduce a −0.045em según la unidad tipográfica de milésimas de em documentada por [Adobe](https://helpx.adobe.com/indesign/desktop/format-and-style-text/tabs-indents-and-spacing/about-kerning-and-tracking.html). Esta regla de marca tiene precedencia sobre el piso genérico −0.04em de Impeccable y se limita al wordmark.

Se consideran tres enfoques: token exclusivo para el texto existente (elegido por fidelidad, accesibilidad y alcance); cambiar el tracking global (afectaría títulos ya aprobados); convertir el wordmark a SVG (agregaría un asset y una representación paralela sin necesidad). Se compara el texto con la parte tipográfica de los lockups, conservando proporciones y sin deformación. El header muestra solo wordmark; las medidas del lockup completo con símbolo no se aplican al orbe emocional de la pantalla. La entrada/símbolo de inicio permanece en ANI-115.

## Task 1: Corrección tipográfica compartida

**Files:** `app/globals.css`, `app/layout.tsx`, `app/tokens/page.tsx`.

1. Inspeccionar baseline en producción: peso 800, tamaño 26.4px, tracking −0.924px y ancho 68.546875px a 100%. Revisar la referencia privada sin publicarla.
2. Agregar `--tracking-wordmark: -0.045em` junto a los tokens tipográficos existentes. Mantener `--tracking-brand: -0.035em`.
3. En el wordmark del header cambiar `font-extrabold tracking-brand` a `font-bold tracking-wordmark`; conservar `text-wordmark`, `leading-wordmark` y texto en minúsculas.
4. Cambiar la muestra Wordmark de `/tokens` al mismo peso/tracking y agregar el nuevo token a los detalles. El peso 800 se etiqueta ExtraBold, no Wordmark.
5. No agregar tests que reflejen solo clases CSS para este ajuste reversible. Ejecutar verificación visual y las regresiones existentes que acreditan comportamiento real.

## Task 2: Verificación visual y accesibilidad

1. Ejecutar `npm run lint`, `npm run typecheck`, `npm run format:check` y `NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build`; se esperan códigos 0.
2. Servir la producción del worktree en 3120: `npm run start -- --port 3120`.
3. Verificar fuente local cargada, tamaño y proporciones sin transformaciones; capturar header claro, ánimo y muestra `/tokens`. Comparar visualmente con brandbook p. 3 sin copiar su imagen al producto ni al repo.
4. Revisar header, Ayuda, skip link y rótulos: contraste sobre lienzo claro y los siete ambientes, foco, ausencia de desbordes/cortes; ancho 320/390/520px, texto 100/200%, alto 844/470px y reduced motion. Guardar capturas propias y JSON en `docs/design/evidence/wordmark-brand-2026-10-05/`.
5. Ejecutar `MOOD_BASE_URL=http://127.0.0.1:3120 uv run --with playwright python app/design-mood.test.py` y `MOTION_BASE_URL=http://127.0.0.1:3120 MOTION_ENGINES=chromium,webkit,firefox uv run --with playwright python app/mood/continuous.test.py` para acreditar el selector/animación aprobados y sus controles. Verificar `/tokens` con su prueba existente si corresponde al ajuste de la galería.
6. Revisión independiente conforme a superpowers:requesting-code-review, sin mutaciones por el revisor; resolver hallazgos relevantes.

## Task 3: Documentar y entregar

1. Actualizar DESIGN.md (wordmark) e informe de brechas (VIS-08 resuelta), conservando diagnóstico histórico y alcance de ANI-115/118.
2. Registrar comparación, contraste, reflujo, fuente y alcance de navegadores junto a las capturas. No volver a solicitar automatización de Safari para este ajuste tipográfico; la prueba manual de ANI-110 continúa registrada como tal.
3. Commit y push de la rama; comprobar SHA remoto. Cerrar ANI-114 con vínculo a evidencia publicada solo después de verificar la ruta Next.js real.

## Ejecución

- [x] Contexto, Linear, referencias y baseline revisados; seis pruebas de geometría/morph/AA pasan en el worktree limpio.
- [ ] Corrección del header y galería.
- [ ] Verificación, capturas y revisión.
- [ ] Documentación, commit/push y cierre de ANI-114.
