---
description: Generate scripts to collect audit evidence
---

# Collect Evidence

Generates scripts to collect point-in-time evidence for audit controls.

## Arguments

- `$1` - Control description (required, in quotes)
- `$2` - Cloud provider (optional, defaults to aws)
- `$3` - Output format (optional, defaults to python)

## Supported Providers

- aws
- azure
- gcp
- kubernetes

## Supported Formats

- python - Python script with SDK
- bash - Shell script with CLI commands

## Instructions

1. Run the collect-evidence script:

   ```bash
   node plugins/grc-engineer/scripts/collect-evidence.js "$ARGUMENTS"
   ```

2. The script generates an evidence collection script.

3. Configure credentials for the cloud provider.

4. Run the generated script to collect evidence.

5. Save the output for audit documentation.

## Examples

```bash
# Collect AWS MFA evidence for SOC 2
/grc-engineer:collect-evidence "MFA for all root users" aws python

# Collect PCI-DSS Requirement 8.4.2 evidence (MFA for CDE access)
/grc-engineer:collect-evidence "MFA for cardholder data environment access" aws bash

# Collect Azure access control evidence
/grc-engineer:collect-evidence "Role-based access controls" azure python

# Collect Kubernetes RBAC evidence
/grc-engineer:collect-evidence "Pod security policies" kubernetes bash
```
