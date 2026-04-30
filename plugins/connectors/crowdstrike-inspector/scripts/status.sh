#!/usr/bin/env bash
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/crowdstrike-inspector.yaml"
ENV_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/crowdstrike-inspector.env"
CACHE_DIR="$HOME/.cache/claude-grc/findings/crowdstrike-inspector"
printf 'crowdstrike-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  exit 2
fi

BASE_URL=$(awk -F'"' '/^base_url:/ {print $2; exit}' "$CONFIG_FILE")
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi
if [[ -z "${FALCON_CLIENT_ID:-}" || -z "${FALCON_CLIENT_SECRET:-}" ]]; then
  printf '  status:        credentials-expired\n'
  exit 2
fi

AUTH_STATUS=$(node - "$BASE_URL" "$FALCON_CLIENT_ID" "$FALCON_CLIENT_SECRET" <<'NODE'
const [baseUrl, id, secret] = process.argv.slice(2);
const body = new URLSearchParams({ client_id: id, client_secret: secret });
const result = await fetch(`${baseUrl.replace(/\/$/, '')}/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }).then(r => r.status).catch(() => 0);
console.log(result);
NODE
)
if [[ "$AUTH_STATUS" != "201" && "$AUTH_STATUS" != "200" ]]; then
  printf '  status:        credentials-expired\n'
  exit 2
fi

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n'
  printf '  base_url:      %s\n' "$BASE_URL"
  printf '  last run:      never\n'
  exit 0
fi
if stat -f%m "$LATEST" >/dev/null 2>&1; then MTIME=$(stat -f%m "$LATEST"); else MTIME=$(stat -c%Y "$LATEST"); fi
AGE_H=$(( ($(date +%s) - MTIME) / 3600 ))
if (( AGE_H < 168 )); then STATUS="ready"; else STATUS="stale"; fi
RES=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(Array.isArray(a)?a.length:1)}catch{console.log('?')}" "$LATEST")
printf '  status:        %s\n' "$STATUS"
printf '  base_url:      %s\n' "$BASE_URL"
printf '  last run:      %sh ago (%s)\n' "$AGE_H" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources\n' "$RES"
