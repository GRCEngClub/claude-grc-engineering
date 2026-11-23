#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/okta-inspector.yaml"
SOURCE="okta-inspector"
SOURCE_VERSION="0.1.0"

DOMAIN=""
TOKEN=""
TOKEN_ENV="OKTA_API_TOKEN"
for arg in "$@"; do
  case "$arg" in
    --domain=*)    DOMAIN="${arg#*=}" ;;
    --token=*)     TOKEN="${arg#*=}" ;;
    --token-env=*) TOKEN_ENV="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

DOMAIN=$(echo "$DOMAIN" | sed -E 's|^https?://||; s|/$||')

if [[ -z "$DOMAIN" ]]; then
  cat <<'EOF' >&2
[okta-inspector:setup] Missing --domain.

Usage:
  /okta-inspector:setup --domain=<your-org>.okta.com
  /okta-inspector:setup --domain=acme.oktapreview.com --token-env=OKTA_STAGE_TOKEN
EOF
  exit 2
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "[$SOURCE:setup] curl not found on PATH." >&2
  exit 5
fi

if [[ -z "$TOKEN" ]]; then
  TOKEN="${!TOKEN_ENV:-}"
fi
if [[ -z "$TOKEN" ]]; then
  cat <<EOF >&2
[okta-inspector:setup] API token not provided.

Create a Read-only API token in Okta admin:
  https://$DOMAIN/admin/access/api/tokens

Then export it:
  export $TOKEN_ENV=<token-value>

And re-run /okta-inspector:setup.
EOF
  exit 2
fi

HTTP_CODE=$(curl -sS -o /tmp/okta-me.json -w '%{http_code}' \
  -H "Authorization: SSWS $TOKEN" -H 'Accept: application/json' \
  "https://$DOMAIN/api/v1/users/me" || echo "000")

case "$HTTP_CODE" in
  200) ;;
  401) echo "[$SOURCE:setup] 401 — token invalid or revoked." >&2; exit 2 ;;
  403) echo "[$SOURCE:setup] 403 — token lacks required scopes (need at least Read-only admin)." >&2; exit 2 ;;
  404) echo "[$SOURCE:setup] 404 — domain '$DOMAIN' not recognized by Okta." >&2; exit 2 ;;
  000) echo "[$SOURCE:setup] Network failure contacting https://$DOMAIN." >&2; exit 2 ;;
  *)   echo "[$SOURCE:setup] Unexpected HTTP $HTTP_CODE from /users/me." >&2; cat /tmp/okta-me.json >&2; exit 2 ;;
esac

CALLER=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('/tmp/okta-me.json','utf8'));console.log(d.profile?.login||d.profile?.email||d.id||'unknown')}catch{console.log('unknown')}")

HTTP_CODE=$(curl -sS -o /tmp/okta-org.json -w '%{http_code}' \
  -H "Authorization: SSWS $TOKEN" -H 'Accept: application/json' \
  "https://$DOMAIN/api/v1/org" || echo "000")
ORG_ID="unknown"
if [[ "$HTTP_CODE" == "200" ]]; then
  ORG_ID=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('/tmp/okta-org.json','utf8'));console.log(d.id||'unknown')}catch{console.log('unknown')}")
fi
rm -f /tmp/okta-me.json /tmp/okta-org.json

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
domain: "$DOMAIN"
org_id: "$ORG_ID"
caller: "$CALLER"
token_env: "$TOKEN_ENV"
defaults:
  include_deactivated_users: false
  inactive_threshold_days: 90
EOF

CACHE_DIR="$HOME/.cache/claude-grc/findings/okta-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
okta-inspector:setup ✓
  domain:        $DOMAIN
  org id:        $ORG_ID
  caller:        $CALLER
  token source:  \$$TOKEN_ENV
  config:        $CONFIG_FILE

Next:
  /okta-inspector:collect
  /grc-engineer:gap-assessment FedRAMP-Moderate,SOC2 --sources=okta-inspector
EOF
