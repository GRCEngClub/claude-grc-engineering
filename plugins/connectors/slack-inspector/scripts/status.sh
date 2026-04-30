#!/usr/bin/env bash
# slack-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/slack-inspector.yaml"
TOKEN_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/slack-inspector.token"
CACHE_DIR="$HOME/.cache/claude-grc/findings/slack-inspector"

printf 'slack-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /slack-inspector:setup\n'
  exit 2
fi

TOKEN="${SLACK_TOKEN:-}"
if [[ -z "$TOKEN" && -f "$TOKEN_FILE" ]]; then TOKEN=$(cat "$TOKEN_FILE"); fi
if [[ -z "$TOKEN" ]]; then
  printf '  status:        credentials-expired\n'
  printf '  fix:           set SLACK_TOKEN or re-run /slack-inspector:setup\n'
  exit 2
fi

AUTH_JSON=$(node - "$TOKEN" <<'NODE'
const token = process.argv[2];
const body = await fetch('https://slack.com/api/auth.test', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).catch(err => ({ ok: false, error: err.message }));
console.log(JSON.stringify(body));
NODE
)

OK=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.ok ? 'yes' : 'no')" "$AUTH_JSON")
if [[ "$OK" != "yes" ]]; then
  ERR=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.error || 'unknown_error')" "$AUTH_JSON")
  printf '  status:        credentials-expired\n'
  printf '  slack error:   %s\n' "$ERR"
  exit 2
fi

TEAM_ID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.team_id || '')" "$AUTH_JSON")
TEAM_NAME=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.team || '')" "$AUTH_JSON")
USER_ID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.user_id || '')" "$AUTH_JSON")

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n'
  printf '  team:          %s (%s)\n' "$TEAM_NAME" "$TEAM_ID"
  printf '  principal:     %s\n' "$USER_ID"
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
printf '  team:          %s (%s)\n' "$TEAM_NAME" "$TEAM_ID"
printf '  principal:     %s\n' "$USER_ID"
printf '  config:        %s\n' "$CONFIG_FILE"
printf '  last run:      %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
