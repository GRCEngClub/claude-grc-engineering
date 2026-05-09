#!/bin/bash

# Deploy Contact Form API (Lambda + API Gateway)
# This script packages and deploys the Lambda function with API Gateway

set -e

PROFILE="con"
REGION="us-east-1"
STACK_NAME="construct-contact-form-api"
LAMBDA_DIR="aws-deployment-kit/lambda"
FUNCTION_NAME="construct-contact-form-handler"

echo "🚀 Deploying Contact Form API..."
echo "Profile: $PROFILE"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
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

# Go back to project root
cd - > /dev/null

echo "✅ Package created"
echo ""

# Deploy CloudFormation stack
echo "☁️  Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file aws-deployment-kit/cloudformation/contact-form-api.yaml \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_NAMED_IAM \
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
echo "   1. Update your contact form to use this endpoint"
echo "   2. Add to .env.local:"
echo "      NEXT_PUBLIC_CONTACT_API=$API_ENDPOINT"
echo ""
echo "🧪 Test the API:"
echo "   curl -X POST $API_ENDPOINT \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"fullName\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Test message\"}'"
echo ""
