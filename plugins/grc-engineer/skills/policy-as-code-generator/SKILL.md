---
name: policy-as-code-generator
description: Selects draft policy templates for a limited set of S3 and EC2 requirements. Output requires independent review and testing.
allowed-tools: Bash, Read, Glob, Write, Edit
---

# Policy-as-Code Generator

This prototype accepts only exact supported phrases, not arbitrary natural-language requirements. **Output is a draft, not an enforceable policy.** Templates may omit requested checks or add unrelated ones, and do not establish compliance. Independently review, adapt, and test against representative compliant and noncompliant inputs before any use.

## Available templates

- `Ensure no S3 buckets are public`: `rego`, `sentinel`, `aws-config`. Each includes a fixed Department tag check.
- `All EC2 instances must have encryption enabled`: `rego` only; also includes a subnet check.

Matching ignores case and surrounding or repeated whitespace; any other wording, extra clauses, or unsupported format combinations fail without generating files. Even semantically equivalent wording is rejected. Terraform and Checkov are not implemented.

## Example

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Ensure no S3 buckets are public" rego
```

The optional second argument selects the format; it defaults to `rego`. The output includes draft code and documentation, not validated test cases.
