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

## Explicit source-based draft

For a separately scoped Rego v1 draft, supply a JSON specification with an exact
resource type, tag key and source citation and excerpt. The source is supplied
by the user and is **not verified**; no control IDs or compliance claims are
inferred. Example `spec.json`:

```json
{
  "format": "rego",
  "resource_type": "aws_s3_bucket",
  "required_tag": "Owner",
  "source": {
    "reference": "Internal tagging policy, section 3",
    "excerpt": "S3 buckets must have an Owner tag."
  }
}
```

```bash
node plugins/grc-engineer/scripts/generate-policy.js --spec spec.json
```

The CLI also writes a paired `.test.rego` starter file and prints the exact
`opa test` command for both files. The three examples cover a missing tag, a
present tag, and an unknown tag; they are not a comprehensive test suite or
proof of compliance. Review and extend them for the actual environment.

All fields are mandatory; extra fields, other resources and other formats fail
without producing files. Input is Terraform `show -json` plan data. The `deny`
set identifies managed S3 buckets with a known absent/null tag value; empty strings
pass. The separate `warning` set identifies indeterminate unknown or malformed
change/tag data, including missing/null tag objects and missing unknown metadata.
Consumers must inspect **both** sets. Terraform `after_unknown` marks unknown whole
objects or individual tag values; pure `["delete"]` actions are excluded, while
replacement actions are evaluated. Data sources are excluded. Provider default
tags, plan completeness, schema validation, other resources and tag value quality
are not established. Neither empty set is evidence of compliance.
The source and draft must be independently verified and the rule adapted and
tested on representative compliant, noncompliant, unknown and malformed plans
before any enforcement. Run the regression tests with OPA v1 installed via
`OPA_BIN=/path/to/opa node --test tests/explicit-policy-draft.test.js`; without
OPA the behavior test is explicitly skipped. Set `REQUIRE_OPA=1` to fail if
OPA is unavailable; CI installs a checksum-pinned OPA and requires it.

## Example

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Ensure no S3 buckets are public" rego
```

The optional second argument selects the format; it defaults to `rego`. The output includes draft code and documentation, not validated test cases.
