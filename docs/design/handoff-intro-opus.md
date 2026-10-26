# Handoff · animación de apertura del onboarding (para Opus 5.5)

## Tu misión

Mismo pedido original del usuario, textual:

> made me a onboarding intial animation form eudila hat shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.

Una versión hecha con Sonnet 5.5 ya existe (abajo). **Tu trabajo es hacer una mejor**: más ambiciosa, mejor dirigida, más pulida. Podés reemplazarla por completo o evolucionarla; lo que no podés es romper las reglas de marca. Que el usuario pueda comparar: guardá la anterior en git (WIP commit o rama) antes de pisarla.

## Leer antes de tocar frontend (lo exige AGENTS.md)

`PRODUCT.md`, `DESIGN.md`, `docs/design/brand-review-2026-10-04.md`, `docs/design/mascota/README.md` y `docs/design/mascota/eudila-viva.html`. Next.js de esta versión tiene cambios incompatibles: leer `node_modules/next/dist/docs/` antes de escribir código. Registrar decisiones y evidencia en los docs de marca (hay una fila «Apertura» nueva en la tabla de Momentos del README de la mascota; actualizala si cambia algo).

## Reglas de marca que no se negocian

- La mascota **nunca sigue al puntero** (ni hover, ni mirada). Solo toque/clic dispara reacciones.
- Cada mascota con reloj propio; Neutral con tres capas; sin cachetes ni boca.
- Sin juicio: los siete estados pesan igual, no se premia lo agradable. El coral Muy agradable del final es identidad de marca, no un premio.
- Movimiento reducido ⇒ quieta / se omite. Teclado, foco visible, AA, reflujo a 320 px, texto al 200 %.
- Voseo rioplatense, poco texto, lienzo oscuro «Lisa» (`app/globals.css`, usar tokens; no constantes paralelas).
- Sin gamificación, sin glassmorphism, sin degradés de texto, sin imitar las capturas IMG_2887–2895.

## Qué hay hoy (versión Sonnet 5.5, sin comitear)

Archivos tocados (`git status`):
- `app/empezar/intro.tsx` (nuevo): overlay fijo, un canvas, una línea de tiempo de 11,4 s con reloj propio. Botón «Saltar» y Esc. Una vez por sesión (`sessionStorage["eudila-intro"]`). Se omite con movimiento reducido.
- `app/empezar/onboarding.tsx`: monta `<Intro>` en un portal a `document.body` (vía `useSyncExternalStore` para no romper la hidratación), `inert` en el formulario mientras suena, foco al título al terminar.
- `app/mood/critter.ts`: ganchos mínimos: `Critter.scene` (pose guionizada que reemplaza al momento), exports de `backOut`, `outCubic`, `hop`, `rgba`, `orbAt`, `ambientAt`, tipo `MomentFrame`.
- `docs/design/mascota/README.md`: fila «Apertura».

Coreografía actual: chispa + anillo (0,5 s) → capas se despliegan (1,1 s) → Neutral baja a Muy desagradable (2,5–4,0) → sube a Muy agradable (4,3–7,1) con nombre del estado, anillo por estado, polvo de estrellas y escala del slider con «pulgar» → aterrizaje con salto y destellos (7,0) → orbe sube, `eudila` letra por letra (8,2) → lema + guiño (9,4) → fade (11,4).

## Debilidades conocidas (por dónde mejorar)

1. **Es todo canvas 2D + WAAPI**; se siente prolijo pero poco «showreel»: poca variación de cámara, sin sensación de profundidad, sin zooms, sin transiciones de escala dramáticas, sin handoff espacial real hacia la pantalla siguiente (hoy solo fade).
2. El final es un fade genérico: el orbe/wordmark no «aterrizan» en el header ni en el formulario.
3. Ritmo uniforme: falta contraste de tempos (silencio/aceleración/impacto) y sincronía fina entre capas.
4. Tipografía animada básica (stagger + blur). Hay margen para algo más expresivo con Figtree.
5. **Sin verificar:** 320 px, texto al 200 %, movimiento reducido real, FPS/rendimiento en celular, contraste de «Saltar» y del nombre del estado sobre los ambientes, y el destello del formulario antes de que monte el overlay (el servidor no renderiza el overlay).
6. No hay grabación (GIF/video) de la pieza; sería ideal dejar una captura en `docs/design/evidence/`.
7. Con `prefers-reduced-motion` hoy se salta sin más; se podría ofrecer un cuadro estático digno.

## Cómo correrlo y probarlo

- Supabase local ya levantado por `npm run supabase:start` (Docker). `.env.local` apunta a él. Si no corre: reiniciarlo con ese script.
- App: `npm run dev -- -p 3111`.
- Cuenta de prueba **solo local** (no existe en Vercel): email `prueba-intro@eudila.test`; la contraseña está en `/private/tmp/claude-501/-Users-147pop-orca-workspaces-eudila-kelpfish/3f337ea9-8c6d-442f-84c9-2ee527aee47f/scratchpad/creds.txt`. Si ese archivo ya no existe, creá una cuenta local nueva por `/crear-cuenta`; confirmá con el enlace del buzón `http://127.0.0.1:54324` (el enlace apunta al puerto 3000: reescribilo a `localhost:3111/auth/callback?...`).
- Para repetir la animación: borrar `eudila-intro` de sessionStorage y recargar `/empezar` (o usar una pestaña nueva).
- Chequeos: `npx tsc --noEmit`, `npx eslint app --max-warnings=0`, `npx prettier --check .`. Hay pruebas del motor en `app/mood/*.test.mjs` y de navegador en `app/**/*.test.py`: correr las de `app/mood` si tocás el motor.
- Preview Vercel de la versión actual (producción NO se tocó): https://eudila-jkehw6akb-147pops-projects.vercel.app. El proyecto está enlazado en `.vercel/`; desplegar con `vercel deploy --yes` (preview). **No** hacer `--prod`, crear cuentas en sitios desplegados ni tocar el Supabase real sin pedido explícito del usuario.

## Criterios de entrega

- Se ve claramente mejor que la versión actual lado a lado (el usuario va a comparar).
- Cumple todas las reglas de arriba y las verificaciones que hoy faltan (320 px, 200 %, movimiento reducido, rendimiento).
- Skippable, una vez por sesión, foco devuelto al título.
- Evidencia (capturas o GIF) en `docs/design/evidence/` y decisión registrada en los docs de marca.
- Reportar con honestidad qué se verificó y qué no.
