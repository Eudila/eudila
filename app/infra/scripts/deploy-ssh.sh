#!/usr/bin/env bash
# Instalar como /usr/local/sbin/eudila-deploy-ssh, root:root 755.
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
if [[ ! ${SSH_ORIGINAL_COMMAND:-} =~ ^deploy\ ([a-f0-9]{40})$ ]]; then
  echo 'Solo se admite: deploy <SHA de main>' >&2
  exit 64
fi
exec /usr/local/sbin/eudila-deploy "${BASH_REMATCH[1]}"
