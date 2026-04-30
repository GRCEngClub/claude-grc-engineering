#!/usr/bin/env bash
set -uo pipefail
CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/snowflake-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/snowflake-inspector"
printf 'snowflake-inspector\n'
if [[ ! -f "$CONFIG_FILE" ]]; then printf '  status:        not-configured\n'; exit 2; fi
ACCOUNT=$(awk -F'"' '/^account:/ {print $2; exit}' "$CONFIG_FILE")
USER=$(awk -F'"' '/^user:/ {print $2; exit}' "$CONFIG_FILE")
WAREHOUSE=$(awk -F'"' '/^warehouse:/ {print $2; exit}' "$CONFIG_FILE")
ROLE=$(awk -F'"' '/^role:/ {print $2; exit}' "$CONFIG_FILE")
if ! command -v snowsql >/dev/null 2>&1; then printf '  status:        snowsql-not-installed\n'; exit 5; fi
if ! snowsql -a "$ACCOUNT" -u "$USER" ${WAREHOUSE:+-w "$WAREHOUSE"} ${ROLE:+-r "$ROLE"} -q "select 1;" -o output_format=plain -o friendly=false -o header=false >/dev/null 2>&1; then printf '  status:        credentials-expired\n'; exit 2; fi
LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then printf '  status:        ready\n  account:       %s\n  last run:      never\n' "$ACCOUNT"; exit 0; fi
if stat -f%m "$LATEST" >/dev/null 2>&1; then MTIME=$(stat -f%m "$LATEST"); else MTIME=$(stat -c%Y "$LATEST"); fi
AGE_H=$(( ($(date +%s) - MTIME) / 3600 ))
if (( AGE_H < 168 )); then STATUS=ready; else STATUS=stale; fi
printf '  status:        %s\n  account:       %s\n  last run:      %sh ago (%s)\n' "$STATUS" "$ACCOUNT" "$AGE_H" "$(basename "$LATEST" .json)"
