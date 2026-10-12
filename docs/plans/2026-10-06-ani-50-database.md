# ANI-50 database implementation

## Goal and authority

Prepare versioned database migrations and inspectable local evidence for the Eudila database. The baseline is `bd7339e6750743f846c57cd46a1154972b1a48e5` on `main`.

The catalog contract is settled by `docs/content/catalogo-emociones-factores.md`, `data/catalogo-v1.json`, `docs/content/ani-64-integracion.md`, and `prototype/catalog.js`. The catalog contains public labels, not personal records. Its existing reader expects `public.emociones(id, nombre, sugerida)` and `public.factores_vida(id, nombre)`, ordered by `nombre`.

The exact current ANI-50 issue and its related issues are still being retrieved by the coordinating task. Record table names, ownership fields, and relationships will be settled against that issue before implementation. The preview shape in `app/historial/records.ts` describes frontend behavior; README explicitly says it is not a Supabase schema.

## Decisions

- Keep all 21 emotion options, including the three alternatives, and all 15 factors with their approved UUIDs. Do not derive emotion from mood.
- Use PostgreSQL UUID primary keys, nonempty text names, and a required boolean for `sugerida`.
- Load the approved catalog with an upsert by ID in one transaction. Repeating the seed must preserve row counts, unrelated existing rows, and existing references. Reject a conflicting name with a different UUID rather than silently creating another identity.
- Keep the JSON file as the source of seed labels. A small Node script renders deterministic SQL; its check mode detects drift in the committed seed file.
- Keep public catalog read access and personal record ownership separate. The catalog migration proposes row-level security and SELECT-only access for `anon` and `authenticated`, preventing default table grants from exposing catalog writes. Source SQL for access policies is reviewable work, not authorization to apply changes to an existing Supabase project.
- Use only an isolated, disposable PostgreSQL 17 container with synthetic roles and data for local verification. Publish no port, use no existing database or volume, and contact no Supabase project.

## Implementation sequence

1. Add the catalog migration, SELECT-only catalog policies, and deterministic seed to `supabase/`. Check schema constraints, app-role reads and rejected writes, exact JSON parity, a repeated seed, preservation of unrelated rows, and rejection of conflicting identities on local PostgreSQL.
2. Read the exact ANI-50 record contract, settle it here, and implement only its agreed tables and relationships. Verify invalid input and foreign keys with synthetic fixtures.
3. Add the personal-record access-policy source required by the issue and test ownership isolation with local roles. Do not apply policies to an existing project.
4. Run existing Node checks and repository lint, types, format, and production build. Record actual commands and results. Open a draft PR with the remaining live-integration requirements.

## Completion boundaries

No cloud database, credentials, RLS configuration, deployment, or production records are modified by this work. ANI-50 remains open until its complete criteria are verified. Auth is ANI-51, authenticated app persistence and export parity are ANI-98, and professional clinical review is ANI-99.

## Evidence

- Catalog migration and deterministic seed implemented. Exact data parity, repeated loading, preservation of unrelated rows and foreign-key references, and full rollback on conflicting identities pass on isolated PostgreSQL 17.
- Existing Node regression checks: 24 passed, covering catalog, draft, history dates/restoration, evolution data, CSV/JSON/report data, and Help worker behavior.
- Lint, route type generation/TypeScript, Prettier, and `git diff --check` pass.
- `npm run build -- --webpack` passes, including all application routes. Normal Turbopack builds failed both in the sandbox and with approved execution escalation: compiling existing `app/exportar/exportar.css` requires an internal process port denied by the host with `Operation not permitted (os error 1)`. Webpack is the verified fallback; the normal pipeline is not claimed as passing. Configuration and host permissions are unchanged.
- Catalog role-policy checks pass: synthetic `anon` and `authenticated` roles read the approved labels and cannot insert, update, delete, truncate, create references, or create triggers on either catalog. Row-level security remains enabled.
- Record tables and live Supabase/PostgREST checks remain pending the exact ANI-50 issue and target access. No issue was marked Done.

Commands run from the worktree:

```sh
node supabase/catalog-seed.mjs --check
node --test supabase/database.test.mjs
node --test data/catalogo.test.mjs prototype/catalog.test.mjs prototype/flow-state.test.mjs app/historial/records.test.mjs app/analisis/data.test.mjs app/exportar/export.test.mjs app/ayuda/worker.test.mjs
npm run lint
npm run typecheck
npm run format:check
npm run build -- --webpack
git diff --check
```
