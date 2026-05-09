# grc-portfolio

Build and deploy a professional portfolio website for GRC engineers — certifications, frameworks, audit experience, tools, and projects — hosted on AWS with global CDN and HTTPS.

## Install

```bash
/plugin marketplace add GRCEngClub/claude-grc-engineering
/plugin install grc-portfolio@grc-engineering-suite
```

## Workflow

```bash
/grc-portfolio:plan ~/Desktop/repos/my-portfolio    # GRC questionnaire → site-config.json
/grc-portfolio:build                                 # scaffold React/Vite project
/grc-portfolio:preflight                             # validate AWS readiness
/grc-portfolio:infra                                 # deploy S3 + CloudFront + Route 53
/grc-portfolio:deploy                                # build + sync to S3 + invalidate CDN
/grc-portfolio:repo                                  # create GitHub repo + push
/grc-portfolio:cicd                                  # GitHub Actions OIDC auto-deploy
```

## What the Plan Step Captures

- **Identity** — name, title, years in GRC, LinkedIn, GitHub, location
- **Frameworks** — SOC 2, ISO 27001, NIST 800-53, FedRAMP, PCI-DSS, CMMC, HITRUST, GDPR, and 12 more
- **Certifications** — CISSP, CISA, CISM, CPA, CIA, CRISC, CCSP, Security+, and more
- **Experience** — career accomplishments, GRC tools used (Vanta, Drata, ServiceNow, Archer, etc.), cloud platforms
- **Projects** — GRC automation tools, GitHub repos, descriptions
- **Writing & Speaking** — articles, conference talks, podcast appearances, open-source contributions
- **Design** — deep navy/slate (default), dark charcoal, or white/teal; custom domain optional

## Generated Site Sections

- Hero — name, title, professional summary
- Frameworks — visual grid of mastered compliance frameworks
- Certifications — badge-style list with active and in-progress certs
- Experience — accomplishments and career highlights
- Projects — GRC automation and tooling projects
- Speaking / Writing — publications, talks, podcasts
- Contact — optional contact form (AWS Lambda + SES)

## Prerequisites

- AWS CLI v2 (`brew install awscli`)
- Node.js 18+ (`brew install node`)
- `gh` CLI for repo/cicd commands (`brew install gh`)
- AWS account with IAM permissions to create CloudFormation stacks

## Bundled Assets

| Directory | Contents |
|---|---|
| `scripts/` | bootstrap.sh, deploy.sh, validate-stack.sh, setup-ses-iam-user.sh |
| `cloudformation/` | website-infrastructure.yaml, website-infrastructure-no-domain.yaml, contact-form-api.yaml |
| `lambda/` | contact-form-handler.js (Node.js + SES) |
| `examples/` | React 18 + Vite 5 project template |
| `templates/` | site-config-template.json, SITE-PLAN-TEMPLATE.md |

## AWS Cost

~$1–5/month after AWS free tier. CloudFront + S3 is extremely cost-effective for static sites.
