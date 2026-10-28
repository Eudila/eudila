#!/usr/bin/env bash
# Instalar como /usr/local/sbin/eudila-deploy, root:root 755.
# Publica la app (/opt/eudila-app) y, si están instalados en este servidor, la landing
# (/opt/eudila-landing) y el panel del psicólogo (/opt/eudila-dashboard). Del repositorio
# solo toma código y contextos de imagen: los compose.yaml de cada proyecto son los del
# servidor, instalados a mano después de revisarlos.
set -euo pipefail
umask 077
[[ ${1:-} =~ ^[a-f0-9]{40}$ && $# == 1 ]] || exit 64
sha=$1
landing_dir=/opt/eudila-landing
dashboard_dir=/opt/eudila-dashboard
cd /opt/eudila-app
exec 9>.deploy.lock
flock -w 1200 9

repo="$PWD/repository.git"
if [[ ! -d $repo ]]; then
  git init --bare "$repo" >/dev/null
  git --git-dir="$repo" remote add origin https://github.com/Eudila/eudila.git
fi
fetch_main() { git --git-dir="$repo" fetch --quiet origin main:refs/heads/main; }
is_current() { [[ $(git --git-dir="$repo" rev-parse refs/heads/main) == "$sha" ]]; }
fetch_main
if ! is_current; then
  echo "Se omite $sha: main ya tiene otra versión."
  exit 0
fi

# Landing y panel son opcionales: se publican solo si su proyecto existe en el servidor,
# y cada uno anota en su carpeta el commit que sirve.
pending() { [[ -f $1/compose.yaml ]] && ! grep -Fxqs "$sha" "$1/DEPLOYED_COMMIT"; }
app_current=0
if [[ -f DEPLOYED_RELEASE.json ]] && python3 -c 'import json,sys; sys.exit(json.load(open("DEPLOYED_RELEASE.json")).get("commit") != sys.argv[1])' "$sha"; then
  app_current=1
fi
if ((app_current)) && ! pending "$landing_dir" && ! pending "$dashboard_dir"; then
  echo "$sha ya está desplegado."
  exit 0
fi

candidate="eudila-candidate-${sha:0:12}"
extra_candidate="eudila-extra-candidate-${sha:0:12}"
switching=0
ready() {
  for _ in $(seq 1 30); do
    if docker exec "$1" node -e 'fetch("http://127.0.0.1:3000/bienvenida").then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))' 2>/dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}
cleanup() {
  status=$?
  trap - EXIT HUP INT TERM
  set +e
  docker rm -f "$candidate" "$extra_candidate" >/dev/null 2>&1
  rm -rf "$release/src/node_modules" "$release/src/app/.next" "$release/src/dashboard/.next"
  if [[ $status != 0 && $switching == 1 ]]; then
    echo 'Falló la activación; restaurando la app anterior.' >&2
    if docker image tag "$previous_image" eudila-app-web:latest &&
      ln -sfn "$(cat "$release/previous-src")" src &&
      ln -sfn "$(cat "$release/previous-web-ctx")" web-ctx &&
      cp "$release/previous-DEPLOYED_COMMIT" DEPLOYED_COMMIT &&
      cp "$release/previous-DEPLOYED_RELEASE.json" DEPLOYED_RELEASE.json &&
      docker compose up -d --no-deps --no-build web &&
      ready "$(docker compose ps -q web)" &&
      docker compose exec -T gateway nginx -s reload; then
      echo 'La app anterior vuelve a responder.' >&2
    else
      echo 'ERROR: rollback incompleto; revisar web y gateway en el VPS.' >&2
    fi
  fi
  exit "$status"
}
watch_signals() {
  trap cleanup EXIT
  trap 'exit 129' HUP
  trap 'exit 130' INT
  trap 'exit 143' TERM
}

set -a
. ./.env
set +a
compile() {
  docker run --rm --memory 2500m --memory-swap 2500m --cpus 1.5 --pids-limit 512 \
    --cap-drop=ALL --security-opt no-new-privileges \
    -v "$1:/src" -v eudila-app-npm:/root/.npm -w /src \
    -e EUDILA_STANDALONE=true -e NEXT_TELEMETRY_DISABLED=1 -e NODE_OPTIONS=--max-old-space-size=1792 \
    -e NEXT_PUBLIC_SUPABASE_URL="$PUBLIC_URL" -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$ANON_KEY" \
    -e NEXT_PUBLIC_CATALOG_URL="$PUBLIC_URL" -e NEXT_PUBLIC_CATALOG_ANON_KEY="$ANON_KEY" \
    -e NEXT_PUBLIC_FRONTEND_PREVIEW=false -e NEXT_PUBLIC_GOOGLE_AUTH_ENABLED="${GOOGLE_ENABLED:-false}" \
    node:24-bookworm-slim sh -ec "$2"
}
extra_builds() {
  local steps=""
  if pending "$landing_dir"; then steps+=" && npm run build:landing"; fi
  if pending "$dashboard_dir"; then steps+=" && npm run build:dashboard"; fi
  printf '%s' "$steps"
}

# Espera a que un contenedor responda a su propio chequeo de salud.
healthy() {
  local container=$1
  shift
  for _ in $(seq 1 30); do
    if docker exec "$container" "$@" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# Cambia solo el servicio web de un proyecto a la imagen nueva (ya probada como candidata)
# y vuelve a la anterior si no responde.
switch_web() {
  local dir=$1 name=$2 image=$3 previous
  shift 3
  previous=$(docker inspect "$name" --format '{{.Image}}' 2>/dev/null || true)
  docker image tag "$image" "$name:latest"
  if (cd "$dir" && docker compose up -d --no-deps --no-build web) && healthy "$name" "$@"; then
    if [[ -s $dir/secrets/tunnel-token ]]; then
      (cd "$dir" && docker compose --profile tunnel up -d --no-deps --no-build cloudflared)
    fi
    printf '%s\n' "$sha" > "$dir/DEPLOYED_COMMIT"
    return 0
  fi
  echo "Falló $name; vuelve la imagen anterior." >&2
  if [[ -n $previous ]] && docker image tag "$previous" "$name:latest" &&
    (cd "$dir" && docker compose up -d --no-deps --no-build web); then
    echo "$name anterior restaurado." >&2
  else
    echo "ERROR: revisar $name en el VPS." >&2
  fi
  return 1
}

deploy_landing() {
  local ctx="$release/landing-ctx" image
  image="eudila-landing:$(basename "$release")"
  mkdir -m 700 "$ctx"
  cp -a "$release/src/landing/dist" "$ctx/dist"
  cp "$release/src/app/infra/landing/Dockerfile" "$release/src/app/infra/landing/nginx.conf" \
    "$release/src/app/infra/landing/security-headers.conf" "$ctx/"
  docker build -t "$image" "$ctx"
  docker rm -f "$extra_candidate" >/dev/null 2>&1 || true
  docker run -d --name "$extra_candidate" --memory 128m --read-only \
    --tmpfs /var/cache/nginx --tmpfs /run --tmpfs /tmp \
    --security-opt no-new-privileges "$image" >/dev/null
  healthy "$extra_candidate" wget -qO /dev/null http://127.0.0.1/
  docker rm -f "$extra_candidate" >/dev/null
  switch_web "$landing_dir" eudila-landing "$image" wget -qO /dev/null http://127.0.0.1/
  echo "Landing desplegada: $sha"
}

deploy_dashboard() {
  local ctx="$release/dashboard-ctx" image
  local probe='fetch("http://127.0.0.1:3000/").then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))'
  image="eudila-dashboard:$(basename "$release")"
  mkdir -m 700 "$ctx"
  cp -a "$release/src/dashboard/.next/standalone" "$ctx/standalone"
  cp -a "$release/src/dashboard/.next/static" "$ctx/static"
  cp "$release/src/app/infra/dashboard/Dockerfile" "$ctx/Dockerfile"
  docker build -t "$image" "$ctx"
  docker rm -f "$extra_candidate" >/dev/null 2>&1 || true
  docker run -d --name "$extra_candidate" --memory 384m --read-only \
    --tmpfs /tmp --tmpfs /app/dashboard/.next/cache --pids-limit 256 \
    --cap-drop=ALL --security-opt no-new-privileges "$image" >/dev/null
  healthy "$extra_candidate" node -e "$probe"
  docker rm -f "$extra_candidate" >/dev/null
  switch_web "$dashboard_dir" eudila-dashboard "$image" node -e "$probe"
  echo "Panel desplegado: $sha"
}

deploy_extras() {
  if pending "$landing_dir"; then deploy_landing; fi
  if pending "$dashboard_dir"; then deploy_dashboard; fi
}

# La app ya sirve este commit: solo faltan la landing o el panel.
if ((app_current)); then
  release="$PWD/releases/$(date -u +%Y%m%dT%H%M%SZ)-extras-${sha:0:12}"
  mkdir -m 700 "$release" "$release/src"
  git --git-dir="$repo" archive "$sha" | tar -x -C "$release/src"
  watch_signals
  compile "$release/src" "npm ci --no-audit --no-fund$(extra_builds)"
  deploy_extras
  exit 0
fi

release="$PWD/releases/$(date -u +%Y%m%dT%H%M%SZ)-ci-${sha:0:12}"
mkdir -m 700 "$release" "$release/src" "$release/web-ctx"
git --git-dir="$repo" archive "$sha" | tar -x -C "$release/src"
readlink -f src > "$release/previous-src"
readlink -f web-ctx > "$release/previous-web-ctx"
cp DEPLOYED_COMMIT "$release/previous-DEPLOYED_COMMIT"
cp DEPLOYED_RELEASE.json "$release/previous-DEPLOYED_RELEASE.json"
previous_image=$(docker inspect "$(docker compose ps -q web)" --format '{{.Image}}')
printf '%s\n' "$previous_image" > "$release/previous-image"
docker image tag "$previous_image" "eudila-app-web:rollback-$(basename "$release")"

# shortcut: las migraciones se aplican manualmente; automatizarlas exige revisión y respaldo por migración.
docker compose exec -T db psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -qAt \
  -c 'select name from public.eudila_migrations order by name' > "$release/applied-migrations.txt"
for migration in "$release"/src/app/supabase/migrations/*.sql; do
  name=$(basename "$migration")
  if ! grep -Fxq "$name" "$release/applied-migrations.txt"; then
    echo "Migración pendiente: $name. Aplicarla con revisión y respaldo antes de desplegar." >&2
    exit 1
  fi
done

watch_signals
compile "$release/src" "npm ci --no-audit --no-fund && npm run build$(extra_builds)"
cp -a "$release/src/app/.next/standalone" "$release/web-ctx/standalone"
cp -a "$release/src/app/.next/static" "$release/web-ctx/static"
cp -a "$release/src/app/public" "$release/web-ctx/public"
cp "$release/src/app/infra/app/Dockerfile.web" "$release/web-ctx/Dockerfile"
image="eudila-app-web:$(basename "$release")"
docker build -t "$image" "$release/web-ctx"
docker run -d --name "$candidate" --network eudila-app_default --memory 512m \
  --read-only --tmpfs /tmp --tmpfs /app/app/.next/cache --pids-limit 256 \
  --cap-drop=ALL --security-opt no-new-privileges "$image" >/dev/null
ready "$candidate"
fetch_main
if ! is_current; then
  echo "Se omite la activación de $sha: main cambió durante el build."
  exit 0
fi

switching=1
docker image tag "$image" eudila-app-web:latest
ln -sfn "$release/src" src
ln -sfn "$release/web-ctx" web-ctx
docker compose up -d --no-deps --no-build web
ready "$(docker compose ps -q web)"
docker compose exec -T gateway nginx -s reload
curl --fail --silent --show-error --location --max-time 20 --retry 5 --retry-all-errors \
  "$PUBLIC_URL/bienvenida" > "$release/smoke.html"
python3 - "$sha" "$release" "$image" <<'PY'
import json, pathlib, sys
sha, release, image = sys.argv[1:]
metadata = {'release': pathlib.Path(release).name, 'commit': sha, 'base_commit': sha,
            'working_tree': False, 'image': image, 'previous_release': json.load(open('DEPLOYED_RELEASE.json'))['release']}
pathlib.Path(release, 'release.json').write_text(json.dumps(metadata, indent=2) + '\n')
pathlib.Path('DEPLOYED_RELEASE.json').write_text(json.dumps(metadata, indent=2) + '\n')
pathlib.Path('DEPLOYED_COMMIT').write_text(sha + '\n')
PY
switching=0
echo "Desplegado $sha en $PUBLIC_URL"
deploy_extras
