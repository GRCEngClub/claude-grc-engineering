#!/bin/bash

###############################################################################
# AWS Website Deployment Script
# 
# This script uploads your built website to S3 and invalidates CloudFront cache
#
# Usage:
#   ./deploy.sh <bucket-name> <distribution-id> [aws-profile]
#
# Example:
#   ./deploy.sh my-website-123456789 E1234ABCD5678 build
#
###############################################################################

set -e  # Exit on error

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check arguments
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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    error "AWS CLI is not installed. Run ./bootstrap.sh first."
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    error "Build folder (dist) not found. Run 'npm run build' first."
fi

# Set AWS profile if provided
if [ "$AWS_PROFILE" != "default" ]; then
    export AWS_PROFILE=$AWS_PROFILE
    info "Using AWS profile: $AWS_PROFILE"
fi

# Verify AWS credentials
info "Verifying AWS credentials..."
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    error "AWS credentials not configured or invalid for profile: $AWS_PROFILE"
fi
success "AWS credentials verified"

# Display deployment info
echo ""
echo "=========================================="
echo "  AWS Website Deployment"
echo "=========================================="
echo "Bucket:        $BUCKET_NAME"
echo "Distribution:  $DISTRIBUTION_ID"
echo "Profile:       $AWS_PROFILE"
echo "=========================================="
echo ""

# Step 1: Upload files to S3
info "Uploading files to S3..."
if aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --delete \
    --cache-control "public,max-age=31536000,immutable" \
    --profile "$AWS_PROFILE"; then
    success "Files uploaded to S3"
else
    error "Failed to upload files to S3"
fi

# Step 2: Invalidate CloudFront cache
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

# Step 3: Done!
echo ""
echo "=========================================="
success "Deployment complete!"
echo "=========================================="
info "Your website will be live in 1-2 minutes."
echo ""
