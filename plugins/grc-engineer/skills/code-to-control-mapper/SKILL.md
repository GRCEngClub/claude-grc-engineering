---
name: code-to-control-mapper
description: Maps infrastructure code (Terraform, Kubernetes, CloudFormation) to compliance controls (ISO 27001, SOC 2, NIST 800-53). Analyzes IaC files and generates compliance evidence mappings showing which controls are satisfied.
allowed-tools: Bash, Read, Glob, Write, Edit
---

# Code-to-Control Mapper

Maps infrastructure-as-code (IaC) files to specific compliance framework controls. Translates technical implementations into audit-ready compliance evidence.

## Quick Commands

**Map a Terraform file to SOC 2:**

```bash
node plugins/grc-engineer/scripts/map-control.js main.tf SOC2
```

**Map Kubernetes manifests to ISO 27001:**

```bash
node plugins/grc-engineer/scripts/map-control.js k8s/deployment.yaml ISO27001
```

**Map CloudFormation template to NIST 800-53:**

```bash
node plugins/grc-engineer/scripts/map-control.js template.yaml NIST80053
```

## Supported Frameworks

- **SOC2** - Service Organization Control 2 (CC6.1, CC7.2, etc.)
- **ISO27001** - ISO/IEC 27001 (Annex A controls)
- **NIST80053** - NIST Special Publication 800-53
- **PCIDSS** - Payment Card Industry Data Security Standard
- **HIPAA** - Health Insurance Portability and Accountability Act
- **GDPR** - General Data Protection Regulation

## Supported IaC Formats

- **Terraform** (.tf, .tfvars)
- **Kubernetes** (.yaml, .yml)
- **CloudFormation** (.yaml, .json)
- **Ansible** (.yml)
- **Pulumi** (.ts, .js, .py)

## Output Format

Generates markdown reports with:

- Control ID and description
- Evidence location (file:line)
- Compliance status (Satisfied/Partial/Not Satisfied)
- Recommendations for improvement

## Example Output

```markdown
# Compliance Mapping Report

## SOC 2 - CC6.1: Logical and Physical Access Controls

**Status:** ✅ Satisfied

**Evidence:**
- `main.tf:45` - `aws_db_instance` with `storage_encrypted = true`
- `main.tf:52` - IAM role with least privilege policy

**Mapping:** Data at rest encryption via AWS KMS satisfies encryption requirements.
```

## Prerequisites

- IaC file to analyze
- Optional: Framework name (defaults to SOC2)
