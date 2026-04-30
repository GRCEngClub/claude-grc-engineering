#!/usr/bin/env bash
# vanta-bridge:setup
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/bridges"
CONFIG_FILE="$CONFIG_DIR/vanta-bridge.yaml"
REGION="us"
INPUT_FILE=""

for arg in "$@"; do
  case "$arg" in
    --region=*) REGION="${arg#*=}" ;;
    --input=*) INPUT_FILE="${arg#*=}" ;;
    *) echo "[vanta-bridge:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

case "$REGION" in
  us|eu|aus) ;;
  *) echo "[vanta-bridge:setup] region must be us, eu, or aus." >&2; exit 2 ;;
esac

VANTA_PLUGIN_STATUS="unknown"
if command -v claude >/dev/null 2>&1; then
  if claude plugin list 2>/dev/null | grep -qi 'vanta'; then
    VANTA_PLUGIN_STATUS="installed"
  else
    VANTA_PLUGIN_STATUS="not-detected"
  fi
else
  VANTA_PLUGIN_STATUS="claude-cli-not-found"
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: vanta-bridge
source_version: "0.1.0"
region: "$REGION"
vanta_plugin_status: "$VANTA_PLUGIN_STATUS"
default_input: "$INPUT_FILE"
EOF

mkdir -p "$HOME/.cache/claude-grc/findings/vanta-bridge"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
vanta-bridge:setup ok
  region:         $REGION
  vanta plugin:   $VANTA_PLUGIN_STATUS
  config:         $CONFIG_FILE

Install Vanta's official plugin if needed:
  /plugin marketplace add VantaInc/vanta-mcp-plugin
  /plugin install vanta

Next:
  /vanta-bridge:sync --input=<vanta-mcp-output.json>
EOF
