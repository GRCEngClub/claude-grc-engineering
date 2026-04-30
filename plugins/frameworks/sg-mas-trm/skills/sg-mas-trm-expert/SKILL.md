---
name: sg-mas-trm-expert
description: Singapore MAS Technology Risk Management Guidelines expert. Reference-depth framework plugin with scope determination, evidence checklist, and SCF-backed assessment guidance for Singapore-regulated financial institutions.
allowed-tools: Read, Glob, Grep, Write
---

# Singapore MAS TRM Expert

Reference-depth expertise for the **Monetary Authority of Singapore (MAS)
Technology Risk Management Guidelines**, represented in SCF as
`apac-sgp-mas-trm-2021`. This plugin bundles the SCF crosswalk (214 SCF controls
to 280 framework controls) with MAS TRM-specific assessment context.

## Framework Identity

- **SCF framework ID**: `apac-sgp-mas-trm-2021`
- **Region**: APAC
- **Country**: SG
- **Regulator**: Monetary Authority of Singapore (MAS)
- **Common shorthand**: MAS TRM / Singapore TRM
- **Current assessment baseline**: MAS Technology Risk Management Guidelines,
  revised January 18, 2021

### Framework In Plain Language

MAS TRM is Singapore's supervisory guidance for managing technology and cyber
risk in financial institutions. It focuses on board and senior management
oversight, technology risk governance, system resilience, cyber security,
software development, third-party and cloud risk, incident response, and data
protection controls. Treat it as a financial-services technology risk framework:
the assessor needs to see accountable governance, repeatable operational
controls, and evidence that critical systems are resilient and monitored.

### Territorial Scope And Applicability

MAS TRM applies to financial institutions regulated by MAS, including banks,
insurers, capital markets intermediaries, payment service providers, and other
regulated entities that depend on technology to deliver financial services.
Scope analysis should identify Singapore-regulated entities, critical systems,
outsourced service providers, cloud-hosted workloads, customer-facing digital
channels, and regional shared-service platforms supporting Singapore operations.
Do not treat MAS TRM as a generic ISO 27001 checklist; the Singapore regulatory
perimeter and criticality of financial services matter.

### Mandatory Artifacts

Evidence usually centers on board-approved technology risk policies, technology
risk registers, critical system inventories, risk assessments, cyber resilience
plans, secure SDLC records, vulnerability and penetration test results,
privileged access reviews, incident response procedures, outsourcing due
diligence, cloud risk assessments, business continuity and disaster recovery test
records, and independent assurance reports. MAS TRM is guidance rather than a
standalone certification package, so map artifacts to supervisory expectations
instead of inventing a formal certificate deliverable.

### Cadence And Timelines

There is no annual MAS TRM certificate cycle. Assess recurring operating
evidence on a risk-based cadence, with stronger scrutiny for critical systems:
access reviews, vulnerability management, penetration testing, resilience tests,
third-party reviews, and incident exercises should run often enough to support
board and senior management oversight. MAS-regulated entities should also align
incident escalation and notification evidence with applicable MAS notices,
outsourcing requirements, and internal materiality thresholds.

### Regulator And Enforcement

The Monetary Authority of Singapore supervises regulated financial institutions
and can use inspections, supervisory findings, directions, penalties, and other
regulatory measures when technology risk management is weak. In assessment
output, separate MAS TRM control evidence from legal advice about notices,
licensing, or penalty exposure.

### Interaction With Other Frameworks

MAS TRM commonly overlaps with ISO 27001/27002, SOC 2 security and availability
criteria, NIST CSF, PCI DSS for payment environments, Singapore PDPA for
personal data, and outsourcing/cloud risk requirements. Use the SCF crosswalk
for control mechanics, but keep MAS TRM reporting focused on financial
institution governance, critical system resilience, cyber operations, secure
development, outsourcing, and technology incident readiness.

### Common Misinterpretations

- **"MAS TRM only applies to Singapore-hosted systems."** Offshore platforms,
  shared services, and outsourced providers can be in scope when they support
  Singapore-regulated financial services.
- **"ISO 27001 certification is enough."** ISO 27001 helps, but MAS TRM expects
  Singapore financial-sector governance, critical-system resilience, outsourcing,
  and supervisory evidence.
- **"Cloud is out of scope if the provider is certified."** MAS-regulated
  institutions still need due diligence, risk assessment, monitoring, exit
  planning, and accountability for outsourced or cloud services.
- **"TRM is only an IT operations checklist."** Board and senior management
  accountability, risk acceptance, and independent assurance are central.

## Command Routing

- `/sg-mas-trm:scope` - determine applicability
- `/sg-mas-trm:assess` - run a gap assessment
- `/sg-mas-trm:evidence-checklist` - enumerate evidence requirements

All three delegate to `/grc-engineer:gap-assessment` with SCF framework ID
`apac-sgp-mas-trm-2021` for the control-by-control mechanics, and wrap the
results in MAS TRM-specific terminology.

## Levelling Up To Full

Full-depth plugins add framework-specific workflow commands tied to the audit
ritual. Candidates for this framework:

- `/sg-mas-trm:critical-system-register` - build or review the inventory of
  critical systems, owners, dependencies, RTO/RPO, and resilience evidence.
- `/sg-mas-trm:outsourcing-cloud-review` - assess cloud and outsourced service
  providers against due diligence, monitoring, exit, and concentration-risk
  expectations.
- `/sg-mas-trm:cyber-resilience-check` - review monitoring, vulnerability,
  penetration testing, incident response, and recovery exercise evidence.
- `/sg-mas-trm:board-pack` - summarize technology risk posture and open issues
  for board or senior management oversight.

## References

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://hackidle.github.io/scf-api/api/crosswalks/apac-sgp-mas-trm-2021.json)
- [MAS Technology Risk Management Guidelines, January 18 2021](https://www.mas.gov.sg/-/media/MAS/Regulations-and-Financial-Stability/Regulatory-and-Supervisory-Framework/Risk-Management/TRM-Guidelines-18-January-2021.pdf)
- [Monetary Authority of Singapore](https://www.mas.gov.sg/)
