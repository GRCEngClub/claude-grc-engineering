---
name: hitrust-expert
description: HITRUST CSF expert for healthcare security. Implementation guidance, assessment workflow, and mapping to HIPAA/NIST/ISO/PCI frameworks. References control IDs only — not a replacement for a licensed CSF copy.
allowed-tools: Read, Glob, Grep, Write
---

# HITRUST Expert

Deep expertise in HITRUST Common Security Framework (CSF) for healthcare and business-associate organizations.

> **Important — normative text.** HITRUST CSF is proprietary and subscription-required. This skill provides **implementation guidance**, **assessment workflow**, and **evidence patterns** — phrased in the author's own words. All normative control statements, scoring rubrics, and MyCSF-specific requirement language must be read from your licensed CSF. When a command in this plugin quotes a control description, it is a paraphrased summary; consult the CSF for authoritative text.

## Expertise Areas

### HITRUST Alliance Overview

**Mission**: Create security and privacy programs that can be certified
**Founded**: 2007
**Purpose**: Address security/privacy challenges in healthcare industry
**Key Value**: Single framework harmonizing 40+ regulations and standards

### HITRUST CSF (Common Security Framework)

**Current Version**: CSF v11 (as of 2024)
**Control Objectives**: 156 across 19 domains
**Customization**: MyCSF tailored assessment
**Certifications**: i1, r2, e1

### Assessment Types

| Type | Full Name | Duration | Assessor | Validity | Use Case |
|------|-----------|----------|----------|----------|----------|
| **i1** | Implemented, 1-year | 3-6 months | Self or validated | 1 year | Initial cert, vendors |
| **r2** | Reportable, 2-year | 6-12 months | External required | 2 years | Providers, high assurance |
| **e1** | e1 Assessment | 3-6 months | Can be self | Bridge | Upgrade i1 to r2 |

**i1 Assessment**:

- Demonstrates control implementation
- Self-assessment or externally validated
- Less rigorous than r2
- Lower cost ($30K-$80K validated)
- Good for: Vendors, BAs, initial certification

**r2 Assessment**:

- Full external validation required
- Independent HITRUST assessor
- Comprehensive testing
- Higher cost ($100K-$300K+)
- Required for: Healthcare providers, payers, high-risk BAs

**e1 Assessment**:

- Bridges i1 to r2 in year 2
- Validates changes since i1
- Extends certification to 2-year cycle
- Cost-effective staged approach

### MyCSF Customization

HITRUST CSF requirements tailored based on:

**Organization Factors**:

1. **Type**: Provider, payer, clearinghouse, BA, vendor, other
2. **Size**:
   - Small: <$20M revenue or <20 employees
   - Medium: Mid-sized
   - Large: >$1B revenue or >1000 employees
3. **System Type**: SaaS, on-premise, hybrid, mobile
4. **Regulatory Factors**: HIPAA, state laws, international regs

**Customization Result**:

- **Not Applicable**: Requirements excluded
- **Implementation Levels**:
  - Baseline: Minimum requirements
  - Middle: Moderate requirements
  - Enhanced: Advanced requirements

### 19 Control Domains

1. **Information Security Management Program (01)** - 12 controls
   - Security governance
   - Risk management program
   - Compliance management

2. **Access Control (02)** - 14 controls
   - User access management
   - Privileged access
   - Access reviews
   - Remote access

3. **Human Resources Security (03)** - 8 controls
   - Background screening
   - Terms of employment
   - Termination procedures

4. **Risk Management (04)** - 5 controls
   - Risk assessment methodology
   - Risk treatment
   - Acceptance criteria

5. **Security Policy (05)** - 3 controls
   - Information security policy
   - Review and updates

6. **Organization of Information Security (06)** - 8 controls
   - Management commitment
   - Security roles
   - Contact with authorities

7. **Compliance (07)** - 6 controls
   - Legal requirements
   - Privacy obligations
   - Intellectual property

8. **Asset Management (08)** - 7 controls
   - Asset inventory
   - Information classification
   - Media handling

9. **Physical and Environmental Security (09)** - 11 controls
   - Secure areas
   - Physical entry controls
   - Equipment security
   - Disposal

10. **Communications and Operations Management (10)** - 23 controls
    - Change management
    - Capacity management
    - Malware protection
    - Backup
    - Network security

11. **Information Systems Acquisition, Development and Maintenance (11)** - 15 controls
    - Security requirements
    - Secure development
    - Cryptographic controls

12. **Information Security Incident Management (12)** - 6 controls
    - Incident response plan
    - Reporting procedures
    - Collection of evidence

13. **Business Continuity Management (13)** - 5 controls
    - BCM process
    - Continuity planning
    - Testing

14. **Network Protection (14)** - 7 controls
    - Network architecture
    - Segmentation
    - Firewall management

15. **Password Management (15)** - 6 controls
    - Password policies
    - Storage and transmission
    - Multi-factor authentication

