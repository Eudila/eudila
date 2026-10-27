#!/usr/bin/env bash
# Lleva la app completa (Next.js + Supabase Auth + base de datos) a un VPS, en su propia carpeta y su
# propio proyecto de Docker. No toca otros servicios: sin puertos publicados, sin tocar el nginx del host.
#
#   VPS_HOST=usuario@ip-del-vps SSHPASS='…' bash app/infra/scripts/deploy-app.sh      (con clave SSH, sin SSHPASS)
#
# Opcionales (se guardan solo en el .env del servidor, nunca en el repo):
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET   habilitan «Continuar con Google»
#   EMAIL_AUTH_ENABLED=true + SMTP_HOST/PORT/USER/PASS/ADMIN_EMAIL   habilitan el login por email
#   PUBLIC_URL (https://app.eudila.com)  ·  VPS_DIR (/opt/eudila-app)  ·  SSH_OPTS
set -euo pipefail
: "${VPS_HOST:?Definí VPS_HOST, por ejemplo usuario@ip-del-vps}"
DEST="${VPS_DIR:-/opt/eudila-app}"
PUBLIC_URL="${PUBLIC_URL:-https://app.eudila.com}"
cd "$(dirname "$0")/../../.."

SSH=(ssh -o StrictHostKeyChecking=accept-new ${SSH_OPTS:-})
if [ -n "${SSHPASS:-}" ]; then SSH=(sshpass -e "${SSH[@]}"); fi
run() { "${SSH[@]}" "$VPS_HOST" "$@"; }

# Si otra sesión desplegó por releases (src y web-ctx son enlaces a releases/<commit>), este script
# borraría el código de esa versión y volvería a una más vieja. Se frena salvo FORCE=1.
if [ "${FORCE:-}" != 1 ] && run "test -L '$DEST/src' || test -e '$DEST/DEPLOYED_COMMIT'"; then
  echo "El servidor ya tiene un despliegue por releases ($(run "cat '$DEST/DEPLOYED_COMMIT' 2>/dev/null | cut -c1-7" || true))." >&2
  echo "Este script pisaría esa versión con el código local. Para activar otra versión usá el flujo de releases," >&2
  echo "o corré con FORCE=1 si de verdad querés reemplazarla." >&2
  exit 1
fi

echo "== Subiendo archivos de despliegue y código"
run "mkdir -p '$DEST/src' '$DEST/email' '$DEST/secrets' && chmod 700 '$DEST/secrets'"
tar -C app/infra/app -czf - compose.yaml Dockerfile.web gateway.conf up.sh db | run "tar -xzf - -C '$DEST'"
tar -C app/supabase/templates -czf - . | run "tar -xzf - -C '$DEST/email'"
# Código: workspaces y herramientas versionadas; sin docs ni configuraciones del servidor.
run "cd '$DEST/src' && find . -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .next -exec rm -rf {} +"
git ls-files -z -- . ':!docs' ':!app/infra/app' ':!app/infra/landing' | tar --null -czf - -T - | run "tar -xzf - -C '$DEST/src'"

echo "== Secretos (solo en el servidor)"
if ! run "test -s '$DEST/.env'"; then
  node app/infra/app/gen-env.mjs "$PUBLIC_URL" | run "umask 077; cat > '$DEST/.env'"
  echo "  .env creado con secretos nuevos"
else
  echo "  .env existente: se conserva"
fi
# Valores opcionales: viajan por stdin (no aparecen en la lista de procesos) y se insertan o reemplazan.
updates=""
add() { [ -n "${2:-}" ] && updates+="$1=$2"$'\n' || true; }
add GOOGLE_CLIENT_ID "${GOOGLE_CLIENT_ID:-}"; add GOOGLE_CLIENT_SECRET "${GOOGLE_CLIENT_SECRET:-}"
[ -n "${GOOGLE_CLIENT_ID:-}" ] && [ -n "${GOOGLE_CLIENT_SECRET:-}" ] && updates+=$'GOOGLE_ENABLED=true\n'
add EMAIL_AUTH_ENABLED "${EMAIL_AUTH_ENABLED:-}"; add SMTP_HOST "${SMTP_HOST:-}"; add SMTP_PORT "${SMTP_PORT:-}"
add SMTP_USER "${SMTP_USER:-}"; add SMTP_PASS "${SMTP_PASS:-}"; add SMTP_ADMIN_EMAIL "${SMTP_ADMIN_EMAIL:-}"
if [ -n "$updates" ]; then
  printf '%s' "$updates" | run "python3 -c '
import sys
path = \"$DEST/.env\"
lines = open(path).read().splitlines()
for pair in sys.stdin.read().splitlines():
    key = pair.split(\"=\", 1)[0]
    lines = [l for l in lines if not l.startswith(key + \"=\")] + [pair]
open(path, \"w\").write(\"\\n\".join(lines) + \"\\n\")
'; chmod 600 '$DEST/.env'"
  echo "  .env actualizado: $(printf '%s' "$updates" | cut -d= -f1 | tr '\n' ' ')"
fi

echo "== Compilando y levantando (puede tardar unos minutos)"
run "cd '$DEST' && BUILD_MEM=${BUILD_MEM:-3g} BUILD_CPUS=${BUILD_CPUS:-2} bash up.sh"
