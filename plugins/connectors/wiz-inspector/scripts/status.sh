#!/usr/bin/env bash
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/wiz-inspector.yaml"
ENV_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/wiz-inspector.env"
CACHE_DIR="$HOME/.cache/claude-grc/findings/wiz-inspector"

printf 'wiz-inspector\n'
if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  exit 2
fi

AUTH_URL=$(awk -F'"' '/^auth_url:/ {print $2; exit}' "$CONFIG_FILE")
API_URL=$(awk -F'"' '/^api_url:/ {print $2; exit}' "$CONFIG_FILE")
if [[ -f "$ENV_FILE" ]]; then source "$ENV_FILE"; fi
if [[ -z "${WIZ_CLIENT_ID:-}" || -z "${WIZ_CLIENT_SECRET:-}" || -z "$API_URL" ]]; then
  printf '  status:        credentials-expired\n'
  exit 2
fi

CODE=$(node - "$AUTH_URL" "$API_URL" "$WIZ_CLIENT_ID" "$WIZ_CLIENT_SECRET" <<'NODE'
const [authUrl, apiUrl, clientId, clientSecret] = process.argv.slice(2);
async function check() {
  const body = new URLSearchParams({ grant_type: 'client_credentials', audience: 'wiz-api', client_id: clientId, client_secret: clientSecret });
  const r = await fetch(authUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!r.ok) return r.status;
  const data = await r.json().catch(() => ({}));
  const q = await fetch(apiUrl, { method: 'POST', headers: { authorization: `Bearer ${data.access_token || ''}`, 'content-type': 'application/json' }, body: JSON.stringify({ query: '{ __typename }' }) });
  return q.status;
}
console.log(await check().catch(() => 0));
NODE
)
if [[ "$CODE" != "200" ]]; then
  printf '  status:        credentials-expired\n'
  exit 2
fi

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n  api_url:       %s\n  last run:      never\n' "$API_URL"
  exit 0
fi
if stat -f%m "$LATEST" >/dev/null 2>&1; then MTIME=$(stat -f%m "$LATEST"); else MTIME=$(stat -c%Y "$LATEST"); fi
AGE_H=$(( ($(date +%s) - MTIME) / 3600 ))
if (( AGE_H < 168 )); then STATUS=ready; else STATUS=stale; fi
printf '  status:        %s\n  api_url:       %s\n  last run:      %sh ago (%s)\n' "$STATUS" "$API_URL" "$AGE_H" "$(basename "$LATEST" .json)"
