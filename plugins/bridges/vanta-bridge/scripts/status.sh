#!/usr/bin/env bash
# vanta-bridge:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/bridges/vanta-bridge.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/vanta-bridge"

printf 'vanta-bridge\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /vanta-bridge:setup\n'
  exit 2
fi

REGION=$(awk -F'"' '/^region:/ {print $2; exit}' "$CONFIG_FILE")
PLUGIN=$(awk -F'"' '/^vanta_plugin_status:/ {print $2; exit}' "$CONFIG_FILE")
INPUT=$(awk -F'"' '/^default_input:/ {print $2; exit}' "$CONFIG_FILE")

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n'
  printf '  region:        %s\n' "$REGION"
  printf '  vanta plugin:  %s\n' "$PLUGIN"
  printf '  default input: %s\n' "${INPUT:-none}"
  printf '  last sync:     never\n'
  exit 0
fi

if stat -f%m "$LATEST" >/dev/null 2>&1; then MTIME=$(stat -f%m "$LATEST"); else MTIME=$(stat -c%Y "$LATEST"); fi
AGE=$(( $(date +%s) - MTIME ))
AGE_H=$(( AGE / 3600 ))
if (( AGE_H < 24 )); then LABEL="${AGE_H}h ago"; STATUS="ready"
elif (( AGE_H < 168 )); then LABEL="$((AGE_H/24))d ago"; STATUS="ready"
else LABEL="$((AGE_H/24))d ago"; STATUS="stale"
fi

RES=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(Array.isArray(a)?a.length:1)}catch{console.log('?')}" "$LATEST")
EVS=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const arr=Array.isArray(a)?a:[a];let n=0;for(const d of arr)n+=(d.evaluations||[]).length;console.log(n)}catch{console.log('?')}" "$LATEST")

printf '  status:        %s\n' "$STATUS"
printf '  region:        %s\n' "$REGION"
printf '  vanta plugin:  %s\n' "$PLUGIN"
printf '  default input: %s\n' "${INPUT:-none}"
printf '  last sync:     %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
