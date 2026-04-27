---
name: ch-fadp-expert
description: Swiss Federal Act on Data Protection (nFADP) expert. Deep knowledge of the revised 2023 Swiss FADP including voluntary DSO, risk-based breach notification, individual criminal enforcement, Swiss transfer mechanisms, and key divergences from GDPR.
allowed-tools: Read, Glob, Grep, Write
---

# Swiss FADP Expert

Deep expertise in the Swiss Federal Act on Data Protection (nFADP) — Switzerland's comprehensive data protection law revised in 2023.

## Expertise Areas

### Framework Overview

**Swiss Federal Act on Data Protection (FADP)** — Revised 2023 (nFADP/nDSG)
**Effective Date**: September 1, 2023
**Scope**: Protection of personality and fundamental rights relating to data processing
**Articles**: 60+ articles across 10 sections

**Territorial Scope**:

- **Establishment**: Swiss law applies to controllers/processors established in Switzerland
- **Effects in Switzerland**: Offers goods/services to Swiss data subjects OR monitors behavior in Switzerland
- **Applies**: Even if organization not in Switzerland

**Material Scope**:

- Automated processing of personal data
- Manual processing in filing systems
- **Exemptions**: Personal/household use, purely professional activities with limited risk

**Switzerland is not an EU member state**. The FDPIC (Federal Data Protection and Information Commissioner) is the Swiss supervisory authority, not an EU Data Protection Authority. Swiss adequacy decisions are separate from EU adequacy.

**Enforcement Model**:

- **Individual criminal liability**: Responsible individuals face criminal sanctions up to CHF 250,000
- **Not entity-level fines**: Enforcement targets the responsible person, not the legal entity
- **FDPIC enforcement**: Administrative orders and compliance measures

### Key Obligations

#### **Processing Records (RoPA)**

- Controllers must maintain records of processing activities
- **SME carve-out**: Organizations with fewer than 250 employees may be exempt from full records UNLESS processing is likely to result in high risk to personality rights
- **Content**: Similar to GDPR Article 30 but streamlined for Swiss context

#### **Privacy by Design and Default**

- Controllers must implement appropriate technical and organizational measures
- **Built-in privacy**: At time of determining processing means and during processing itself
- **Default settings**: Most protective configuration by default
- **Focus**: Data minimization, pseudonymization, transparency

#### **Transparency / Privacy Notice**

- Controllers must provide clear information about processing
- **Timing**: At collection or before processing begins
- **Content**: Identity of controller, purposes of processing, categories of data, recipients
- **Special categories**: Additional disclosure for sensitive data processing
- **Data subject rights**: Information about access, rectification, objection rights

#### **Data Subject Rights**

- **Right of Access**: Data subjects can request confirmation of processing and access to their data
- **Right to Rectification**: Inaccurate data must be corrected
- **Right to Erasure**: Data must be deleted if no longer necessary for processing purpose
- **Right to Data Portability**: Right to receive data in structured, commonly used format (more limited than GDPR)
- **Right to Object**: Can object to processing based on overriding private or public interest
- **Note**: Swiss FADP rights are somewhat more limited in scope than GDPR; no explicit right to restriction of processing

#### **Data Protection Impact Assessments**

- **Trigger threshold**: Processing likely to result in **high risk** to personality or fundamental rights
- **High-risk indicators**: Systematic profiling, large-scale processing of sensitive data, public monitoring
- **DSO consultation**: If DSO is appointed, they must be consulted on high-risk processing
- **Content**: Systematic description of processing, necessity/proportionality assessment, risk assessment, mitigation measures

#### **Breach Notification**

- **Trigger**: Breaches of security that pose a **high risk** to personality or fundamental rights
- **Timing**: Notify FDPIC **"as soon as possible"** — urgency determined by risk level
- **No fixed deadline**: Unlike GDPR which has a strict deadline, nFADP uses risk-based urgency
- **Content**: Nature of breach, categories of data subjects and data, likely consequences, mitigation measures
- **Data subject notification**: Required if high risk and not adequately mitigated

#### **Cross-Border Transfers**

- **Adequacy list**: FDPIC maintains countries with adequate protection (including EU under GDPR)
- **Swiss-approved SCCs**: Standard Contractual Clauses must be approved by FDPIC
- **EU SCCs alone are NOT sufficient**: European Union SCCs are not automatically valid under Swiss law
- **Derogations**: Explicit consent, performance of contract, important public interest, legal claims, vital interests, legitimate interests (with safeguards)

#### **Processor Agreements**

- Controllers must have written agreements with processors
- **Mandatory content**: Subject matter, duration, nature/purpose, data categories, controller obligations
- **Processor obligations**: Process only on controller instructions, ensure confidentiality, implement security measures, assist with breach notification, allow audits
- **Sub-processors**: Require controller authorization (general or specific)

#### **Data Security Officer (DSO)**

