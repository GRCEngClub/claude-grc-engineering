---
description: UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell compliance gap assessment
---

# UK NCSC Cyber Essentials Plus (CE+) Assessment

Runs a compliance gap assessment against **UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell** by delegating to `/grc-engineer:gap-assessment` with the framework's SCF identifier, then overlays CE+-specific context and evidence requirements.

## Usage

```
/cyber-essentials-plus:assess [--scope=<scope>] [--sources=<connector-list>]
```

## Arguments

- `--scope=<scope>` (optional) — narrow the assessment to one of the five CE+ controls: `firewalls`, `secure-configuration`, `user-access-control`, `malware-protection`, `patch-management`.
- `--sources=<connector-list>` (optional) — comma-separated connector plugins (e.g. `aws-inspector,github-inspector`).

## What the assessment produces

1. **Compliance score** — overall CE+ readiness percentage, weighted by mapped SCF controls.
2. **Applicable-requirements summary** — which of the five controls apply to the defined certification boundary.
3. **Control-by-control gap** — each of the 5 mapped controls, with pass/fail/inconclusive status from connector findings.
4. **Evidence gaps** — controls where no evidence source is configured.
5. **Remediation roadmap** — prioritized by severity and effort, with the 14-day patching window and MFA-for-cloud requirements flagged as highest priority.

## Delegation

Under the hood:

```
/grc-engineer:gap-assessment "emea-gbr-ce-2021" [--sources=<connector-list>]
```

The SCF crosswalk expands 26 SCF controls into the 5 Cyber Essentials Plus controls.

## Framework-specific assessment notes

### Most commonly requested scope

Full-boundary assessments are the norm — CE+ certifies the entire defined boundary, not individual controls. Partial-scope runs are useful for pre-assessment gap analysis only.

### Known interactions with sibling frameworks

- **ISO 27001**: CE+ five controls map closely to ISO Annex A domains A.8 (Asset Management), A.9 (Access Control), A.12 (Operations Security), and A.13 (Communications Security). Achieving CE+ first provides a solid foundation before pursuing ISO 27001.
- **NIST CSF**: CE+ maps primarily to the Protect function. Use `/grc-engineer:map-controls-unified` to identify overlapping controls before running parallel assessments.
- **GDPR / UK GDPR**: CE+ certification is referenced in ICO guidance as a baseline technical measure for Article 32 security obligations. It does not substitute for a full GDPR assessment.

### Mandatory cadence

- Annual recertification required — CE+ lapses 12 months after the certification date.
- Danzell v3.3 question set is effective **27 April 2026**; assessments submitted on or after that date must use this version.
- No grace period for critical patch application: patches must be applied within **14 days** of release.

### Common misinterpretations this assessment corrects

- **MFA is now mandatory for cloud services** (Danzell v3.3): Many organisations believe MFA is optional or only required for admin accounts. Under v3.3, MFA is required for *all* user accounts accessing *any* cloud service within the boundary.
- **CE vs CE+**: Cyber Essentials (self-assessed) and Cyber Essentials Plus (independently verified) are different certifications. This plugin covers CE+ only. The verification testing in CE+ may surface gaps invisible to self-assessment.
- **Unsupported software must be removed**: Risk-acceptance alone is not sufficient for unsupported OS or software — it must be removed from the boundary or the boundary redrawn.
