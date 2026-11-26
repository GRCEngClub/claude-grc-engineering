#!/usr/bin/env bash
# Runs Claude Code's own validator in strict mode on the marketplace and on
# every plugin it lists. A marketplace run checks manifests only, so each plugin
# folder is validated separately to cover its skills, commands and hooks.
set -uo pipefail

if ! command -v claude >/dev/null 2>&1; then
  echo "claude CLI not found. Install it with: npm install --global @anthropic-ai/claude-code" >&2
  exit 2
fi

failed=0
run() {
  local target="$1" output
  if ! output=$(claude plugin validate "$target" --strict 2>&1); then
    printf '::error::claude plugin validate --strict failed for %s\n%s\n' "$target" "$output"
    failed=$((failed + 1))
  fi
}

if ! sources=$(node -e "for (const p of require('./.claude-plugin/marketplace.json').plugins) if (typeof p.source === 'string') console.log(p.source)"); then
  echo "Could not read the plugin list from .claude-plugin/marketplace.json." >&2
  exit 2
fi
if [ -z "$sources" ]; then
  echo "The marketplace lists no plugins, so there is nothing to validate." >&2
  exit 2
fi

run .
count=0
while IFS= read -r source; do
  run "$source"
  count=$((count + 1))
done <<< "$sources"

if [ "$failed" -gt 0 ]; then
  echo "$failed target(s) failed strict validation."
  exit 1
fi
echo "Marketplace and $count plugin(s) pass claude plugin validate --strict."
