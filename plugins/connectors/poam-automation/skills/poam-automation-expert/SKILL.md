---
name: poam-automation-expert
description: "Expertise in FedRAMP POA&M lifecycle management, FedRAMP 20x VDR generation, and vulnerability classification using CISA KEV, EPSS, N-ratings, LEV/IRV, and NIST 800-53 control mappings."
---

# POA&M Automation Expert

## Tool Behavior

This connector wraps the FedRAMP POA&M Automation Tool — a Python CLI that manages the full vulnerability finding lifecycle from scanner import through FedRAMP 20x VDR generation.

### What it does

- Parses raw scanner exports (Nessus, Tenable, Qualys, Wiz) into a structured FedRAMP POA&M
- Auto-deduplicates findings across scanner imports using title + asset identifier
- Enriches findings with NIST 800-53 control mappings via keyword matching
- Manages finding lifecycle: update, close, deviation (false positive / operational requirement)
- Generates FedRAMP 20x VDR reports with live CISA KEV and EPSS enrichment
- Generates per-release Product VDR reports for customer-facing vulnerability disclosure
- Outputs machine-readable JSON alongside every Excel report

### VDR Classification Logic

Each finding is classified using live threat intelligence:

- **CISA KEV**: Finding CVE is checked against the live CISA Known Exploited Vulnerabilities catalog. KEV findings are bumped to minimum N3 adverse impact.
- **EPSS**: Exploit Prediction Scoring System score fetched from First.org API. Score ≥ 0.10 triggers LEV classification.
- **LEV/NLEV**: Likely Exploitable / Not Likely Exploitable. Determined by KEV membership, EPSS score, and severity fallback.
- **IRV/NIRV**: Internet Reachable / Not Internet Reachable. Derived from keywords in asset identifier and weakness description.
- **N-Rating**: N1 (lowest) to N5 (highest) adverse impact. Base rating derived from severity, then adjusted upward for KEV and IRV+LEV combinations.

### Evaluation Deadlines

Per FedRAMP 20x baseline:
- High: 2 days from detection
- Moderate: 5 days from detection
- Low: 7 days from detection

### Auto-Acceptance Threshold

Findings open 192+ days are automatically moved to the Accepted Vulnerabilities sheet per VDR-TFR-MAV.

### Update Frequency Requirements

- High baseline: Weekly (every 7 days)
- Moderate baseline: Every 14 days
- Low baseline: Monthly (every 30 days)

## Control Coverage

This connector maps findings to NIST 800-53 Rev 5 controls via keyword matching across 30+ control families including SI-2, RA-5, AC-2, AC-3, SC-8, SC-28, AU-2, CM-6, CM-7, and others.

## Failure Modes

- **Missing openpyxl**: Install with `pip install openpyxl`
- **CISA KEV unavailable**: Offline fallback uses severity-based LEV classification
- **EPSS unavailable**: Offline fallback uses severity-based LEV classification
- **POA&M file open in Excel**: Close the file before running any write command
- **Duplicate findings**: Automatically skipped on import — same title + asset identifier

## Limitations

- Product VDR requires a manually maintained vulnerability CSV — it does not auto-discover product vulnerabilities
- NIST control mapping is keyword-based, not authoritative — review mappings before submission
- AI remediation text requires Ollama running locally with the Mistral model
