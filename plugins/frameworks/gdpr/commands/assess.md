---
description: GDPR compliance readiness assessment
---

# GDPR Assessment

Evaluates organizational readiness for General Data Protection Regulation (GDPR) compliance.

## Arguments

- Argument 1 - Assessment scope (optional: full, data-mapping, rights-management, security-measures)
- Argument 2 - Organization type (optional: controller, processor, joint-controller)

## GDPR Applicability

**Territorial Scope**:

- Establishment in EU (regardless of processing location)
- Offering goods/services to EU data subjects
- Monitoring behavior of EU data subjects

**Data Subject Rights Territory**:

- EU/EEA countries
- UK (UK GDPR post-Brexit)
- Switzerland (via adequacy decision)

## Assessment Output

1. **Compliance Score**: Overall GDPR readiness percentage
2. **Principle Assessment**: Evaluation against 7 core principles
3. **Lawful Basis Analysis**: Validity of processing bases
4. **Data Subject Rights**: Implementation status of 8 rights
5. **Security Measures**: Technical and organizational safeguards
6. **Accountability**: Documentation and governance gaps
7. **DPO Requirements**: Whether DPO required and compliance status
8. **Cross-Border Transfers**: Transfer mechanism compliance
9. **Breach Readiness**: 72-hour notification capability
10. **Remediation Roadmap**: Prioritized action plan with timelines

## 7 GDPR Principles (Article 5)

| Principle | Description | Key Requirements |
|-----------|-------------|------------------|
| **Lawfulness, Fairness, Transparency** | Legal basis, fair processing, clear communication | Privacy notices, consent forms, legitimate interest assessments |
| **Purpose Limitation** | Specific, explicit, legitimate purposes | Purpose documentation, no scope creep |
| **Data Minimization** | Adequate, relevant, limited to necessary | Justify each data element collected |
| **Accuracy** | Accurate and up to date | Data correction procedures |
| **Storage Limitation** | Kept no longer than necessary | Retention schedules, deletion procedures |
| **Integrity and Confidentiality** | Appropriate security | Encryption, access controls, pseudonymization |
| **Accountability** | Demonstrate compliance | Records of processing, DPIAs, policies |

## 6 Lawful Bases for Processing (Article 6)

Organizations must identify one lawful basis for each processing activity:

1. **Consent**: Freely given, specific, informed, unambiguous
2. **Contract**: Necessary for contract performance
3. **Legal Obligation**: Required by EU/Member State law
4. **Vital Interests**: Protect life of data subject or another
5. **Public Task**: Official authority or public interest
6. **Legitimate Interests**: Balancing test (not for public authorities)

**Special Category Data (Article 9)** requires additional lawful basis beyond Article 6.

## Key Compliance Areas

### Data Mapping and Inventory

- Systems processing personal data
- Data flows (collection, storage, transfer, deletion)
- Data categories and special categories
- Data subject types
- Retention periods
- Third-party processors

### Privacy Notices

- Identity and contact of controller
- DPO contact (if applicable)
- Purposes and lawful basis
- Recipients of data
- International transfers
- Retention periods
- Data subject rights
- Right to withdraw consent
- Right to complain to supervisory authority

### Data Subject Rights (8 Rights)

1. Right to be informed
2. Right of access (Article 15)
3. Right to rectification (Article 16)
4. Right to erasure/"right to be forgotten" (Article 17)
5. Right to restriction of processing (Article 18)
6. Right to data portability (Article 20)
7. Right to object (Article 21)
8. Rights related to automated decision-making (Article 22)

### Security Measures (Article 32)

- Encryption and pseudonymization
- Confidentiality, integrity, availability
- Regular testing and evaluation
- Incident response capability
- Privacy by Design and Default (Article 25)

### Records of Processing Activities (Article 30)

Required for organizations with:

- 250+ employees, OR
- High-risk processing, OR
- Regular processing of special categories/criminal data

### Data Protection Impact Assessment (DPIA)

Required when processing likely to result in high risk:

- Systematic and extensive profiling
- Large-scale processing of special categories
- Systematic monitoring of public areas
- New technologies with high risk

### Data Protection Officer (DPO)

Required for:

- Public authorities (except courts)
- Large-scale systematic monitoring
- Large-scale processing of special categories/criminal data

**DPO Requirements**:

- Professional qualities and expertise
- Adequate resources
- Independence (no conflict of interest)
- Direct reporting to highest management
- Contact point for supervisory authority

## Cross-Border Data Transfers

**Transfer Mechanisms**:

1. **Adequacy Decision**: EU Commission approved countries (UK, Switzerland, Japan, etc.)
2. **Standard Contractual Clauses (SCCs)**: EU-approved contracts
3. **Binding Corporate Rules (BCRs)**: Group-wide policies
4. **Certification Mechanisms**: Approved certifications
5. **Derogations**: Specific situations (consent, contract necessity, etc.)

**Special Considerations**:

- Schrems II decision impact (US transfers)
- Transfer Impact Assessments (TIAs)
- Supplementary measures beyond SCCs

## Breach Notification Requirements

**72-Hour Rule (Article 33)**:

- Notify supervisory authority within 72 hours of becoming aware
- Unless breach unlikely to result in risk to rights/freedoms
- Describe nature, categories, approximate numbers
- DPO contact information
- Likely consequences
- Measures taken/proposed

**Data Subject Notification (Article 34)**:

- Required if high risk to rights and freedoms
- Clear and plain language
- Same information as supervisory authority

## Supervisory Authorities

**Lead Supervisory Authority**:

- Based on main establishment in EU
- Coordinates cross-border processing investigations

**Examples**:

- CNIL (France)
- ICO (UK)
- EDPB (European Data Protection Board)
- National DPAs in each Member State

## Penalties

**Administrative Fines (Article 83)**:

- **Tier 1**: Up to €10M or 2% global annual turnover
  - Processor obligations, certification, monitoring body
- **Tier 2**: Up to €20M or 4% global annual turnover
  - Core principles, lawful basis, data subject rights
  - Cross-border transfer violations
  - Supervisory authority orders

**Factors Considered**:

- Nature, gravity, duration
- Intentional or negligent
- Mitigation actions
- Previous infringements
- Cooperation with authority
- Categories of data affected
- Manner authority became aware

## Examples

```bash
# Full GDPR compliance assessment
/gdpr:assess full

# Data mapping and inventory focus
/gdpr:assess data-mapping

# Data subject rights implementation check
/gdpr:assess rights-management

# Security measures evaluation
/gdpr:assess security-measures

# Assessment as data controller
/gdpr:assess full controller

# Assessment as data processor
/gdpr:assess full processor
```

## Assessment Timeline

**Typical GDPR Compliance Journey**:

1. **Gap Assessment**: 2-4 weeks
2. **Data Mapping**: 4-8 weeks
3. **Policy Development**: 4-6 weeks
4. **Technical Implementation**: 3-9 months
5. **Training and Awareness**: Ongoing
6. **Ongoing Compliance**: Continuous monitoring
