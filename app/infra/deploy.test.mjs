import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  symlinkSync,
  readlinkSync,
  rmSync,
  realpathSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const source = readFileSync(
  new URL("scripts/deploy-release.sh", import.meta.url),
  "utf8",
);
const gate = new URL("scripts/deploy-ssh.sh", import.meta.url);

test("SSH rechaza shell, SHA inválido y comandos concatenados", () => {
  for (const command of [
    "",
    "bash",
    "deploy main",
    `deploy ${"a".repeat(40)}; id`,
  ]) {
    assert.equal(
      spawnSync("bash", [gate.pathname], {
        env: { ...process.env, SSH_ORIGINAL_COMMAND: command },
      }).status,
      64,
    );
  }
});

for (const failure of ["none", "build", "activate", "smoke", "migration"]) {
  test(`release: ${failure}`, () => {
    const root = realpathSync(
      mkdtempSync(join(tmpdir(), "eudila-deploy-test-")),
    );
    try {
      const bin = join(root, "bin");
      const repo = join(root, "fixture");
      mkdirSync(bin);
      mkdirSync(repo);
      mkdirSync(join(root, "releases"));
      for (const folder of ["old-src", "old-web-ctx"])
        mkdirSync(join(root, folder));
      symlinkSync(join(root, "old-src"), join(root, "src"));
      symlinkSync(join(root, "old-web-ctx"), join(root, "web-ctx"));
      const git = (...args) =>
        execFileSync("git", args, {
          cwd: repo,
          stdio: ["ignore", "pipe", "pipe"],
        })
          .toString()
          .trim();
      git("init", "--initial-branch=main");
      mkdirSync(join(repo, "app/supabase/migrations"), { recursive: true });
      writeFileSync(
        join(
          repo,
          "app/supabase/migrations/20261027031110_registros_cuenta.sql",
        ),
        "-- already applied\n",
      );
      mkdirSync(join(repo, "app/infra/app"), { recursive: true });
      writeFileSync(
        join(repo, "app/infra/app/Dockerfile.web"),
        "FROM scratch\n",
      );
      git("add", ".");
      git(
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "commit",
        "-m",
        "fixture",
      );
      const sha = git("rev-parse", "HEAD");
      git("clone", "--bare", repo, join(root, "repository.git"));
      writeFileSync(
        join(root, ".env"),
        "PUBLIC_URL=https://example.com\nANON_KEY=public-test-key\n",
      );
      writeFileSync(join(root, "DEPLOYED_COMMIT"), "previous\n");
      const metadata = '{"release":"previous"}\n';
      writeFileSync(join(root, "DEPLOYED_RELEASE.json"), metadata);
      const executable = (name, content) =>
        writeFileSync(join(bin, name), `#!/bin/sh\nset -eu\n${content}\n`, {
          mode: 0o755,
        });
      executable("flock", "exit 0");
      executable("sleep", "exit 0");
      executable("curl", '[ "$FAILURE" != smoke ] || exit 22; echo welcome');
      executable(
        "docker",
        `
printf '%s\\n' "$*" >> "$TEST_ROOT/docker.log"
case "$*" in
  'compose ps -q web') echo current-web ;;
  'inspect '*) echo sha256:previous ;;
  'compose exec -T db '*) [ "$FAILURE" = migration ] || echo 20261027031110_registros_cuenta.sql ;;
  'run --rm '*)
    [ "$FAILURE" != build ] || exit 1
    for arg do
      case "$arg" in *:/src)
        src=$(printf '%s' "$arg" | sed 's|:/src$||')
        mkdir -p "$src/app/.next/standalone" "$src/app/.next/static" "$src/app/public"
      ;; esac
    done ;;
  'image tag sha256:previous eudila-app-web:latest') rm -f "$TEST_ROOT/new-image" ;;
  'image tag '*':latest') touch "$TEST_ROOT/new-image" ;;
  'exec current-web '*)
    [ "$FAILURE" != activate ] || [ ! -f "$TEST_ROOT/new-image" ] ;;
esac`,
      );
      const script = join(root, "deploy.sh");
      writeFileSync(
        script,
        source.replace("cd /opt/eudila-app", `cd '${root}'`),
      );
      const result = spawnSync("bash", [script, sha], {
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          TEST_ROOT: root,
          FAILURE: failure,
        },
        encoding: "utf8",
      });
      const log = readFileSync(join(root, "docker.log"), "utf8");
      assert.doesNotMatch(log, /compose (down|up.*(?:db|auth|rest))/);
      if (failure === "none") {
        assert.equal(result.status, 0, result.stderr);
        assert.equal(
          JSON.parse(readFileSync(join(root, "DEPLOYED_RELEASE.json"))).commit,
          sha,
        );
        assert.notEqual(readlinkSync(join(root, "src")), join(root, "old-src"));
      } else {
        assert.notEqual(result.status, 0, result.stdout);
        assert.equal(
          readFileSync(join(root, "DEPLOYED_RELEASE.json"), "utf8"),
          metadata,
        );
        assert.equal(
          readFileSync(join(root, "DEPLOYED_COMMIT"), "utf8"),
          "previous\n",
        );
        assert.equal(readlinkSync(join(root, "src")), join(root, "old-src"));
        assert.equal(
          readlinkSync(join(root, "web-ctx")),
          join(root, "old-web-ctx"),
        );
        if (["activate", "smoke"].includes(failure)) {
          assert.match(log, /image tag sha256:previous eudila-app-web:latest/);
          assert.match(log, /compose up -d --no-deps --no-build web/);
        } else assert.doesNotMatch(log, /compose up/);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}
