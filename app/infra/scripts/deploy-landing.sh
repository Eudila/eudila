#!/usr/bin/env bash
# Publica la landing en un VPS dentro de su propia carpeta y su propio proyecto de Docker.
# No toca otros servicios: no usa el nginx del host, no publica puertos ni cambia el firewall.
#
#   VPS_HOST=usuario@ip-del-vps SSHPASS='…' npm run deploy:vps   (contraseña por entorno, no se guarda)
#   VPS_HOST=usuario@ip-del-vps npm run deploy:vps                (con clave SSH)
#
# Si existe secrets/tunnel-token en el VPS, también levanta el túnel de Cloudflare.
set -euo pipefail
: "${VPS_HOST:?Definí VPS_HOST, por ejemplo usuario@ip-del-vps}"
DEST="${VPS_DIR:-/opt/eudila-landing}"
cd "$(dirname "$0")/../../../landing"

SSH=(ssh -o StrictHostKeyChecking=accept-new ${SSH_OPTS:-})
if [ -n "${SSHPASS:-}" ]; then SSH=(sshpass -e "${SSH[@]}"); fi

npm run build
tar -czf - dist -C ../app/infra/landing Dockerfile nginx.conf security-headers.conf compose.yaml |
  "${SSH[@]}" "$VPS_HOST" "set -e; mkdir -p '$DEST/secrets'; rm -rf '$DEST/dist'; tar -xzf - -C '$DEST'"

"${SSH[@]}" "$VPS_HOST" "set -e; cd '$DEST'
  profile=''; [ -s secrets/tunnel-token ] && profile='--profile tunnel'
  docker compose \$profile up -d --build --remove-orphans
  sleep 3
  docker compose ps
  curl -fsS -o /dev/null -w 'salud local: HTTP %{http_code}\n' http://127.0.0.1:8081/healthz"
