#!/usr/bin/env bash
# datadog-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/datadog-inspector.yaml"
ENV_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/datadog-inspector.env"
CACHE_DIR="$HOME/.cache/claude-grc/findings/datadog-inspector"

printf 'datadog-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /datadog-inspector:setup\n'
  exit 2
fi

SITE=$(awk -F'"' '/^site:/ {print $2; exit}' "$CONFIG_FILE")
[[ -z "$SITE" ]] && SITE="datadoghq.com"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

if [[ -z "${DD_API_KEY:-}" || -z "${DD_APP_KEY:-}" ]]; then
  printf '  status:        credentials-expired\n'
  printf '  fix:           set DD_API_KEY/DD_APP_KEY or re-run /datadog-inspector:setup\n'
  exit 2
fi

VALIDATE_JSON=$(node - "$DD_API_KEY" "$DD_APP_KEY" "$SITE" <<'NODE'
const [apiKey, appKey, site] = process.argv.slice(2);
const body = await fetch(`https://api.${site}/api/v1/validate`, {
  headers: { 'DD-API-KEY': apiKey, 'DD-APPLICATION-KEY': appKey, Accept: 'application/json' }
}).then(r => r.json().then(j => ({ status: r.status, body: j }))).catch(err => ({ status: 0, body: { valid: false, error: err.message } }));
console.log(JSON.stringify(body));
NODE
)

VALID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.body?.valid ? 'yes' : 'no')" "$VALIDATE_JSON")
if [[ "$VALID" != "yes" ]]; then
  printf '  status:        credentials-expired\n'
  exit 2
fi

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n'
  printf '  site:          %s\n' "$SITE"
  printf '  config:        %s\n' "$CONFIG_FILE"
  printf '  last run:      never\n'
  exit 0
fi

if stat -f%m "$LATEST" >/dev/null 2>&1; then MTIME=$(stat -f%m "$LATEST"); else MTIME=$(stat -c%Y "$LATEST"); fi
AGE=$(( $(date +%s) - MTIME ))
AGE_H=$(( AGE / 3600 ))
if (( AGE_H < 24 )); then LABEL="${AGE_H}h ago"; STATUS="ready"
elif (( AGE_H < 168 )); then LABEL="$((AGE_H/24))d ago"; STATUS="ready"
else LABEL="$((AGE_H/24))d ago"; STATUS="stale"
fi

RES=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(Array.isArray(a)?a.length:1)}catch{console.log('?')}" "$LATEST")
EVS=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const arr=Array.isArray(a)?a:[a];let n=0;for(const d of arr)n+=(d.evaluations||[]).length;console.log(n)}catch{console.log('?')}" "$LATEST")

printf '  status:        %s\n' "$STATUS"
printf '  site:          %s\n' "$SITE"
printf '  config:        %s\n' "$CONFIG_FILE"
printf '  last run:      %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
