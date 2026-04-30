#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/knowledge-sources"
CONFIG_FILE="$CONFIG_DIR/gcp-docs.yaml"
ENV_FILE="$CONFIG_DIR/gcp-docs.env"
API_KEY="${GOOGLE_DEVELOPER_KNOWLEDGE_API_KEY:-}"
BASE_URL="${GOOGLE_DEVELOPER_KNOWLEDGE_API_BASE_URL:-https://developerknowledge.googleapis.com/v1alpha}"

for arg in "$@"; do
  case "$arg" in
    --api-key=*) API_KEY="${arg#*=}" ;;
    --base-url=*) BASE_URL="${arg#*=}" ;;
    *) echo "[gcp-docs:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$API_KEY" ]]; then
  echo "[gcp-docs:setup] missing Developer Knowledge API key." >&2
  exit 2
fi

STATUS=$(node "$(dirname "$0")/gcp-docs.js" status --api-key="$API_KEY" --base-url="$BASE_URL" --output=code || true)
if [[ "$STATUS" != "200" ]]; then
  echo "[gcp-docs:setup] API check failed: HTTP $STATUS" >&2
  exit 2
fi

mkdir -p "$CONFIG_DIR" "$HOME/.cache/claude-grc/knowledge/google"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: gcp-docs
source_version: "0.1.0"
base_url: "$BASE_URL"
cache_dir: "$HOME/.cache/claude-grc/knowledge/google"
ttl_days: 7
EOF

umask 077
cat > "$ENV_FILE" <<EOF
GOOGLE_DEVELOPER_KNOWLEDGE_API_KEY="$API_KEY"
EOF

printf 'gcp-docs:setup ok\n  base_url: %s\n  config:   %s\n' "$BASE_URL" "$CONFIG_FILE"
