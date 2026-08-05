#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -eq 0 ]]; then
  exit 0
fi

# pre-commit installs Node dependencies into its isolated global package root.
# CommonJS honors NODE_PATH, so the same validator works both there and with
# the repository's local node_modules directory.
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"

if ! node -e "require('ajv'); require('ajv-formats')" >/dev/null 2>&1; then
  echo "Ajv not found. Rebuild the hook env with: pre-commit clean && pre-commit install" >&2
  exit 2
fi

args=(--schema schemas/finding.schema.json --quiet)
for finding in "$@"; do
  args+=(--data "$finding")
done

node tests/validate-json-schema.cjs "${args[@]}"
