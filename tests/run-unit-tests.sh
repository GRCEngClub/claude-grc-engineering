#!/usr/bin/env bash
set -eo pipefail

suites=()
while IFS= read -r suite; do
  [ -n "$suite" ] && suites+=("$suite")
done < <(find tests -mindepth 2 -maxdepth 2 -type f -not -path 'tests/fixtures/*' -not -path 'tests/helpers/*' \
  \( -name '*.test.js' -o -name '*.test.mjs' -o -name '*.test.cjs' \) | sort)

if [ ${#suites[@]} -eq 0 ]; then
  echo "::warning::No unit test suites found under tests/"
  exit 0
fi

echo "Running ${#suites[@]} unit test suite(s):"
printf '  %s\n' "${suites[@]}"

node --test "${suites[@]}"
