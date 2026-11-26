#!/usr/bin/env bash
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/oscal.yaml"
SOURCE="oscal"

JSON_OUT=0
QUIET=0
FILE=""
for arg in "$@"; do
  case "$arg" in
    --json)  JSON_OUT=1 ;;
    --quiet) QUIET=1 ;;
    --*)     echo "[$SOURCE:validate] unknown flag: $arg" >&2; exit 2 ;;
    *)       FILE="$arg" ;;
  esac
done

if [[ -z "$FILE" ]]; then
  echo "Usage: /oscal:validate <file> [--json] [--quiet]" >&2
  exit 2
fi
if [[ ! -r "$FILE" ]]; then
  echo "[$SOURCE:validate] cannot read '$FILE'" >&2
  exit 2
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "[$SOURCE:validate] not configured. Run /oscal:setup." >&2
  exit 5
fi
BIN=$(awk -F'"' '/^binary:/ {print $2; exit}' "$CONFIG_FILE")
if [[ ! -x "$BIN" ]]; then
  echo "[$SOURCE:validate] binary at '$BIN' not executable. Re-run /oscal:setup." >&2
  exit 5
fi

if (( JSON_OUT )); then
  if ERRS=$("$BIN" validate "$FILE" 2>&1); then
    printf '{"ok":true,"errors":[],"schema_version":"1.1.3"}\n'
  else
    CODE=$?
    ESC=$(echo "$ERRS" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const lines=d.trim().split('\n').filter(Boolean);console.log(JSON.stringify(lines))})")
    printf '{"ok":false,"errors":%s,"schema_version":"1.1.3"}\n' "$ESC"
    exit 6
  fi
else
  FLAGS=()
  (( QUIET )) && FLAGS+=(--quiet)
  "$BIN" validate "$FILE" "${FLAGS[@]}" || exit 6
fi
