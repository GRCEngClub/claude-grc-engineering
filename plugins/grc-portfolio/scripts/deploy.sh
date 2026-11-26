#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

error() {
    echo -e "${RED}✗ $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

if [ $# -lt 2 ]; then
    error "Missing required arguments!

Usage: $0 <bucket-name> <distribution-id> [aws-profile]

Example:
  $0 my-website-123456789 E1234ABCD5678
  $0 my-website-123456789 E1234ABCD5678 build

Get these values from CloudFormation stack Outputs tab."
fi

BUCKET_NAME=$1
DISTRIBUTION_ID=$2
AWS_PROFILE=${3:-default}

if ! command -v aws &> /dev/null; then
    error "AWS CLI is not installed. Run ./bootstrap.sh first."
fi

if [ ! -d "dist" ]; then
    error "Build folder (dist) not found. Run 'npm run build' first."
fi

if [ "$AWS_PROFILE" != "default" ]; then
    export AWS_PROFILE=$AWS_PROFILE
    info "Using AWS profile: $AWS_PROFILE"
fi

info "Verifying AWS credentials..."
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    error "AWS credentials not configured or invalid for profile: $AWS_PROFILE"
fi
success "AWS credentials verified"

echo ""
echo "=========================================="
echo "  AWS Website Deployment"
echo "=========================================="
echo "Bucket:        $BUCKET_NAME"
echo "Distribution:  $DISTRIBUTION_ID"
echo "Profile:       $AWS_PROFILE"
echo "=========================================="
echo ""

# Hashed assets are cached immutably for a year; HTML must not be cached
# immutably or visitors won't see new deploys (Vite emits a fresh index.html
# every build that references the latest hashed asset URLs).
info "Uploading hashed assets to S3 (immutable cache)..."
if aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --delete \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "*.html" \
    --profile "$AWS_PROFILE"; then
    success "Assets uploaded"
else
    error "Failed to upload assets to S3"
fi

info "Uploading HTML to S3 (no immutable cache)..."
if aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --cache-control "public,max-age=0,must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --profile "$AWS_PROFILE"; then
    success "HTML uploaded"
else
    error "Failed to upload HTML to S3"
fi

info "Invalidating CloudFront cache..."
INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --profile "$AWS_PROFILE" \
    2>&1)

if [ $? -eq 0 ]; then
    INVALIDATION_ID=$(echo "$INVALIDATION_OUTPUT" | grep -o '"Id": "[^"]*"' | cut -d'"' -f4)
    success "CloudFront cache invalidation created: $INVALIDATION_ID"
else
    error "Failed to invalidate CloudFront cache: $INVALIDATION_OUTPUT"
fi

echo ""
echo "=========================================="
success "Deployment complete!"
echo "=========================================="
info "Your website will be live in 1-2 minutes."
echo ""
