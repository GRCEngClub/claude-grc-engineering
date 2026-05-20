# Trust Center — Deployment Guide

Step-by-step walkthrough to go from zero to a live trust center.

## Prerequisites

Before you start, make sure you have these installed on your machine:

```bash
# Check if you have these. If any command fails, install that tool first.
git --version        # Need: 2.x+    → https://git-scm.com/downloads
node --version       # Need: 18+     → https://nodejs.org/
python3 --version    # Need: 3.11+   → https://www.python.org/downloads/
aws --version        # Need: 2.x+    → https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
```

You also need an AWS account with permissions to create: S3, CloudFront, WAF, API Gateway, Lambda, DynamoDB, Cognito, IAM roles.

## Phase 1: Get the Code

### Step 1.1 — Fork the GRC Eng Club Repo

1. Go to: https://github.com/GRCEngClub/claude-grc-engineering
2. Click the **"Fork"** button (top-right corner)
3. Keep "Copy the main branch only" checked
4. Click **"Create Fork"**
5. You now have your own copy at: `https://github.com/YOUR_USERNAME/claude-grc-engineering`

### Step 1.2 — Clone Your Fork Locally

```bash
# Replace YOUR_USERNAME with your GitHub username
cd ~/projects  # or wherever you keep code
git clone https://github.com/YOUR_USERNAME/claude-grc-engineering.git
cd claude-grc-engineering
```

### Step 1.3 — Create a Branch for Your Work

```bash
git checkout -b feature/trust-center-plugin
```

### Step 1.4 — Copy the Trust Center Code Into the Plugin Structure

The repo uses a `plugins/` directory. Your trust center goes in there:

```bash
# Create the plugin directory
mkdir -p plugins/trust-center

# Copy all the trust center files in
# (assuming you have the trust-center/ folder from this project)
cp -r /path/to/trust-center/* plugins/trust-center/
```

Your directory should look like:

```
plugins/trust-center/
├── infrastructure/
│   └── template.yaml         # CloudFormation (entire AWS stack)
├── backend/
│   ├── functions/
│   │   └── api_handler.py    # Lambda API
│   └── seed_data.py          # Populate DB with your company data
├── frontend/
│   ├── src/
│   │   └── App.jsx           # React trust center UI
│   ├── package.json
│   └── vite.config.js
├── plugin/
│   └── SKILL.md              # Claude Code skill definition
├── docs/
│   └── DEPLOYMENT.md         # This file
├── deploy.sh                 # One-command deploy script
└── README.md
```

## Phase 2: Configure AWS

### Step 2.1 — Configure AWS CLI

If you haven't already set up AWS CLI:

```bash
aws configure
# It will ask for:
#   AWS Access Key ID:     (get from AWS Console → IAM → your user → Security Credentials)
#   AWS Secret Access Key: (same place)
#   Default region:        us-east-1    (MUST be us-east-1 for CloudFront + WAF)
#   Default output format: json
```

**Important:** The CloudFormation stack MUST be deployed in `us-east-1` because:
- WAF WebACLs for CloudFront must be in us-east-1
- ACM certificates for CloudFront must be in us-east-1

### Step 2.2 — (Optional) Set Up a Custom Domain

If you want `trust.yourcompany.com` instead of a CloudFront URL:

1. Go to AWS Console → **Certificate Manager** (make sure you're in us-east-1)
2. Click **"Request a certificate"**
3. Choose **"Request a public certificate"**
4. Enter your domain: `trust.yourcompany.com`
5. Choose **DNS validation**
6. Add the CNAME record to your DNS provider (Route 53, Cloudflare, etc.)
7. Wait for validation (usually 5-15 minutes)
8. Copy the **Certificate ARN** — you'll need it in the next step

If you skip this, you'll get a CloudFront URL like `d1234abcd.cloudfront.net` — perfectly fine for testing.

## Phase 3: Deploy the Infrastructure

### Step 3.1 — Deploy the CloudFormation Stack

```bash
cd plugins/trust-center/infrastructure/

# WITHOUT custom domain (quickest way to get started):
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name trust-center-prod \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    CompanyName="Your Company" \
    AdminEmail="your-email@company.com" \
    Stage=prod

# WITH custom domain:
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name trust-center-prod \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    CompanyName="Your Company" \
    DomainName="trust.yourcompany.com" \
    CertificateArn="arn:aws:acm:us-east-1:123456789:certificate/abc-123" \
    AdminEmail="your-email@company.com" \
    Stage=prod
```

**This takes 5-15 minutes.** CloudFront distribution creation is the slow part.

Watch the progress:
```bash
aws cloudformation describe-stack-events \
  --stack-name trust-center-prod \
  --query 'StackEvents[0:5].[Timestamp,ResourceStatus,LogicalResourceId]' \
  --output table
```

### Step 3.2 — Get Your Stack Outputs

Once the deploy finishes, grab the output values. You'll need them for everything else:

```bash
# Save all outputs to a file for easy reference
aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs' \
  --output table

# Or grab them one at a time:
WEBSITE_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucket`].OutputValue' \
  --output text)

