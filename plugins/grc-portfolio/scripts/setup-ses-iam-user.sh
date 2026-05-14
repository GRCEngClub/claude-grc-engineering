#!/bin/bash

# Setup IAM User for SES Email Sending
# Creates an IAM user scoped to ses:SendEmail/SendRawEmail, then prints a
# fresh access key + secret for the Lambda contact-form path.
#
# Usage:
#   ./setup-ses-iam-user.sh [aws-profile] [user-name] [policy-name]
#
# Examples:
#   ./setup-ses-iam-user.sh
#   ./setup-ses-iam-user.sh my-aws-profile
#   ./setup-ses-iam-user.sh my-aws-profile my-portfolio-ses-mailer MyPortfolioSesPolicy

set -e

PROFILE="${1:-default}"
USER_NAME="${2:-grc-portfolio-ses-mailer}"
POLICY_NAME="${3:-GrcPortfolioSesSendPolicy}"

echo "🔧 Creating IAM user for SES email sending..."
echo "Profile: $PROFILE"
echo "User: $USER_NAME"
echo ""

# Create IAM user
echo "📝 Creating IAM user: $USER_NAME"
aws iam create-user \
  --user-name "$USER_NAME" \
  --profile "$PROFILE" \
  2>/dev/null || echo "User already exists, continuing..."

# Create policy document
POLICY_DOCUMENT='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}'

# Create and attach policy
echo "📋 Creating and attaching SES send policy..."
POLICY_ARN=$(aws iam create-policy \
  --policy-name "$POLICY_NAME" \
  --policy-document "$POLICY_DOCUMENT" \
  --profile "$PROFILE" \
  --query 'Policy.Arn' \
  --output text 2>/dev/null) || {
    echo "Policy might already exist, fetching ARN..."
    POLICY_ARN=$(aws iam list-policies \
      --profile "$PROFILE" \
      --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" \
      --output text)
  }

echo "Policy ARN: $POLICY_ARN"

# Attach policy to user
echo "🔗 Attaching policy to user..."
aws iam attach-user-policy \
  --user-name "$USER_NAME" \
  --policy-arn "$POLICY_ARN" \
  --profile "$PROFILE" \
  2>/dev/null || echo "Policy already attached"

# Create access key
echo "🔑 Creating access key..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key \
  --user-name "$USER_NAME" \
  --profile "$PROFILE" \
  --output json)

ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | grep -o '"AccessKeyId": "[^"]*"' | cut -d'"' -f4)
SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | grep -o '"SecretAccessKey": "[^"]*"' | cut -d'"' -f4)

echo ""
echo "✅ IAM User created successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Add these credentials to your .env.local file:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "AWS_REGION=us-east-1"
echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Save these credentials now!"
echo "    The secret access key cannot be retrieved again."
echo ""
echo "📝 To save these to .env.local, run from your project root:"
echo "   ./scripts/create-env-file.sh \"$ACCESS_KEY_ID\" \"$SECRET_ACCESS_KEY\""
echo ""
