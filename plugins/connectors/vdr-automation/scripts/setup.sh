#!/usr/bin/env bash
set -euo pipefail

CACHE_DIR="${HOME}/.cache/claude-grc/findings/vdr-automation"
CONFIG_DIR="${HOME}/.config/claude-grc/connectors"
CONFIG_FILE="${CONFIG_DIR}/vdr-automation.yaml"
TOOL_BASE="${HOME}/.local/share/claude-grc/tools"
TOOL_DIR="${TOOL_BASE}/vdr-automation"
TOOL_REPO="https://github.com/networkbm/POAM-Automation-Tool.git"

case "${1:-}" in
  -h|--help)
    cat <<'USAGE'
Usage: setup.sh

Clones or updates networkbm/POAM-Automation-Tool under
~/.local/share/claude-grc/tools/vdr-automation, installs openpyxl into a
virtualenv there, and writes ~/.config/claude-grc/connectors/vdr-automation.yaml.
Also moves a findings cache left by the old poam-automation name out of the
findings directory. Takes no options.
USAGE
    exit 0
    ;;
esac

echo "=== vdr-automation setup ==="

if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 not found. Install Python 3.8 or later." >&2
  exit 5
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "  python3: ${PYTHON_VERSION}"

LEGACY_CACHE_DIR="${HOME}/.cache/claude-grc/findings/poam-automation"
if [[ -d "${LEGACY_CACHE_DIR}" ]]; then
  RETIRED_DIR="${HOME}/.cache/claude-grc/retired/poam-automation-$(date +%s)"
  mkdir -p "$(dirname "${RETIRED_DIR}")"
  mv "${LEGACY_CACHE_DIR}" "${RETIRED_DIR}"
  echo "  moved findings from the old poam-automation name to ${RETIRED_DIR}"
fi

mkdir -p "${TOOL_BASE}"
if [[ ! -d "${TOOL_DIR}/.git" ]]; then
  echo "  cloning ${TOOL_REPO} → ${TOOL_DIR}"
  git clone --depth 1 "${TOOL_REPO}" "${TOOL_DIR}"
else
  echo "  updating ${TOOL_DIR}"
  git -C "${TOOL_DIR}" fetch --depth 1 origin
  git -C "${TOOL_DIR}" reset --hard origin/HEAD
fi

TOOL_PATH="${TOOL_DIR}/grc_tool.py"
if [[ ! -f "${TOOL_PATH}" ]]; then
  echo "ERROR: grc_tool.py not found at ${TOOL_PATH} after clone." >&2
  exit 2
fi
echo "  grc_tool.py: ${TOOL_PATH}"

# Install openpyxl into a dedicated venv to stay PEP 668 compatible.
VENV_DIR="${TOOL_DIR}/.venv"
if [[ ! -d "${VENV_DIR}" ]]; then
  echo "  creating venv: ${VENV_DIR}"
  python3 -m venv "${VENV_DIR}"
fi
"${VENV_DIR}/bin/python" -m pip install --quiet --upgrade pip
"${VENV_DIR}/bin/python" -m pip install --quiet openpyxl
echo "  openpyxl: installed in venv"

mkdir -p "${CONFIG_DIR}"
cat > "${CONFIG_FILE}" <<YAML
tool_path: "${TOOL_PATH}"
python: "${VENV_DIR}/bin/python"
default_baseline: moderate
YAML
echo "  config: ${CONFIG_FILE}"

mkdir -p "${CACHE_DIR}"
echo "  cache: ${CACHE_DIR}"

echo ""
echo "Setup complete. Run collect.sh --poam <path> to generate findings."