DOCS_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`DocumentsBucket`].OutputValue' \
  --output text)

API_URL=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomain`].OutputValue' \
  --output text)

CF_DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

TABLE_NAME=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' \
  --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name trust-center-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text)

echo "Website bucket: $WEBSITE_BUCKET"
echo "Docs bucket:    $DOCS_BUCKET"
echo "API URL:        $API_URL"
echo "CloudFront:     https://$CLOUDFRONT_DOMAIN"
echo "Table:          $TABLE_NAME"
echo "User Pool:      $USER_POOL_ID"
echo "Client ID:      $USER_POOL_CLIENT_ID"
```

## Phase 4: Deploy the Backend

### Step 4.1 — Package and Upload the Lambda Code

```bash
cd ../backend/

# Create a zip of the Lambda function
cd functions/
zip -r ../../lambda-package.zip api_handler.py
cd ..

# Update the Lambda function with real code
aws lambda update-function-code \
  --function-name trust-center-api-prod \
  --zip-file fileb://../lambda-package.zip
```

### Step 4.2 — Seed the Database

This populates DynamoDB with your document metadata:

```bash
pip install boto3  # if you don't have it

python seed_data.py \
  --table "$TABLE_NAME" \
  --bucket "$DOCS_BUCKET"
```

### Step 4.3 — Upload the Actual Documents

```bash
# Upload the SOC 2 and SOC 3 reports
aws s3 cp /path/to/SOC2Report.pdf "s3://$DOCS_BUCKET/documents/SOC2Report.pdf"
aws s3 cp /path/to/SOC3Report.pdf "s3://$DOCS_BUCKET/documents/SOC3Report.pdf"

# Upload all policies
for policy in /path/to/policies/*.docx; do
  filename=$(basename "$policy")
  aws s3 cp "$policy" "s3://$DOCS_BUCKET/documents/$filename"
  echo "Uploaded: $filename"
done
```

## Phase 5: Deploy the Frontend

### Step 5.1 — Install Dependencies and Build

```bash
cd ../frontend/

# Install Node dependencies
npm install

# Create environment config
cat > .env.production << EOF
VITE_API_URL=$API_URL
VITE_USER_POOL_ID=$USER_POOL_ID
VITE_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
VITE_COMPANY_NAME=Your Company
EOF

# Build the production bundle
npm run build
```

### Step 5.2 — Upload to S3

```bash
# Sync the build output to the website bucket
aws s3 sync dist/ "s3://$WEBSITE_BUCKET" --delete

# Invalidate CloudFront cache so changes show immediately
aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "/*"
```

### Step 5.3 — Verify It Works

Open your browser and go to:
```
https://YOUR_CLOUDFRONT_DOMAIN
```

You should see the Trust Center with your company's certifications, compliance stats, and document list.

## Phase 6: Set Up Admin Access

### Step 6.1 — Check Your Email

When the CloudFormation stack created the Cognito admin user, it sent a temporary password to the AdminEmail you provided. Check your inbox for an email from `no-reply@verificationemail.com`.

### Step 6.2 — First Admin Login

1. Go to `https://YOUR_CLOUDFRONT_DOMAIN/admin`
2. Enter your email and the temporary password
3. You'll be prompted to set a new password (must be 12+ chars, upper+lower+number+symbol)
4. After setting the password, you're in the admin dashboard

## Phase 7: (Optional) Custom Domain DNS

If you set up a custom domain with ACM:

1. Go to your DNS provider
2. Add a **CNAME record**:
   - Name: `trust` (or whatever subdomain you chose)
   - Value: `YOUR_CLOUDFRONT_DOMAIN` (the `d1234abcd.cloudfront.net` value)
   - TTL: 300

DNS propagation takes 5-60 minutes depending on your provider.

## Quick Reference: Useful Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name trust-center-prod --query 'Stacks[0].StackStatus'

# View Lambda logs
aws logs tail /aws/lambda/trust-center-api-prod --follow

# Redeploy frontend after changes
cd frontend && npm run build && aws s3 sync dist/ "s3://$WEBSITE_BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$CF_DIST_ID" --paths "/*"

# Update Lambda code after changes
cd backend/functions && zip -r ../../lambda-package.zip api_handler.py
aws lambda update-function-code --function-name trust-center-api-prod --zip-file fileb://../lambda-package.zip

# Tear down everything (CAREFUL — deletes all resources)
aws cloudformation delete-stack --stack-name trust-center-prod
```

## Troubleshooting

**CloudFormation stuck on CREATE_IN_PROGRESS for >20 min?**
CloudFront distributions take 10-15 min. Check events with the describe-stack-events command above.

**403 error on the website?**
S3 bucket policy might not have propagated. Wait 60 seconds and try again. Also check that you synced to the correct bucket.

**API returning 500?**
Check Lambda logs: `aws logs tail /aws/lambda/trust-center-api-prod --since 5m`

**CORS errors in browser console?**
The Lambda handler includes CORS headers. Make sure you're hitting the API through CloudFront (`/api/*`) not directly through API Gateway.

**Cognito "User does not exist" error?**
Check that the AdminEmail parameter matches exactly what you're trying to log in with.
