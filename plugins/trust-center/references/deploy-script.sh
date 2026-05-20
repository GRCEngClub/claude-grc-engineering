#!/usr/bin/env bash
set -euo pipefail

# ================================================================
# Trust Center — One-Command Deploy Script
# ================================================================
# Usage:
#   ./deploy.sh --email you@company.com
#   ./deploy.sh --email you@company.com --domain trust.yourco.com --cert-arn arn:aws:acm:...
#   ./deploy.sh --email you@company.com --stage dev
#   ./deploy.sh --skip-frontend   # redeploy backend only
#   ./deploy.sh --skip-infra      # redeploy code only (no CloudFormation)
# ================================================================

COMPANY_NAME="${COMPANY_NAME:-Your Company}"
STAGE="${STAGE:-prod}"
STACK_NAME="trust-center-${STAGE}"
ADMIN_EMAIL=""
DOMAIN_NAME=""
CERT_ARN=""
ESIGN_API_KEY=""
ESIGN_NDA_TEMPLATE_ID=""
SKIP_FRONTEND=false
SKIP_INFRA=false
SKIP_SEED=false

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()   { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()    { echo -e "${GREEN}  ✓${NC} $1"; }
warn()  { echo -e "${YELLOW}  ⚠${NC} $1"; }
fail()  { echo -e "${RED}  ✗${NC} $1"; exit 1; }

# ── Parse arguments ─────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --email)       ADMIN_EMAIL="$2"; shift 2 ;;
    --domain)      DOMAIN_NAME="$2"; shift 2 ;;
    --cert-arn)    CERT_ARN="$2"; shift 2 ;;
    --stage)       STAGE="$2"; STACK_NAME="trust-center-${STAGE}"; shift 2 ;;
    --company)     COMPANY_NAME="$2"; shift 2 ;;
    --esign-key)        ESIGN_API_KEY="$2"; shift 2 ;;
    --esign-template)   ESIGN_NDA_TEMPLATE_ID="$2"; shift 2 ;;
    --skip-frontend) SKIP_FRONTEND=true; shift ;;
    --skip-infra)    SKIP_INFRA=true; shift ;;
    --skip-seed)     SKIP_SEED=true; shift ;;
    *) fail "Unknown argument: $1" ;;
  esac
done

if [[ -z "$ADMIN_EMAIL" ]]; then
  fail "Missing required --email. Usage: ./deploy.sh --email you@company.com"
fi

# ── Verify prerequisites ────────────────────────────────────
log "Checking prerequisites..."

command -v aws >/dev/null 2>&1 || fail "AWS CLI not found. Install: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
command -v node >/dev/null 2>&1 || fail "Node.js not found. Install: https://nodejs.org/"
command -v python3 >/dev/null 2>&1 || fail "Python 3 not found. Install: https://www.python.org/downloads/"

AWS_REGION=$(aws configure get region 2>/dev/null || echo "")
if [[ -z "$AWS_REGION" ]]; then
  fail "AWS CLI not configured. Run: aws configure"
fi
ok "AWS CLI configured (region: $AWS_REGION)"

# Warn if not us-east-1 (needed for CloudFront WAF)
if [[ "$AWS_REGION" != "us-east-1" ]]; then
  warn "CloudFront WAF requires us-east-1. Your region is $AWS_REGION."
  warn "Set region: aws configure set region us-east-1"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ok "Working from: $SCRIPT_DIR"

# ── Phase 1: Deploy CloudFormation ──────────────────────────
if [[ "$SKIP_INFRA" == false ]]; then
  log "Deploying CloudFormation stack: $STACK_NAME ..."

  PARAMS=()
  PARAMS+=("CompanyName=${COMPANY_NAME}")
  PARAMS+=("AdminEmail=${ADMIN_EMAIL}")
  PARAMS+=("Stage=${STAGE}")
  if [[ -n "$DOMAIN_NAME" ]]; then
    PARAMS+=("DomainName=${DOMAIN_NAME}")
  fi
  if [[ -n "$CERT_ARN" ]]; then
    PARAMS+=("CertificateArn=${CERT_ARN}")
  fi
  if [[ -n "$ESIGN_API_KEY" ]]; then
    PARAMS+=("DocumensoApiKey=${ESIGN_API_KEY}")
  fi
  if [[ -n "$ESIGN_NDA_TEMPLATE_ID" ]]; then
    PARAMS+=("DocumensoNdaTemplateId=${ESIGN_NDA_TEMPLATE_ID}")
  fi

  aws cloudformation deploy \
    --template-file "$SCRIPT_DIR/infrastructure/template.yaml" \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides "${PARAMS[@]}" \
    --no-fail-on-empty-changeset

  ok "CloudFormation stack deployed"
