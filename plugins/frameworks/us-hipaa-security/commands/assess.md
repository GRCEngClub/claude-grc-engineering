---
description: HIPAA Security Rule gap assessment against SCF crosswalk
---

# HIPAA Security Rule Assessment

Run a comprehensive gap assessment of the HIPAA Security Rule (45 CFR Part 164, Subpart C) against the SCF crosswalk for US-HIPAA-Security.

## Usage

```bash
/us-hipaa-security:assess [--scope=<category>]
```

## Arguments

- `--scope`: Optional safeguard category to limit assessment scope
  - `administrative` - Administrative Safeguards only (§164.308)
  - `physical` - Physical Safeguards only (§164.310)
  - `technical` - Technical Safeguards only (§164.312)
  - `organizational` - Organizational Requirements only (§164.314)
  - `policies` - Policies & Documentation only (§164.316)
  - Default: All five categories

## Pre-Assessment Confirmation

Before starting the assessment, confirm the following with the user:

1. **Entity Type**: Are you a Covered Entity (healthcare provider, health plan, clearinghouse) or Business Associate (vendor handling ePHI on behalf of a CE)?

2. **ePHI Systems in Scope**: What systems handle electronic Protected Health Information?
   - Clinical systems (EHR/EMR, e-prescribing)
   - Administrative systems (billing, claims, RCM)
   - Patient-facing systems (portals, telehealth, mobile apps)
   - Data platforms (warehouses, HIEs, analytics)
   - Cloud infrastructure (AWS, Azure, GCP)
   - Endpoints (workstations, laptops, mobile devices)

3. **Risk Analysis Status**: When was your last organization-wide risk analysis conducted (required under §164.308(a)(1)(ii)(A))? Does it cover all ePHI systems?

4. **Enforcement History**: Any prior OCR investigations, breaches, or enforcement actions?

## How It Works

This command routes to `/grc-engineer:gap-assessment --framework=US-HIPAA-Security` and leverages the SCF crosswalk to map HIPAA Security Rule implementation specifications to standardized compliance controls.

## Assessment Output

The assessment generates findings grouped by safeguard category:

### Administrative Safeguards (§164.308)

| Control Reference | CFR Section | SCF Control ID | Current Status | Risk Level | Recommended Remediation | Req/Addr |
|-------------------|-------------|----------------|----------------|------------|-------------------------|----------|
| Example: Risk Analysis | §164.308(a)(1)(ii)(A) | PRI-01 | Gap | Critical | Conduct organization-wide risk analysis covering all ePHI systems | Required |
| Example: Security Awareness Training | §164.308(a)(5)(i) | CFG-02 | Partially | High | Implement formal training program with completion tracking | Required |
| Example: Encryption at Rest | §164.312(a)(2)(iv) | IAC-08 | Implemented | Low | Continue current implementation | Addressable |

**Status Categories**:

- **Implemented**: Fully compliant with no identified gaps
- **Partially**: Partially compliant but requires improvement
- **Gap**: Not implemented - non-compliant
- **N/A**: Not applicable to organization's scope

**Risk Levels**:

- **Critical**: Immediate violation, blocks audit, high likelihood of OCR enforcement
- **High**: Serious gap, should remediate before audit
- **Medium**: Important improvement
- **Low**: Best practice recommendation

**Req/Addr Column**:

- **Required**: Must implement exactly as stated
- **Addressable**: Must implement, document equivalent alternative, or document rationale

### Physical Safeguards (§164.310)

Same format as Administrative Safeguards, covering:

- Facility Access Controls
- Workstation Use
- Workstation Security
- Device and Media Controls

### Technical Safeguards (§164.312)

Same format, covering:

- Access Control (unique user IDs, emergency access, automatic logoff, encryption)
- Audit Controls
- Integrity
- Authentication
- Transmission Security

### Organizational Requirements (§164.314)

Same format, covering:

- Business Associate Agreements
- Group Health Plan requirements

### Policies & Documentation (§164.316)

Same format, covering:

- Written policies and procedures
- Documentation retention (6 years)

## Remediating Addressable Specifications

For any **Addressable** implementation specifications marked as "Gap" or "Partially":

1. **Document Rationale**: Explain why the specification is not reasonable and appropriate for your organization
   - Cost considerations
   - Technical feasibility issues
   - Operational impact on clinical workflows
   - Environmental constraints

2. **Implement Equivalent Alternative** (if applicable):
   - Identify alternative control providing equivalent protection
   - Document how alternative achieves same security objective
   - Implement and test the alternative

3. **Maintain Documentation**:
   - Keep assessment and rationale for 6 years
   - Review annually as technology and operations evolve
   - Update if circumstances change

## Examples

```bash
# Full HIPAA Security Rule assessment (all categories)
/us-hipaa-security:assess

# Assessment limited to Administrative Safeguards only
/us-hipaa-security:assess --scope=administrative

# Assessment focused on Technical Safeguards
/us-hipaa-security:assess --scope=technical
```

## SCF Crosswalk

This assessment leverages the Secure Controls Framework (SCF) crosswalk for US-HIPAA-Security, which maps HIPAA Security Rule implementation specifications to standardized SCF controls.

**SCF ID**: US-HIPAA-Security
**Regulator**: US HHS OCR
**Region**: Americas
**Depth**: Reference (tier 2 of 3)

## Related Commands

- `/us-hipaa-security:evidence-checklist` - Generate evidence request list for audits
- `/grc-engineer:gap-assessment` - Direct access to gap assessment with framework options

## Common Findings

Based on OCR enforcement actions and Resolution Agreements, the most common HIPAA Security Rule gaps include:

1. **Inadequate Risk Analysis** (§164.308(a)(1)(ii)(A)) - Not organization-wide, not updated, lacks specificity
2. **Missing Business Associate Agreements** (§164.308(b)(1)) - Cloud providers, SaaS vendors without BAAs
3. **Insufficient Access Controls** (§164.312(a)(1)) - Shared accounts, lack of unique user IDs
4. **Incomplete ePHI Inventory** - Systems handling ePHI not identified or documented
5. **Missing or Outdated Policies** (§164.316(a)) - No written policies, policies not updated
6. **Lack of Encryption** (§164.312(a)(2)(iv)) - Addressable but not implemented or documented
7. **Insufficient Audit Controls** (§164.312(b)) - No audit logging or review procedures
8. **Incomplete Contingency Planning** (§164.308(a)(7)) - No disaster recovery plan, untested backups

## Enforcement Context

**OCR Audit Priorities** (based on publicly available information):

- Risk analysis and risk management (most frequent finding)
- Business Associate Agreements
- Access controls and audit trails
- Encryption and transmission security
- Breach notification compliance
- Security incident response procedures

**Penalty Tiers** (per violation category per year):

- Tier 1: $100 - $25,000 (lack of knowledge)
- Tier 2: $1,000 - $100,000 (reasonable cause)
- Tier 3: $10,000 - $250,000 (willful neglect, corrected)
- Tier 4: $50,000 - $1,900,000 (willful neglect, not corrected)

---

**Applicability**: Covered Entities and Business Associates handling ePHI
**Citation**: 45 CFR Part 164, Subpart C
**Enforcement**: US Department of Health and Human Services (HHS) - Office for Civil Rights (OCR)
**Guidance**: NIST SP 800-66 Rev. 2
