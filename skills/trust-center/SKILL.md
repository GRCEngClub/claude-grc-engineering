---
name: trust-center
description: >
  Deploy a serverless trust center to publish your company's compliance posture.
  Creates a public page showing certifications and compliance stats, plus a gated
  access flow for sensitive documents (SOC 2 reports, policies) with NDA signing.
  Supports AWS deployment (S3, CloudFront, Lambda, DynamoDB, Cognito, WAF).
version: 1.0.0
author: GRC Engineering Club
tags: [trust-center, compliance, soc2, grc, serverless]
---

# Trust Center Plugin

Creates and deploys a trust center for any organization — a public-facing page
showing compliance certifications, downloadable reports, and a gated access
workflow for sensitive documents.

## Commands

### `/trust-center:init`
Initialize a trust center project in the current directory.

**What it does:**
1. Scaffolds the project structure (infrastructure, backend, frontend)
2. Asks for company name, certifications, and admin email
3. Generates CloudFormation template customized to your answers
4. Creates seed data script from your compliance info

**Usage:**
```
/trust-center:init
```

### `/trust-center:add-document`
Add a document to the trust center.

**What it does:**
1. Asks for document name, description, category, and access level
2. Updates the seed data script
3. If deployed, updates DynamoDB directly

**Usage:**
```
/trust-center:add-document --name "SOC 2 Type II" --access gated --category "Audit Reports"
```

### `/trust-center:deploy`
Deploy the trust center to AWS.

**What it does:**
1. Validates AWS credentials and region
2. Deploys CloudFormation stack
3. Packages and uploads Lambda function
4. Runs seed data script
5. Builds and uploads React frontend
6. Outputs the live URL

**Usage:**
```
/trust-center:deploy --email admin@company.com
/trust-center:deploy --email admin@company.com --domain trust.company.com
```

### `/trust-center:status`
Check the deployment status.

**Usage:**
```
/trust-center:status
```

## Architecture

Fully serverless on AWS (~$5-15/mo for a small company):

- **S3 + CloudFront** — Static site hosting with CDN
- **WAF** — Rate limiting and bot protection
- **API Gateway + Lambda** — Backend API
- **DynamoDB** — Document metadata, access requests, audit log
- **Cognito** — Admin authentication
- **DocuSeal** (optional) — NDA e-signatures for gated access

## Access Model

| Tier | Who | What They See |
|------|-----|---------------|
| Public | Anyone | Certifications, compliance stats, SOC 3 report |
| Gated | After request + approval | SOC 2 report, individual policies |
| Admin | Cognito admins group | Approve/deny requests, manage documents, audit log |

## Integration with GRC Engineer

Works alongside other GRC Engineering Club plugins:

- Use `/grc-engineer:gap-assessment` output to populate trust center stats
- Use `/grc-engineer:collect-evidence` artifacts as gated documents
- Trust center displays certifications that `/soc2:*` and other framework plugins validate
