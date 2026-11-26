---
name: sync-docs
description: Sync latest FedRAMP 20X policies from official repository
---

# Sync FedRAMP Docs

Synchronizes the latest FedRAMP 20X machine-readable policies from the official FedRAMP/docs GitHub repository.

## Arguments

- Argument 1 - Sync mode (optional: check, full, force)

## Sync Modes

- **check** - Check for updates without downloading
- **full** - Download all policy files
- **force** - Force re-download even if up-to-date

## Policy Files Synced

From https://github.com/FedRAMP/docs:

| File | Description |
|------|-------------|
| FRMR.KSI | Key Security Indicators |
| FRMR.VDR | Vulnerability Detection and Response |
| FRMR.MAS | Minimum Assessment Scope |
| FRMR.PVA | Persistent Validation and Assessment |
| FRMR.ICP | Incident Communications Procedures |
| FRMR.SCN | Significant Change Notifications |
| FRMR.CCM | Collaborative Continuous Monitoring |
| FRMR.ADS | Authorization Data Sharing |
| FRMR.RSC | Recommended Secure Configuration |
| FRMR.UCM | Using Cryptographic Modules |
| FRMR.FSI | FedRAMP Security Inbox |
| FRMR.FRD | FedRAMP Definitions |

## Output

- List of updated policies
- Changelog of what changed
- New requirements identified
- Deprecations noted

## Example

```bash
/fedramp-20x:sync-docs check
/fedramp-20x:sync-docs full
```
