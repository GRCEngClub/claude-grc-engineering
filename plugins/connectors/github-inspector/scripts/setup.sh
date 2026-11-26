#!/usr/bin/env bash

set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/github-inspector.yaml"
SOURCE="github-inspector"
SOURCE_VERSION="0.1.0"

die() { echo "[$SOURCE:setup] $*" >&2; exit "${2:-1}"; }

if ! command -v gh >/dev/null 2>&1; then
  cat <<EOF >&2
[$SOURCE:setup] gh CLI not found on PATH.

Install:
  macOS:    brew install gh
  Debian:   sudo apt install gh
  other:    https://github.com/cli/cli#installation

Then re-run /github-inspector:setup.
EOF
  exit 5
fi

GH_BIN=$(command -v gh)
GH_VERSION=$(gh --version | head -1 | awk '{print $3}')

if ! gh auth status >/dev/null 2>&1; then
  cat <<EOF >&2
[$SOURCE:setup] gh is not authenticated.

Run:
  gh auth login --scopes=repo,read:org,read:packages,security_events

Then re-run /github-inspector:setup.
EOF
  exit 2
fi

if ! LOGIN=$(gh api user --jq .login 2>/dev/null); then
  die "gh auth is present but 'gh api user' failed. Try 'gh auth refresh' and retry." 2
fi

SCOPES=$(gh auth status 2>&1 | awk -F'scopes:' '/Token scopes/ {gsub(/^ +| +$/,"",$2); print $2; exit}' || true)

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
authenticated_as: "$LOGIN"
gh_binary: "$GH_BIN"
gh_version: "$GH_VERSION"
scopes: "${SCOPES:-unknown}"
defaults:
  scope: "@me"
  include_archived: false
  include_forks: false
  concurrency: 4
EOF

CACHE_DIR="$HOME/.cache/claude-grc/findings/github-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
github-inspector:setup ✓
  gh version:       $GH_VERSION
  authenticated as: $LOGIN
  scopes:           ${SCOPES:-unknown}
  config written:   $CONFIG_FILE
  cache dir:        $CACHE_DIR

Next:
  /github-inspector:collect --scope=@me
  /engineer:gap-assessment SOC2 --sources=github-inspector
EOF
