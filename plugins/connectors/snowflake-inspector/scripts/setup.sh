#!/usr/bin/env bash
set -euo pipefail
CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/snowflake-inspector.yaml"
ACCOUNT="${SNOWSQL_ACCOUNT:-}"
USER="${SNOWSQL_USER:-}"
WAREHOUSE="${SNOWSQL_WAREHOUSE:-}"
ROLE="${SNOWSQL_ROLE:-}"
for arg in "$@"; do
  case "$arg" in
    --account=*) ACCOUNT="${arg#*=}" ;;
    --user=*) USER="${arg#*=}" ;;
    --warehouse=*) WAREHOUSE="${arg#*=}" ;;
    --role=*) ROLE="${arg#*=}" ;;
    *) echo "[snowflake-inspector:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done
if ! command -v snowsql >/dev/null 2>&1; then echo "[snowflake-inspector:setup] snowsql not found." >&2; exit 5; fi
if [[ -z "$ACCOUNT" || -z "$USER" ]]; then echo "[snowflake-inspector:setup] missing account/user." >&2; exit 2; fi
if ! snowsql -a "$ACCOUNT" -u "$USER" ${WAREHOUSE:+-w "$WAREHOUSE"} ${ROLE:+-r "$ROLE"} -q "select current_account();" -o output_format=plain -o friendly=false -o header=false >/dev/null; then
  echo "[snowflake-inspector:setup] SnowSQL connection failed." >&2
  exit 2
fi
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: snowflake-inspector
source_version: "0.1.0"
account: "$ACCOUNT"
user: "$USER"
warehouse: "$WAREHOUSE"
role: "$ROLE"
defaults:
  session_timeout_minutes: 240
  min_retention_days: 1
EOF
mkdir -p "$HOME/.cache/claude-grc/findings/snowflake-inspector"
touch "$HOME/.cache/claude-grc/runs.log"
printf 'snowflake-inspector:setup ok\n  account: %s\n  user:    %s\n  config:  %s\n' "$ACCOUNT" "$USER" "$CONFIG_FILE"
