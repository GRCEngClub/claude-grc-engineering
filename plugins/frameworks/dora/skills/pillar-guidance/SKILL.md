---
name: pillar-guidance
description: Deep dive guidance on DORA's 5 pillars and implementation requirements
---

# DORA Pillar Guidance

Provides detailed implementation guidance for each of DORA's 5 pillars.

## Arguments

- Argument 1 - Pillar (required: ict-risk, incident-management, resilience-testing, third-party-risk, information-sharing, all)
- Argument 2 - Detail level (optional: overview, implementation, evidence)

## Pillar 1: ICT Risk Management (Articles 5-16)

### Overview

Establishes comprehensive framework for managing ICT risks across financial entities.

**Legal Basis**: Articles 5-16 of DORA
**Applicability**: All financial entities
**Key Principle**: Proportionality to size, risk profile, and complexity

### Core Requirements

#### 1. ICT Risk Management Framework (Article 6)

**Must Include**:

- Strategies, policies, procedures, and protocols
- ICT risk management function with sufficient resources
- Documentation of ICT risk management framework
- Board approval and regular review

**Implementation**:

- Establish ICT risk management policy
- Define roles and responsibilities
- Create risk assessment methodology
- Implement controls and mitigation measures
- Monitor and report on ICT risks

#### 2. Governance and Organization (Article 5)

**Board Responsibilities**:

- Define, approve, and oversee ICT risk management framework
- Allocate budget and resources
- Approve ICT strategy
- Approve policies for ICT service provision by third parties
- Receive regular reporting on ICT risk

**Management Body**:

- At least one member with sufficient knowledge and skills in ICT
- Regular training on ICT risks
- Oversight of senior management

#### 3. Identification (Article 8)

**Requirements**:

- Identify all ICT-supported business functions
- Map dependencies and interdependencies
- Identify all ICT assets and configurations
- Document data flows
- Assess criticality of ICT assets

**Deliverables**:

- ICT asset inventory
- Business impact analysis (BIA)
- Data flow diagrams
- Network diagrams
- Dependency mapping

#### 4. Protection and Prevention (Article 9)

**Requirements**:

- Implement security policies and procedures
- Regular ICT security awareness training
- Physical and environmental security
- Access control mechanisms
- Encryption of sensitive data
- Segregation of duties
- Network security controls

**Key Controls**:

- Multi-factor authentication
- Privileged access management
- Data loss prevention
- Endpoint protection
- Network segmentation
- Vulnerability management
- Patch management

#### 5. Detection (Article 10)

**Requirements**:

- Continuous monitoring mechanisms
- Detection tools and systems
- Logging and log analysis
- Anomaly detection
- Intrusion detection/prevention systems (IDS/IPS)
- Security information and event management (SIEM)

**Capabilities**:

- Real-time alerting
- 24/7 monitoring (for significant entities)
- Threat intelligence integration
- Automated detection rules

#### 6. Response and Recovery (Article 11)

**Business Continuity**:

- Business continuity policy
- Business continuity plans (BCPs)
- Disaster recovery plans (DRPs)
- Regular testing of BCPs/DRPs
- Communication plans during crises

**Incident Response**:

- Incident response plans
- Predefined incident response procedures
- Crisis management team
- Communication protocols
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)

#### 7. Learning and Evolving (Article 12)

**Requirements**:

- Post-incident reviews
- Lessons learned documentation
- Continuous improvement process
- Metrics and KPIs for ICT risk
- Regular framework updates

#### 8. Communication (Article 13)

**Requirements**:

- Internal communication channels
- External communication (clients, authorities)
- Crisis communication plans
- Public relations protocols
- Media handling procedures

#### 9. Backup Policies and Procedures (Article 12)

**Requirements**:

- Backup strategies and policies
- Regular backups of critical data and systems
- Backup testing and restoration
- Off-site backup storage
- Immutable backups (ransomware protection)

---

## Pillar 2: Incident Management & Reporting (Articles 17-23)

### Overview

Comprehensive framework for detecting, managing, classifying, and reporting ICT-related incidents.

**Legal Basis**: Articles 17-23
**Key Innovation**: Mandatory reporting of major incidents to authorities
**Timeline**: Strict reporting deadlines

### Core Requirements

#### 1. Incident Management Process (Article 17)

**Requirements**:

- Detection mechanisms
- Incident management procedures
- Incident classification criteria
- Escalation procedures
- Root cause analysis
- Remediation and recovery

**Process Steps**:

1. Detection and logging
2. Initial assessment and classification
3. Containment
4. Investigation and analysis
5. Remediation and recovery
6. Post-incident review
7. Reporting (if major incident)

#### 2. Classification of Incidents (Article 18)

**Major Incident Criteria**:

- Significant impact on financial services provided
- Large number of clients/counterparties affected
- Geographical spread across multiple member states
- Duration exceeding thresholds
- Reputational impact
- Data loss affecting critical services
- Critical services unavailable

**Classification Factors**:

