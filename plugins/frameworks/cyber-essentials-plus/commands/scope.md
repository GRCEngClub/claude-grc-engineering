---
description: Determine which parts of UK NCSC Cyber Essentials Plus (CE+) apply to the organization
---

# UK NCSC Cyber Essentials Plus (CE+) Scope

Determines whether and how **UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell** applies to the organization. Reference-depth scope is a decision-tree prompt; Full-depth plugins extend this with jurisdiction-aware logic.

## Usage

```
/cyber-essentials-plus:scope
```

## What this produces

- **Applicability verdict**: In-scope / out-of-scope / partially in-scope, with the triggers that led there
- **In-scope entity types**: organizations handling UK government contracts, consumer-facing services, or any entity seeking CE+ certification
- **In-scope systems**: all devices that can access organisational data or services — laptops, desktops, servers, cloud tenants, mobile devices, and network devices in scope boundary
- **Jurisdiction reach**: UK-based operations; mandatory for UK government supply chain contracts
- **Carve-outs**: operational technology (OT/ICS), IoT devices without IP connectivity, and systems explicitly excluded from the certification boundary by the certifying body
- **Next steps**: whether to proceed with `/cyber-essentials-plus:assess` or `/cyber-essentials-plus:evidence-checklist`

## Framework-specific scope triggers

CE+ scope depends on (at minimum):

- **Certification boundary** — the applicant defines the boundary; the assessor verifies all in-boundary devices meet all five controls. Boundary must include all devices that access organisational data or services.
- **Cloud services** — any cloud service (SaaS, IaaS, PaaS) used within the boundary is in scope. MFA is mandatory for all cloud services under Danzell v3.3 (effective 27 April 2026).
- **Bring Your Own Device (BYOD)** — devices used to access organisational data are in scope unless explicitly excluded and compensating controls documented.
- **Annual recertification** — CE+ certification lapses after 12 months; scope must be re-confirmed at each cycle.
- **Government supply chain** — UK government contracts handling personal data or sensitive information typically mandate CE+ as a minimum.
- **Entity classification** — sole traders, SMEs, and large enterprises are all eligible; there is no revenue or headcount threshold.

This scope command should ask only the questions that actually matter for CE+, then output the applicability verdict without asking the user to search through the whole question set.
