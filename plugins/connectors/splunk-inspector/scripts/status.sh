#!/usr/bin/env bash
# splunk-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/splunk-inspector.yaml"
ENV_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/splunk-inspector.env"
CACHE_DIR="$HOME/.cache/claude-grc/findings/splunk-inspector"

printf 'splunk-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /splunk-inspector:setup\n'
  exit 2
fi

BASE_URL=$(awk -F'"' '/^base_url:/ {print $2; exit}' "$CONFIG_FILE")
INSECURE=$(awk '/^insecure:/ {print $2; exit}' "$CONFIG_FILE")
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

if [[ -z "${SPLUNK_TOKEN:-}" && ( -z "${SPLUNK_USERNAME:-}" || -z "${SPLUNK_PASSWORD:-}" ) ]]; then
  printf '  status:        credentials-expired\n'
  printf '  fix:           set SPLUNK_TOKEN or re-run /splunk-inspector:setup\n'
  exit 2
fi

AUTH_JSON=$(NODE_TLS_REJECT_UNAUTHORIZED=$([[ "$INSECURE" == "true" ]] && echo 0 || echo 1) node - "$BASE_URL" "${SPLUNK_TOKEN:-}" "${SPLUNK_USERNAME:-}" "${SPLUNK_PASSWORD:-}" <<'NODE'
const [baseUrl, token, username, password] = process.argv.slice(2);
const headers = { Accept: 'application/json' };
if (token) headers.Authorization = `Bearer ${token}`;
else headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
const result = await fetch(`${baseUrl.replace(/\/$/, '')}/services/server/info?output_mode=json`, { headers }).then(async r => ({ status: r.status, body: await r.json().catch(() => ({})) })).catch(err => ({ status: 0, body: { error: err.message } }));
console.log(JSON.stringify(result));
NODE
)

STATUS_CODE=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.status)" "$AUTH_JSON")
if [[ "$STATUS_CODE" != "200" ]]; then
  printf '  status:        credentials-expired\n'
  printf '  base_url:      %s\n' "$BASE_URL"
  exit 2
fi

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n'
  printf '  base_url:      %s\n' "$BASE_URL"
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
printf '  base_url:      %s\n' "$BASE_URL"
printf '  config:        %s\n' "$CONFIG_FILE"
printf '  last run:      %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
