---
name: evidence-artifact-collector
description: Generates CLI commands and API scripts to collect point-in-time evidence for audit controls. Automates evidence gathering from cloud providers (AWS, Azure, GCP) and outputs formatted reports.
allowed-tools: Bash, Read, Glob, Write, Edit
---

# Evidence Artifact Collector

Generates scripts to collect audit evidence from cloud infrastructure. Automates the most labor-intensive part of compliance - evidence gathering.

## Quick Commands

**Generate AWS evidence script:**

```bash
node plugins/grc-engineer/scripts/collect-evidence.js "MFA for all root users" aws
```

**Generate Azure evidence script:**

```bash
node plugins/grc-engineer/scripts/collect-evidence.js "All storage accounts encrypted" azure
```

**Generate GCP evidence script:**

```bash
node plugins/grc-engineer/scripts/collect-evidence.js "IAM bindings audit" gcp
```

## Supported Providers

- **aws** - AWS CLI and boto3 scripts
- **azure** - Azure CLI and Python SDK scripts
- **gcp** - gcloud CLI and Python SDK scripts
- **kubernetes** - kubectl commands
- **terraform** - Terraform state queries

## Output Formats

- **python** - Python script with boto3/azure-sdk/google-cloud
- **bash** - Shell script with CLI commands
- **json** - Direct API query results
- **markdown** - Formatted evidence report
- **pdf** - PDF report (requires additional dependencies)

## Example Controls

- "MFA for all root users"
- "All S3 buckets encrypted"
- "CloudTrail logging enabled"
- "Security groups restrict access"
- "IAM policies follow least privilege"
- "Database encryption at rest"
- "Network ACLs configured"

## Generated Script Features

- Point-in-time evidence collection
- Timestamped results
- Multiple output formats
- Error handling and validation
- Ready-to-run commands

## Example Output

```python
#!/usr/bin/env python3
"""
Evidence Collection Script
Control: MFA for all root users
Provider: AWS
Generated: 2025-01-15T10:30:00Z
"""

import boto3
import json
from datetime import datetime

iam = boto3.client('iam')

def collect_mfa_evidence():
    """Collect evidence for MFA requirement on root users."""
    evidence = {
        "control": "MFA for all root users",
        "timestamp": datetime.utcnow().isoformat(),
        "results": []
    }
    
    # Get account summary
    summary = iam.get_account_summary()
    mfa_enabled = summary['SummaryMap'].get('AccountMFAEnabled', 0)
    
    evidence["results"].append({
        "check": "Root account MFA status",
        "status": "PASS" if mfa_enabled == 1 else "FAIL",
        "details": f"MFA Enabled: {mfa_enabled == 1}"
    })
    
    return evidence

if __name__ == "__main__":
    result = collect_mfa_evidence()
    print(json.dumps(result, indent=2))
```

## Prerequisites

- Control description or control ID
- Optional: Cloud provider (defaults to aws)
- Optional: Output format (defaults to python)
