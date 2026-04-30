#!/usr/bin/env bash
# drata-inspector:setup
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/drata-inspector.yaml"
SOURCE="drata-inspector"
SOURCE_VERSION="0.1.0"
DRATA_CMD="${DRATA_CMD:-drata}"
REGION="${DRATA_REGION:-us}"

for arg in "$@"; do
  case "$arg" in
    --command=*) DRATA_CMD="${arg#*=}" ;;
    --region=*)  REGION="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if ! command -v "$DRATA_CMD" >/dev/null 2>&1; then
  cat >&2 <<'EOF'
[drata-inspector:setup] drata CLI not found.

Install:
  npm install -g drata-cli

Then configure auth:
  drata auth login --api-key-stdin
EOF
  exit 5
fi

VERSION=$("$DRATA_CMD" --version 2>/dev/null || echo unknown)
if ! AUTH_JSON=$(DRATA_READ_ONLY=1 DRATA_REGION="$REGION" "$DRATA_CMD" auth check --json 2>/dev/null); then
  cat >&2 <<EOF
[drata-inspector:setup] Drata auth check failed.

Configure drata-cli auth with one of:
  drata auth login --api-key-stdin
  export DRATA_API_KEY=...
  export DRATA_API_KEY_CMD='op read op://vault/drata/api-key'
EOF
  exit 2
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
drata_command: "$DRATA_CMD"
drata_cli_version: "$VERSION"
region: "$REGION"
defaults:
  workflows: ["summary", "controls_failing", "monitors_failing", "connections", "personnel", "evidence"]
  limit: 50
  max_pages: 20
  evidence_days: 60
EOF

CACHE_DIR="$HOME/.cache/claude-grc/findings/drata-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
drata-inspector:setup ok
  drata:   $VERSION
  region:  $REGION
  config:  $CONFIG_FILE

Next:
  /drata-inspector:collect
EOF
