#!/usr/bin/env bash
set -uo pipefail
CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/tenable-inspector.yaml"
ENV_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/tenable-inspector.env"
CACHE_DIR="$HOME/.cache/claude-grc/findings/tenable-inspector"
printf 'tenable-inspector\n'
if [[ ! -f "$CONFIG_FILE" ]]; then printf '  status:        not-configured\n'; exit 2; fi
BASE_URL=$(awk -F'"' '/^base_url:/ {print $2; exit}' "$CONFIG_FILE")
if [[ -f "$ENV_FILE" ]]; then source "$ENV_FILE"; fi
if [[ -z "${TENABLE_ACCESS_KEY:-}" || -z "${TENABLE_SECRET_KEY:-}" ]]; then printf '  status:        credentials-expired\n'; exit 2; fi
CODE=$(node - "$BASE_URL" "$TENABLE_ACCESS_KEY" "$TENABLE_SECRET_KEY" <<'NODE'
const [baseUrl, access, secret] = process.argv.slice(2);
const r = await fetch(`${baseUrl.replace(/\/$/, '')}/scans?limit=1`, { headers: { 'X-ApiKeys': `accessKey=${access}; secretKey=${secret}` } }).then(r => r.status).catch(() => 0);
console.log(r);
NODE
)
if [[ "$CODE" != "200" ]]; then printf '  status:        credentials-expired\n'; exit 2; fi
LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then printf '  status:        ready\n  base_url:      %s\n  last run:      never\n' "$BASE_URL"; exit 0; fi
if stat -f%m "$LATEST" >/dev/null 2>&1; then MTIME=$(stat -f%m "$LATEST"); else MTIME=$(stat -c%Y "$LATEST"); fi
AGE_H=$(( ($(date +%s) - MTIME) / 3600 ))
if (( AGE_H < 168 )); then STATUS=ready; else STATUS=stale; fi
printf '  status:        %s\n  base_url:      %s\n  last run:      %sh ago (%s)\n' "$STATUS" "$BASE_URL" "$AGE_H" "$(basename "$LATEST" .json)"
