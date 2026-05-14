#!/usr/bin/env bash
# testssl-inspector:setup — verify testssl.sh is reachable and write default config.
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/testssl-inspector.yaml"
SOURCE="testssl-inspector"
SOURCE_VERSION="0.1.0"

USE_DOCKER="false"
TARGETS=()
for arg in "$@"; do
  case "$arg" in
    --docker)        USE_DOCKER="true" ;;
    --target=*)      TARGETS+=("${arg#*=}") ;;
    -h|--help)
      cat <<'EOF'
testssl-inspector:setup — locate testssl.sh and write default targets.

Usage:
  /testssl-inspector:setup [--docker] [--target=host[:port]] [--target=...]

Examples:
  /testssl-inspector:setup --target=example.com
  /testssl-inspector:setup --docker --target=example.com:8443 --target=api.example.com
EOF
      exit 0 ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

resolve_binary() {
  for candidate in testssl.sh testssl; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"; return 0
    fi
  done
  for candidate in \
    "$HOME/.local/share/testssl.sh/testssl.sh" \
    "/opt/testssl.sh/testssl.sh" \
    "/usr/local/bin/testssl.sh"; do
    [[ -x "$candidate" ]] && { echo "$candidate"; return 0; }
  done
  return 1
}

TESTSSL_BIN=""
VERSION="unknown"
RUNNER="native"

if [[ "$USE_DOCKER" == "true" ]]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "[$SOURCE:setup] --docker passed but docker is not on PATH." >&2
    exit 3
  fi
  RUNNER="docker"
  if docker image inspect drwetter/testssl.sh:latest >/dev/null 2>&1; then
    VERSION=$(docker run --rm drwetter/testssl.sh:latest --version 2>/dev/null \
      | grep -Eo 'testssl\.sh +[0-9][^ ,]*' | awk '{print $2}' | head -1)
    VERSION="${VERSION:-unknown}"
  else
    echo "[$SOURCE:setup] drwetter/testssl.sh image not pulled yet. Pulling..."
    docker pull drwetter/testssl.sh:latest >/dev/null
    VERSION=$(docker run --rm drwetter/testssl.sh:latest --version 2>/dev/null \
      | grep -Eo 'testssl\.sh +[0-9][^ ,]*' | awk '{print $2}' | head -1)
    VERSION="${VERSION:-unknown}"
  fi
else
  if TESTSSL_BIN=$(resolve_binary); then
    VERSION=$("$TESTSSL_BIN" --version 2>/dev/null \
      | grep -Eo 'testssl\.sh +[0-9][^ ,]*' | awk '{print $2}' | head -1)
    VERSION="${VERSION:-unknown}"
  else
    cat >&2 <<EOF
[$SOURCE:setup] testssl.sh not found on PATH or in common install paths.

Install one of these and re-run:
  macOS:           brew install testssl
  Debian/Ubuntu:   sudo apt-get install -y testssl.sh
  From source:     git clone https://github.com/testssl/testssl.sh ~/.local/share/testssl.sh
                   export PATH="\$HOME/.local/share/testssl.sh:\$PATH"

Or use Docker without installing anything:
  /testssl-inspector:setup --docker
EOF
    exit 3
  fi
fi

mkdir -p "$CONFIG_DIR"
{
  echo "version: 1"
  echo "source: $SOURCE"
  echo "source_version: \"$SOURCE_VERSION\""
  if [[ "$RUNNER" == "docker" ]]; then
    echo "use_docker: true"
  else
    echo "use_docker: false"
    echo "testssl_path: \"$TESTSSL_BIN\""
  fi
  echo "testssl_version: \"$VERSION\""
  echo "targets:"
  if (( ${#TARGETS[@]} == 0 )); then
    echo "  # add targets as: - host[:port]"
  else
    for t in "${TARGETS[@]}"; do echo "  - \"$t\""; done
  fi
} > "$CONFIG_FILE"

CACHE_DIR="$HOME/.cache/claude-grc/findings/testssl-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
testssl-inspector:setup ✓
  runner:           $RUNNER${TESTSSL_BIN:+ ($TESTSSL_BIN)}
  testssl version: $VERSION
  config:          $CONFIG_FILE
  targets:         ${#TARGETS[@]} configured

Next:
  /testssl-inspector:scan --target=example.com
  /testssl-inspector:scan --target=example.com --fast
  /grc-engineer:gap-assessment SOC2,PCI-DSS --sources=testssl-inspector
EOF