else
  log "Skipping infrastructure (--skip-infra)"
fi

# ── Grab stack outputs ──────────────────────────────────────
log "Reading stack outputs..."

get_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey==\`$1\`].OutputValue" \
    --output text
}

WEBSITE_BUCKET=$(get_output WebsiteBucket)
DOCS_BUCKET=$(get_output DocumentsBucket)
API_URL=$(get_output ApiUrl)
CLOUDFRONT_DOMAIN=$(get_output CloudFrontDomain)
CF_DIST_ID=$(get_output CloudFrontDistributionId)
TABLE_NAME=$(get_output TableName)
USER_POOL_ID=$(get_output UserPoolId)
USER_POOL_CLIENT_ID=$(get_output UserPoolClientId)

ok "Website bucket:  $WEBSITE_BUCKET"
ok "Docs bucket:     $DOCS_BUCKET"
ok "API URL:         $API_URL"
ok "CloudFront:      https://$CLOUDFRONT_DOMAIN"

# ── Phase 2: Deploy Lambda Code ─────────────────────────────
log "Packaging and deploying Lambda function..."

LAMBDA_ZIP="$SCRIPT_DIR/lambda-package.zip"
rm -f "$LAMBDA_ZIP"

cd "$SCRIPT_DIR/backend/functions"
zip -r "$LAMBDA_ZIP" api_handler.py >/dev/null
cd "$SCRIPT_DIR"

aws lambda update-function-code \
  --function-name "trust-center-api-${STAGE}" \
  --zip-file "fileb://$LAMBDA_ZIP" \
  --no-cli-pager >/dev/null

rm -f "$LAMBDA_ZIP"
ok "Lambda function updated"

# ── Phase 3: Seed Database ──────────────────────────────────
if [[ "$SKIP_SEED" == false ]]; then
  log "Seeding DynamoDB with document metadata..."
  python3 "$SCRIPT_DIR/backend/seed_data.py" \
    --table "$TABLE_NAME" \
    --bucket "$DOCS_BUCKET"
  ok "Database seeded"
else
  log "Skipping seed (--skip-seed)"
fi

# ── Phase 4: Build and Deploy Frontend ──────────────────────
if [[ "$SKIP_FRONTEND" == false ]]; then
  log "Building frontend..."

  cd "$SCRIPT_DIR/frontend"

  # Write env config
  cat > .env.production << EOF
VITE_API_URL=$API_URL
VITE_USER_POOL_ID=$USER_POOL_ID
VITE_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
VITE_COMPANY_NAME=$COMPANY_NAME
EOF

  npm install --silent 2>/dev/null
  npm run build --silent 2>/dev/null
  ok "Frontend built"

  log "Uploading to S3..."
  aws s3 sync dist/ "s3://$WEBSITE_BUCKET" --delete --no-cli-pager >/dev/null
  ok "Frontend uploaded"

  log "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths "/*" \
    --no-cli-pager >/dev/null
  ok "Cache invalidated"
else
  log "Skipping frontend (--skip-frontend)"
fi

# ── Done ────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Trust Center deployed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "  URL:     ${BLUE}https://$CLOUDFRONT_DOMAIN${NC}"
if [[ -n "$DOMAIN_NAME" ]]; then
  echo -e "  Custom:  ${BLUE}https://$DOMAIN_NAME${NC}  (after DNS propagation)"
fi
echo -e "  API:     ${BLUE}$API_URL${NC}"
echo -e "  Admin:   ${BLUE}https://$CLOUDFRONT_DOMAIN/admin${NC}"
echo ""
echo -e "  ${YELLOW}Check your email ($ADMIN_EMAIL) for your temporary admin password.${NC}"
echo ""
echo -e "  Next: upload your actual documents:"
echo -e "    aws s3 cp SOC2.pdf s3://$DOCS_BUCKET/documents/"
echo -e "    aws s3 cp SOC3.pdf s3://$DOCS_BUCKET/documents/"
echo ""
