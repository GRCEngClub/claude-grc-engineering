#!/usr/bin/env bash
# okta-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/okta-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/okta-inspector"

printf 'okta-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /okta-inspector:setup --domain=<your-org>.okta.com\n'
  exit 2
fi

DOMAIN=$(awk -F'"' '/^domain:/ {print $2; exit}' "$CONFIG_FILE")
ORG_ID=$(awk -F'"' '/^org_id:/ {print $2; exit}' "$CONFIG_FILE")
CALLER=$(awk -F'"' '/^caller:/ {print $2; exit}' "$CONFIG_FILE")
TOKEN_ENV=$(awk -F'"' '/^token_env:/ {print $2; exit}' "$CONFIG_FILE")

TOKEN="${!TOKEN_ENV:-}"
if [[ -z "$TOKEN" ]]; then
  printf '  status:        token-missing\n'
  printf '  domain:        %s\n' "$DOMAIN"
  printf '  fix:           export %s=<token-value>\n' "$TOKEN_ENV"
  exit 2
fi

HTTP=$(curl -sS -o /tmp/okta-status.json -w '%{http_code}' \
  -H "Authorization: SSWS $TOKEN" -H 'Accept: application/json' \
  "https://$DOMAIN/api/v1/users/me" 2>/dev/null || echo "000")
rm -f /tmp/okta-status.json

printf '  domain:        %s\n' "$DOMAIN"
printf '  org id:        %s\n' "$ORG_ID"
case "$HTTP" in
  200) printf '  token source:  $%s (valid)\n' "$TOKEN_ENV" ;;
  401|403) printf '  status:        token-invalid (HTTP %s)\n' "$HTTP"; exit 2 ;;
  000) printf '  status:        network-error\n'; exit 2 ;;
  *)   printf '  status:        unexpected HTTP %s\n' "$HTTP"; exit 2 ;;
esac
printf '  caller:        %s\n' "$CALLER"
printf '  config:        %s\n' "$CONFIG_FILE"

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready (no runs yet)\n'
  printf '  last run:      never\n'
  exit 0
fi
if stat -f%m "$LATEST" >/dev/null 2>&1; then MTIME=$(stat -f%m "$LATEST"); else MTIME=$(stat -c%Y "$LATEST"); fi
AGE_H=$(( ($(date +%s) - MTIME) / 3600 ))
if (( AGE_H < 24 )); then LABEL="${AGE_H}h ago"; STATUS="ready"
elif (( AGE_H < 168 )); then LABEL="$((AGE_H/24))d ago"; STATUS="ready"
else LABEL="$((AGE_H/24))d ago"; STATUS="stale"
fi
RES=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(Array.isArray(a)?a.length:1)}catch{console.log('?')}" "$LATEST")
EVS=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const arr=Array.isArray(a)?a:[a];let n=0;for(const d of arr)n+=(d.evaluations||[]).length;console.log(n)}catch{console.log('?')}" "$LATEST")

printf '  status:        %s\n' "$STATUS"
printf '  last run:      %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
