#!/usr/bin/env bash
# azure-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/azure-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/azure-inspector"

printf 'azure-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /azure-inspector:setup\n'
  exit 2
fi

if ! command -v az >/dev/null 2>&1; then
  printf '  status:        az-not-installed\n'
  exit 5
fi

AZ_VERSION=$(az version --query '"azure-cli"' -o tsv 2>/dev/null || az --version 2>/dev/null | head -1 | awk '{print $NF}')
printf '  az:            %s\n' "$AZ_VERSION"

SUBSCRIPTION=$(awk -F'"' '/^subscription_id:/ {print $2; exit}' "$CONFIG_FILE")
TENANT=$(awk -F'"' '/^tenant_id:/ {print $2; exit}' "$CONFIG_FILE")

if ! ACCOUNT_JSON=$(az account show --subscription "$SUBSCRIPTION" --only-show-errors -o json 2>/dev/null); then
  printf '  status:        credentials-expired-or-subscription-inaccessible\n'
  printf '  subscription:  %s\n' "$SUBSCRIPTION"
  printf '  fix:           az login && az account set --subscription %s\n' "$SUBSCRIPTION"
  exit 2
fi

CALLER=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).user?.name || ''))" <<<"$ACCOUNT_JSON")
NAME=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).name || ''))" <<<"$ACCOUNT_JSON")

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready\n'
  printf '  subscription:  %s (%s)\n' "$NAME" "$SUBSCRIPTION"
  printf '  tenant:        %s\n' "$TENANT"
  printf '  caller:        %s\n' "$CALLER"
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

printf '  status:        %s\n' "$STATUS"
printf '  subscription:  %s (%s)\n' "$NAME" "$SUBSCRIPTION"
printf '  tenant:        %s\n' "$TENANT"
printf '  caller:        %s\n' "$CALLER"
printf '  config:        %s\n' "$CONFIG_FILE"

RES=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(Array.isArray(a)?a.length:1)}catch{console.log('?')}" "$LATEST")
EVS=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const arr=Array.isArray(a)?a:[a];let n=0;for(const d of arr)n+=(d.evaluations||[]).length;console.log(n)}catch{console.log('?')}" "$LATEST")

printf '  last run:      %s (%s)\n' "$LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
