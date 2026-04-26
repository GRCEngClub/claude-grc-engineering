#!/usr/bin/env bash
# Validate every plugin.json and the marketplace.json against the
# Claude Code plugin schemas in schemas/.
#
# This guards against the common failure mode where a manifest looks
# fine to the contributor but is rejected at install time by
# `claude plugin install`. The most frequent offender is the `author`
# field — Claude Code requires an object form `{ "name": "..." }`,
# not a bare string.
#
# Run locally:
#   npm install --no-save ajv-cli@5 ajv-formats@3
#   bash tests/validate-plugin-manifests.sh

set -uo pipefail

PATH="./node_modules/.bin:$PATH"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v ajv >/dev/null 2>&1; then
  echo "ajv-cli not found. Install with: npm install --no-save ajv-cli@5 ajv-formats@3" >&2
  exit 2
fi

plugin_schema="schemas/plugin.schema.json"
marketplace_schema="schemas/marketplace.schema.json"

fail=0
checked=0

validate_file() {
  local schema="$1"
  local file="$2"
  checked=$((checked + 1))
  echo "::group::$file"
  if ajv validate \
      --spec=draft2020 \
      -s "$schema" \
      -d "$file" \
      --errors=line; then
    echo "  ✓ $file"
  else
    echo "::error file=$file::Manifest failed schema validation against $schema"
    fail=1
  fi
  echo "::endgroup::"
}

if [[ -f .claude-plugin/marketplace.json ]]; then
  validate_file "$marketplace_schema" .claude-plugin/marketplace.json
fi

while IFS= read -r manifest; do
  validate_file "$plugin_schema" "$manifest"
done < <(find plugins -type f -name plugin.json -path '*/.claude-plugin/*' | sort)

echo
echo "Validated $checked manifest(s)."
if [[ $fail -ne 0 ]]; then
  echo "::error::One or more manifests failed schema validation"
  exit 1
fi
echo "All manifests valid."
