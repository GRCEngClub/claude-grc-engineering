#!/usr/bin/env bash
set -euo pipefail

CACHE_DIR="${HOME}/.cache/claude-grc/findings/poam-automation"
CONFIG_FILE="${HOME}/.config/claude-grc/connectors/poam-automation.yaml"

echo "=== poam-automation status ==="

# Check config
if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "  config:   NOT CONFIGURED (run setup.sh)" >&2
  exit 2
fi
echo "  config:   ${CONFIG_FILE}"

TOOL_PATH=$(grep 'tool_path:' "${CONFIG_FILE}" | sed 's/tool_path: *"//' | sed 's/"//')
if [[ ! -f "${TOOL_PATH}" ]]; then
  echo "  tool:     NOT FOUND at ${TOOL_PATH}" >&2
  exit 2
fi
echo "  tool:     ${TOOL_PATH}"

BASELINE=$(grep 'default_baseline:' "${CONFIG_FILE}" | awk '{print $2}')
echo "  baseline: ${BASELINE}"

# Check python + openpyxl
if python3 -c "import openpyxl" &>/dev/null; then
  echo "  openpyxl: ok"
else
  echo "  openpyxl: MISSING (run: pip install openpyxl)" >&2
  exit 2
fi

# Cache status
if [[ ! -d "${CACHE_DIR}" ]]; then
  echo "  cache:    no findings yet (run collect.sh)"
  exit 0
fi

LATEST=$(ls -t "${CACHE_DIR}"/*.json 2>/dev/null | head -1 || true)
if [[ -z "${LATEST}" ]]; then
  echo "  cache:    no findings yet (run collect.sh)"
  exit 0
fi

# File age
if [[ "$(uname)" == "Darwin" ]]; then
  MTIME=$(stat -f%m "${LATEST}")
else
  MTIME=$(stat -c%Y "${LATEST}")
fi
NOW=$(date +%s)
AGE_HOURS=$(( (NOW - MTIME) / 3600 ))
AGE_DAYS=$(( AGE_HOURS / 24 ))

if [[ ${AGE_HOURS} -lt 24 ]]; then
  AGE_LABEL="${AGE_HOURS}h ago"
else
  AGE_LABEL="${AGE_DAYS}d ago"
fi

FINDING_COUNT=$(python3 -c "import json; d=json.load(open('${LATEST}')); print(len(d))" 2>/dev/null || echo "?")

if [[ ${AGE_DAYS} -lt 7 ]]; then
  CACHE_STATUS="ready"
else
  CACHE_STATUS="stale"
fi

echo "  cache:    ${CACHE_STATUS} — ${FINDING_COUNT} findings (${AGE_LABEL})"
echo "  latest:   ${LATEST}"
