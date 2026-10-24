# Logo mascota e icono de app · F1 · 24/10/2026

Cierra VIS-13 (logo) y VIS-17 (icono de app y favicon) sobre las rutas Next.js reales, servidas con `next dev` en `127.0.0.1:3130` en la rama `147pop/kelpfish`.

- [Header a 390 × 844](header-390.png): mascota Muy agradable animada en caja de 72 px y wordmark Figtree 700 `2.25rem`.
- [Header a 320 × 568](header-320x568.png): con alto ≤600 px la caja baja a 48 px para conservar las seis sugerencias de emoción.
- [Header a 320 px con texto al 200 %](header-320-200.png): símbolo y wordmark crecen juntos (caja en `rem`), sin desbordamiento horizontal.
- [Header sin JavaScript](header-nojs.png): `public/brand/logo-mascota.svg` en la misma caja, con el mismo radio de orbe que el canvas; no hay salto al hidratar.
- [Icono de app 512 px](icono-app-512.png): mascota al 64 % sobre el lienzo Aurora `#1A1626`. Favicon `app/icon.svg` (el SVG estático), `app/apple-icon.png` 180 px y `app/manifest.ts` con iconos 192/512 (`any` y `maskable`).

Implementación: motor canvas `app/mood/critter.ts` (port de `eudila-viva.html`, geometría de `prototype/moods.js`) y componente `app/mood/mascota.tsx`. El logo tiene estado fijo, cara ×1,75 y destellos ×2,4; un solo `requestAnimationFrame` para todas las mascotas, pausado con la pestaña oculta o fuera de pantalla. El toque es la única entrada del puntero (salto y sacudida). Con movimiento reducido se dibuja un único cuadro quieto.

Verificación:

- `node --test app/mood/*.test.mjs`: Neutral con tres capas, dos mascotas desincronizadas, movimiento reducido quieto, momentos que terminan solos.
- Chromium a 390, 320 × 568, 320 al 200 % y con movimiento reducido: sin errores JS ni desbordamiento.
- `app/ayuda/ayuda.test.py` en build de producción: la copia offline de Ayuda guarda y muestra `logo-mascota.svg`. `app/ayuda/worker.test.mjs` actualizado.
- `app/registro/emociones.test.py`: seis sugerencias visibles a 320 × 568 con el header nuevo.
- Lint, typecheck y build: exit 0.

No se probó Safari físico.
