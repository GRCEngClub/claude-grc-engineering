---
name: assess
description: DORA compliance readiness assessment for EU financial entities
---

# DORA Assessment

Evaluates organizational readiness for Digital Operational Resilience Act (DORA) compliance.

## Arguments

- Argument 1 - Assessment scope (required: full, pillar-specific, entity-type)
- Argument 2 - Entity classification (optional: credit-institution, payment-institution, investment-firm, crypto-asset-provider, ict-provider)

## DORA Overview

**Regulation**: EU Regulation 2022/2554
**Effective Date**: January 17, 2025
**Applicability**: EU financial entities and ICT third-party service providers
**Enforcement**: National competent authorities (NCAs)

## Entity Types Subject to DORA

| Entity Type | Examples | Key Requirements |
|-------------|----------|------------------|
| **Credit Institutions** | Banks, lending institutions | Full DORA compliance, advanced testing |
| **Payment Institutions** | Payment processors, e-money institutions | Digital resilience testing, incident reporting |
| **Investment Firms** | Broker-dealers, asset managers | ICT risk management, third-party oversight |
| **Crypto-Asset Service Providers** | Exchanges, wallet providers | Enhanced monitoring, security controls |
| **Insurance/Reinsurance** | Insurers, reinsurance undertakings | Business continuity, resilience testing |
| **ICT Third-Party Providers** | Cloud providers, data centers, critical service providers | Oversight framework, contractual requirements |

## DORA's 5 Pillars

### Pillar 1: ICT Risk Management (Articles 5-16)

Comprehensive framework for managing ICT risks across the organization.

**Key Requirements**:

- Governance and control framework
- ICT risk management framework
- Business continuity policy and disaster recovery plans
- Learning and evolving capabilities
- Communication during crises

### Pillar 2: ICT-Related Incident Management & Reporting (Articles 17-23)

Detection, management, and reporting of major ICT-related incidents.

**Key Requirements**:

- Incident detection and management processes
- Classification of incidents (major vs. non-major)
- Reporting to competent authorities (major incidents)
- Voluntary notification mechanism
- Centralized incident reporting to ESAs

**Major Incident Criteria**:

- Significant impact on financial services
- Client/counterparty impact
- Reputational impact
- Data loss or corruption
- Critical service disruption

### Pillar 3: Digital Operational Resilience Testing (Articles 24-27)

Regular testing to ensure systems can withstand cyber threats and operational disruptions.

**Key Requirements**:

- Risk-based testing programs
- Advanced testing (threat-led penetration testing - TLPT)
- Testing frequency based on risk profile
- Test result remediation
- TLPT for systemically important entities

**Testing Types**:

- Vulnerability assessments
- Network security assessments
- Gap analyses
- Physical security reviews
- Questionnaires and software solution scanning
- Open-source analyses
- Scenario-based testing
- Compatibility testing
- Performance testing
- End-to-end testing
- Threat-led penetration testing (TLPT)

### Pillar 4: ICT Third-Party Risk Management (Articles 28-30)

Oversight of risks from ICT service providers, especially critical providers.

**Key Requirements**:

- Third-party risk assessment and monitoring
- Contractual arrangements with service providers
- Key contractual provisions mandated by DORA
- Exit strategies and transition planning
- Register of all ICT third-party providers
- Oversight framework for critical providers

**Critical ICT Third-Party Providers**:

- Designated by ESAs
- Subject to direct oversight
- Must meet stringent requirements
- Lead overseer assigned

### Pillar 5: Information Sharing (Articles 45)

Voluntary sharing of cyber threat information and intelligence.

**Key Requirements**:

- Participation in information-sharing arrangements
- Protection from liability when sharing in good faith
- Trusted information-sharing communities
- Cyber threat intelligence exchange

## Assessment Output

1. **Overall Readiness Score**: Compliance percentage across 5 pillars
2. **Pillar-by-Pillar Analysis**:
   - ICT Risk Management: X% compliant
   - Incident Management & Reporting: X% compliant
   - Resilience Testing: X% compliant
   - Third-Party Risk: X% compliant
   - Information Sharing: X% compliant

3. **Gap Identification**:
   - Critical gaps blocking compliance
   - High-priority gaps requiring immediate attention
   - Medium-priority gaps (address before Jan 2025)
   - Low-priority enhancements

4. **Entity-Specific Requirements**: Tailored to organization type
5. **Competent Authority Expectations**: NCA-specific guidance
6. **Remediation Roadmap**: Phased approach to compliance
7. **Timeline to Compliance**: Based on current state
8. **Budget Estimates**: Investment needed for compliance

## Key Compliance Milestones

| Deadline | Requirement |
|----------|-------------|
| **January 17, 2025** | DORA becomes applicable |
| **Within 6 months** | Initial risk assessment complete |
| **Within 12 months** | Full ICT risk management framework |
| **Ongoing** | Incident reporting (within timelines) |
| **Annual** | Resilience testing (minimum) |
| **Every 3 years** | TLPT for significant entities |

## Critical Success Factors

1. **Executive Commitment**: Board-level ownership and resources
2. **Cross-Functional Collaboration**: IT, risk, compliance, legal
3. **ICT Risk Framework**: Comprehensive and board-approved
4. **Incident Response Capability**: Detection, classification, reporting
5. **Third-Party Inventory**: Complete register with risk ratings
6. **Testing Program**: Risk-based and regularly executed
7. **Documentation**: Policies, procedures, evidence
8. **Vendor Contracts**: DORA-compliant clauses and SLAs

## Common Readiness Gaps

### Governance & Risk Management

- No ICT risk management framework
- Board not sufficiently involved in ICT risk
- Inadequate business continuity planning
- Lack of ICT asset inventory

### Incident Management

- No major incident classification criteria
- Incident reporting process not aligned with DORA timelines
- Missing incident response playbooks
- Lack of crisis communication plans

### Testing

- No formal resilience testing program
- Testing not risk-based
- Advanced testing (TLPT) not planned
- Remediation tracking inadequate

### Third-Party Risk

- Incomplete third-party inventory
- Contracts lack DORA provisions
- No critical provider oversight
- Exit strategies not documented

### Information Sharing

- Not participating in threat intelligence communities
- No framework for sharing incidents
- Legal concerns about information sharing

## Regulatory Expectations

**European Banking Authority (EBA)**: Focus on credit institutions
**European Securities and Markets Authority (ESMA)**: Investment firms
**European Insurance and Occupational Pensions Authority (EIOPA)**: Insurance
**National Competent Authorities**: Country-specific supervision

**Inspection Focus Areas**:

- ICT risk governance
- Major incident handling
- TLPT execution and findings
- Critical provider dependencies
- Contractual compliance

## Examples

```bash
# Full DORA readiness assessment
/dora:assess full

# Assessment for credit institution
/dora:assess full credit-institution

# Pillar-specific assessment (Third-Party Risk)
/dora:assess pillar-specific

# Assessment by entity type
/dora:assess entity-type payment-institution
```
