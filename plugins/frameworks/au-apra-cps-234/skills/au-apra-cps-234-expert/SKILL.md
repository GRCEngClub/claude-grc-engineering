---
name: au-apra-cps-234-expert
description: APRA CPS 234 expert for Australian prudential information security. Reference-depth framework plugin with scope determination, evidence checklist, and SCF-backed assessment guidance.
allowed-tools: Read, Glob, Grep, Write
---

# APRA CPS 234 Expert

Reference-depth expertise for **APRA Prudential Standard CPS 234 Information
Security**, represented in SCF as `apac-aus-ps-cps-234-2019`. This plugin
bundles the SCF crosswalk (52 SCF controls to 38 framework controls) with
CPS 234-specific assessment context.

## Framework Identity

- **SCF framework ID**: `apac-aus-ps-cps-234-2019`
- **Region**: APAC
- **Country**: AU
- **Regulator**: Australian Prudential Regulation Authority (APRA)
- **Common shorthand**: APRA CPS 234
- **Current assessment baseline**: Prudential Standard CPS 234 Information
  Security, effective July 1, 2019

### Framework In Plain Language

CPS 234 is APRA's prudential information security standard for regulated
financial entities. It requires information security capability that is
commensurate with threats, vulnerabilities, and the sensitivity and criticality
of information assets. For GRC work, treat CPS 234 as an accountability and
resilience framework: the assessor needs to see clear information-asset
ownership, tested controls, incident response readiness, and board-level
oversight of material information security risk.

### Territorial Scope And Applicability

CPS 234 applies to APRA-regulated entities, including authorised deposit-taking
institutions, general insurers, life insurers, private health insurers, RSE
licensees, and other regulated groups within APRA's prudential perimeter. Scope
analysis should identify information assets managed directly, by related
parties, or by third parties, including cloud and outsourced services. Do not
limit the scope to systems hosted in Australia; assets and service providers are
in scope when they support APRA-regulated operations.

### Mandatory Artifacts

Evidence usually centers on information security policy, asset classification
and ownership records, control standards, control testing plans and results,
incident response plans, board or senior management reporting, vulnerability and
threat monitoring, third-party assurance, materiality criteria, and notification
records. CPS 234 does not define a SOC-style report package, but APRA-regulated
entities should be able to show that control design, operating effectiveness,
and incident notification obligations are managed and tested.

### Cadence And Timelines

Control testing frequency should be commensurate with vulnerabilities, threats,
asset criticality, asset sensitivity, and previous test results. CPS 234 also
requires timely notification to APRA for material information security
incidents and for material control weaknesses that cannot be remediated quickly.
Assessment output should preserve both the control-testing cadence rationale and
the evidence that incidents and weaknesses were escalated under the entity's
materiality criteria.

### Regulator And Enforcement

APRA supervises regulated entities through prudential standards, reporting,
reviews, directions, and enforcement action. In assessment output, separate
CPS 234 control evidence from legal advice about licensing, capital impacts, or
specific enforcement exposure.

### Interaction With Other Frameworks

CPS 234 commonly overlaps with CPS 220 risk management, CPS 230 operational
risk, CPS 231 outsourcing for legacy programs, ISO 27001, NIST CSF, SOC 2
security and availability criteria, PCI DSS for payment environments, and the
Australian Essential Eight. Use the SCF crosswalk for control mechanics, but
keep CPS 234 reporting focused on APRA-regulated information assets, control
testing, materiality, third-party reliance, and notification readiness.

### Common Misinterpretations

- **"CPS 234 only covers cyber tools."** It also covers accountability,
  information asset ownership, policy, third-party reliance, testing, and
  incident management.
- **"Only Australian-hosted systems are in scope."** Related-party,
  third-party, cloud, and offshore systems are in scope when they manage
  information assets for an APRA-regulated entity.
- **"Annual penetration testing is enough."** Testing frequency should match
  asset criticality, sensitivity, vulnerabilities, threats, and previous test
  results.
- **"Third-party certificates transfer accountability."** They help, but the
  regulated entity still needs assurance that testing nature and frequency are
  appropriate for its assets.

## Command Routing

- `/au-apra-cps-234:scope` - determine applicability
- `/au-apra-cps-234:assess` - run a gap assessment
- `/au-apra-cps-234:evidence-checklist` - enumerate evidence requirements

`/au-apra-cps-234:assess` delegates to `/grc-engineer:gap-assessment` with SCF
framework ID `apac-aus-ps-cps-234-2019` for the control-by-control mechanics,
and wraps the results in CPS 234-specific terminology.

## Levelling Up To Full

Full-depth plugins add framework-specific workflow commands tied to the audit
ritual. Candidates for this framework:

- `/au-apra-cps-234:asset-criticality-register` - build or review information
  asset ownership, sensitivity, criticality, and control coverage.
- `/au-apra-cps-234:control-testing-plan` - map testing nature and frequency to
  threats, vulnerabilities, asset criticality, and previous results.
- `/au-apra-cps-234:material-incident-triage` - classify whether an incident or
  control weakness likely requires APRA notification.
- `/au-apra-cps-234:third-party-assurance-review` - assess reliance on related
  parties and third-party control testing.

## References

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://hackidle.github.io/scf-api/api/crosswalks/apac-aus-ps-cps-234-2019.json)
- [APRA Prudential Standard CPS 234 Information Security](https://handbook.apra.gov.au/standard/cps-234)
- [APRA Prudential Practice Guide CPG 234 Information Security](https://handbook.apra.gov.au/ppg/cpg-234)
