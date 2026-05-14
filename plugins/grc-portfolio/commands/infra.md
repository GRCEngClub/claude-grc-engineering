---
description: Deploy AWS CloudFormation stacks for S3, CloudFront, Route 53, ACM, and optionally the contact form Lambda + API Gateway.
---

# Deploy Infrastructure

Provisions all AWS infrastructure needed to host your GRC portfolio using CloudFormation:

- **S3 bucket** — stores your built website files
- **CloudFront distribution** — global CDN with HTTPS
- **Route 53** + **ACM certificate** — custom domain with SSL *(if configured)*
- **Lambda + API Gateway** — contact form backend *(if configured)*

Deployment takes ~5–15 minutes. Stack outputs (bucket name, distribution ID, CloudFront URL) are automatically saved back to `site-config.json`.

## Arguments

- `$1` — Project directory containing `site-config.json` (optional; defaults to current directory)

## Prerequisite

Run `/grc-portfolio:preflight` first. All checks must pass.

## Example

```
/grc-portfolio:infra ~/Desktop/repos/my-grc-portfolio
/grc-portfolio:infra
```

## Next Step

Run `/grc-portfolio:deploy` to build and push your site to the new infrastructure.
