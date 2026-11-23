#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/gcp-inspector.yaml"
SOURCE="gcp-inspector"
SOURCE_VERSION="0.1.0"

PROJECT=""
REGION=""
for arg in "$@"; do
  case "$arg" in
    --project=*) PROJECT="${arg#*=}" ;;
    --region=*)  REGION="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if ! command -v gcloud >/dev/null 2>&1; then
  cat <<'EOF' >&2
[gcp-inspector:setup] gcloud CLI not found on PATH.

Install:
  macOS:  brew install --cask google-cloud-sdk
  Linux:  https://cloud.google.com/sdk/docs/install

Then: gcloud auth login && gcloud auth application-default login
Finally re-run /gcp-inspector:setup.
EOF
  exit 5
fi

GCLOUD_VERSION=$(gcloud --version 2>/dev/null | head -1 | awk '{print $NF}')

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | head -1 || true)
if [[ -z "$ACTIVE_ACCOUNT" ]]; then
  cat <<'EOF' >&2
[gcp-inspector:setup] No active gcloud account.

Fix:
  gcloud auth login
  gcloud auth application-default login

Then re-run /gcp-inspector:setup.
EOF
  exit 2
fi

if [[ -z "$PROJECT" ]]; then
  PROJECT="${CLOUDSDK_CORE_PROJECT:-$(gcloud config get-value project 2>/dev/null || true)}"
fi
if [[ -z "$PROJECT" || "$PROJECT" == "(unset)" ]]; then
  cat <<'EOF' >&2
[gcp-inspector:setup] No project configured.

Fix (pick one):
  gcloud config set project <project-id>
  # or re-run with --project=<project-id>
EOF
  exit 2
fi

if ! PROJ_JSON=$(gcloud projects describe "$PROJECT" --format=json 2>/tmp/gcp-setup.err); then
  cat >&2 <<EOF
[gcp-inspector:setup] Cannot describe project '$PROJECT'.

$(cat /tmp/gcp-setup.err)

Likely cause: caller lacks 'resourcemanager.projects.get'. Minimum role: roles/viewer.
For full scans, grant: roles/iam.securityReviewer, roles/cloudkms.viewer, roles/logging.viewer.
EOF
  exit 2
fi

PROJECT_NUMBER=$(echo "$PROJ_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).projectNumber))")

if [[ -z "$REGION" ]]; then
  REGION=$(gcloud config get-value compute/region 2>/dev/null || true)
  [[ -z "$REGION" || "$REGION" == "(unset)" ]] && REGION="us-central1"
fi

mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
project_id: "$PROJECT"
project_number: "$PROJECT_NUMBER"
caller: "$ACTIVE_ACCOUNT"
default_region: "$REGION"
defaults:
  services: ["iam", "storage", "logging", "kms", "compute"]
EOF

CACHE_DIR="$HOME/.cache/claude-grc/findings/gcp-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
gcp-inspector:setup ✓
  gcloud:          $GCLOUD_VERSION
  project:         $PROJECT (number $PROJECT_NUMBER)
  caller:          $ACTIVE_ACCOUNT
  default region:  $REGION
  config:          $CONFIG_FILE

Next:
  /gcp-inspector:collect
  /grc-engineer:gap-assessment FedRAMP-Moderate,SOC2 --sources=gcp-inspector
EOF
