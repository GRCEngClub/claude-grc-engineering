#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/fedramp-ssp.yaml"
SOURCE="fedramp-ssp"
SOURCE_VERSION="0.1.0"

PYTHON_BIN=""
for arg in "$@"; do
  case "$arg" in
    --python=*) PYTHON_BIN="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$PYTHON_BIN" ]]; then
  for candidate in python3.12 python3.11 python3.10 python3 python; do
    if command -v "$candidate" >/dev/null 2>&1; then
      if "$candidate" -c 'import sys; sys.exit(0 if sys.version_info>=(3,10) else 1)' 2>/dev/null; then
        PYTHON_BIN="$(command -v "$candidate")"
        break
      fi
    fi
  done
fi
if [[ -z "$PYTHON_BIN" ]]; then
  cat <<'EOF' >&2
[fedramp-ssp:setup] No Python 3.10+ found.

Install:
  macOS:  brew install python@3.12
  Linux:  apt install python3.12 python3.12-venv  (or your distro equivalent)

Then re-run, optionally with --python=/absolute/path/to/python3.
EOF
  exit 2
fi
PYTHON_VERSION=$("$PYTHON_BIN" --version 2>&1 | awk '{print $2}')

TOOL_DIR="$HOME/.local/share/claude-grc/tools/frdocx-to-froscal-ssp"
if [[ ! -d "$TOOL_DIR/.git" ]]; then
  mkdir -p "$(dirname "$TOOL_DIR")"
  git clone --depth=1 https://github.com/ethanolivertroy/frdocx-to-froscal-ssp "$TOOL_DIR" >/dev/null
else
  (cd "$TOOL_DIR" && git pull --ff-only >/dev/null 2>&1 || true)
fi

VENV="$TOOL_DIR/.venv"
VENV_PYTHON=""
VENV_STATUS="pending"

if "$PYTHON_BIN" -m venv "$VENV" >/tmp/fedramp-venv.err 2>&1; then
  VENV_PYTHON="$VENV/bin/python"
  "$VENV_PYTHON" -m pip install --quiet --upgrade pip >/tmp/fedramp-pip.err 2>&1 || true
  if [[ -f "$TOOL_DIR/requirements.txt" ]]; then
    if "$VENV_PYTHON" -m pip install --quiet -r "$TOOL_DIR/requirements.txt" >/tmp/fedramp-pip.err 2>&1; then
      VENV_STATUS="ready (python-docx installed)"
    else
      VENV_STATUS="incomplete (pip install failed; see /tmp/fedramp-pip.err)"
    fi
  else
    if "$VENV_PYTHON" -m pip install --quiet python-docx >/tmp/fedramp-pip.err 2>&1; then
      VENV_STATUS="ready (python-docx installed)"
    else
      VENV_STATUS="incomplete (pip install failed)"
    fi
  fi
else
  if "$PYTHON_BIN" -c 'import docx' 2>/dev/null; then
    VENV_PYTHON="$PYTHON_BIN"
    VENV_STATUS="using system Python (python-docx already importable)"
  else
    VENV_STATUS="venv creation failed; python-docx not found"
    cat <<EOF >&2

[fedramp-ssp:setup] Could not create a virtualenv at $VENV.
$(cat /tmp/fedramp-venv.err 2>/dev/null | tail -3)

The plugin still records the tool location. To enable /fedramp-ssp:convert,
install python-docx into a Python that the plugin can use:

  pipx install python-docx        # one option
  $PYTHON_BIN -m pip install --user python-docx   # another

Or fix the venv issue (often: ensure 'python3-venv' package is installed on
Debian/Ubuntu, or use a different Python binary via --python=<path>).
EOF
  fi
fi

JAVA_STATUS="not-installed"
if command -v java >/dev/null 2>&1; then
  JAVA_VERSION=$(java -version 2>&1 | head -1 | awk -F'"' '{print $2}')
  if [[ -n "$JAVA_VERSION" ]]; then
    JAVA_STATUS="$JAVA_VERSION"
  fi
fi

EFFECTIVE_PYTHON="${VENV_PYTHON:-$PYTHON_BIN}"
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
python: "$EFFECTIVE_PYTHON"
python_version: "$PYTHON_VERSION"
venv: "$VENV"
venv_status: "$VENV_STATUS"
tool_dir: "$TOOL_DIR"
oscal_version: "1.2.0"
java: "$JAVA_STATUS"
EOF

cat <<EOF
fedramp-ssp:setup ✓
  python:      $PYTHON_BIN ($PYTHON_VERSION)
  tool dir:    $TOOL_DIR
  venv:        $VENV_STATUS
  java:        $JAVA_STATUS
  config:      $CONFIG_FILE

Next:
  /fedramp-ssp:convert --ssp-docx=<path> --appendix-a-docx=<path>
EOF

if [[ "$JAVA_STATUS" == "not-installed" ]]; then
  cat <<'EOF'

Note: Java 17 is not installed. The pipeline will still run, but the upstream
tool's optional oscal-cli validation step is disabled. Use /oscal:validate on
the produced JSON (requires the `oscal` plugin).
EOF
fi
