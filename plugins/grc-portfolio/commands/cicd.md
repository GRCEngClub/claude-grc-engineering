---
description: Set up GitHub Actions CI/CD with OIDC for keyless AWS authentication — automatic deployment on every push to main.
---

# Set Up CI/CD

Configures fully automated deployments using GitHub Actions and GitHub OIDC. No static AWS access keys stored anywhere — the workflow assumes a least-privilege IAM role via OIDC token.

## Arguments

- `$1` — Project directory containing `site-config.json` (optional; defaults to current directory)

## What It Does

1. Creates (or verifies) the GitHub OIDC provider in your AWS account
2. Creates an IAM role scoped to **only** your S3 bucket and CloudFront distribution
3. Generates `.github/workflows/deploy.yml` — triggers on push to `main` and `workflow_dispatch`
4. Commits and pushes the workflow file
5. Verifies the first run completes successfully

## Prerequisites

- `/grc-portfolio:repo` must have run (`status.repoCreated === true`)
- `/grc-portfolio:infra` must have run (`status.infraDeployed === true`)

## Example

```
/grc-portfolio:cicd ~/Desktop/repos/my-grc-portfolio
/grc-portfolio:cicd
```

After this, every `git push` to `main` automatically builds and deploys your portfolio.
