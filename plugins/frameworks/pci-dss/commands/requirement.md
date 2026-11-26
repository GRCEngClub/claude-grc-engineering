---
description: Deep dive on specific PCI DSS requirement
---

# PCI DSS Requirement Details

Provides detailed guidance on specific PCI DSS v4.0.1 requirements.

## Arguments

- Argument 1 - Requirement number (required: 1-12 or specific like 3.4.2)
- Argument 2 - Focus area (optional: controls, testing, evidence)

## Requirements Overview

| Req | Title | Key Focus |
|-----|-------|-----------|
| 1 | Network Security Controls | Firewalls, network segmentation |
| 2 | Secure Configurations | Hardening, defaults, inventory |
| 3 | Protect Stored Data | Encryption, retention, PAN masking |
| 4 | Cryptography in Transit | TLS, secure transmission |
| 5 | Malware Protection | Anti-malware, updates |
| 6 | Secure Development | SDLC, vulnerabilities, patches |
| 7 | Access Restriction | Need-to-know, least privilege |
| 8 | User Authentication | Passwords, MFA, accounts |
| 9 | Physical Security | Facility access, media |
| 10 | Logging and Monitoring | Audit trails, log review |
| 11 | Security Testing | Scans, pen tests, IDS |
| 12 | Security Policies | Policies, awareness, incidents |

## Sub-requirement Format

Requirements follow pattern: `X.Y.Z`

- X = Major requirement (1-12)
- Y = Section
- Z = Specific control
- Additional: .1, .2 for sub-controls

## Example

```bash
/pci-dss:requirement 3
/pci-dss:requirement 8.4.2 testing
/pci-dss:requirement 6.4.3 evidence
```
