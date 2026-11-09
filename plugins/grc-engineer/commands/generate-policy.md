---
description: Generate draft policy templates from natural language requirements
---

# Generate Policy

This prototype selects a fixed template only for exact supported phrases, not a reliable interpretation of arbitrary requirements. **Output is a draft, not an enforceable policy.** Independently review, adapt, and test it before any use. Templates may miss requirements or add unrelated checks; for example the S3 template always includes a Department tag check. No compliance coverage is inferred.

## Arguments

- `$1` - Requirement description (required, in quotes)
- `$2` - Output format (optional, defaults to rego)

## Available templates

- `Ensure no S3 buckets are public`: `rego`, `sentinel`, `aws-config`
- `All EC2 instances must have encryption enabled`: `rego` only

Matching ignores case and surrounding or repeated whitespace; any other wording, extra clauses, or unsupported format combinations fail without generating files. Even semantically equivalent wording is rejected. Terraform and Checkov are not implemented.

## Instructions

Run the generator with a quoted requirement and optional format:

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Ensure no S3 buckets are public" rego
```

Inspect the draft and validate it against representative compliant and noncompliant inputs. Do not deploy it as-is.
