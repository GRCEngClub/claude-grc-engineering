---
name: policy-as-code-generator
description: Converts natural language compliance requirements into executable policies (OPA Rego, AWS Config Rules, Sentinel, Terraform). Standardizes governance by making it part of the build process.
allowed-tools: Bash, Read, Glob, Write, Edit
---

# Policy-as-Code Generator

Converts natural language compliance requirements into executable policy code. Generates OPA Rego, AWS Config Rules, Sentinel policies, or Terraform modules.

## Quick Commands

**Generate OPA Rego policy:**

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Ensure no S3 buckets are public and all must have a 'Department' tag" rego
```

**Generate AWS Config Rule:**

```bash
node plugins/grc-engineer/scripts/generate-policy.js "All EC2 instances must have encryption enabled" aws-config
```

**Generate Sentinel policy:**

```bash
node plugins/grc-engineer/scripts/generate-policy.js "Terraform plans must not create resources without required tags" sentinel
```

## Supported Output Formats

- **rego** - Open Policy Agent (OPA) Rego language
- **sentinel** - HashiCorp Sentinel policy language
- **aws-config** - AWS Config Rule (Python/Lambda)
- **terraform** - Terraform policy module
- **checkov** - Checkov YAML policy

## Example Inputs

- "Ensure no S3 buckets are public and all must have a 'Department' tag"
- "All EC2 instances must have encryption enabled and be in a VPC"
- "Terraform plans must not create resources without required tags"
- "Kubernetes pods must not run as root user"
- "All databases must have automated backups enabled"

## Output Structure

Generated policies include:

- Policy definition with clear logic
- Test cases/examples
- Documentation comments
- Integration instructions for CI/CD

## Prerequisites

- Natural language requirement description
- Optional: Output format (defaults to rego)
