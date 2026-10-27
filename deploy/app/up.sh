#!/usr/bin/env bash
# Corre EN el servidor (o en una máquina local de prueba), dentro de la carpeta de despliegue.
# Compila la app, levanta el proyecto de Docker y aplica migraciones y catálogo. Es idempotente.
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "Falta .env (lo genera scripts/deploy-app.sh)"; exit 1; }
set -a; . ./.env; set +a
COMPOSE=(docker compose)
[ -n "${COMPOSE_TEST:-}" ] && COMPOSE=(docker compose -f compose.yaml -f compose.test.yaml)
[ -s secrets/tunnel-token ] && COMPOSE+=(--profile tunnel)

echo "== 1/4 Compilar la app (contenedor con límites, para no desplazar a otros servicios)"
docker run --rm --memory "${BUILD_MEM:-2500m}" --memory-swap "${BUILD_MEM:-2500m}" --cpus "${BUILD_CPUS:-1.5}" \
  -v "$PWD/src:/src" -v eudila-app-npm:/root/.npm -w /src \
  -e NEXT_TELEMETRY_DISABLED=1 -e NODE_OPTIONS=--max-old-space-size=1792 \
  -e NEXT_PUBLIC_SUPABASE_URL="$PUBLIC_URL" -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$ANON_KEY" \
  -e NEXT_PUBLIC_CATALOG_URL="$PUBLIC_URL" -e NEXT_PUBLIC_CATALOG_ANON_KEY="$ANON_KEY" \
  -e NEXT_PUBLIC_FRONTEND_PREVIEW=false -e NEXT_PUBLIC_GOOGLE_AUTH_ENABLED="$GOOGLE_ENABLED" \
  node:24-bookworm-slim sh -ec '
    npm ci --no-audit --no-fund
    # El modo standalone se activa solo acá: el repo no necesita next.config.
    [ -e next.config.mjs ] || [ -e next.config.ts ] || [ -e next.config.js ] || printf "export default { output: \"standalone\" };\n" > next.config.mjs
    npm run build'
rm -rf web-ctx && mkdir web-ctx
cp -a src/.next/standalone web-ctx/standalone
cp -a src/.next/static web-ctx/static
cp -a src/public web-ctx/public 2>/dev/null || mkdir web-ctx/public
cp Dockerfile.web web-ctx/Dockerfile

echo "== 2/4 Base de datos y autenticación"
"${COMPOSE[@]}" build web
"${COMPOSE[@]}" up -d db
for i in $(seq 1 60); do [ "$("${COMPOSE[@]}" ps --format '{{.Health}}' db)" = healthy ] && break; sleep 2; done
"${COMPOSE[@]}" up -d auth
psql() { "${COMPOSE[@]}" exec -T db psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -qAt "$@"; }
for i in $(seq 1 60); do [ "$(psql -c "select to_regclass('auth.users') is not null")" = t ] && break; sleep 2; done

echo "== 3/4 Migraciones y catálogo"
psql -c "create table if not exists public.eudila_migrations(name text primary key, applied_at timestamptz not null default now()); revoke all on public.eudila_migrations from anon, authenticated;"
for f in src/supabase/migrations/*.sql; do
  n="$(basename "$f")"
  if [ "$(psql -c "select exists(select 1 from public.eudila_migrations where name = '$n')")" = t ]; then echo "  ya aplicada: $n"; continue; fi
  { echo "begin;"; cat "$f"; echo "insert into public.eudila_migrations(name) values ('$n');"; echo "commit;"; } | psql >/dev/null
  echo "  aplicada: $n"
done
if [ "$(psql -c "select count(*) from public.emociones")" = 0 ]; then psql < src/supabase/seed.sql >/dev/null && echo "  catálogo cargado"; else echo "  catálogo ya cargado"; fi
psql -c "notify pgrst, 'reload schema'" >/dev/null

echo "== 4/4 Servicios"
"${COMPOSE[@]}" up -d --remove-orphans
sleep 6
"${COMPOSE[@]}" ps --format 'table {{.Service}}\t{{.Status}}'
