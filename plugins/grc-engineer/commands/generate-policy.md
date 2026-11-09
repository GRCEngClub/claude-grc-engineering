---
description: Generate draft policy templates from natural language requirements
---

# Generate Policy

This prototype selects a fixed template using keywords, not a reliable interpretation of the requirement. **Output is a draft, not an enforceable policy.** Independently review, adapt, and test it before any use. Templates may miss requirements or add unrelated checks; for example the S3 template always includes a Department tag check. No compliance coverage is inferred.

## Arguments

- `$1` - Requirement description (required, in quotes)
- `$2` - Output format (optional, defaults to rego)

## Available templates

- S3 public access or tags: `rego`, `sentinel`, `aws-config`
- EC2 encryption: `rego` only

Other requirements and combinations fail without generating files. Terraform and Checkov are not implemented.

## Instructions

Run the generator with a quoted requirement and optional format:

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Ensure no S3 buckets are public" rego
```

Inspect the draft and validate it against representative compliant and noncompliant inputs. Do not deploy it as-is.
