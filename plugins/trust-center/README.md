# GRC Trust Center

An open-source, serverless trust center for publishing your compliance posture — certifications, policies, and audit reports — with gated access for sensitive documents.

Built as a plugin for the [GRC Engineering Club](https://github.com/GRCEngClub/claude-grc-engineering) toolkit. Addresses [Issue #148](https://github.com/GRCEngClub/claude-grc-engineering/issues/148).

## What It Does

Gives any company a production-ready trust center page where:

- **Public visitors** see your certifications, security overview, and downloadable public reports (e.g., SOC 3)
- **Gated visitors** request access to sensitive documents (SOC 2, individual policies) by signing an NDA via DocuSeal
- **Admins** manage what's published, review access requests, and track who downloaded what

## Architecture

Fully serverless on AWS. Monthly cost for a small company: ~$5-15/mo.

```
┌─────────────┐     ┌──────────┐     ┌─────────────┐
│  CloudFront  │────▶│   WAF    │────▶│  S3 Bucket  │  (React SPA)
└──────┬──────┘     └──────────┘     └─────────────┘
       │
       │  /api/*
       ▼
┌─────────────┐     ┌──────────┐     ┌─────────────┐
│ API Gateway  │────▶│  Lambda  │────▶│  DynamoDB   │
└─────────────┘     └────┬─────┘     └─────────────┘
                         │
                    ┌────▼─────┐     ┌─────────────┐
                    │  Cognito │     │  DocuSeal   │  (NDA e-signatures)
                    └──────────┘     └─────────────┘
                                     ┌─────────────┐
                                     │  S3 (docs)  │  (private doc storage)
                                     └─────────────┘
```

## Tech Stack

| Layer | Service | Why |
|-------|---------|-----|
| CDN / Hosting | CloudFront + S3 | Fast static site, custom domain |
| SSL | ACM | Free managed certificates |
| Firewall | WAF | Rate limiting, bot protection |
| Auth | Cognito | Admin login + gated user pools |
| API | API Gateway (REST) | Serverless API, no servers to manage |
| Compute | Lambda (Python) | Backend logic, pay-per-request |
| Database | DynamoDB | Access requests, doc metadata, audit log |
| Doc Storage | S3 (private bucket) | SOC 2 reports, policies, signed NDAs |
| E-Signatures | DocuSeal (self-hosted) | Open-source NDA signing flow |

## Quick Start

### Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ (for frontend build)
- Python 3.11+ (for Lambda functions)

### Deploy

```bash
# 1. Deploy infrastructure
cd infrastructure/
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name trust-center \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    DomainName=trust.yourcompany.com \
    CompanyName="Your Company"

# 2. Build and upload frontend
cd ../frontend/
npm install && npm run build
aws s3 sync dist/ s3://$(aws cloudformation describe-stacks \
  --stack-name trust-center \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucket`].OutputValue' \
  --output text)

# 3. Upload your documents
aws s3 cp your-soc2-report.pdf s3://DOCS_BUCKET/documents/
```

## Project Structure

```
trust-center/
├── infrastructure/        # CloudFormation templates
│   └── template.yaml      # Full serverless stack
├── backend/
│   └── functions/         # Lambda function code
│       ├── api_handler.py # Main API (CRUD for docs, requests, config)
│       └── authorizer.py  # Custom Cognito authorizer
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Public, Gated, Admin pages
│   │   └── utils/         # API client, auth helpers
│   └── package.json
├── docs/                  # Documentation
│   └── DEPLOYMENT.md      # Step-by-step deploy guide
└── plugin/                # GRC Eng Club plugin wrapper
    └── SKILL.md           # Claude Code skill definition
```

## Contributing

This project is an open-source contribution to the GRC Engineering Club.
See the [main repo's contributing guide](https://github.com/GRCEngClub/claude-grc-engineering/blob/main/docs/CONTRIBUTING.md).

## License

MIT — same as the parent GRC Engineering toolkit.