- Number of clients affected
- Duration of incident
- Geographical spread
- Economic impact
- Data loss severity
- Service criticality
- Reputational damage

#### 3. Reporting to Authorities (Article 19)

**Major Incident Reporting Timeline**:

| Timeline | Report Type | Content |
|----------|-------------|---------|
| **4 hours** | Initial notification | Incident awareness, preliminary assessment |
| **72 hours** | Intermediate report | Classification, impact assessment, mitigation actions |
| **1 month** | Final report | Root cause, remediation, lessons learned |

**Additional Reports**:

- Significant updates when incident evolves
- Material changes to impact assessment
- Updates on remediation progress

**Reporting Channels**:

- To relevant national competent authority (NCA)
- Via single point of contact
- Using standardized templates (RTS to be developed)

#### 4. Voluntary Notification (Article 20)

**Cyber Threats**:

- Financial entities may voluntarily report cyber threats
- Sharing with other entities
- Reporting to authorities
- No liability for good faith sharing

#### 5. Centralized Hub (Article 21)

**ESA Responsibilities**:

- European Supervisory Authorities establish incident register
- Analyze incident patterns
- Publish anonymized incident reports
- Identify trends and systemic risks

---

## Pillar 3: Digital Operational Resilience Testing (Articles 24-27)

### Overview

Risk-based testing program to ensure systems withstand, respond to, and recover from ICT-related disruptions.

**Legal Basis**: Articles 24-27
**Principle**: Proportionate to size, risk profile, and complexity

### Core Requirements

#### 1. General Testing Requirements (Article 24)

**Mandatory Testing Types**:

- Vulnerability assessments and scans
- Open-source analysis
- Network security assessments
- Gap analyses
- Physical security reviews
- Questionnaires and scanning software solutions
- Source code reviews (where feasible)
- Scenario-based testing
- Compatibility testing
- Performance testing
- End-to-end testing
- Penetration testing

**Testing Frequency**:

- Regular basis (at least annually)
- After significant changes to ICT systems
- Following major incidents
- Based on risk assessment

**Testing Scope**:

- All critical ICT systems
- Live production environments
- Third-party service providers
- Backup and recovery systems

#### 2. Advanced Testing - TLPT (Articles 26-27)

**Threat-Led Penetration Testing (TLPT)**:

- Simulated real-world cyber attacks
- Uses tactics, techniques, and procedures (TTPs) of threat actors
- Red team vs. blue team exercises
- Covers people, processes, and technology

**TLPT Requirements**:

- Conducted at least every 3 years
- For entities identified as systemically important
- By qualified testers (internal or external)
- Based on TIBER-EU framework or equivalent
- Covers critical functions and services

**TLPT Process**:

1. **Preparation Phase**:
   - Scope definition
   - Threat intelligence gathering
   - Test plan development
   - Stakeholder engagement

2. **Testing Phase**:
   - Red team attack simulation
   - Blue team defense
   - White team oversight
   - Real-time monitoring

3. **Closure Phase**:
   - Debriefing
   - Test report
   - Remediation plan
   - Lessons learned

**TIBER-EU Alignment**:

- Intelligence-led testing
- Bespoke scenarios
- Controlled testing environment
- No disruption to services
- Comprehensive documentation

#### 3. Testing Documentation

**Required Documentation**:

- Testing policy and procedures
- Test plans and scopes
- Test results and findings
- Remediation plans
- Evidence of fixes implemented
- Management reporting

---

## Pillar 4: Third-Party Risk Management (Articles 28-30)

### Overview

Framework for managing risks from ICT third-party service providers, especially critical providers.

**Legal Basis**: Articles 28-30
**Scope**: All ICT services provided by third parties
**Special Focus**: Critical ICT third-party service providers

### Core Requirements

#### 1. ICT Third-Party Risk (Article 28)

**Risk Management Process**:

- Maintain register of all ICT third-party service providers
- Risk assessment before contracting
- Ongoing monitoring of service providers
- Due diligence and security assessments
- Regular audits and reviews
- Exit strategies and transition plans

**Register Requirements**:

- List of all ICT service providers
- Contractual arrangements
- Data and functions involved
- Countries where services provided
- Start/end dates of contracts
- Classification (critical vs. non-critical)

#### 2. Contractual Requirements (Article 30)

**Mandatory Contractual Provisions**:

1. **Service Levels**:
   - Clear service level agreements (SLAs)
   - Performance metrics
   - Availability targets
   - Response times

2. **Locations**:
   - Data storage locations
   - Data processing locations
   - Permission requirements for relocations

3. **Access and Audit Rights**:
   - Financial entity access to systems/data
   - Competent authority access rights
   - Audit rights
   - Inspection rights

4. **Security Requirements**:
   - Security measures and controls
   - Incident notification obligations
   - Data protection requirements
   - Encryption standards

5. **Termination Rights**:
   - Clear termination conditions
   - Notice periods
   - Handover procedures
   - Data return/deletion

