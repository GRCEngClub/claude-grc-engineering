#!/bin/bash

###############################################################################
# CloudFormation Template Validation Script
# 
# This script validates your CloudFormation templates before deployment
#
# Usage:
#   ./validate-stack.sh [template-file] [aws-profile]
#
# Example:
#   ./validate-stack.sh cloudformation/website-infrastructure.yaml
#   ./validate-stack.sh cloudformation/website-infrastructure.yaml build
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

# Default template file
TEMPLATE_FILE="${1:-cloudformation/website-infrastructure.yaml}"
AWS_PROFILE="${2:-default}"

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    error "Template file not found: $TEMPLATE_FILE

Available templates:
  - cloudformation/website-infrastructure.yaml (with custom domain)
  - cloudformation/website-infrastructure-no-domain.yaml (CloudFront URL only)

Usage: $0 [template-file] [aws-profile]"
fi

# Set AWS profile if provided
if [ "$AWS_PROFILE" != "default" ]; then
    export AWS_PROFILE=$AWS_PROFILE
    info "Using AWS profile: $AWS_PROFILE"
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    error "AWS CLI is not installed. Run ./bootstrap.sh first."
fi

# Verify AWS credentials
info "Verifying AWS credentials..."
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    error "AWS credentials not configured or invalid for profile: $AWS_PROFILE"
fi
success "AWS credentials verified"

# Validate template
info "Validating CloudFormation template: $TEMPLATE_FILE"
echo ""

if aws cloudformation validate-template \
    --template-body "file://$TEMPLATE_FILE" \
    --profile "$AWS_PROFILE" > /dev/null 2>&1; then
    
    success "Template is valid!"
    echo ""
    
    # Show template details
    info "Template Details:"
    aws cloudformation validate-template \
        --template-body "file://$TEMPLATE_FILE" \
        --profile "$AWS_PROFILE" \
        --query '{Description:Description,Parameters:Parameters[*].[ParameterKey,Description]}' \
        --output table
    
else
    error "Template validation failed. Check the template syntax and try again."
fi
