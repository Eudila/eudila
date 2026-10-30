# Database source and local verification

This directory prepares the ANI-50 database contract. It does not configure a Supabase project or enable authenticated record persistence. Do not mark ANI-50 complete from the local checks alone.

`migrations/20261006000100_catalog.sql` creates the two public-label catalogs consumed by the existing reader. Its proposed table policies enable row-level security and grant only SELECT to the existing Supabase `anon` and `authenticated` roles. Catalog writes remain administrative. These are versioned policy definitions for review, not changes applied to an existing project.

`seed.sql` upserts the approved 21 emotion options and 15 life factors by their stable UUIDs in one transaction. It preserves existing references and unrelated rows. Case-insensitive names cannot acquire a second UUID silently; a conflict rolls back the seed and requires an explicit identity migration.

`data/catalogo-v1.json` is the authoritative catalog. After an approved editorial change, regenerate and check its SQL:

```sh
node supabase/catalog-seed.mjs
node supabase/catalog-seed.mjs --check
node --test data/catalogo.test.mjs prototype/catalog.test.mjs
```

The database test needs Docker and an already available `postgres:17` image:

```sh
node --test supabase/database.test.mjs
```

It starts one disposable container with no network, published ports, or persistent volume. The repository is mounted read-only. Its `anon` and `authenticated` roles are synthetic test fixtures. The test verifies catalog reads under both roles, rejection of app writes, exact seed parity, invalid inputs, duplicate names, repeated loading, preservation of unrelated rows and foreign-key references, and full rollback when an existing catalog identity conflicts. The runner stops its own container when finished.

This check runs PostgreSQL, not Supabase Auth or PostgREST. A reviewed live integration still needs the complete record schema and ownership policies, target-project inspection, approved application of migrations and policies, and REST readback. No live database or its permissions were inspected or changed in this increment. The [implementation plan](../docs/plans/2026-10-06-ani-50-database.md) records the current boundary.
