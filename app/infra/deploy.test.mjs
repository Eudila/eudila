import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
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

/**
 * Un servidor de mentira: repositorio bare con un commit, enlaces de la versión anterior,
 * proyectos opcionales de landing y panel, y un `docker` que registra cada llamada.
 */
function server({ landing = false, dashboard = false, appAt = null } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "eudila-deploy-test-")));
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
    execFileSync("git", args, { cwd: repo, stdio: ["ignore", "pipe", "pipe"] })
      .toString()
      .trim();
  git("init", "--initial-branch=main");
  const file = (path, content) => {
    mkdirSync(join(repo, path, ".."), { recursive: true });
    writeFileSync(join(repo, path), content);
  };
  file(
    "app/supabase/migrations/20261027031110_registros_cuenta.sql",
    "-- already applied\n",
  );
  file("app/infra/app/Dockerfile.web", "FROM scratch\n");
  file("app/infra/dashboard/Dockerfile", "FROM scratch\n");
  for (const name of ["Dockerfile", "nginx.conf", "security-headers.conf"])
    file(`app/infra/landing/${name}`, "# landing\n");
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
  writeFileSync(join(root, "DEPLOYED_COMMIT"), `${appAt ?? "previous"}\n`);
  const metadata = appAt
    ? `{"release":"previous","commit":"${appAt === "sha" ? sha : appAt}"}\n`
    : '{"release":"previous"}\n';
  writeFileSync(join(root, "DEPLOYED_RELEASE.json"), metadata);
  const projects = {
    landing: join(root, "landing"),
    dashboard: join(root, "dashboard"),
  };
  if (landing)
    mkdirSync(join(projects.landing, "secrets"), { recursive: true });
  if (landing)
    writeFileSync(join(projects.landing, "compose.yaml"), "name: x\n");
  if (dashboard) mkdirSync(projects.dashboard);
  if (dashboard)
    writeFileSync(join(projects.dashboard, "compose.yaml"), "name: x\n");
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
printf '%s @ %s\\n' "$*" "$PWD" >> "$TEST_ROOT/docker.log"
case "$*" in
  'compose ps -q web') echo current-web ;;
  'inspect current-web '*) echo sha256:previous ;;
  'inspect eudila-landing '*) echo sha256:landing-previous ;;
  'inspect eudila-dashboard '*) exit 1 ;;
  'compose exec -T db '*) [ "$FAILURE" = migration ] || echo 20261027031110_registros_cuenta.sql ;;
  'run --rm '*)
    [ "$FAILURE" != build ] || exit 1
    for arg do
      case "$arg" in *:/src)
        src=$(printf '%s' "$arg" | sed 's|:/src$||')
        mkdir -p "$src/app/.next/standalone" "$src/app/.next/static" "$src/app/public" \
          "$src/dashboard/.next/standalone" "$src/dashboard/.next/static" "$src/landing/dist"
      ;; esac
    done ;;
  'image tag sha256:previous eudila-app-web:latest') rm -f "$TEST_ROOT/new-image" ;;
  'image tag '*' eudila-app-web:latest') touch "$TEST_ROOT/new-image" ;;
  'exec current-web '*)
    [ "$FAILURE" != activate ] || [ ! -f "$TEST_ROOT/new-image" ] ;;
  'exec eudila-extra-candidate-'*' node '*) [ "$FAILURE" != dashboard ] ;;
  'exec eudila-landing '*) [ "$FAILURE" != landing ] ;;
