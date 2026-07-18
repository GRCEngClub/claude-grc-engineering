#!/usr/bin/env bash
set -eo pipefail

validator="tests/validate-json-schema.cjs"

categories=(
  "findings schemas/finding.schema.json"
  "metrics schemas/metric.schema.json"
  "risks schemas/risk.schema.json"
  "exceptions schemas/exception.schema.json"
  "vendors schemas/vendor.schema.json"
  "policies schemas/policy.schema.json"
)

total=0
failed=0

for entry in "${categories[@]}"; do
  category="${entry%% *}"
  schema="${entry#* }"
  fixtures=$(find "tests/fixtures/$category" -type f -name '*.json' | sort)

  if [ -z "$fixtures" ]; then
    echo "::warning::No fixtures found under tests/fixtures/$category/"
    continue
  fi

  fixture_count=$(printf '%s\n' "$fixtures" | sed '/^$/d' | wc -l | tr -d ' ')
  echo "Validating ${fixture_count} fixture(s) in tests/fixtures/$category against $schema ..."
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    total=$((total + 1))
    if node "$validator" \
      --schema "$schema" \
      --data "$f" \
      --quiet 2>&1; then
      echo "  ✓ $f"
    else
      echo "  ✗ $f"
      failed=$((failed + 1))
    fi
  done <<EOF
$fixtures
EOF
done

if [ $failed -gt 0 ]; then
  echo "::error::$failed fixture(s) failed schema validation"
  exit 1
fi

echo "All $total fixture(s) valid."
