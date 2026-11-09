---
name: policy-as-code-generator
description: Selects draft policy templates for a limited set of S3 and EC2 requirements. Output requires independent review and testing.
allowed-tools: Bash, Read, Glob, Write, Edit
---

# Policy-as-Code Generator

This prototype uses keyword matching, not reliable natural-language policy generation. **Output is a draft, not an enforceable policy.** Templates may omit requested checks or add unrelated ones, and do not establish compliance. Independently review, adapt, and test against representative compliant and noncompliant inputs before any use.

## Available templates

- S3 public access or tags: `rego`, `sentinel`, `aws-config`. Each includes a fixed Department tag check.
- EC2 encryption: `rego` only; also includes a subnet check.

Other requirements and combinations fail without generating files. Terraform and Checkov are not implemented.

## Example

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Ensure no S3 buckets are public" rego
```

The optional second argument selects the format; it defaults to `rego`. The output includes draft code and documentation, not validated test cases.
