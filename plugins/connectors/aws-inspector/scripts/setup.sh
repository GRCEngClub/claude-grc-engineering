#!/usr/bin/env bash
# aws-inspector:setup
# Idempotent setup for the aws-inspector connector.
#
# Verifies aws CLI + credentials, writes ~/.config/claude-grc/connectors/aws-inspector.yaml,
# warns if the caller has admin privileges.

set -euo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
CONFIG_FILE="$CONFIG_DIR/aws-inspector.yaml"
SOURCE="aws-inspector"
SOURCE_VERSION="0.1.0"

PROFILE=""
REGION=""
for arg in "$@"; do
  case "$arg" in
    --profile=*) PROFILE="${arg#*=}" ;;
    --region=*)  REGION="${arg#*=}" ;;
    *) echo "[$SOURCE:setup] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

AWSENV=()
[[ -n "$PROFILE" ]] && AWSENV+=("AWS_PROFILE=$PROFILE")
[[ -n "$REGION" ]]  && AWSENV+=("AWS_REGION=$REGION")

aws_() {
  if (( ${#AWSENV[@]} > 0 )); then
    env "${AWSENV[@]}" aws "$@"
  else
    aws "$@"
  fi
}

# 1. aws binary
if ! command -v aws >/dev/null 2>&1; then
  cat <<'EOF' >&2
[aws-inspector:setup] aws CLI not found on PATH.

Install:
  macOS:  brew install awscli
  Linux:  https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

Then re-run /aws-inspector:setup.
EOF
  exit 5
fi

AWS_BIN=$(command -v aws)
AWS_VERSION=$(aws --version 2>&1 | awk '{print $1}' | sed 's|aws-cli/||')

# 2. Credentials resolve?
if ! IDENT_JSON=$(aws_ sts get-caller-identity --output json 2>/tmp/aws-setup.err); then
  cat <<EOF >&2
[aws-inspector:setup] AWS credentials did not resolve.

$(cat /tmp/aws-setup.err)

Credential sources tried (in order):
  1. --profile flag (${PROFILE:-none})
  2. AWS_PROFILE env var (${AWS_PROFILE:-unset})
  3. AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
  4. ~/.aws/credentials default profile
  5. EC2/ECS/IRSA instance metadata

Fix one of:
  aws configure            # interactive setup
  aws sso login            # if using IAM Identity Center
  export AWS_PROFILE=<n>   # select an existing profile
EOF
  exit 2
fi

ACCOUNT_ID=$(echo "$IDENT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).Account))")
CALLER_ARN=$(echo "$IDENT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).Arn))")

# 3. Default region
if [[ -z "$REGION" ]]; then
  REGION="${AWS_REGION:-$(aws_ configure get region 2>/dev/null || true)}"
  [[ -z "$REGION" ]] && REGION="us-east-1"
fi

# 4. Admin privilege heuristic (warn, don't fail)
ADMIN_WARN=0
if echo "$CALLER_ARN" | grep -qE ':root$|:user/.*admin|:role/.*[Aa]dmin|:role/OrganizationAccountAccessRole'; then
  ADMIN_WARN=1
fi

# 5. Write config
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
version: 1
source: $SOURCE
source_version: "$SOURCE_VERSION"
account_id: "$ACCOUNT_ID"
caller_arn: "$CALLER_ARN"
profile: "${PROFILE:-${AWS_PROFILE:-}}"
default_region: "$REGION"
defaults:
  regions: ["$REGION"]
  services: ["iam", "s3", "cloudtrail", "ebs"]
EOF

# 6. Prepare cache dirs
CACHE_DIR="$HOME/.cache/claude-grc/findings/aws-inspector"
mkdir -p "$CACHE_DIR"
touch "$HOME/.cache/claude-grc/runs.log"

cat <<EOF
aws-inspector:setup ✓
  aws:            $AWS_BIN $AWS_VERSION
  account:        $ACCOUNT_ID
  caller:         $CALLER_ARN
  profile:        ${PROFILE:-${AWS_PROFILE:-<default>}}
  default region: $REGION
  config written: $CONFIG_FILE

EOF

if [[ $ADMIN_WARN -eq 1 ]]; then
  cat <<'EOF'
WARNING: caller ARN appears to have administrative privileges. For production
scans, prefer a dedicated read-only role (the AWS-managed SecurityAudit policy
is a good starting point). See /aws-inspector:collect for the minimum policy.

EOF
fi

cat <<'EOF'
Next:
  /aws-inspector:collect
  /aws-inspector:collect --tag-filter=env=production
  /aws-inspector:collect --scope-file=config/scope.yaml
  /grc-engineer:gap-assessment SOC2,FedRAMP-Moderate --sources=aws-inspector

To scope audits to production resources, edit:
  plugins/connectors/aws-inspector/config/scope.yaml
EOF
