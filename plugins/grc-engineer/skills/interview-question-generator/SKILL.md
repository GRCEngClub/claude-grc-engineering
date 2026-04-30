---
name: interview-question-generator
description: Generates focused assessor interview questions from a technology stack and maps them to compliance frameworks with practical CLI/API evidence hints.
allowed-tools: Bash, Read, Glob
---

# Interview Question Generator

Use this skill when preparing audit or assessment interview questions for a client environment. It helps avoid broad screenshot requests by producing targeted questions, expected evidence, and programmatic collection hints.

## Quick Commands

**Generate markdown questions:**

```bash
node plugins/grc-engineer/scripts/generate-interview-questions.js "AWS IAM users" SOC2,NIST-800-53,PCI-DSS
```

**Generate JSON for downstream tooling:**

```bash
node plugins/grc-engineer/scripts/generate-interview-questions.js "GitHub branch protection" SOC2 --format=json
```

**Limit output for a short interview block:**

```bash
node plugins/grc-engineer/scripts/generate-interview-questions.js "Okta MFA" ISO27001 --limit=5
```

## Supported Stack Hints

- AWS IAM users and groups
- AWS S3 encryption and access
- AWS CloudTrail logging
- Kubernetes RBAC
- GitHub repository controls
- Okta identity controls

If no stack-specific profile matches, the generator falls back to a generic assessment profile.

## Assessment Use

- Start with the client technology stack and target frameworks.
- Review the mapped controls before sending questions to stakeholders.
- Prefer CLI/API evidence hints when they can replace manual screenshots.
- Treat generated questions as an assessor starting point, not as a full test plan.