- **Voluntary appointment**: Unlike GDPR which requires DPO based on core activities, nFADP DSO appointment is entirely voluntary
- **Organizations may appoint**: Any controller can appoint a DSO
- **Same duties apply**: If appointed, DSO has similar monitoring, advisory, and cooperation functions
- **No GDPR Article 37 trigger**: No automatic requirement based on core activities or scale

#### **Sensitive Data**

**Special Categories** (require heightened protection):

- Health data
- Data about the intimate sphere (including sexual preferences and life)
- Genetic data
- Biometric data (for uniquely identifying a person)
- Religious or philosophical beliefs
- Political opinions
- Trade union membership
- Data concerning administrative or criminal proceedings and sanctions

**Financial data is NOT a special category** under nFADP (unlike some other jurisdictions).

### GDPR Divergence Cheat-Sheet

| Topic | GDPR | nFADP |
|-------|------|-------|
| **Breach notification clock** | Notify supervisory authority without undue delay (GDPR Art. 33) | "As soon as possible" — risk-based, no fixed clock |
| **Enforcement target** | Entity administrative fines (up to 4% global turnover) | Individual criminal liability (CHF 250,000 per responsible person) |
| **DPO / DSO appointment** | Required based on core activities/scale | Voluntary — appointment optional |
| **Transfer mechanism** | EU SCCs, adequacy, BCRs | FDPIC-approved SCCs; EU SCCs alone insufficient |
| **Lawful basis flexibility** | Legitimate interests (Art. 6(1)(f)) is standalone basis | Legitimate interests require demonstrable overriding private/public interest |
| **Regulatory body** | National DPAs (EU) + EDPB | FDPIC (Swiss) — not an EU authority |
| **Sensitive data: financial** | Not a special category | Not a special category |
| **Protected entities** | Natural persons only | Natural persons only |

### SCF Crosswalk Notes

CH-FADP is supported in the Secure Controls Framework crosswalk via `/grc-engineer:gap-assessment` today. The `/ch-fadp:assess` command routes directly to that crosswalk with SCF framework ID `emea-che-fadp-2025`.

**Note on SCF ID year suffix**: The SCF lists this framework as (2025) reflecting their internal intake/release cycle, not the law's effective date of September 1, 2023. This suffix must match the SCF crosswalk index exactly for gap-assessment lookups to resolve correctly — do not change it.

Priority SCF control domains for a Swiss controller:

- **PRV (Privacy)**: Privacy by design, data minimization, transparency, data subject rights
- **GOV (Governance)**: Records of processing, DSO (if appointed), accountability, policies
- **DCH (Data Classification and Handling)**: Sensitive data categories, data mapping, retention
- **IAO (Incident Analysis and Response)**: Risk-based breach notification to FDPIC
- **IRO (Incident Response and Operations)**: Security measures, processor agreements, transfers

### Available Commands

| Command | Description |
|---------|-------------|
| `/ch-fadp:assess` | Run a gap assessment against Swiss FADP via the SCF crosswalk |

### Upgrade Path — TODOs for Contributors

This stub provides the foundation. Level up to Reference or Full depth by implementing:

- [ ] `/ch-fadp:scope` — Framework-specific applicability determination (SME carve-out, effects in Switzerland)
- [ ] `/ch-fadp:evidence-checklist` — Evidence patterns organized by nFADP articles and sections
- [ ] `/ch-fadp:dpia-review` — Data Protection Impact Assessment workflow for high-risk processing
- [ ] `/ch-fadp:transfer-mechanism-check` — Cross-border transfer mechanism selection and validation
- [ ] `/ch-fadp:breach-triage` — Risk-based breach notification urgency and FDPIC reporting

See [Framework Plugin Guide](../../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for detailed criteria.

### Usage Example

A SaaS company processing Swiss resident HR data invokes `/ch-fadp:assess` during a Claude Code session. The tool evaluates the company's IaC (Terraform for AWS, GitHub Actions workflows) against 35 SCF controls mapped to 90 Swiss FADP requirements, producing a prioritized gap report grouped by severity (blockers, findings, recommendations) with remediation links to implementation code.

### References

- [Swiss FDPIC official guidance portal](https://www.edoeb.admin.ch/edoeb/en/home.html) — Data protection authority resources, guidance, and breach reporting
- [Federal Chancellery nFADP full text](https://www.fedlex.admin.ch/eli/cc/2020/765) — Official Swiss law portal with complete revised act text
- [Data Protection Ordinance (VDSG)](https://www.fedlex.admin.ch/eli/cc/2023/589) — Implementation ordinance effective September 2023
- [SCF CH-FADP crosswalk](https://securecontrolsframework.com) — Secure Controls Framework mapping for Swiss data protection
- [GitHub issue #12](https://github.com/GRCEngClub/claude-grc-engineering/issues/12) — Framework coverage tracker