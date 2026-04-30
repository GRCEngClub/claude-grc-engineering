#!/usr/bin/env bash
# datadog-inspector:setup
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/datadog-inspector.yaml"
ENV_FILE="$CONFIG_DIR/datadog-inspector.env"
SOURCE="datadog-inspector"
SOURCE_VERSION="0.1.0"

API_KEY="${DD_API_KEY:-}"
APP_KEY="${DD_APP_KEY:-}"
SITE="datadoghq.com"

for arg in "$@"; do
  case "$arg" in
    --api-key=*) API_KEY="${arg#*=}" ;;
    --app-key=*) APP_KEY="${arg#*=}" ;;
    --site=*)    SITE="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$API_KEY" || -z "$APP_KEY" ]]; then
  echo "[$SOURCE:setup] missing --api-key/--app-key or DD_API_KEY/DD_APP_KEY." >&2
  exit 2
fi

VALIDATE_JSON=$(node - "$API_KEY" "$APP_KEY" "$SITE" <<'NODE'
const [apiKey, appKey, site] = process.argv.slice(2);
const url = `https://api.${site}/api/v1/validate`;
const body = await fetch(url, {
  headers: { 'DD-API-KEY': apiKey, 'DD-APPLICATION-KEY': appKey, Accept: 'application/json' }
}).then(r => r.json().then(j => ({ status: r.status, body: j }))).catch(err => ({ status: 0, body: { valid: false, error: err.message } }));
console.log(JSON.stringify(body));
NODE
)

VALID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.body?.valid ? 'yes' : 'no')" "$VALIDATE_JSON")
if [[ "$VALID" != "yes" ]]; then
  ERR=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.body?.errors?.join('; ') || d.body?.error || ('http_' + d.status))" "$VALIDATE_JSON")
  echo "[$SOURCE:setup] Datadog credential validation failed: $ERR" >&2
  exit 2
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
site: "$SITE"
defaults:
  checks: ["logs", "audit", "monitors", "sso", "rbac"]
EOF

umask 077
cat > "$ENV_FILE" <<EOF
DD_API_KEY="$API_KEY"
DD_APP_KEY="$APP_KEY"
EOF

CACHE_DIR="$HOME/.cache/claude-grc/findings/datadog-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
datadog-inspector:setup ok
  site:      $SITE
  config:    $CONFIG_FILE
  secrets:   $ENV_FILE

Next:
  /datadog-inspector:collect
EOF
