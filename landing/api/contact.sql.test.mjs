import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

// Base descartable preparada con roles anon, authenticated y service_role (BYPASSRLS).
// CONTACT_TEST_CONTAINER habilita esta prueba; nunca usa credenciales o bases de producción.
const container = process.env.CONTACT_TEST_CONTAINER;
const args = [
  "exec",
  "-i",
  container,
  "psql",
  "-X",
  "-U",
  "postgres",
  "-v",
  "ON_ERROR_STOP=1",
  "-At",
];
const sql = (input) =>
  execFileSync("docker", args, {
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();

test(
  "PostgreSQL real: mensajes privados y límite atómico entre procesos",
  { skip: !container },
  async () => {
    assert.match(container, /^eudila-contact-test(?:-[a-z0-9]+)*$/);
    sql(
      "drop function if exists public.consumir_limite_contacto(text); drop table if exists public.contact_messages, public.contact_rate_limits;",
    );
    sql(
      readFileSync(
        new URL(
          "../../app/supabase/migrations/20261028090000_contacto_landing.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.equal(
      sql(
        "select bool_and(relrowsecurity) from pg_class where oid in ('public.contact_messages'::regclass, 'public.contact_rate_limits'::regclass);",
      ),
      "t",
    );
    assert.throws(
      () =>
        sql("set role service_role; select * from public.contact_rate_limits;"),
      /permission denied/,
    );
    for (const role of ["anon", "authenticated"]) {
      for (const statement of [
        "select * from public.contact_messages",
        "insert into public.contact_messages (name,email,message) values ('Ana','ana@example.org','Una consulta suficientemente larga')",
        `select public.consumir_limite_contacto(repeat('a',64))`,
      ]) {
        assert.throws(
          () => sql(`set role ${role}; ${statement};`),
          /permission denied/,
        );
      }
    }
    sql(
      "set role service_role; insert into public.contact_messages (name,email,message,interest) values ('Ana','ana@example.org','Una consulta suficientemente larga','Otra consulta');",
    );
    assert.equal(sql("select count(*) from public.contact_messages;"), "1");
    assert.throws(
      () =>
        sql("set role service_role; select * from public.contact_messages;"),
      /permission denied/,
    );
    assert.throws(
      () =>
        sql(
          "set role service_role; insert into public.contact_messages (name,email,message) values ('Ana','ana@example.org','corto');",
        ),
      /check constraint/,
    );
    const run = () =>
      new Promise((resolve, reject) => {
        const proc = spawn("docker", args);
        let out = "";
        let err = "";
        proc.stdout.on("data", (data) => {
          out += data;
        });
        proc.stderr.on("data", (data) => {
          err += data;
        });
        proc.on("error", reject);
        proc.on("exit", (code) =>
          code
            ? reject(new Error(err))
            : resolve(Number(out.trim().split("\n").at(-1))),
        );
        proc.stdin.end(
          "set role service_role; select public.consumir_limite_contacto(repeat('a',64));",
        );
      });
    const results = await Promise.all(Array.from({ length: 12 }, run));
    assert.equal(results.filter((n) => n === 0).length, 5);
    assert.equal(results.filter((n) => n > 0 && n <= 900).length, 7);
    assert.equal(
      sql(
        "set role service_role; select public.consumir_limite_contacto(repeat('b',64));",
      )
        .split("\n")
        .at(-1),
      "0",
    );
    sql(
      "update public.contact_rate_limits set reset_at = now() - interval '1 second';",
    );
    assert.equal(await run(), 0);
    assert.equal(sql("select count(*) from public.contact_rate_limits;"), "1");
  },
);
