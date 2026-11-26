#!/bin/bash

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

TEMP_DIR=$(mktemp -d)
echo "📦 Creating Lambda deployment package..."

cp "$LAMBDA_DIR/contact-form-handler.js" "$TEMP_DIR/index.js"

# The Lambda layer's dependencies are pinned via the checked-in
# contact-lambda/package-lock.json (npm security principle: hash-pinned
# installs, required by OpenSSF Scorecard's PinnedDependencies check).
cd "$TEMP_DIR"
cp "$SCRIPT_DIR"/contact-lambda/package.json "$SCRIPT_DIR"/contact-lambda/package-lock.json .
npm ci --ignore-scripts --no-audit --no-fund > /dev/null 2>&1

zip -r function.zip . > /dev/null 2>&1

cd - > /dev/null

echo "✅ Package created"
echo ""

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

echo "📤 Updating Lambda function code..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$TEMP_DIR/function.zip" \
  --profile "$PROFILE" \
  --region "$REGION" \
  > /dev/null

echo "✅ Function code updated"
echo ""

echo "⏳ Waiting for function to be ready..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --profile "$PROFILE" \
  --region "$REGION"

API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

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
