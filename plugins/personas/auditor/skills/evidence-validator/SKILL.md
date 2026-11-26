---
name: evidence-validator
description: Validates audit evidence artifacts for completeness, timeliness, relevance, and authenticity. Reviews screenshots, logs, configurations, and policies against control requirements.
allowed-tools: Read, Glob, Grep
---

# Evidence Validator

Analyzes and validates evidence artifacts submitted for audit review.

## Capabilities

- **Completeness Check**: Verifies evidence covers all aspects of the control
- **Timeliness Validation**: Confirms evidence is from the audit period
- **Relevance Assessment**: Ensures evidence actually demonstrates the control
- **Authenticity Review**: Identifies potential tampering or inconsistencies

## Evidence Types Supported

- Screenshots and images
- Configuration files (JSON, YAML, XML)
- Log files and exports
- Policy documents (PDF, DOCX, MD)
- Access review spreadsheets
- System-generated reports

## Output Format

Generates evidence review memos with:

- Evidence identification
- Control mapping
- Validation results
- Gaps and recommendations
- Auditor notes

## Example Usage

When reviewing evidence for SOC 2 CC6.1 (Logical Access):

- Validates access review screenshots show appropriate approvals
- Confirms termination evidence matches HR records
- Verifies configuration exports match stated policies
