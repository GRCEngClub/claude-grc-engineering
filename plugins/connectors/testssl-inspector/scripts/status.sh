#!/usr/bin/env bash
# testssl-inspector:status — quick health view.
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/testssl-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/testssl-inspector"
SOURCE="testssl-inspector"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "$SOURCE:status — not configured. Run /testssl-inspector:setup."
  exit 5
fi

VERSION=$(grep -E '^testssl_version:' "$CONFIG_FILE" 2>/dev/null | awk -F'"' '{print $2}')
RUNNER="native"
if grep -qE '^use_docker:\s*true' "$CONFIG_FILE" 2>/dev/null; then RUNNER="docker"; fi
TESTSSL_PATH=$(grep -E '^testssl_path:' "$CONFIG_FILE" 2>/dev/null | awk -F'"' '{print $2}')

TARGET_COUNT=0
if grep -qE '^targets:' "$CONFIG_FILE" 2>/dev/null; then
  TARGET_COUNT=$(awk '/^targets:/{ flag=1; next } flag && /^[A-Za-z_]/{ flag=0 } flag && /^[[:space:]]*-/{ c++ } END{ print c+0 }' "$CONFIG_FILE")
fi

RECENT_RUNS=0
LATEST_RUN=""
if [[ -d "$CACHE_DIR" ]]; then
  RECENT_RUNS=$(find "$CACHE_DIR" -maxdepth 1 -name '*.json' -type f 2>/dev/null | wc -l | tr -d ' ')
  LATEST_RUN=$(ls -1t "$CACHE_DIR"/*.json 2>/dev/null | head -1 | xargs -I{} basename {} 2>/dev/null || true)
fi

cat <<EOF
testssl-inspector:status
  runner:          $RUNNER${TESTSSL_PATH:+ ($TESTSSL_PATH)}
  testssl version: ${VERSION:-unknown}
  config:          $CONFIG_FILE
  targets:         $TARGET_COUNT configured
  cache:           $CACHE_DIR
  scans on disk:   $RECENT_RUNS
  latest:          ${LATEST_RUN:-<none>}
EOF
