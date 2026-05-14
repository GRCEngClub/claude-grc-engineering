---
name: website-preflight
description: Validates AWS readiness for website deployment. Checks CLI tools, credentials, SES, Route 53, and ACM. Produces a report with pass/fail and action items.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Website Preflight Skill

You are running the `/grc-portfolio:preflight` skill. Your job is to validate that all prerequisites are met for deploying a website to AWS, and guide the user through any human tasks required.

## Step 1: Locate Config

Find `site-config.json`:
- Check `$ARGUMENTS` for a project directory path
- Check the current working directory
- Ask the user if not found

Read it to understand what features are enabled and what AWS configuration is needed.

## Step 2: Automated Checks

Run each check and record the result as PASS or FAIL:

### Required Checks (all deployments)

1. **AWS CLI installed**
   ```bash
   aws --version
   ```
   If missing: suggest running `$TOOLKIT_DIR/scripts/bootstrap.sh`

2. **Node.js installed (v18+)**
   ```bash
   node --version
   ```

3. **npm installed**
   ```bash
   npm --version
   ```

4. **AWS credentials configured**
   ```bash
   aws sts get-caller-identity --profile <aws.profile>
   ```
   Record the account ID and ARN for the report.

5. **AWS region set to us-east-1**
   Verify `aws.region` in config is `us-east-1` (required for CloudFront + ACM).

6. **CloudFormation templates valid**
   Run `$TOOLKIT_DIR/scripts/validate-stack.sh` against the appropriate template:
   - If `features.customDomain`: validate `$TOOLKIT_DIR/cloudformation/website-infrastructure.yaml`
   - Otherwise: validate `$TOOLKIT_DIR/cloudformation/website-infrastructure-no-domain.yaml`

### Conditional Checks

7. **SES email verified** (if `features.contactForm`)
   ```bash
   aws ses get-identity-verification-attributes --identities <client.email> --profile <aws.profile> --region us-east-1
   ```
   Check that the status is "Success".

8. **Route 53 hosted zone exists** (if `features.customDomain`)
   ```bash
   aws route53 list-hosted-zones-by-name --dns-name <aws.domain> --profile <aws.profile>
   ```
   If found, save the hosted zone ID to `aws.hostedZoneId` in config.

9. **ACM certificate exists in us-east-1** (if `features.customDomain`)
   ```bash
   aws acm list-certificates --region us-east-1 --profile <aws.profile> --query "CertificateSummaryList[?DomainName=='<aws.domain>']"
   ```
   If found and status is "ISSUED", save the ARN to `aws.certArn` in config.

10. **gh CLI installed** (for future /grc-portfolio:repo and /grc-portfolio:cicd steps)
    ```bash
    gh --version
    ```

## Step 3: Produce Report

Output a formatted report with three sections:

### PASS
List all checks that passed with a checkmark.

### ACTION REQUIRED (Automated)
Things that can be fixed automatically -- offer to run the fix:
- Missing tools (run bootstrap.sh)
- Template validation (fix template issues)

### ACTION REQUIRED (Human)
Things the user must do manually. For each, provide:
- **What to do** (clear instructions)
- **AWS Console URL** (direct link where possible)
- **Expected time** (rough estimate)
- **Verification command** (how to check it's done)

Common human tasks:
- **Create AWS account**: https://aws.amazon.com/ -- sign up, create IAM user with AdministratorAccess
- **Buy/transfer domain to Route 53**: https://console.aws.amazon.com/route53/home#/DomainRegistration
- **Request ACM certificate**: https://console.aws.amazon.com/acm/home?region=us-east-1#/certificates/request -- request for the domain + *.domain, use DNS validation
- **Verify email in SES**: https://console.aws.amazon.com/ses/home?region=us-east-1#/verified-identities -- add email, click verification link
- **Install gh CLI**: `brew install gh && gh auth login`

## Step 4: Wait for Human Tasks

If there are human action items, tell the user to complete them and then say "ready" or "done" to re-run the checks.

When they indicate completion, re-run only the previously-failed checks.

## Step 5: Update Config

Once all checks pass:
- Update `aws.hostedZoneId` if discovered
- Update `aws.certArn` if discovered
- Set `status.preflightComplete = true`
- Write the updated `site-config.json`

## Step 6: Summary

Tell the user:
- All preflight checks passed
- Suggest running `/grc-portfolio:build` next (if not done) or `/grc-portfolio:infra` to deploy infrastructure

## Variables

- `$TOOLKIT_DIR` = read from `site-config.json` `toolkitDir` field
- `$ARGUMENTS` = arguments passed after `/grc-portfolio:preflight` (expected: project directory path)
