---
description: Generate assessment interview questions mapped to framework controls
---

# Generate Interview Questions

Generates focused client interview questions from a technology stack, maps them to framework controls, and includes practical CLI/API evidence hints.

## Arguments

- `$1` - Technology stack or scope (required, in quotes)
- `$2` - Comma-separated frameworks (optional, defaults to `SOC2,NIST-800-53`)

## Options

Pass options after the arguments:

- `--format=markdown|json` - Output format (default: `markdown`)
- `--limit=N` - Maximum questions to emit (default: `12`)

## Supported Framework Short Names

- `SOC2`
- `NIST` or `NIST-800-53`
- `ISO` or `ISO-27001`
- `PCI` or `PCI-DSS`
- `CIS`
- `CMMC`
- `FedRAMP`

## Instructions

1. Run the generator:

   ```bash
   node plugins/grc-engineer/scripts/generate-interview-questions.js "$ARGUMENTS"
   ```

2. Review each question with the mapped controls and evidence hints.

3. Ask for CLI/API exports where possible instead of screenshots.

4. Save the final question set in the assessment workpaper or interview agenda.

## Examples

```bash
# AWS IAM user interview questions mapped to SOC 2, NIST, and PCI DSS
/grc-engineer:generate-interview-questions "AWS IAM users" SOC2,NIST-800-53,PCI-DSS

# JSON output for downstream tooling
/grc-engineer:generate-interview-questions "AWS S3, CloudTrail" FedRAMP,NIST --format=json

# Mixed stack with a shorter agenda
/grc-engineer:generate-interview-questions "Kubernetes RBAC and GitHub repositories" CIS,SOC2 --limit=5
```

## Example Evidence Hint

For AWS IAM users, the generator prefers programmatic evidence such as:

```bash
aws iam list-users --query 'Users[*].[UserName,Arn,CreateDate]' --output table
```

This gives assessors a repeatable artifact with user names, ARNs, and creation dates instead of a manually captured screenshot.
