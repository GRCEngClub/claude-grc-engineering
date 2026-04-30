#!/usr/bin/env bash
# gcp-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/gcp-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/gcp-inspector"

printf 'gcp-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /gcp-inspector:setup\n'
  exit 2
fi

if ! command -v gcloud >/dev/null 2>&1; then
  printf '  status:        gcloud-not-installed\n'
  exit 5
fi

GCLOUD_VERSION=$(gcloud --version 2>/dev/null | head -1 | awk '{print $NF}')
printf '  gcloud:        %s\n' "$GCLOUD_VERSION"

PROJECT=$(awk -F'"' '/^project_id:/ {print $2; exit}' "$CONFIG_FILE")
REGION=$(awk -F'"' '/^default_region:/ {print $2; exit}' "$CONFIG_FILE")
PROJECT_NUMBER=$(awk -F'"' '/^project_number:/ {print $2; exit}' "$CONFIG_FILE")

# Active account
ACTIVE=$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | head -1)
if [[ -z "$ACTIVE" ]]; then
  printf '  status:        credentials-expired\n'
  printf '  fix:           gcloud auth login && gcloud auth application-default login\n'
  exit 2
fi

# Project still accessible?
if ! gcloud projects describe "$PROJECT" --format=json >/dev/null 2>&1; then
  printf '  status:        project-inaccessible\n'
  printf '  project:       %s\n' "$PROJECT"
  printf '  fix:           check roles/viewer on %s for %s\n' "$PROJECT" "$ACTIVE"
  exit 2
fi

printf '  project:       %s (%s)\n' "$PROJECT" "$PROJECT_NUMBER"
printf '  caller:        %s\n' "$ACTIVE"
printf '  default region: %s\n' "$REGION"
printf '  config:        %s\n' "$CONFIG_FILE"

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready (no runs yet)\n'
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
printf '  last run:      %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
