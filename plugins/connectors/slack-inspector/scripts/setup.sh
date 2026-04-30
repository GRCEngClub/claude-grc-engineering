#!/usr/bin/env bash
# slack-inspector:setup
# Idempotent setup for the slack-inspector connector.
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/slack-inspector.yaml"
SOURCE="slack-inspector"
SOURCE_VERSION="0.1.0"

TOKEN="${SLACK_TOKEN:-}"
WORKSPACE=""
for arg in "$@"; do
  case "$arg" in
    --token=*)     TOKEN="${arg#*=}" ;;
    --workspace=*) WORKSPACE="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$TOKEN" ]]; then
  cat >&2 <<'EOF'
[slack-inspector:setup] Missing Slack OAuth token.

Pass --token=xoxb-... or set SLACK_TOKEN. Recommended scopes include:
  team:read users:read admin.users.info:read admin.apps:read admin.conversations:read discovery:read
EOF
  exit 2
fi

AUTH_JSON=$(node - "$TOKEN" <<'NODE'
const token = process.argv[2];
const body = await fetch('https://slack.com/api/auth.test', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).catch(err => ({ ok: false, error: err.message }));
console.log(JSON.stringify(body));
NODE
)

OK=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.ok ? 'yes' : 'no')" "$AUTH_JSON")
if [[ "$OK" != "yes" ]]; then
  ERR=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.error || 'unknown_error')" "$AUTH_JSON")
  echo "[$SOURCE:setup] Slack auth.test failed: $ERR" >&2
  exit 2
fi

TEAM_ID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.team_id || '')" "$AUTH_JSON")
TEAM_NAME=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.team || '')" "$AUTH_JSON")
USER_ID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.user_id || '')" "$AUTH_JSON")
if [[ -z "$WORKSPACE" ]]; then WORKSPACE="$TEAM_NAME"; fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
team_id: "$TEAM_ID"
team_name: "$TEAM_NAME"
workspace: "$WORKSPACE"
token_env: "SLACK_TOKEN"
defaults:
  checks: ["auth", "retention", "apps", "dlp"]
EOF

CRED_FILE="$CONFIG_DIR/slack-inspector.token"
umask 077
printf '%s\n' "$TOKEN" > "$CRED_FILE"

CACHE_DIR="$HOME/.cache/claude-grc/findings/slack-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
slack-inspector:setup ok
  team:        $TEAM_NAME ($TEAM_ID)
  principal:   $USER_ID
  config:      $CONFIG_FILE
  token file:  $CRED_FILE

Next:
  /slack-inspector:collect
  /grc-engineer:gap-assessment SOC2,NIST-800-53 --sources=slack-inspector
EOF
