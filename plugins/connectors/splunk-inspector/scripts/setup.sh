#!/usr/bin/env bash
# splunk-inspector:setup
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/splunk-inspector.yaml"
ENV_FILE="$CONFIG_DIR/splunk-inspector.env"
SOURCE="splunk-inspector"
SOURCE_VERSION="0.1.0"

BASE_URL="${SPLUNK_BASE_URL:-}"
TOKEN="${SPLUNK_TOKEN:-}"
USERNAME="${SPLUNK_USERNAME:-}"
PASSWORD="${SPLUNK_PASSWORD:-}"
INSECURE="false"

for arg in "$@"; do
  case "$arg" in
    --base-url=*) BASE_URL="${arg#*=}" ;;
    --token=*) TOKEN="${arg#*=}" ;;
    --username=*) USERNAME="${arg#*=}" ;;
    --password=*) PASSWORD="${arg#*=}" ;;
    --insecure) INSECURE="true" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$BASE_URL" ]]; then
  echo "[$SOURCE:setup] missing --base-url or SPLUNK_BASE_URL." >&2
  exit 2
fi

if [[ -z "$TOKEN" && ( -z "$USERNAME" || -z "$PASSWORD" ) ]]; then
  echo "[$SOURCE:setup] provide --token or --username/--password." >&2
  exit 2
fi

AUTH_JSON=$(NODE_TLS_REJECT_UNAUTHORIZED=$([[ "$INSECURE" == "true" ]] && echo 0 || echo 1) node - "$BASE_URL" "$TOKEN" "$USERNAME" "$PASSWORD" <<'NODE'
const [baseUrl, token, username, password] = process.argv.slice(2);
const headers = { Accept: 'application/json' };
if (token) headers.Authorization = `Bearer ${token}`;
else headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
const url = `${baseUrl.replace(/\/$/, '')}/services/server/info?output_mode=json`;
const result = await fetch(url, { headers }).then(async r => ({ status: r.status, body: await r.json().catch(() => ({})) })).catch(err => ({ status: 0, body: { error: err.message } }));
console.log(JSON.stringify(result));
NODE
)

STATUS=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.status)" "$AUTH_JSON")
if [[ "$STATUS" != "200" ]]; then
  ERR=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.body?.messages?.[0]?.text || d.body?.error || ('http_' + d.status))" "$AUTH_JSON")
  echo "[$SOURCE:setup] Splunk auth check failed: $ERR" >&2
  exit 2
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
base_url: "$BASE_URL"
insecure: $INSECURE
defaults:
  min_retention_days: 30
EOF

umask 077
cat > "$ENV_FILE" <<EOF
SPLUNK_TOKEN="$TOKEN"
SPLUNK_USERNAME="$USERNAME"
SPLUNK_PASSWORD="$PASSWORD"
EOF

CACHE_DIR="$HOME/.cache/claude-grc/findings/splunk-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
splunk-inspector:setup ok
  base_url:  $BASE_URL
  config:    $CONFIG_FILE
  secrets:   $ENV_FILE

Next:
  /splunk-inspector:collect
EOF
