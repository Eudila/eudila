# Ambiente y composición de ánimo — Implementation Plan

> Ejecución en esta sesión con superpowers:executing-plans; verificación antes de declarar cierre.

**Goal:** implementar ANI-107 / VIS-01 y ANI-113 / VIS-07 en `/registro/animo` real.

**Architecture:** un shell cliente recibe contenido del layout servidor y lee ruta/borrador compartido. Solo ánimo activa un ambiente de tres paradas con los tokens existentes; todos los elementos persistentes se integran sin bandas claras. El componente Registro conserva semántica, navegación, almacenamiento y diálogo.

**Tech Stack:** Next.js 16.3.8, React 19, TypeScript, Tailwind 4, Playwright Python/Chrome.

## Diseño y decisión

El usuario pidió elegir el próximo pendiente frontend, planificarlo y hacerlo siguiendo las guías estéticas. Autoridad: PRODUCT.md, DESIGN.md, revisión de marca, brandbook v1.0 p. 10 y video Motion. Se ejecuta bajo esa autorización sin otra pausa de aprobación.

Alternativas: (1) shell derivado de ruta/borrador (elegida, un solo estado y fondo continuo); (2) efecto que pinta el DOM desde Registro (riesgo de estilos persistentes al navegar y doble estado); (3) layout separado por ruta (duplicaría header/ayuda/preview). El shell servidor mantiene fuente local y metadata; la envoltura cliente admite children servidor.

Una persona registra en su celular, con luz interior variable y atención en una pregunta breve: ánimo usa el ambiente oscuro que exige la marca; las demás rutas mantienen Nube.

Decisión tras inspección al 200%: la fila de navegación usa columnas 44px / flexible / 44px, conservando atrás y cerrar en extremos aun cuando el progreso ocupe varias líneas. En alturas <=600px, el lienzo completo vuelve al flujo desplazable del documento: evita recortar texto/acciones entre cabecera y tabs. Ayuda, preview y navegación permanecen en el flujo; pueden necesitar desplazamiento en estas alturas. En alturas normales se conserva el main con scroll interno. No se achica texto ni se elimina una función para hacerla caber.

Fondo vertical: ambiente existente a 0%, mezcla ambiente 72% / Grafito a 56%, casi negro #071416 a 100% (traducción técnica del prototipo; no hex certificado). Header, tabs y preview transparentes con tinta blanca; popover y diálogo continúan neutrales. Ayuda sigue en un toque. Progreso visible. Atrás/cerrar: símbolo de navegación sobre círculo blanco al 14%, diámetro visual 32px y área táctil >=44px, nombre accesible estable. Pregunta centrada, orbe sin distorsión con tamaño limitado por alto/ancho, etiqueta única y acción inferior. Reflujo vertical mediante main scrollable.

El orbe sigue siendo el renderer actual: ANI-108/109/112/118 conservan sus criterios. Slider nativo sin rediseño (ANI-110). No se declara completo ANI-114 solo por alinear la tipografía del estado con DESIGN.md; wordmark sigue pendiente. Cambios instantáneos y sin nuevos ciclos; movimiento coordinado pertenece a ANI-112.

## Task 1 — Regresión de pantalla real

- Crear `app/design-mood.test.py`: siete fondos, navegación, recuperación del borrador, semántica del slider, Ayuda, aviso, confirmación de cierre y retorno a Nube.
- Ejecutar en baseline: `MOOD_BASE_URL=http://127.0.0.1:3118 uv run --with playwright python app/design-mood.test.py`; debe fallar por ambiente ausente.

## Task 2 — Shell y composición

- Crear `app/shell.tsx` con usePathname/useDraft y variable `--mood-ambient` derivada de draft.mood solamente en `/registro/animo`.
- Modificar `app/layout.tsx`: reemplazar contenedor por AppShell sin mover providers, contenido, ayuda o preview.
- Modificar `app/globals.css`: tokens del fondo final y tinta secundaria, reglas scoped para superficies persistentes y composición. Sin nuevas constantes de paleta emocional.
- Modificar `app/registro/registro.tsx`: clases y símbolos solo en ánimo; conservar Link/button, nombres, foco, slider y diálogo.

## Task 3 — Validación y evidencia

- `npm run lint`, `npm run typecheck`, `npm run format:check`, `NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build`.
- Test visual: siete estados y contraste sobre las tres paradas, teclado, ruta/historial del navegador, recarga, cierre, almacenamiento bloqueado, ayuda/preview, 320/390/520 px con texto 100/200%, alto corto y reduced motion.
- Regresión: `uv run --with playwright --with pypdf python app/frontend.test.py`, `uv run --with playwright python app/auth/browser.test.py` y prueba compartida `app/design-actions.test.py` contra el build.
- Inspeccionar capturas contra fuente interna; guardar evidencia de la app sin publicar PDF/video/fotogramas privados.
- Actualizar DESIGN.md, revisión de marca y README con alcance/resultados verificables. Revisar diff y dejar commit en rama de trabajo; sin publicar ni integrar cambios a main.

## Resultado verificado

- Prueba roja inicial: `mood ambient absent: none`.
- Implementación completa de ambiente y composición en Next.js; orbe/slider/movimiento conservan sus tareas.
- Prueba visual en producción: siete ambientes reales y contraste sobre paradas, ventanas neutras, navegación/borrador/recarga/diálogo/Ayuda, teclado, reduced motion y almacenamiento bloqueado. 84 casos de reflujo pasan, incluyendo controles completos visibles tras scroll.
- Lint, typecheck, formato y build de preview pasan. Regresiones de frontend completo, autenticación y acciones (54 casos) pasan.
- Revisión independiente: un problema de contraste del cierre del popover, reproducido con prueba roja y corregido; revisión final sin problemas críticos/importantes.
- Documentación y capturas guardadas en `docs/design/evidence/mood-composition-2026-10-05/`. Implementación local lista en rama; publicación/integración no realizada. Cierre técnico de ANI-107/113 respaldado por esta evidencia, sin afirmar despliegue.
