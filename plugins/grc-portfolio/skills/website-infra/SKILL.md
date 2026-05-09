---
name: website-infra
description: Deploys AWS CloudFormation infrastructure stacks for the website (S3, CloudFront, Route 53, ACM, and optionally contact form API).
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Website Infrastructure Skill

You are running the `/grc-portfolio:infra` skill. Your job is to deploy the AWS infrastructure needed to host the website using CloudFormation.

## Step 1: Locate and Validate Config

Find `site-config.json`:
- Check `$ARGUMENTS` for a project directory path
- Check the current working directory
- Ask the user if not found

Read it and validate that `status.preflightComplete === true`. If not, tell the user to run `/grc-portfolio:preflight` first.

## Step 2: Choose Template

Based on `features.customDomain`:
- **With custom domain**: Use `$TOOLKIT_DIR/cloudformation/website-infrastructure.yaml`
- **Without custom domain**: Use `$TOOLKIT_DIR/cloudformation/website-infrastructure-no-domain.yaml`

## Step 3: Validate Template

Run the validation script:
```bash
$TOOLKIT_DIR/scripts/validate-stack.sh <template-path> <aws.profile>
```

If validation fails, report the error and stop.

## Step 4: Deploy Main Stack

Deploy the CloudFormation stack:

**With custom domain:**
```bash
aws cloudformation create-stack \
  --stack-name <aws.stackName> \
  --template-body file://<template-path> \
  --parameters \
    ParameterKey=ProjectName,ParameterValue=<projectName> \
    ParameterKey=DomainName,ParameterValue=<aws.domain> \
    ParameterKey=HostedZoneId,ParameterValue=<aws.hostedZoneId> \
    ParameterKey=CertificateArn,ParameterValue=<aws.certArn> \
  --profile <aws.profile> \
  --region us-east-1
```

**Without custom domain:**
```bash
aws cloudformation create-stack \
  --stack-name <aws.stackName> \
  --template-body file://<template-path> \
  --parameters \
    ParameterKey=ProjectName,ParameterValue=<projectName> \
  --profile <aws.profile> \
  --region us-east-1
```

Note: Check the actual template parameters first by reading the template file, as parameter names may differ from the examples above. Use the actual parameter names from the template.

## Step 5: Wait for Completion

```bash
aws cloudformation wait stack-create-complete \
  --stack-name <aws.stackName> \
  --profile <aws.profile> \
  --region us-east-1
```

This can take 5-15 minutes (especially with CloudFront distribution creation). Tell the user it's in progress and approximately how long it might take.

If the stack fails, retrieve the failure reason:
```bash
aws cloudformation describe-stack-events \
  --stack-name <aws.stackName> \
  --profile <aws.profile> \
  --region us-east-1 \
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" \
  --output table
```

## Step 6: Retrieve Stack Outputs

```bash
aws cloudformation describe-stacks \
  --stack-name <aws.stackName> \
  --profile <aws.profile> \
  --region us-east-1 \
  --query "Stacks[0].Outputs"
```

Extract and save to `site-config.json`:
- `aws.bucketName` -- the S3 bucket name
- `aws.distributionId` -- the CloudFront distribution ID
- `aws.cloudFrontUrl` -- the CloudFront domain name (e.g., d123abc.cloudfront.net)

## Step 7: Deploy Contact Form API (if enabled)

If `features.contactForm` is true:

1. Deploy the contact form stack:
```bash
aws cloudformation deploy \
  --template-file $TOOLKIT_DIR/cloudformation/contact-form-api.yaml \
  --stack-name <projectName>-contact-form-api \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile <aws.profile> \
  --region us-east-1 \
  --no-fail-on-empty-changeset
```

2. Retrieve the API endpoint:
```bash
aws cloudformation describe-stacks \
  --stack-name <projectName>-contact-form-api \
  --profile <aws.profile> \
  --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text
```

3. Save to `aws.contactApiEndpoint` in config.

4. Package and deploy the Lambda function code (reference `$TOOLKIT_DIR/scripts/deploy-contact-api.sh` for the pattern -- create temp dir, copy handler, install @aws-sdk/client-ses, zip, update function code).

## Step 8: Domain Instructions (if custom domain)

If using a custom domain, tell the user:
- The nameservers they need to set at their domain registrar
- How to verify DNS propagation: `dig NS <domain>`
- That DNS propagation can take up to 48 hours (usually much faster)

Get the nameservers:
```bash
aws route53 get-hosted-zone --id <aws.hostedZoneId> --profile <aws.profile> --query "DelegationSet.NameServers"
```

## Step 9: Update Config

Update `site-config.json`:
- Set `aws.bucketName`, `aws.distributionId`, `aws.cloudFrontUrl`
- Set `aws.contactApiEndpoint` (if contact form)
- Set `status.infraDeployed = true`

## Step 10: Summary

Tell the user:
- Infrastructure deployed successfully
- CloudFront URL where the site will be accessible
- Contact form API endpoint (if applicable)
- DNS instructions (if custom domain)
- Suggest running `/grc-portfolio:deploy` next to push the built site to AWS

## Variables

- `$TOOLKIT_DIR` = read from `site-config.json` `toolkitDir` field
- `$ARGUMENTS` = arguments passed after `/infra` (expected: project directory path)
