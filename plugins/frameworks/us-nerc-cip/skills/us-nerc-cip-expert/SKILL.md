---
name: us-nerc-cip-expert
description: NERC Critical Infrastructure Protection expert. Reference-depth framework plugin with scope determination, evidence checklist, and SCF-backed assessment guidance for BES Cyber Systems.
allowed-tools: Read, Glob, Grep, Write
---

# NERC CIP Expert

Reference-depth expertise for **NERC Critical Infrastructure Protection (CIP)**
Reliability Standards, represented in SCF as `usa-federal-nerc-cip-2024`. This
plugin bundles the SCF crosswalk (122 SCF controls to 204 framework controls)
with NERC CIP-specific assessment context.

## Framework Identity

- **SCF framework ID**: `usa-federal-nerc-cip-2024`
- **Region**: Americas
- **Country**: US / North American bulk power system jurisdictions
- **Regulators**: North American Electric Reliability Corporation (NERC),
  Regional Entities, and Federal Energy Regulatory Commission (FERC) in the US
- **Common shorthand**: NERC CIP
- **Current assessment baseline**: NERC CIP Reliability Standards represented in
  the 2024 SCF crosswalk

### Framework In Plain Language

NERC CIP is the cybersecurity and physical security standards family for Bulk
Electric System (BES) reliability. It focuses on identifying BES Cyber Systems,
categorizing impact, protecting electronic and physical perimeters, managing
personnel risk, hardening systems, responding to incidents, recovering from
events, protecting information, and managing supply chain risk. For GRC work,
the assessor needs to see repeatable evidence tied to registered functions,
assets, impact ratings, and Reliability Standard requirements.

### Territorial Scope And Applicability

NERC Reliability Standards apply across interconnected North American bulk power
system jurisdictions through NERC, Regional Entities, and applicable regulatory
authorities. Scope analysis starts with registered entity functions such as BA,
DP, GO, GOP, RC, TO, TOP, and TP, then maps Facilities, assets, BES Cyber
Systems, Electronic Security Perimeters, Physical Security Perimeters, and
associated cyber assets. Do not treat NERC CIP as a generic IT security
framework; applicability depends on BES reliability functions and asset impact
categorization.

### Mandatory Artifacts

Evidence usually centers on CIP-002 BES Cyber System categorization records,
asset inventories, impact rating rationale, security management controls,
personnel training and risk assessment records, access authorization lists,
electronic access control evidence, physical access control evidence, system
hardening baselines, vulnerability assessments, patch management records,
incident response plans and exercises, recovery plans and tests, protected
information handling procedures, and supply chain risk management plans.

### Cadence And Timelines

Cadence varies by CIP standard and requirement. Assessors should preserve the
entity's compliance calendar, recurring evidence, dated approvals, test results,
change records, and exception handling. Incident response, recovery testing,
access reviews, vulnerability assessments, patch evaluation, configuration
change management, and training records need dates and scope that align with
the specific requirement being assessed.

### Regulator And Enforcement

NERC develops and enforces Reliability Standards with Regional Entities; FERC
approves and enforces standards in the United States. Non-compliance can lead to
findings, mitigation plans, settlement activity, penalties, and enhanced
oversight. Assessment output should separate control evidence and likely gaps
from legal conclusions about violation risk or penalty exposure.

### Interaction With Other Frameworks

NERC CIP overlaps with NIST CSF, NIST 800-53, ISO 27001, CIS Controls, and
utility-specific operational technology security programs. Use the SCF crosswalk
for control mechanics, but keep NERC CIP reporting focused on BES Cyber System
categorization, registered functions, impact ratings, audit-ready evidence, and
Reliability Standard requirement structure.

### Common Misinterpretations

- **"NERC CIP covers every utility IT system."** It focuses on BES reliability
  assets and cyber systems; enterprise IT may be supporting evidence but is not
  automatically a BES Cyber System.
- **"Low impact means low effort."** Low impact assets still require defined
  programs, security management controls, access controls, incident response,
  and other requirement-specific evidence.
- **"A security tool report is enough."** CIP evidence needs requirement-level
  traceability, responsible entity context, dates, approvals, and scope.
- **"Cloud and vendors are outside CIP."** Supply chain and vendor access can be
  in scope when they affect BES Cyber Systems or associated protected
  information.

## Command Routing

- `/us-nerc-cip:scope` - determine applicability
- `/us-nerc-cip:assess` - run a gap assessment
- `/us-nerc-cip:evidence-checklist` - enumerate evidence requirements

All three delegate to `/grc-engineer:gap-assessment` with SCF framework ID
`usa-federal-nerc-cip-2024` for the control-by-control mechanics, and wrap the
results in NERC CIP-specific terminology.

## Levelling Up To Full

Full-depth plugins add framework-specific workflow commands tied to the audit
ritual. Candidates for this framework:

- `/us-nerc-cip:bes-cyber-system-scope` - build or review CIP-002
  categorization and impact-rating evidence.
- `/us-nerc-cip:access-review-pack` - assemble CIP access authorization,
  revocation, and review evidence.
- `/us-nerc-cip:vulnerability-and-patch-review` - assess vulnerability
  assessment, patch evaluation, mitigation, and exception evidence.
- `/us-nerc-cip:incident-exercise-review` - review incident response plan,
  testing, lessons learned, and reportability evidence.

## References

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://hackidle.github.io/scf-api/api/crosswalks/usa-federal-nerc-cip-2024.json)
- [NERC Reliability Standards](https://nerc.com/pa/Stand/Pages/ReliabilityStandards.aspx)
- [NERC Supply Chain Risk Mitigation Program](https://www.nerc.com/pa/comp/Pages/Supply-Chain-Risk-Mitigation-Program.aspx)
- [FERC 2024 Lessons Learned from Commission-Led Reliability Audits](https://www.ferc.gov/news-events/news/ferc-staff-report-offers-lessons-learned-2024-cip-audits)
