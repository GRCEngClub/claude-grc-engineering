#!/usr/bin/env bash
set -euo pipefail

PATH="./node_modules/.bin:$PATH"

if [[ "$#" -eq 0 ]]; then
  exit 0
fi

if ! command -v ajv >/dev/null 2>&1; then
  echo "ajv-cli not found. Rebuild the hook env with: pre-commit clean && pre-commit install" >&2
  exit 2
fi

for finding in "$@"; do
  ajv validate \
    --spec=draft2020 \
    -c ajv-formats \
    -s schemas/finding.schema.json \
    -d "$finding" \
    --errors=line
done
