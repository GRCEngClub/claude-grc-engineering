#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/oscal.yaml"
SOURCE="oscal"
SOURCE_VERSION="0.1.0"

FROM_SOURCE=0
PREFIX="$HOME/.local"
for arg in "$@"; do
  case "$arg" in
    --from-source) FROM_SOURCE=1 ;;
    --prefix=*)    PREFIX="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

BIN="$(command -v oscal 2>/dev/null || true)"

install_from_source() {
  if ! command -v go >/dev/null 2>&1; then
    cat <<'EOF' >&2
[oscal:setup] Go compiler not installed; cannot build from source.

Options:
  - Install Go (https://go.dev/dl/) and re-run with --from-source.
  - Download a pre-built binary from https://github.com/ethanolivertroy/oscal-cli/releases
    and place it on your PATH, then re-run /oscal:setup.
EOF
    exit 5
  fi
  TOOL_DIR="$HOME/.local/share/claude-grc/tools/oscal-cli"
  if [[ ! -d "$TOOL_DIR/.git" ]]; then
    echo "[oscal:setup] cloning ethanolivertroy/oscal-cli ..." >&2
    mkdir -p "$(dirname "$TOOL_DIR")"
    git clone --depth=1 https://github.com/ethanolivertroy/oscal-cli "$TOOL_DIR" >/dev/null
  else
    (cd "$TOOL_DIR" && git pull --ff-only >/dev/null 2>&1 || true)
  fi

  if [[ -d "$TOOL_DIR/cmd/oscal" ]]; then
    (cd "$TOOL_DIR" && make build >/dev/null) || {
      echo "[oscal:setup] upstream 'make build' failed. See $TOOL_DIR for details." >&2
      return 1
    }
  elif [[ -f "$TOOL_DIR/main.go" ]]; then
    (cd "$TOOL_DIR" && go build -o oscal . >/dev/null) || {
      echo "[oscal:setup] 'go build' failed in $TOOL_DIR." >&2
      return 1
    }
  else
    cat <<EOF >&2
[oscal:setup] upstream oscal-cli repo is missing cmd/oscal/main.go and a
root main.go — this indicates the upstream build is incomplete.

Workaround: download a pre-built binary from the oscal-cli releases page and
place it on your PATH, then re-run /oscal:setup:

  https://github.com/ethanolivertroy/oscal-cli/releases

Tracking issue: file against ethanolivertroy/oscal-cli.
EOF
    return 1
  fi
  mkdir -p "$PREFIX/bin"
  ln -sf "$TOOL_DIR/oscal" "$PREFIX/bin/oscal"
  BIN="$PREFIX/bin/oscal"
}

if [[ -z "$BIN" || "$FROM_SOURCE" -eq 1 ]]; then
  if ! install_from_source; then
    mkdir -p "$CONFIG_DIR"
    cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
binary: ""
binary_version: "not-installed"
oscal_schema_version: "1.1.3"
EOF
    exit 5
  fi
fi

if [[ -z "$BIN" || ! -x "$BIN" ]]; then
  echo "[$SOURCE:setup] oscal binary not available after install attempt." >&2
  exit 5
fi

VERSION=$("$BIN" --version 2>/dev/null | head -1 | awk '{print $NF}' || echo "unknown")

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
binary: "$BIN"
binary_version: "$VERSION"
oscal_schema_version: "1.1.3"
EOF

cat <<EOF
oscal:setup ✓
  binary:         $BIN $VERSION
  OSCAL schema:   1.1.3
  config:         $CONFIG_FILE

Next:
  /oscal:validate <file>
  /oscal:convert <file> --to json|xml|yaml
EOF
