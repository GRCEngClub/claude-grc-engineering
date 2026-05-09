---
name: website-cicd
description: Sets up GitHub Actions CI/CD workflow for automatic deployment to AWS on push to main. Uses GitHub OIDC for keyless AWS authentication.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Website CI/CD Skill

You are running the `/grc-portfolio:cicd` skill. Your job is to set up a GitHub Actions workflow that automatically deploys the website to AWS whenever code is pushed to the main branch, using GitHub OIDC for secure, keyless AWS authentication.

## Step 1: Locate and Validate Config

Find `site-config.json`:
- Check `$ARGUMENTS` for a project directory path
- Check the current working directory
- Ask the user if not found

Read it and validate:
- `status.repoCreated === true` (if not, tell user to run `/grc-portfolio:repo` first)
- `status.infraDeployed === true` (if not, tell user to run `/grc-portfolio:infra` first)

## Step 2: Set Up GitHub OIDC IAM Role

### 2a: Ensure OIDC Provider Exists

Check if the GitHub OIDC identity provider already exists in the AWS account:
```bash
aws iam list-open-id-connect-providers --profile <aws.profile>
```

Look for `token.actions.githubusercontent.com`. If it doesn't exist, create it:
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  --profile <aws.profile>
```

### 2b: Create IAM Role with Trust Policy

Create a trust policy that allows only this specific GitHub repo to assume the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<github.owner>/<github.repoName>:*"
        }
      }
    }
  ]
}
```

Create the role:
```bash
aws iam create-role \
  --role-name <projectName>-github-deploy \
  --assume-role-policy-document file:///tmp/<projectName>-trust-policy.json \
  --description "GitHub Actions OIDC role for <projectName> website deployment" \
  --profile <aws.profile>
```

### 2c: Attach Least-Privilege Deploy Policy

Create an inline policy scoped to only the S3 bucket and CloudFront distribution for this project:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Deploy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<aws.bucketName>",
        "arn:aws:s3:::<aws.bucketName>/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<account-id>:distribution/<aws.distributionId>"
    }
  ]
}
```

Attach it:
```bash
aws iam put-role-policy \
  --role-name <projectName>-github-deploy \
  --policy-name <projectName>-deploy-access \
  --policy-document file:///tmp/<projectName>-deploy-policy.json \
  --profile <aws.profile>
```

## Step 3: Create Workflow File

Create `.github/workflows/deploy.yml` in the project directory.

The workflow uses OIDC — no static AWS keys needed. Bucket name, distribution ID, and role ARN are stored as workflow env vars (not secrets, since they're not sensitive):

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

env:
  AWS_BUCKET_NAME: <aws.bucketName>
  AWS_DISTRIBUTION_ID: <aws.distributionId>
  AWS_REGION: us-east-1
  AWS_ROLE_ARN: arn:aws:iam::<account-id>:role/<projectName>-github-deploy

jobs:
  deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          NODE_ENV: production

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ env.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ env.AWS_BUCKET_NAME }} \
            --delete \
            --cache-control "public,max-age=31536000,immutable" \
            --exclude "index.html" \
            --exclude "*.html"

          aws s3 sync dist/ s3://${{ env.AWS_BUCKET_NAME }} \
            --cache-control "public,max-age=0,must-revalidate" \
            --exclude "*" \
            --include "*.html"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.AWS_DISTRIBUTION_ID }} \
            --paths "/*"
```

If `features.contactForm` is true, add to the Build step's env:
```yaml
        env:
          NODE_ENV: production
          VITE_CONTACT_API_ENDPOINT: <aws.contactApiEndpoint>
```

## Step 4: Commit and Push

```bash
cd <projectDir>
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deploy workflow (OIDC auth)"
git push
```

## Step 5: Verify Workflow

Check that the workflow was triggered:
```bash
gh run list --limit 1
```

If the run is in progress, tell the user. If it completed, report the status:
```bash
gh run view <run-id>
```

## Step 6: Update Config

Update `site-config.json`:
- Set `github.secretsConfigured = true`
- Set `status.cicdConfigured = true`

## Step 7: Summary

Tell the user:
- GitHub Actions CI/CD is configured with OIDC (no static AWS keys)
- IAM role `<projectName>-github-deploy` is scoped to only S3 + CloudFront for this project
- Every push to `main` will automatically build and deploy the site
- The workflow can also be triggered manually from the GitHub UI (workflow_dispatch)
- Provide the direct link: `<github.repoUrl>/actions`

## Variables

- `$TOOLKIT_DIR` = read from `site-config.json` `toolkitDir` field
- `$ARGUMENTS` = arguments passed after `/cicd` (expected: project directory path)