6. **Subcontracting**:
   - Prior approval for subcontracting
   - Subcontractor requirements
   - Chain of subcontracting visibility

7. **Exit Strategy**:
   - Transition assistance
   - Knowledge transfer
   - Data portability
   - Service continuity during transition

8. **Liability and Indemnity**:
   - Liability provisions
   - Insurance requirements
   - Indemnification clauses

#### 3. Critical ICT Third-Party Providers

**Designation**:

- By European Supervisory Authorities (ESAs)
- Based on systemic importance
- Criteria: number of clients, criticality of services, substitutability

**Oversight Framework**:

- Direct oversight by ESAs
- Lead overseer appointed
- On-site inspections
- Recommendations and enforcement
- General investigations

**Critical Provider Obligations**:

- Register with lead overseer
- Provide information to authorities
- Submit to inspections
- Implement recommendations
- Maintain business continuity

---

## Pillar 5: Information Sharing (Article 45)

### Overview

Voluntary sharing of cyber threat information and intelligence among financial entities.

**Legal Basis**: Article 45
**Purpose**: Enhance collective resilience
**Protection**: Liability protection for good faith sharing

### Core Requirements

#### 1. Information Sharing Arrangements

**Participation**:

- Join information-sharing communities
- Establish trusted sharing relationships
- Participate in sector-specific ISACs
- Engage with national/EU-level sharing platforms

**Types of Information Shared**:

- Cyber threat intelligence
- Tactics, techniques, and procedures (TTPs)
- Indicators of compromise (IOCs)
- Vulnerabilities and exploits
- Incident trends and patterns
- Mitigation strategies

#### 2. Confidentiality and Liability Protection

**Protections**:

- No liability for sharing in good faith
- Confidentiality of shared information
- Protection from disclosure requirements (exceptions for law enforcement)
- Antitrust safe harbor

**Conditions**:

- Information shared in good faith
- Within trusted communities
- For enhancing digital resilience
- Not for competitive advantage

#### 3. Information Sharing Platforms

**EU-Level**:

- Financial Services Information Sharing and Analysis Centre (FS-ISAC)
- EU Agency for Cybersecurity (ENISA) platforms
- ESA-coordinated sharing mechanisms

**National-Level**:

- National Computer Emergency Response Teams (CERTs)
- Financial sector ISACs
- NCA-facilitated forums

## Implementation Roadmap by Pillar

### Pillar 1: ICT Risk Management

**Phase 1 (Months 1-3)**:

- Conduct gap assessment
- Draft ICT risk management framework
- Establish governance structure
- Initial asset inventory

**Phase 2 (Months 4-6)**:

- Implement risk assessment processes
- Deploy monitoring and detection tools
- Develop business continuity plans
- Board approval of framework

**Phase 3 (Months 7-12)**:

- Full framework implementation
- Training and awareness programs
- Continuous improvement processes
- Metrics and reporting

### Pillar 2: Incident Management

**Phase 1 (Months 1-2)**:

- Define incident classification criteria
- Establish reporting procedures
- Identify competent authority contact

**Phase 2 (Months 3-4)**:

- Implement incident management system
- Develop incident response playbooks
- Train incident response team

**Phase 3 (Months 5-6)**:

- Test incident reporting process
- Conduct tabletop exercises
- Refine classification criteria

### Pillar 3: Resilience Testing

**Phase 1 (Months 1-3)**:

- Define testing policy and scope
- Identify critical systems for testing
- Establish testing schedule

**Phase 2 (Months 4-9)**:

- Conduct vulnerability assessments
- Perform scenario-based tests
- Execute penetration testing

**Phase 3 (Months 10-12 and ongoing)**:

- TLPT planning (if applicable)
- Remediation of findings
- Continuous testing program

### Pillar 4: Third-Party Risk

**Phase 1 (Months 1-2)**:

- Create complete third-party register
- Assess criticality of providers
- Gap analysis on current contracts

**Phase 2 (Months 3-6)**:

- Renegotiate contracts with DORA clauses
- Conduct due diligence on critical providers
- Develop exit strategies

**Phase 3 (Months 7-12)**:

- Implement ongoing monitoring
- Annual audits of critical providers
- Regular register updates

### Pillar 5: Information Sharing

**Phase 1 (Months 1-2)**:

- Identify relevant sharing communities
- Establish legal framework for sharing

**Phase 2 (Months 3-6)**:

- Join FS-ISAC or similar
- Participate in threat intelligence sharing
- Integrate intelligence into defenses

## Examples

```bash
# Get guidance on ICT Risk Management pillar
/dora:pillar-guidance ict-risk

# Detailed implementation guide for incident management
/dora:pillar-guidance incident-management implementation

# Evidence requirements for resilience testing
/dora:pillar-guidance resilience-testing evidence

# Overview of all 5 pillars
/dora:pillar-guidance all overview

# Third-party risk management implementation
/dora:pillar-guidance third-party-risk implementation
```
