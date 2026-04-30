#!/usr/bin/env bash
# azure-inspector:setup
# Idempotent setup for the azure-inspector connector.
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/azure-inspector.yaml"
SOURCE="azure-inspector"
SOURCE_VERSION="0.1.0"

SUBSCRIPTION=""
TENANT=""
for arg in "$@"; do
  case "$arg" in
    --subscription=*) SUBSCRIPTION="${arg#*=}" ;;
    --tenant=*)       TENANT="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if ! command -v az >/dev/null 2>&1; then
  cat <<'EOF' >&2
[azure-inspector:setup] Azure CLI not found on PATH.

Install:
  macOS:  brew install azure-cli
  Linux:  https://learn.microsoft.com/cli/azure/install-azure-cli

Then: az login
Finally re-run /azure-inspector:setup.
EOF
  exit 5
fi

AZ_VERSION=$(az version --query '"azure-cli"' -o tsv 2>/dev/null || az --version 2>/dev/null | head -1 | awk '{print $NF}')
ERR_FILE=$(mktemp "${TMPDIR:-/tmp}/azure-inspector-setup.XXXXXX")
trap 'rm -f "$ERR_FILE"' EXIT

if ! ACCOUNT_JSON=$(az account show --only-show-errors -o json 2>"$ERR_FILE"); then
  cat >&2 <<EOF
[azure-inspector:setup] No active Azure account.

$(cat "$ERR_FILE")

Fix:
  az login
  az account set --subscription <subscription-id>
EOF
  exit 2
fi

if [[ -z "$SUBSCRIPTION" ]]; then
  SUBSCRIPTION=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).id || ''))" <<<"$ACCOUNT_JSON")
fi
if [[ -z "$TENANT" ]]; then
  TENANT=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).tenantId || ''))" <<<"$ACCOUNT_JSON")
fi
SUBSCRIPTION_NAME=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).name || ''))" <<<"$ACCOUNT_JSON")
CALLER=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).user?.name || ''))" <<<"$ACCOUNT_JSON")

if [[ -z "$SUBSCRIPTION" ]]; then
  echo "[azure-inspector:setup] Could not determine subscription. Re-run with --subscription=<subscription-id>." >&2
  exit 2
fi

if ! az account show --subscription "$SUBSCRIPTION" --only-show-errors -o json >/dev/null 2>&1; then
  echo "[azure-inspector:setup] Cannot access subscription '$SUBSCRIPTION'. Check Reader access for the active principal." >&2
  exit 2
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
subscription_id: "$SUBSCRIPTION"
subscription_name: "$SUBSCRIPTION_NAME"
tenant_id: "$TENANT"
caller: "$CALLER"
defaults:
  services: ["entra", "storage", "keyvault", "monitor", "defender"]
EOF

CACHE_DIR="$HOME/.cache/claude-grc/findings/azure-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
azure-inspector:setup ok
  az:             $AZ_VERSION
  subscription:   $SUBSCRIPTION_NAME ($SUBSCRIPTION)
  tenant:         $TENANT
  caller:         $CALLER
  config:         $CONFIG_FILE

Next:
  /azure-inspector:collect
  /grc-engineer:gap-assessment FedRAMP-Moderate,SOC2 --sources=azure-inspector
EOF
