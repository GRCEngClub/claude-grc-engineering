#!/usr/bin/env bash
# Runs every node:test suite under tests/.
#
# The file list is built here rather than handed to `node --test` as a glob or
# a directory: Node 20 (the CI baseline) expands neither, and a directory
# argument is resolved as a module path. Discovering by name instead means a
# newly added tests/*.test.* file is picked up without touching CI config.
set -eo pipefail

suites=()
while IFS= read -r suite; do
  [ -n "$suite" ] && suites+=("$suite")
done < <(find tests -maxdepth 1 -type f \
  \( -name '*.test.js' -o -name '*.test.mjs' -o -name '*.test.cjs' \) | sort)

if [ ${#suites[@]} -eq 0 ]; then
  echo "::warning::No unit test suites found under tests/"
  exit 0
fi

echo "Running ${#suites[@]} unit test suite(s):"
printf '  %s\n' "${suites[@]}"

node --test "${suites[@]}"
