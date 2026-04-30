#!/usr/bin/env bash
# drata-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/drata-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/drata-inspector"

printf 'drata-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /drata-inspector:setup\n'
  exit 2
fi

DRATA_CMD=$(awk -F'"' '/^drata_command:/ {print $2; exit}' "$CONFIG_FILE")
REGION=$(awk -F'"' '/^region:/ {print $2; exit}' "$CONFIG_FILE")
[[ -z "$DRATA_CMD" ]] && DRATA_CMD="drata"
[[ -z "$REGION" ]] && REGION="${DRATA_REGION:-us}"

if ! command -v "$DRATA_CMD" >/dev/null 2>&1; then
  printf '  status:        drata-not-installed\n'
  printf '  fix:           npm install -g drata-cli\n'
  exit 5
fi

VERSION=$("$DRATA_CMD" --version 2>/dev/null || echo unknown)
if ! DRATA_READ_ONLY=1 DRATA_REGION="$REGION" "$DRATA_CMD" auth check --json >/dev/null 2>&1; then
  printf '  status:        credentials-expired\n'
  printf '  drata:         %s\n' "$VERSION"
  printf '  fix:           drata auth login --api-key-stdin\n'
  exit 2
fi

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n'
  printf '  drata:         %s\n' "$VERSION"
  printf '  region:        %s\n' "$REGION"
  printf '  config:        %s\n' "$CONFIG_FILE"
  printf '  last run:      never\n'
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
printf '  drata:         %s\n' "$VERSION"
printf '  region:        %s\n' "$REGION"
printf '  config:        %s\n' "$CONFIG_FILE"
printf '  last run:      %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
