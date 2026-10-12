# Acciones y contraste de eudila — Implementation Plan

> Ejecución en esta sesión con superpowers:executing-plans; revisión y evidencia antes del cierre.

**Goal:** cerrar ANI-111 / VIS-05, ANI-116 / VIS-10 y ANI-117 / VIS-11 en el frontend Next.js real.

**Architecture:** variantes CSS compartidas en `app/globals.css`, conservando botones nativos y enlaces Next.js. La acción emocional recibe únicamente acento y tinta del estado a través de tokens existentes; autenticación e historial mantienen el lienzo neutro. Controles y tarjetas conservan radio de 14 px; acciones principales usan cápsula de al menos 50 px.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Playwright Python.

## Diseño y alternativas

La autoridad es `PRODUCT.md`, `DESIGN.md`, el brandbook v1.0 (p. 10) y la revisión de marca del 04/10. La cápsula de la referencia se conserva; blanco sobre azul, turquesa y coral se adapta a Grafito para AA. El usuario autorizó planificar y ejecutar un grupo hasta Done.

Se eligen variantes CSS compartidas: evitan duplicación y no cambian navegación ni eventos. Un componente polimórfico añade complejidad para distinguir `<button>` de `<Link>` sin aportar una nueva interacción. Cambiar clases ruta por ruta sin variantes deja estados duplicados e inconsistentes.

## Agrupación del backlog estético completo

1. **Pantalla emocional y renderer:** ANI-107/108/109/112/113/118 (VIS-01/02/03/06/07/12). Ambiente, geometría, luz, composición y movimiento dependen de un estado/renderer compartido. Verificar siete estados y animación/reduced motion como conjunto.
2. **Controles y contraste:** ANI-110/111/116/117 (VIS-04/05/10/11). Ejecutar ahora ANI-111/116/117; el slider ANI-110 queda para un grupo con comprobaciones de control nativo en Chromium, Safari y Firefox.
3. **Tipografía y apertura:** ANI-114/115 (VIS-08/09). Comparar lockup, Figtree y símbolo; integrar apertura breve, salteable y no repetida cuando el renderer común esté disponible.

## Task 1 — Capturar regresión real

- Crear `app/design-actions.test.py`.
- Abrir `/registro/animo` y probar los siete acentos/tintas, contraste ≥4.5, tamaño de cápsula, hover/focus/active y navegación con teclado.
- Probar estados disabled reales en tipo/confirmación/exportación, CTA de inicio/auth/historial y separación respecto de inputs, selectores y tarjetas.
- Ejecutar contra baseline y confirmar fallo por el botón monocromático.

## Task 2 — Variantes compartidas

- Modificar `app/globals.css`: `.action-primary`, `.action-secondary`, `.action-text`, `.control-choice` y tokens semánticos de radios.
- Principal: cápsula ≥50 px, color institucional accesible o tokens emocionales; estados sin reducir opacidad del texto. Foco con dos anillos para superficies claras/oscuras; hover subrayado, active borde interior; disabled legible y sin hover; loading conserva geometría y texto.
- Secundaria: cápsula con contorno y lienzo neutro. Texto: objetivo ≥44 px y subrayado.
- Migrar inicio, registro y pasos, auth, ayuda del header, historial y exportación. Separar radios de tarjeta/control sin redondear todo el producto.
- Ejecutar regresión y revisar capturas; comprobar reflujo 320/390/520 px, texto al 200%, alto corto y reduced motion.

## Task 3 — Evidencia y cierre

- Actualizar `DESIGN.md` y `docs/design/brand-review-2026-10-04.md` con decisiones, estados y referencias a evidencia.
- Ejecutar lint, typecheck, build con preview, prueba visual y regresión funcional de frontend/auth.
- Revisar diff, guardar commit y preparar PR revisable con evidencia.
- Relacionar las tres tareas en Linear; marcar Done solo con criterios cumplidos, enlaces a código/evidencia y resultado de validación. El resto del backlog conserva su estado.
