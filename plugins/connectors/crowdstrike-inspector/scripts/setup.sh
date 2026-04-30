#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/crowdstrike-inspector.yaml"
ENV_FILE="$CONFIG_DIR/crowdstrike-inspector.env"
BASE_URL="${FALCON_BASE_URL:-https://api.crowdstrike.com}"
CLIENT_ID="${FALCON_CLIENT_ID:-}"
CLIENT_SECRET="${FALCON_CLIENT_SECRET:-}"

for arg in "$@"; do
  case "$arg" in
    --base-url=*) BASE_URL="${arg#*=}" ;;
    --client-id=*) CLIENT_ID="${arg#*=}" ;;
    --client-secret=*) CLIENT_SECRET="${arg#*=}" ;;
    *) echo "[crowdstrike-inspector:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$CLIENT_ID" || -z "$CLIENT_SECRET" ]]; then
  echo "[crowdstrike-inspector:setup] missing client id/secret." >&2
  exit 2
fi

AUTH_JSON=$(node - "$BASE_URL" "$CLIENT_ID" "$CLIENT_SECRET" <<'NODE'
const [baseUrl, id, secret] = process.argv.slice(2);
const body = new URLSearchParams({ client_id: id, client_secret: secret });
const result = await fetch(`${baseUrl.replace(/\/$/, '')}/oauth2/token`, {
  method: 'POST',
  headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
  body
}).then(async r => ({ status: r.status, body: await r.json().catch(() => ({})) })).catch(err => ({ status: 0, body: { error: err.message } }));
console.log(JSON.stringify(result));
NODE
)

STATUS=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.status)" "$AUTH_JSON")
if [[ "$STATUS" != "201" && "$STATUS" != "200" ]]; then
  ERR=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.body?.errors?.[0]?.message || d.body?.error || ('http_' + d.status))" "$AUTH_JSON")
  echo "[crowdstrike-inspector:setup] Falcon auth failed: $ERR" >&2
  exit 2
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: crowdstrike-inspector
source_version: "0.1.0"
base_url: "$BASE_URL"
defaults:
  limit: 100
EOF
umask 077
cat > "$ENV_FILE" <<EOF
FALCON_CLIENT_ID="$CLIENT_ID"
FALCON_CLIENT_SECRET="$CLIENT_SECRET"
EOF
mkdir -p "$HOME/.cache/claude-grc/findings/crowdstrike-inspector"
touch "$HOME/.cache/claude-grc/runs.log"
printf 'crowdstrike-inspector:setup ok\n  base_url: %s\n  config:   %s\n' "$BASE_URL" "$CONFIG_FILE"
