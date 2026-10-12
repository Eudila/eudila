// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { setTimeout } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));
const catalog = JSON.parse(
  readFileSync(new URL("../data/catalogo-v1.json", import.meta.url), "utf8"),
);

test("catalog migrations preserve approved data, constraints, and atomic seeds", async () => {
  const container = `eudila-database-test-${process.pid}`;
  const run = (...args) =>
    spawnSync("docker", args, { encoding: "utf8", timeout: 60_000 });
  const checked = (...args) => {
    const result = run(...args);
    assert.equal(result.status, 0, result.error?.message ?? result.stderr);
    return result.stdout;
  };
  const sql = (input, { failure = false } = {}) => {
    const result = spawnSync(
      "docker",
      [
        "exec",
        "-i",
        container,
        "psql",
        "-X",
        "-U",
        "postgres",
        "-h",
        "127.0.0.1",
        "-t",
        "-A",
        "-v",
        "ON_ERROR_STOP=1",
        "-v",
        "VERBOSITY=verbose",
        "-v",
        `catalog=${JSON.stringify(catalog)}`,
      ],
      { encoding: "utf8", input, timeout: 30_000 },
    );
    if (failure) {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /23505/);
    } else {
      assert.equal(result.status, 0, result.error?.message ?? result.stderr);
    }
    return result.stdout;
  };

  checked(
    "run",
    "--rm",
    "--detach",
    "--pull=never",
    "--name",
    container,
    "--network",
    "none",
    "--mount",
    `type=bind,source=${root},target=/workspace,readonly`,
    "--tmpfs",
    "/var/lib/postgresql/data",
    "--env",
    "POSTGRES_HOST_AUTH_METHOD=trust",
    "postgres:17",
  );
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (
        run(
          "exec",
          container,
          "pg_isready",
          "-U",
          "postgres",
          "-h",
          "127.0.0.1",
        ).status === 0
      ) {
        ready = true;
        break;
      }
      await setTimeout(100);
    }
    assert.ok(ready, "Disposable PostgreSQL did not become ready");
    sql(`\\i /workspace/supabase/tests/bootstrap.sql
\\i /workspace/supabase/migrations/20261006000100_catalog.sql
\\i /workspace/supabase/seed.sql
\\i /workspace/supabase/seed.sql
\\i /workspace/supabase/tests/catalog.sql
`);
    sql("\\i /workspace/supabase/seed.sql\n", { failure: true });
    assert.equal(
      sql(`select
  (select count(*) from public.emociones) = 22 and
  (select count(*) from public.factores_vida) = 17 and
  (select nombre from public.emociones where id = (:'catalog'::jsonb -> 'emociones' -> 0 ->> 'id')::uuid) = 'Synthetic old emotion' and
  (select nombre from public.factores_vida where id = (:'catalog'::jsonb -> 'factores_vida' -> 0 ->> 'id')::uuid) = 'Synthetic old factor';
`).trim(),
      "t",
      "A catalog identity conflict must roll back updates to both tables",
    );
  } finally {
    checked("stop", container);
  }
});
