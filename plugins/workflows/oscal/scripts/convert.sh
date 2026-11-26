#!/usr/bin/env bash
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/oscal.yaml"
SOURCE="oscal"

TO=""
OUTPUT=""
OVERWRITE=0
FILE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --to=*)     TO="${1#*=}" ;;
    --to)       shift; TO="${1:-}" ;;
    --output=*) OUTPUT="${1#*=}" ;;
    --overwrite) OVERWRITE=1 ;;
    --*)        echo "[$SOURCE:convert] unknown flag: $1" >&2; exit 2 ;;
    *)          FILE="$1" ;;
  esac
  shift || true
done

if [[ -z "$FILE" || -z "$TO" ]]; then
  echo "Usage: /oscal:convert <file> --to=json|xml|yaml [--output=path] [--overwrite]" >&2
  exit 2
fi
if [[ ! -r "$FILE" ]]; then
  echo "[$SOURCE:convert] cannot read '$FILE'" >&2
  exit 2
fi
case "$TO" in json|xml|yaml) ;; *) echo "[$SOURCE:convert] --to must be json|xml|yaml" >&2; exit 2 ;; esac

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "[$SOURCE:convert] not configured. Run /oscal:setup." >&2
  exit 5
fi
BIN=$(awk -F'"' '/^binary:/ {print $2; exit}' "$CONFIG_FILE")
[[ -x "$BIN" ]] || { echo "[$SOURCE:convert] binary at '$BIN' not executable." >&2; exit 5; }

FLAGS=(--to "$TO")
[[ -n "$OUTPUT" ]] && FLAGS+=(--output "$OUTPUT")
(( OVERWRITE )) && FLAGS+=(--overwrite)

"$BIN" convert "$FILE" "${FLAGS[@]}"
