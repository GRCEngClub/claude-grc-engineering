---
description: Validate AWS CLI, credentials, SES, Route 53, and ACM readiness before deploying infrastructure. Produces a pass/fail report with action items.
---

# AWS Preflight Check

Runs 10 automated checks against your AWS environment to verify everything is ready for deployment. Produces a three-section report: PASS, ACTION AUTOMATED, and ACTION HUMAN (with console links and estimated time for each).

## Arguments

- `$1` — Project directory containing `site-config.json` (optional; defaults to current directory)

## Checks Run

1. AWS CLI installed
2. Node.js v18+ installed
3. npm installed
4. AWS credentials valid (`aws sts get-caller-identity`)
5. Region set to `us-east-1` (required for CloudFront + ACM)
6. CloudFormation template valid
7. SES email verified *(if contact form enabled)*
8. Route 53 hosted zone exists *(if custom domain)*
9. ACM certificate issued in us-east-1 *(if custom domain)*
10. `gh` CLI installed *(for repo/cicd steps)*

## Example

```
/grc-portfolio:preflight ~/Desktop/repos/my-grc-portfolio
/grc-portfolio:preflight
```

## Next Step

Once all checks pass, run `/grc-portfolio:infra` to deploy the AWS infrastructure.