16. **Education, Training and Awareness (16)** - 4 controls
    - Security awareness
    - Role-based training

17. **Third Party Assurance (17)** - 6 controls
    - Business associate agreements
    - Vendor risk management
    - Cloud service provider oversight

18. **Mobile Device Security (18)** - 5 controls
    - Mobile device policy
    - BYOD management
    - Mobile application security

19. **Incident Detection and Response (19)** - 5 controls
    - Monitoring and detection
    - Security information and event management (SIEM)
    - Threat intelligence

### Framework Harmonization

HITRUST CSF maps to 40+ frameworks including:

**Primary Frameworks**:

- **HIPAA** Security and Privacy Rules
- **NIST** 800-53, Cybersecurity Framework
- **ISO/IEC** 27001:2022, 27002:2022
- **PCI DSS** v4.0.1 (mapped in HITRUST CSF v11.8 and later)
- **FedRAMP** Moderate Baseline

**Additional Frameworks**:

- AICPA Trust Services Criteria (SOC 2)
- COBIT 5
- GDPR
- FISMA
- FDA Medical Device Guidance
- CMS MARS-E
- State breach notification laws
- Canadian PIPEDA
- UK Data Protection Act

**Benefits of Harmonization**:

- Single assessment covers multiple requirements
- Reduced audit fatigue
- Streamlined compliance
- Consistent control language

### Certification Process

**Phase 1: Preparation (2-4 months)**

1. Gap assessment
2. Remediation planning
3. Control implementation
4. Documentation
5. Self-assessment

**Phase 2: Assessment (1-3 months)**

1. Assessor selection (for validated/r2)
2. Scoping and kickoff
3. Evidence collection
4. Interviews and testing
5. Assessor review

**Phase 3: Certification (1-2 months)**

1. Corrective action (if needed)
2. Final review
3. Certification decision
4. Certificate issuance

**Ongoing: Surveillance**

- Continuous monitoring
- Interim assessments
- Change notifications
- Annual recertification (i1) or biennial (r2)

### Common Implementation Challenges

1. **Scope Definition**:
   - System boundaries unclear
   - Data flows not documented
   - Inherited controls from cloud providers

2. **Resource Constraints**:
   - Limited security staff
   - Budget limitations
   - Competing priorities

3. **Documentation Gaps**:
   - Policies outdated or missing
   - Procedures not formalized
   - Evidence not collected systematically

4. **Technical Deficiencies**:
   - MFA not fully deployed
   - Encryption gaps
   - Logging/monitoring insufficient
   - Vulnerability management immature

5. **Organizational**:
   - Lack of executive support
   - Unclear roles and responsibilities
   - Change management resistance

### Critical Controls (High Failure Rate)

1. **09.ab** - Encryption of ePHI at Rest
2. **10.k** - Encryption in Transit
3. **15.d** - Multi-Factor Authentication
4. **10.j** - Audit Logging
5. **12.a** - Incident Response Plan
6. **13.a** - Business Continuity Plan
7. **17.a** - Business Associate Agreements
8. **04.a** - Risk Assessment

### Evidence Requirements

**Common Artifacts Needed**:

- Information security policies
- Risk assessment reports
- Business impact analysis
- System security plans
- Network diagrams
- Data flow diagrams
- Asset inventories
- Access control matrices
- Audit logs
- Vulnerability scan reports
- Penetration test reports
- Security awareness training records
- Incident response plans and tests
- Business continuity/disaster recovery plans
- Business associate agreements
- Vendor risk assessments
- Change management records

### Cost Considerations

**i1 Validated Assessment**:

- Assessor fees: $30K-$80K
- Remediation: $50K-$150K
- Tools/tech: $20K-$50K
- Internal effort: 500-1000 hours
- **Total**: $100K-$280K

**r2 Assessment**:

- Assessor fees: $100K-$300K
- Remediation: $150K-$500K
- Tools/tech: $50K-$150K
- Internal effort: 1000-2000 hours
- **Total**: $300K-$950K+

*Costs vary by scope, readiness, and organization size*

### Certification Benefits

**Regulatory**:

- Demonstrates HIPAA compliance
- Satisfies breach safe harbor (some states)
- Shows due diligence

**Business**:

- Competitive differentiator
- Customer confidence
- BAA credibility
- Reduced audit burden
- Streamlined vendor assessments

**Operational**:

- Improved security posture
- Standardized processes
- Better risk visibility
- Incident readiness

## Capabilities

- HITRUST CSF assessment planning (i1, r2, e1)
- MyCSF scoping and customization
- Gap analysis and remediation roadmaps
- Control implementation guidance (156 controls)
- Evidence collection and documentation
- Assessor selection and management
- Framework mapping (HIPAA, NIST, ISO, PCI-DSS)
- Business associate agreement review
- Vendor risk assessment (HITRUST CSF perspective)
- Continuous monitoring and surveillance
- Certification maintenance
