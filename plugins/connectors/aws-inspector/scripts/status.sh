#!/usr/bin/env bash
# aws-inspector:status
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/aws-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/aws-inspector"

printf 'aws-inspector\n'

if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /aws-inspector:setup\n'
  exit 2
fi

if ! command -v aws >/dev/null 2>&1; then
  printf '  status:        aws-not-installed\n'
  exit 5
fi

AWS_VERSION=$(aws --version 2>&1 | awk '{print $1}' | sed 's|aws-cli/||')
printf '  aws:           %s %s\n' "$(command -v aws)" "$AWS_VERSION"

# Extract profile from config
PROFILE=$(awk -F'"' '/^profile:/ {print $2; exit}' "$CONFIG_FILE" 2>/dev/null || true)
AWSENV=()
[[ -n "${PROFILE:-}" ]] && AWSENV+=("AWS_PROFILE=$PROFILE")

aws_() {
  if (( ${#AWSENV[@]} > 0 )); then env "${AWSENV[@]}" aws "$@"; else aws "$@"; fi
}

if IDENT_JSON=$(aws_ sts get-caller-identity --output json 2>/dev/null); then
  ACCOUNT=$(echo "$IDENT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).Account))")
  ARN=$(echo "$IDENT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).Arn))")
  printf '  account:       %s\n' "$ACCOUNT"
  printf '  caller:        %s\n' "$ARN"
else
  printf '  status:        credentials-expired\n'
  printf '  fix:           aws sso login (or aws configure)\n'
  exit 2
fi

REGION=$(awk -F'"' '/^default_region:/ {print $2; exit}' "$CONFIG_FILE")
printf '  default region: %s\n' "$REGION"
printf '  profile:       %s\n' "${PROFILE:-<default>}"
printf '  config:        %s\n' "$CONFIG_FILE"

LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready (no runs yet)\n'
  printf '  last run:      never\n'
  exit 0
fi

if stat -f%m "$LATEST" >/dev/null 2>&1; then
  MTIME=$(stat -f%m "$LATEST")
else
  MTIME=$(stat -c%Y "$LATEST")
fi
AGE_SEC=$(( $(date +%s) - MTIME ))
AGE_H=$(( AGE_SEC / 3600 ))
if (( AGE_H < 24 )); then AGE="${AGE_H}h ago"; STATUS="ready"
elif (( AGE_H < 168 )); then AGE="$((AGE_H/24))d ago"; STATUS="ready"
else AGE="$((AGE_H/24))d ago"; STATUS="stale"
fi

RES=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(Array.isArray(a)?a.length:1)}catch{console.log('?')}" "$LATEST")
EVS=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const arr=Array.isArray(a)?a:[a];let n=0;for(const d of arr)n+=(d.evaluations||[]).length;console.log(n)}catch{console.log('?')}" "$LATEST")

printf '  status:        %s\n' "$STATUS"
printf '  last run:      %s (%s)\n' "$AGE" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RES" "$EVS"
