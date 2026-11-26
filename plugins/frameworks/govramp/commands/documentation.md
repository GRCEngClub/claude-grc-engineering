---
description: GovRAMP package documentation by verification status (SSP, RAR, SAR, POA&M, ConMon)
---

# GovRAMP Documentation Guidance

Explains what goes into a GovRAMP submission for each verification status and how to prepare it. GovRAMP still uses an SSP and POA&M. FedRAMP's 2026 rules replaced those for federal work, so don't carry FedRAMP 20x terms into a GovRAMP package. For FedRAMP, use the `fedramp-20x` plugin.

## Arguments

- `$1` - Document (optional: `ssp`, `rar`, `sar`, `poam`, `conmon`, `all`; default `all`)
- `$2` - Target status (optional: `core`, `ready`, `authorized`; default `core`)

## Templates come from GovRAMP

GovRAMP publishes service provider packages for Low, Moderate, and High, and a Core evidence collection package with examples and folders for all 60 Core controls. Download the current versions from [govramp.org/core](https://govramp.org/core) and [govramp.org/authorized](https://govramp.org/authorized) and work from them rather than from older StateRAMP or FedRAMP Rev5 templates.

## What each status needs

### Core Verification

GovRAMP lists these items for a Core Service Request:

- System Security Plan (SSP)
- System diagrams
- Policies and procedures, including the Configuration Management Plan, Incident Response Plan, and Contingency Plan
- User guide
- Rules of behavior
- Plans catalog
- 90 days of continuous monitoring data and a POA&M
- Applicable laws and regulations

The PMO reviews these together with scan results. It is not a self-attestation, so every control claim needs evidence behind it.

### Ready Verification

Everything Core needs, for the 80 Ready controls, plus a **Readiness Assessment Report (RAR)** from a GovRAMP 3PAO. A current FedRAMP Ready package can be reused toward GovRAMP Ready.

### Authorized / Provisional Verification

- The full service provider package for the chosen impact level, with the SSP covering the whole baseline
- A **Security Assessment Report (SAR)** from a GovRAMP 3PAO
- A POA&M for open findings
- Approval by a government sponsor or the GovRAMP Approvals Committee

GovRAMP Fast Track accepts existing federal RAR, SAR, and ConMon material in place of repeating an assessment.

## Writing the SSP

For each control in scope:

- **Status**: implemented, partially implemented, planned, or not applicable (with the reason).
- **Responsibility**: provider, customer, shared, or inherited, naming the provider you inherit from and its GovRAMP or FedRAMP status.
- **Implementation**: how the control is met in this system, naming the tools, settings, and teams. "We follow best practices" fails review.
- **Evidence**: where the reviewer will find proof, keyed to the evidence folder.

Keep the authorization boundary diagram, data flow diagrams, and inventory consistent with each other and with the SSP text. Reviewers check them against each other.

## Writing the POA&M

One row per weakness: the control, the source (scan, 3PAO finding, self-identified), the risk rating, the planned fix, milestones, the owner, and the scheduled completion date. Take remediation deadlines from GovRAMP's [Continuous Monitoring Guide and Escalation Process](https://govramp.org/hubfs/Continuous%20Monitoring%20Guide%20and%20Escalation%20Process.pdf), not from memory. Provisional status can carry limited POA&M items tied to unverified dependencies.

## Continuous monitoring deliverables

- **Core**: quarterly ConMon, reviewed by the PMO.
- **Ready and Authorized/Provisional**: monthly ConMon. Authorized/Provisional also has an annual reassessment.

Participating governments can request access to a provider's ConMon profile through GovRAMP. The provider must approve the request.

## Pre-submission checklist

- [ ] Using the current GovRAMP template for the status and impact level
- [ ] No TBDs or placeholder text in the SSP
- [ ] Boundary, data flow, and inventory agree with each other
- [ ] Every inherited control names its source and that source's status
- [ ] Evidence folders match the control numbering in the package
- [ ] POA&M includes every open scan and assessment finding
- [ ] 90 days of ConMon data included (Core)
- [ ] RAR or SAR from a GovRAMP 3PAO attached (Ready and Authorized)

## Examples

```bash
/govramp:documentation
/govramp:documentation ssp core
/govramp:documentation poam authorized
/govramp:documentation conmon ready
```

## Related commands

1. `/govramp:assess` to check readiness before writing
2. `/govramp:evidence-checklist` for control-level evidence
3. `/govramp:impact-select` to choose the baseline for Ready and Authorized
