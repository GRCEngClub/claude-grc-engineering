---
description: Generate draft policy templates from natural language requirements
---

# Generate Policy

This prototype selects a fixed template only for exact supported phrases, not a reliable interpretation of arbitrary requirements. **Output is a draft, not an enforceable policy.** Independently review, adapt, and test it before any use. Templates may miss requirements or add unrelated checks; for example the S3 template always includes a Department tag check. No compliance coverage is inferred.

## Arguments

- Requirement description (required, in quotes)
- Output format (optional, defaults to rego)

## Available templates

- `Ensure no S3 buckets are public`: `rego`, `sentinel`, `aws-config`
- `All EC2 instances must have encryption enabled`: `rego` only

Matching ignores case and surrounding or repeated whitespace; any other wording, extra clauses, or unsupported format combinations fail without generating files. Even semantically equivalent wording is rejected. Terraform and Checkov are not implemented.

## Instructions

Parse `$ARGUMENTS` as a quoted requirement followed by an optional format.
Pass the actual requirement as the first CLI argument and the format, if supplied,
as the second. Preserve the entire requirement as one argument; do not
substitute an example or silently change either value. Pass arguments safely
without interpreting their contents as shell syntax. Omit the second argument
when no format was supplied so the script defaults to `rego`. If the requirement
is missing or the arguments are ambiguous, ask the user rather than guessing.
Propagate errors without producing a substitute draft.

For example, only for a request for this specific requirement and format:

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Ensure no S3 buckets are public" rego
```

Inspect the draft and validate it against representative compliant and noncompliant inputs. Do not deploy it as-is.
