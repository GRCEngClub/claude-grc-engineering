#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/wiz-inspector.yaml"
AUTH_URL="${WIZ_AUTH_URL:-https://auth.app.wiz.io/oauth/token}"
API_URL="${WIZ_API_URL:-}"
CLIENT_ID="${WIZ_CLIENT_ID:-}"
CLIENT_SECRET="${WIZ_CLIENT_SECRET:-}"
CLIENT_ID_ENV="WIZ_CLIENT_ID"
CLIENT_SECRET_ENV="WIZ_CLIENT_SECRET"
PROJECT_ID="${WIZ_PROJECT_ID:-}"
LIMIT="${WIZ_LIMIT:-100}"

for arg in "$@"; do
  case "$arg" in
    --auth-url=*) AUTH_URL="${arg#*=}" ;;
    --api-url=*) API_URL="${arg#*=}" ;;
    --client-id=*) CLIENT_ID="${arg#*=}" ;;
    --client-secret=*) CLIENT_SECRET="${arg#*=}" ;;
    --client-id-env=*) CLIENT_ID_ENV="${arg#*=}"; CLIENT_ID="${!CLIENT_ID_ENV:-$CLIENT_ID}" ;;
    --client-secret-env=*) CLIENT_SECRET_ENV="${arg#*=}"; CLIENT_SECRET="${!CLIENT_SECRET_ENV:-$CLIENT_SECRET}" ;;
    --project-id=*) PROJECT_ID="${arg#*=}" ;;
    --limit=*) LIMIT="${arg#*=}" ;;
    *) echo "[wiz-inspector:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$CLIENT_ID" || -z "$CLIENT_SECRET" || -z "$API_URL" ]]; then
  echo "[wiz-inspector:setup] missing client id, client secret, or API URL." >&2
  exit 2
fi

STATUS=$(node - "$AUTH_URL" "$API_URL" "$CLIENT_ID" "$CLIENT_SECRET" <<'NODE'
const [authUrl, apiUrl, clientId, clientSecret] = process.argv.slice(2);
async function token() {
  const body = new URLSearchParams({ grant_type: 'client_credentials', audience: 'wiz-api', client_id: clientId, client_secret: clientSecret });
  const r = await fetch(authUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!r.ok) return r.status;
  const data = await r.json().catch(() => ({}));
  const q = await fetch(apiUrl, { method: 'POST', headers: { authorization: `Bearer ${data.access_token || ''}`, 'content-type': 'application/json' }, body: JSON.stringify({ query: '{ __typename }' }) });
  return q.status;
}
console.log(await token().catch(() => 0));
NODE
)
if [[ "$STATUS" != "200" ]]; then
  echo "[wiz-inspector:setup] Wiz auth/API check failed: HTTP $STATUS" >&2
  exit 2
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: wiz-inspector
source_version: "0.1.0"
auth_url: "$AUTH_URL"
api_url: "$API_URL"
project_id: "$PROJECT_ID"
client_id_env: "$CLIENT_ID_ENV"
client_secret_env: "$CLIENT_SECRET_ENV"
defaults:
  limit: $LIMIT
EOF

mkdir -p "$HOME/.cache/claude-grc/findings/wiz-inspector"
touch "$HOME/.cache/claude-grc/runs.log"
printf 'wiz-inspector:setup ok\n  api_url:      %s\n  project_id:   %s\n  credentials:  $%s / $%s\n  config:       %s\n' "$API_URL" "${PROJECT_ID:-tenant-wide}" "$CLIENT_ID_ENV" "$CLIENT_SECRET_ENV" "$CONFIG_FILE"