esac`,
  );
  const script = join(root, "deploy.sh");
  writeFileSync(
    script,
    source
      .replace("cd /opt/eudila-app", `cd '${root}'`)
      .replace(
        "landing_dir=/opt/eudila-landing",
        `landing_dir='${projects.landing}'`,
      )
      .replace(
        "dashboard_dir=/opt/eudila-dashboard",
        `dashboard_dir='${projects.dashboard}'`,
      ),
  );
  return {
    root,
    sha,
    metadata,
    projects,
    run(failure = "none") {
      const result = spawnSync("bash", [script, sha], {
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          TEST_ROOT: root,
          FAILURE: failure,
        },
        encoding: "utf8",
      });
      const logFile = join(root, "docker.log");
      const log = existsSync(logFile) ? readFileSync(logFile, "utf8") : "";
      return { ...result, log };
    },
    deployed: (dir) =>
      existsSync(join(dir, "DEPLOYED_COMMIT"))
        ? readFileSync(join(dir, "DEPLOYED_COMMIT"), "utf8").trim()
        : null,
    appCommit: () =>
      JSON.parse(readFileSync(join(root, "DEPLOYED_RELEASE.json"))).commit,
    clean: () => rmSync(root, { recursive: true, force: true }),
  };
}

for (const failure of ["none", "build", "activate", "smoke", "migration"]) {
  test(`release: ${failure}`, () => {
    const s = server();
    try {
      const { status, stdout, stderr, log } = s.run(failure);
      assert.doesNotMatch(log, /compose (down|up.*(?:db|auth|rest))/);
      assert.doesNotMatch(log, /eudila-(landing|dashboard)/);
      if (failure === "none") {
        assert.equal(status, 0, stderr);
        assert.equal(s.appCommit(), s.sha);
        assert.notEqual(
          readlinkSync(join(s.root, "src")),
          join(s.root, "old-src"),
        );
      } else {
        assert.notEqual(status, 0, stdout);
        assert.equal(
          readFileSync(join(s.root, "DEPLOYED_RELEASE.json"), "utf8"),
          s.metadata,
        );
        assert.equal(
          readFileSync(join(s.root, "DEPLOYED_COMMIT"), "utf8"),
          "previous\n",
        );
        assert.equal(
          readlinkSync(join(s.root, "src")),
          join(s.root, "old-src"),
        );
        assert.equal(
          readlinkSync(join(s.root, "web-ctx")),
          join(s.root, "old-web-ctx"),
        );
        if (["activate", "smoke"].includes(failure)) {
          assert.match(log, /image tag sha256:previous eudila-app-web:latest/);
          assert.match(log, /compose up -d --no-deps --no-build web/);
        } else assert.doesNotMatch(log, /compose up/);
      }
    } finally {
      s.clean();
    }
  });
}

test("release con landing y panel: publica los tres y anota cada commit", () => {
  const s = server({ landing: true, dashboard: true });
  try {
    const { status, stderr, log } = s.run();
    assert.equal(status, 0, stderr);
    assert.equal(s.appCommit(), s.sha);
    assert.equal(s.deployed(s.projects.landing), s.sha);
    assert.equal(s.deployed(s.projects.dashboard), s.sha);
    assert.match(
      log,
      /npm run build && npm run build:landing && npm run build:dashboard/,
    );
    assert.match(log, /image tag eudila-landing:\S+ eudila-landing:latest/);
    assert.match(log, /image tag eudila-dashboard:\S+ eudila-dashboard:latest/);
    // Cada proyecto se actualiza desde su carpeta y solo cambia su servicio web.
    assert.match(
      log,
      new RegExp(
        `compose up -d --no-deps --no-build web @ ${s.projects.landing}\\n`,
      ),
    );
    assert.match(
      log,
      new RegExp(
        `compose up -d --no-deps --no-build web @ ${s.projects.dashboard}\\n`,
      ),
    );
    assert.doesNotMatch(log, /cloudflared/);
  } finally {
    s.clean();
  }
});

test("si falla el candidato del panel, la app queda publicada y el panel no cambia", () => {
  const s = server({ dashboard: true });
  try {
    const { status, log } = s.run("dashboard");
    assert.notEqual(status, 0);
    assert.equal(s.appCommit(), s.sha);
    assert.equal(s.deployed(s.projects.dashboard), null);
    assert.doesNotMatch(log, /eudila-dashboard:latest/);
    assert.doesNotMatch(log, /image tag sha256:previous eudila-app-web:latest/);
  } finally {
    s.clean();
  }
});

test("con la app ya publicada, solo despliega lo que falta", () => {
  const s = server({ landing: true, appAt: "sha" });
  try {
    const { status, stderr, log } = s.run();
    assert.equal(status, 0, stderr);
    assert.equal(s.deployed(s.projects.landing), s.sha);
    assert.match(
      log,
      /sh -ec npm ci --no-audit --no-fund && npm run build:landing\b/,
    );
    assert.doesNotMatch(log, /compose ps -q web|eudila-app-web/);
    assert.match(
      readFileSync(join(s.root, "DEPLOYED_RELEASE.json"), "utf8"),
      /previous/,
    );
    // Una segunda corrida ya no tiene nada que hacer.
    rmSync(join(s.root, "docker.log"));
    const again = s.run();
    assert.equal(again.status, 0);
    assert.match(again.stdout, /ya está desplegado/);
    assert.equal(again.log, "");
  } finally {
    s.clean();
  }
});

test("si la landing nueva no responde, vuelve la imagen anterior", () => {
  const s = server({ landing: true });
  try {
    const { status, log } = s.run("landing");
    assert.notEqual(status, 0);
    assert.equal(s.appCommit(), s.sha);
    assert.equal(s.deployed(s.projects.landing), null);
    assert.match(
      log,
      /image tag sha256:landing-previous eudila-landing:latest/,
    );
  } finally {
    s.clean();
  }
});
