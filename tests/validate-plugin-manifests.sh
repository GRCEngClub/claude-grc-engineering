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
cd "$repo_root" || {
  echo "Failed to cd to repo root: $repo_root" >&2
  exit 2
}

if ! command -v ajv >/dev/null 2>&1; then
  echo "ajv-cli not found. Install with: npm install --no-save ajv-cli@5 ajv-formats@3" >&2
  exit 2
fi

plugin_schema="schemas/plugin.schema.json"
marketplace_schema="schemas/marketplace.schema.json"

fail=0
checked=0
in_ci="${GITHUB_ACTIONS:-false}"

# Escape values that get interpolated into GitHub Actions workflow commands
# (`::group::`, `::error file=…::…`). Filenames here come from `find` over a
# PR-controlled tree, so a crafted path containing `%`, CR, or LF could
# otherwise inject additional workflow commands into the CI log.
# See: https://docs.github.com/actions/reference/workflow-commands-for-github-actions
gha_escape() {
  local s="$1"
  s="${s//%/%25}"
  s="${s//$'\r'/%0D}"
  s="${s//$'\n'/%0A}"
  printf '%s' "$s"
}

emit_group_start() {
  if [[ "$in_ci" == "true" ]]; then
    printf '::group::%s\n' "$(gha_escape "$1")"
  else
    printf '── %s\n' "$1"
  fi
}

emit_group_end() {
  if [[ "$in_ci" == "true" ]]; then
    printf '::endgroup::\n'
  fi
}

emit_error() {
  local file="$1" message="$2"
  if [[ "$in_ci" == "true" ]]; then
    printf '::error file=%s::%s\n' "$(gha_escape "$file")" "$(gha_escape "$message")"
  else
    printf 'ERROR (%s): %s\n' "$file" "$message" >&2
  fi
}

emit_summary_error() {
  local message="$1"
  if [[ "$in_ci" == "true" ]]; then
    printf '::error::%s\n' "$(gha_escape "$message")"
  else
    printf 'ERROR: %s\n' "$message" >&2
  fi
}

validate_file() {
  local schema="$1"
  local file="$2"
  checked=$((checked + 1))
  emit_group_start "$file"
  if ajv validate \
      --spec=draft2020 \
      -s "$schema" \
      -d "$file" \
      --errors=line; then
    printf '  ✓ %s\n' "$file"
  else
    emit_error "$file" "Manifest failed schema validation against $schema"
    fail=1
  fi
  emit_group_end
}

if [[ -f .claude-plugin/marketplace.json ]]; then
  validate_file "$marketplace_schema" .claude-plugin/marketplace.json
else
  emit_summary_error "Missing required .claude-plugin/marketplace.json (this repository is a Claude Code plugin marketplace; the top-level marketplace manifest must exist)"
  exit 1
fi

while IFS= read -r manifest; do
  validate_file "$plugin_schema" "$manifest"
done < <(find plugins -type f -name plugin.json -path '*/.claude-plugin/*' | sort)

echo
echo "Validated $checked manifest(s)."
if [[ $fail -ne 0 ]]; then
  emit_summary_error "One or more manifests failed schema validation"
  exit 1
fi
echo "All manifests valid."
