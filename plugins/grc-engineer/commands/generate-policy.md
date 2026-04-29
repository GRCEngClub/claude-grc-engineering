---
description: Generate policy-as-code from natural language requirements
---

# Generate Policy

Converts natural language compliance requirements into executable policy code.

## Arguments

- `$1` - Requirement description (required, in quotes)
- `$2` - Output format (optional, defaults to rego)

## Supported Formats

- rego - Open Policy Agent (OPA) Rego
- sentinel - HashiCorp Sentinel
- aws-config - AWS Config Rule (Python)
- terraform - Terraform policy module
- checkov - Checkov YAML policy

## Instructions

1. Run the generate-policy script:

   ```bash
   node plugins/grc-engineer/scripts/generate-policy.js "$ARGUMENTS"
   ```

2. The script generates policy code in the specified format.

3. Review and integrate the policy into your CI/CD pipeline.

## Examples

```bash
# Generate OPA policy for S3 bucket security
/grc-engineer:generate-policy "Ensure no S3 buckets are public and all must have a 'Department' tag" rego

# Generate PCI-DSS Requirement 3 policy (protect stored data)
/grc-engineer:generate-policy "All databases storing cardholder data must use encryption at rest" aws-config

# Generate network segmentation policy for PCI-DSS Requirement 1
/grc-engineer:generate-policy "Cardholder data environment must be isolated via network segmentation" sentinel

# Generate HIPAA encryption policy
/grc-engineer:generate-policy "All PHI storage must use AES-256 encryption" terraform
```
