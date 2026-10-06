# Orb renderer implementation evidence

ANI-108 implements an SVG renderer in `app/components/mood-orb.tsx` and connects it to the existing registration route. Its radial fill and light edges use the existing orb/white tokens. Five translucent layers retain the existing silhouette and scales. The white core stays centered independently of the selected state. The renderer is fixed; ANI-112 owns continuous movement and particles.

The implementation plan and remaining source questions are in `docs/plans/2026-10-06-ani-108-orb.md`. This evidence does not close VIS-02, VIS-03, VIS-06 or VIS-12.

## Technical verification

| Check | Result |
| --- | --- |
| `node --test app/components/mood-orb.test.mjs` | Four passing checks across seven states and both variants. Five layers, one stable core, shared geometry, decorative semantics, independent SVG IDs and resolved paint references. |
| `npm run lint` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run format:check` | Passed. |
| `git diff --check` | Passed. |
| `NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build -- --webpack` | Passed. Next.js 16.3.8 generated all application routes. |
| Default Turbopack build | Interrupted after no progress in the restricted environment. No application/configuration change was made for this limitation. |
| Existing record/draft Node checks | Passed. |

The build log is retained in the task workspace at `task-7/evidence/ani108-build-webpack.log`. Browser execution, hydration, screenshots, source comparison, short viewport, text at 200%, keyboard and reduced-motion QA are pending with the parent's browser owner.

## Source limitation

The missing authority for ANI-109 is `Eudila-Brandbook.pdf`, v1.0, September 2026, 13 pages, SHA-256 `3fdfb738099abcf643a4c2d4252a7c76f99050f0379510aa7ff516c1746feece`. Local and connected-source searches did not recover the original. `prototype/moods.js` remains unchanged, including the known silhouette limitations in the brand review. No visual fidelity or ticket acceptance is claimed.

## ANI-118 history integration

Today, calendar, day detail and their legends now consume the same fixed renderer. The private one-path `MoodShape` implementation was removed. Small symbols use `size-6` instead of `size-5`; summaries retain `size-12`. Their labels, ordinal values and accessible calendar names remain present.

`node --test app/historial/mood-renderer.test.mjs app/components/mood-orb.test.mjs app/historial/records.test.mjs prototype/flow-state.test.mjs` passes all nine checks. The three history checks render the actual views with a synthetic seven-state fixture and inspect their compact orbs and labels. This is isolated SSR evidence; it does not verify browser hydration or remote persistence.

Lint, format, diff checks and the final production Webpack build pass. The final build covers both ANI-108 and ANI-118, with its log at `task-7/evidence/ani118-build-webpack.log`. See [the history integration plan](../../../plans/2026-10-06-ani-118-shared-renderer.md). Browser measurements and visual acceptance remain pending, and neither ticket was marked Done.
