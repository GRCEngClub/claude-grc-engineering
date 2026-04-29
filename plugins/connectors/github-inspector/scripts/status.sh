#!/usr/bin/env bash
# github-inspector:status
# Non-destructive health check for the connector.

set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/github-inspector.yaml"
CACHE_DIR="$HOME/.cache/claude-grc/findings/github-inspector"
RUNS_LOG="$HOME/.cache/claude-grc/runs.log"

printf 'github-inspector\n'

# 1. Config present?
if [[ ! -f "$CONFIG_FILE" ]]; then
  printf '  status:        not-configured\n'
  printf '  fix:           run /github-inspector:setup\n'
  exit 2
fi

# 2. gh present?
if ! command -v gh >/dev/null 2>&1; then
  printf '  status:        gh-not-installed\n'
  printf '  fix:           brew install gh (or equivalent), then /github-inspector:setup\n'
  exit 5
fi

GH_VERSION=$(gh --version 2>/dev/null | head -1 | awk '{print $3}')
printf '  gh:            %s v%s\n' "$(command -v gh)" "$GH_VERSION"

# 3. auth valid?
if AUTH_OUTPUT=$(gh auth status 2>&1); then
  LOGIN=$(gh api user --jq .login 2>/dev/null || echo "?")
  SCOPES=$(echo "$AUTH_OUTPUT" | awk -F'scopes:' '/Token scopes/ {gsub(/^ +| +$/,"",$2); print $2; exit}')
  printf '  auth:          valid (%s, scopes: %s)\n' "$LOGIN" "${SCOPES:-unknown}"
else
  printf '  auth:          invalid — run gh auth login\n'
  printf '  status:        auth-expired\n'
  exit 2
fi

printf '  config:        %s\n' "$CONFIG_FILE"

# 4. Last run?
LATEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1 || true)
if [[ -z "$LATEST" ]]; then
  printf '  status:        ready (no runs yet)\n'
  printf '  last run:      never\n'
  exit 0
fi

# File age in hours (BSD stat fallback for macOS)
if stat -f%m "$LATEST" >/dev/null 2>&1; then
  MTIME=$(stat -f%m "$LATEST")
else
  MTIME=$(stat -c%Y "$LATEST")
fi
NOW=$(date +%s)
AGE_SEC=$((NOW - MTIME))
AGE_HOURS=$((AGE_SEC / 3600))

if (( AGE_HOURS < 24 )); then
  AGE_LABEL="${AGE_HOURS}h ago"
elif (( AGE_HOURS < 24 * 7 )); then
  AGE_LABEL="$((AGE_HOURS / 24))d ago"
  STATUS_LABEL="ready"
else
  AGE_LABEL="$((AGE_HOURS / 24))d ago"
  STATUS_LABEL="stale"
fi
STATUS_LABEL="${STATUS_LABEL:-ready}"

RESOURCES=$(node -e "
const fs=require('fs');
try{const a=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log(Array.isArray(a)?a.length:1)}catch{console.log('?')}
" "$LATEST")
EVALS=$(node -e "
const fs=require('fs');
try{
  const a=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
  const arr=Array.isArray(a)?a:[a];
  let n=0; for(const d of arr) n+=(d.evaluations||[]).length;
  console.log(n);
}catch{console.log('?')}
" "$LATEST")

printf '  status:        %s\n' "$STATUS_LABEL"
printf '  last run:      %s (%s)\n' "$AGE_LABEL" "$(basename "$LATEST" .json)"
printf '  cached:        %s resources, %s evaluations\n' "$RESOURCES" "$EVALS"

# 5. Rate limit
if RL=$(gh api /rate_limit --jq '.rate | "\(.remaining)/\(.limit)"' 2>/dev/null); then
  printf '  rate limit:    %s remaining\n' "$RL"
fi

exit 0
