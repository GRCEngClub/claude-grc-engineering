#!/usr/bin/env bash
set -euo pipefail
CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/tenable-inspector.yaml"
ENV_FILE="$CONFIG_DIR/tenable-inspector.env"
BASE_URL="${TENABLE_BASE_URL:-https://cloud.tenable.com}"
ACCESS_KEY="${TENABLE_ACCESS_KEY:-}"
SECRET_KEY="${TENABLE_SECRET_KEY:-}"
for arg in "$@"; do
  case "$arg" in
    --base-url=*) BASE_URL="${arg#*=}" ;;
    --access-key=*) ACCESS_KEY="${arg#*=}" ;;
    --secret-key=*) SECRET_KEY="${arg#*=}" ;;
    *) echo "[tenable-inspector:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done
if [[ -z "$ACCESS_KEY" || -z "$SECRET_KEY" ]]; then echo "[tenable-inspector:setup] missing access/secret key." >&2; exit 2; fi
STATUS=$(node - "$BASE_URL" "$ACCESS_KEY" "$SECRET_KEY" <<'NODE'
const [baseUrl, access, secret] = process.argv.slice(2);
const r = await fetch(`${baseUrl.replace(/\/$/, '')}/scans?limit=1`, { headers: { Accept: 'application/json', 'X-ApiKeys': `accessKey=${access}; secretKey=${secret}` } }).then(r => r.status).catch(() => 0);
console.log(r);
NODE
)
if [[ "$STATUS" != "200" ]]; then echo "[tenable-inspector:setup] Tenable auth check failed: HTTP $STATUS" >&2; exit 2; fi
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: tenable-inspector
source_version: "0.1.0"
base_url: "$BASE_URL"
defaults:
  limit: 100
  max_vulnerability_age_days: 30
EOF
umask 077
cat > "$ENV_FILE" <<EOF
TENABLE_ACCESS_KEY="$ACCESS_KEY"
TENABLE_SECRET_KEY="$SECRET_KEY"
EOF
mkdir -p "$HOME/.cache/claude-grc/findings/tenable-inspector"
touch "$HOME/.cache/claude-grc/runs.log"
printf 'tenable-inspector:setup ok\n  base_url: %s\n  config:   %s\n' "$BASE_URL" "$CONFIG_FILE"
