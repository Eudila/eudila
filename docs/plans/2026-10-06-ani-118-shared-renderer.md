# ANI-118 · Shared renderer in history

## Contract and decision

`DESIGN.md` requires compact symbols to preserve their meaning, remain fixed and measure at least 24 px. VIS-12 in `docs/design/brand-review-2026-10-04.md` identifies different registration/history renderers as a gap. Registration now uses `MoodOrb` from ANI-108; the mood catalogue and geometry still live in `prototype/moods.js`.

Remove `MoodShape` from `app/historial/views.tsx`. Today, day detail, calendar cells and the seven-state legend consume `MoodOrb` with `variant="compact"`. Summaries retain `size-12`; the smaller symbols change from `size-5` to `size-6`, which is 24 px with the current base spacing. Labels, ordinal values and calendar accessible names remain external to the decorative SVG.

No new catalogue, colour constants or geometry source is added. The compact renderer uses the same five layers and fixed core as registration. It introduces no animation and does not alter history's neutral canvas. ANI-109's original source is still missing; its geometry remains unchanged.

## Verification

`app/historial/mood-renderer.test.mjs` renders the actual Today, calendar and day-detail components with an explicit seven-state history fixture. Only history data and Next Link are isolated for Node rendering. The test checks shared compact orbs, retained labels, layer/core counts, decorative semantics and the smaller symbol class. It is an SSR integration check, not browser or persistent-backend evidence.

Run the new check, the ANI-108 renderer check, existing record/draft checks, lint, types, formatting and the production Webpack build. Browser hydration, computed size, 320 px, text at 200%, keyboard and reduced-motion QA remain with the parent's browser owner. Visual comparison needs the missing brandbook/video source.

The full Linear criteria have not arrived. This commit implements the documented shared-renderer increment; it does not close ANI-118 or VIS-12. PR-11's actions and ANI-110's slider remain untouched.

## Recorded result

The Node suite passes nine checks, including actual Today, calendar and day-detail rendering with a seven-state fixture. Lint, formatting and diff checks pass. `NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build -- --webpack` passes for the final code and generates all Next.js routes. The parent retains browser QA and full ticket review.
