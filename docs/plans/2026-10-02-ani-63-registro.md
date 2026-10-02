# ANI-63 · Tipo de registro y escala de ánimo

**Objetivo:** elegir tipo y ánimo con mouse o teclado, anunciar el valor y avanzar al paso de emoción en la app Next.js.

**Arquitectura:** reutilizar el borrador y su validación de `prototype/flow-state.js`, y compartir la escala y geometría del orbe con el prototipo. Un proveedor en el layout raíz conserva el estado entre rutas, incluso al visitar Ayuda; `sessionStorage` conserva el borrador ante recarga. Radio buttons y un range nativo resuelven teclado y semántica sin dependencias nuevas.

**Stack:** Next.js 16.3.8, React 19.3, TypeScript y los tokens existentes de Tailwind 4.

## Decisiones y revisión de opciones

- Mañana (`mañana`), Tarde (`tarde`), Noche (`noche`) y Registro libre (`libre`), exactamente las opciones enumeradas en ANI-63 y ya presentes en ANI-62. Se revisan contra ambos tickets y el prototipo antes de publicar. El usuario puede corregir su formulación durante la ejecución autorizada de punta a punta.
- Los momentos son elegidos por la persona, sin franjas horarias impuestas. Registro libre admite cualquier momento. El tipo es obligatorio para avanzar.
- Escala ordinal 1–7: Muy desagradable, Desagradable, Algo desagradable, Neutral, Algo agradable, Agradable, Muy agradable. Empieza en Neutral (4), según ANI-62; no representa un diagnóstico.
- Se recomienda el range nativo frente a siete botones: conserva las flechas y `aria-valuetext` del prototipo y requiere menos código. El orbe cambia de forma y color; la etiqueta y posición permiten comprenderlo sin color.
- La ruta `/registro/emocion` es el destino del segundo paso y muestra honestamente la ausencia del catálogo aprobado (ANI-64/ANI-96/ANI-50). No se inventan emociones ni se simula un registro guardado.
- Cerrar solicita confirmación y descarta el borrador. Navegar fuera del registro conserva el borrador, sin bloquear el acceso a Ayuda. Si falla el almacenamiento, se informa que la recarga puede perderlo y el estado sigue en memoria.

## Ejecución

1. **Estado y rutas.** Agregar `app/registro/registro.tsx` y `app/registro/[paso]/page.tsx`; integrar el proveedor en `app/layout.tsx` y el enlace de entrada en `app/page.tsx`. Restaurar con la validación existente, persistir al cambiar, mantener emoción/factores y validar rutas. Foco en el título al cambiar de paso; diálogo nativo para cerrar.
2. **Controles y presentación.** Compartir la escala y `shapePath` en `prototype/moods.js`, conservar el prototipo como consumidor. Implementar radios, slider 1–7, orbe de cinco capas y etiqueta anunciada. Reutilizar tokens, acciones al pie y ayuda global; soportar 320 px y texto al 200 %.
3. **Verificación y publicación.** Extender `app/tokens/tokens.test.py` con el recorrido real: mouse, teclado, extremos, valor accesible/live, atrás/adelante, recarga, ayuda, descarte, entrada directa, datos inválidos y almacenamiento bloqueado. Ejecutar `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`, checks del prototipo y navegador contra el build. Revisar el diff, publicar en GitHub, verificar SHA remoto y cerrar ANI-63 con evidencia en Linear.

## Criterios de cierre

- [ ] Elegir los cuatro tipos con mouse y teclado, y avanzar.
- [ ] Cambiar ánimo con mouse/flechas; reflejar los siete estados y límites.
- [ ] Valor anunciado por `aria-valuetext` y región viva; foco visible.
- [ ] Avanzar a emoción; volver, recargar y abrir ayuda sin perder selecciones.
- [ ] Cierre confirmado descarta; cancelar/Escape conserva.
- [ ] Layout sin desbordes a 320 px y con texto ampliado.
- [ ] Checks pasan; revisión y commit publicados; Linear en Done.

## Evidencia

Pendiente de ejecución.
