---
name: collect-evidence
description: Generate scripts to collect audit evidence
---

# Collect Evidence

Generates scripts to collect point-in-time evidence for audit controls.

## Arguments

- Argument 1 - Control description (required, in quotes)
- Argument 2 - Cloud provider (optional, defaults to aws)
- Argument 3 - Output format (optional, defaults to python)

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
   node "${CLAUDE_PLUGIN_ROOT}/scripts/collect-evidence.js" "$ARGUMENTS"
   ```

2. The script generates an evidence collection script.

3. Configure credentials for the cloud provider.

4. Run the generated script to collect evidence.

5. Save the output for audit documentation.

## Examples

```bash
# Collect AWS MFA evidence for SOC 2
/engineer:collect-evidence "MFA for all root users" aws python

# Collect PCI-DSS Requirement 8.4.2 evidence (MFA for CDE access)
/engineer:collect-evidence "MFA for cardholder data environment access" aws bash

# Collect Azure access control evidence
/engineer:collect-evidence "Role-based access controls" azure python

# Collect Kubernetes RBAC evidence
/engineer:collect-evidence "Pod security policies" kubernetes bash
```
