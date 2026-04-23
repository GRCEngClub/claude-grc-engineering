#!/usr/bin/env bash
set -euo pipefail

CACHE_DIR="${HOME}/.cache/claude-grc/findings/poam-automation"
CONFIG_DIR="${HOME}/.config/claude-grc/connectors"
CONFIG_FILE="${CONFIG_DIR}/poam-automation.yaml"

echo "=== poam-automation setup ==="

# Check Python 3
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 not found. Install Python 3.8 or later." >&2
  exit 5
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "  python3: ${PYTHON_VERSION}"

# Check openpyxl
if ! python3 -c "import openpyxl" &>/dev/null; then
  echo "  Installing openpyxl..."
  pip install openpyxl --quiet
fi
echo "  openpyxl: ok"

# Check grc_tool.py
TOOL_PATH=""
for candidate in "./grc_tool.py" "${HOME}/POAM-Automation-Tool/grc_tool.py"; do
  if [[ -f "${candidate}" ]]; then
    TOOL_PATH=$(realpath "${candidate}")
    break
  fi
done

if [[ -z "${TOOL_PATH}" ]]; then
  echo "ERROR: grc_tool.py not found. Clone the tool repo first:" >&2
  echo "  git clone https://github.com/networkbm/POAM-Automation-Tool" >&2
  exit 2
fi
echo "  grc_tool.py: ${TOOL_PATH}"

# Create config
mkdir -p "${CONFIG_DIR}"
cat > "${CONFIG_FILE}" <<YAML
tool_path: "${TOOL_PATH}"
default_baseline: moderate
YAML
echo "  config: ${CONFIG_FILE}"

# Create cache dirs
mkdir -p "${CACHE_DIR}"
echo "  cache: ${CACHE_DIR}"

echo ""
echo "Setup complete. Run collect.sh --poam <path> to generate findings."
