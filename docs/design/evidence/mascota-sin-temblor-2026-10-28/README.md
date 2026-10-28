# Muy desagradable sin temblor · 28/10/2026

Por pedido del usuario, la amplitud de tiritona de Muy desagradable pasa de 1,1 a 0. Se conserva el resto del comportamiento. Motor compartido `packages/mood/critter.ts`, referencia `docs/design/mascota/eudila-viva.html` y copia generada `landing/mascota.js` sincronizados.

Verificado sobre Next.js local en `/registro/animo`, con preview y Chrome mediante Playwright, a 390 × 844:

- 73 cuadros durante 1,2 s después de estabilizar el slider en 1: posición del orbe estable; variación máxima menor a 0,000001 px en ambos ejes.
- Muy agradable conserva su movimiento.
- Movimiento reducido mantiene el canvas idéntico entre cuadros.
- Sin errores JavaScript de página.

[Mediciones](results.json) · [Captura](muy-desagradable.png). La captura muestra el estado; las mediciones entre cuadros comprueban la ausencia de temblor.

`node --test packages/mood/critter.test.mjs`: 8 pruebas correctas. La nueva prueba falló con el valor anterior y pasó al quitar el temblor. ESLint de los dos archivos del motor y `git diff --check` correctos.

Alcance: validación local en Chromium. Sin despliegue remoto, comprobación Safari/Firefox ni regeneración del video de la landing. No se cierra otra brecha estética.
