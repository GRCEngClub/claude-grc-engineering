#!/bin/bash

# Deploy Contact Form API (Lambda + API Gateway)
# Packages the Lambda handler with its SES dependency, deploys the
# CloudFormation stack, and pushes the function code.
#
# Usage:
#   ./deploy-contact-api.sh <ses-from-email> <ses-to-email> [profile] [stack-name] [region]
#
# Examples:
#   ./deploy-contact-api.sh hello@example.com inbox@example.com
#   ./deploy-contact-api.sh hello@example.com inbox@example.com my-aws-profile my-contact-api us-east-1
#
# The script is intended to be run from the project root that contains
# the plugin's cloudformation/ and lambda/ directories — i.e. the
# grc-portfolio plugin itself, or a project that has copied them locally.

set -e

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <ses-from-email> <ses-to-email> [profile] [stack-name] [region]"
  exit 1
fi

SES_FROM_EMAIL="$1"
SES_TO_EMAIL="$2"
PROFILE="${3:-default}"
STACK_NAME="${4:-grc-portfolio-contact-form-api}"
REGION="${5:-us-east-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAMBDA_DIR="$PLUGIN_ROOT/lambda"
TEMPLATE_FILE="$PLUGIN_ROOT/cloudformation/contact-form-api.yaml"
FUNCTION_NAME="${STACK_NAME}-handler"

echo "🚀 Deploying Contact Form API..."
echo "Profile:    $PROFILE"
echo "Region:     $REGION"
echo "Stack:      $STACK_NAME"
echo "From:       $SES_FROM_EMAIL"
echo "To:         $SES_TO_EMAIL"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

if [ ! -f "$LAMBDA_DIR/contact-form-handler.js" ]; then
    echo "❌ Lambda handler not found at $LAMBDA_DIR/contact-form-handler.js"
    exit 1
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ CloudFormation template not found at $TEMPLATE_FILE"
    exit 1
fi

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
echo "📦 Creating Lambda deployment package..."

# Copy Lambda function
cp "$LAMBDA_DIR/contact-form-handler.js" "$TEMP_DIR/index.js"

# Install dependencies in temp directory
cd "$TEMP_DIR"
npm init -y > /dev/null 2>&1
npm install @aws-sdk/client-ses --save > /dev/null 2>&1

# Create zip file
zip -r function.zip . > /dev/null 2>&1

# Go back to original directory
cd - > /dev/null

echo "✅ Package created"
echo ""

# Deploy CloudFormation stack
echo "☁️  Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --parameter-overrides "SESFromEmail=$SES_FROM_EMAIL" "SESToEmail=$SES_TO_EMAIL" \
  --capabilities CAPABILITY_IAM \
  --profile "$PROFILE" \
  --region "$REGION" \
  --no-fail-on-empty-changeset

echo "✅ Stack deployed"
echo ""

# Update Lambda function code
echo "📤 Updating Lambda function code..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$TEMP_DIR/function.zip" \
  --profile "$PROFILE" \
  --region "$REGION" \
  > /dev/null

echo "✅ Function code updated"
echo ""

# Wait for function to be ready
echo "⏳ Waiting for function to be ready..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --profile "$PROFILE" \
  --region "$REGION"

# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 API Endpoint:"
echo "   $API_ENDPOINT"
echo ""
echo "📝 Next Steps:"
echo "   1. Update your contact form to POST to this endpoint."
echo "   2. (Optional) add to your build env:"
echo "      VITE_CONTACT_API=$API_ENDPOINT"
echo ""
echo "🧪 Test the API:"
echo "   curl -X POST $API_ENDPOINT \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"fullName\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Test message\"}'"
echo ""
