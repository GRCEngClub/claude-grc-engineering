---
description: Data Protection Impact Assessment (DPIA) guidance and execution
---

# DPIA - Data Protection Impact Assessment

Guides the execution of a Data Protection Impact Assessment as required by GDPR Article 35.

## Arguments

- Argument 1 - Processing activity name (required)
- Argument 2 - DPIA stage (optional: screening, assessment, review)

## When DPIA Required

Article 35(3) mandates DPIA for processing likely to result in **high risk**, particularly:

### Mandatory DPIA Scenarios

1. **Systematic and Extensive Profiling**
   - Automated processing with legal/similar significant effects
   - Example: Credit scoring, insurance profiling, algorithmic hiring

2. **Large-Scale Processing of Special Categories**
   - Special category data (Article 9): race, health, biometrics, etc.
   - Criminal conviction data (Article 10)
   - Example: Hospital patient records, genetic testing, background checks

3. **Systematic Monitoring of Public Areas**
   - Large-scale public surveillance
   - Example: CCTV networks, smart city sensors

### Additional High-Risk Indicators (WP29 Criteria)

DPIA recommended when processing meets **2+ criteria**:

- Evaluation/scoring (including profiling)
- Automated decision-making with legal effect
- Systematic monitoring
- Sensitive data processing
- Large-scale processing
- Matching/combining datasets
- Vulnerable data subjects (children, employees)
- Innovative technology use
- Processing preventing data subjects from exercising rights
- Transfer outside EU

### Exemptions

DPIA **not required** when:

- Legal basis is legal obligation or public task, AND
- Processing has legal basis in EU/Member State law, AND
- DPIA already conducted as part of general impact assessment

## DPIA Process (5 Steps)

### 1. Screening (Threshold Assessment)

**Determine if DPIA required**:

- Review mandatory scenarios
- Apply WP29 9 criteria test
- Check supervisory authority "DPIA lists"
- Document screening decision

**Output**: Go/No-Go decision with justification

### 2. Description of Processing

**Systematic description including**:

- Nature of processing (what, why, how)
- Purposes of processing
- Lawful basis for processing
- Legitimate interests (if applicable)
- Personal data categories
- Special category data
- Data subject categories
- Recipients of data (internal, external, third countries)
- Data flows (collection → storage → use → deletion)
- Retention periods
- Technical and organizational measures
- Third-party processors involved
- Functional description of system/technology

**Key Questions**:

- What personal data is processed?
- Why is it processed?
- How is it processed (automated, manual)?
- Who has access?
- Where is it stored/transferred?
- How long is it kept?

### 3. Necessity and Proportionality Assessment

**Evaluate**:

- Compliance with GDPR principles (Article 5)
- Necessity: Could purposes be achieved with less data?
- Proportionality: Is processing appropriate for purposes?
- Alternative means: Are there less intrusive options?
- Data minimization: Only necessary data collected?
- Storage limitation: Retention periods justified?
- Purpose limitation: Clear, specific purposes?

**Data Protection by Design and Default** (Article 25):

- Pseudonymization where possible
- Encryption of personal data
- Minimized data collection
- Transparency measures
- Enable data subject rights
- Privacy-preserving defaults

### 4. Risk Assessment

**Identify Risks to Data Subjects**:

**Risk Categories**:

1. **Illegal access** (data breach, hacking)
2. **Unwanted modification** (data alteration, corruption)
3. **Disappearance** (data loss, deletion)
4. **Disclosure** (unauthorized sharing, surveillance)

**Risk to Rights and Freedoms**:

- Discrimination
- Identity theft/fraud
- Financial loss
- Reputational damage
- Loss of confidentiality (medical, professional)
- Economic/social disadvantage
- Deprivation of rights
- Physical harm
- Psychological harm

**Risk Assessment Matrix**:

| Severity | Likelihood | Risk Level | Action Required |
|----------|-----------|------------|-----------------|
| High | Likely | Critical | Must mitigate before processing |
| High | Possible | High | Strong mitigation required |
| Medium | Likely | High | Strong mitigation required |
| Medium | Possible | Moderate | Mitigation recommended |
| Low | Unlikely | Low | Accept or basic mitigation |

**For Each Risk**:

- Source (threat)
- Potential impact on data subjects
- Severity (negligible, limited, significant, maximum)
- Likelihood (negligible, possible, likely, maximum)
- Overall risk level

### 5. Risk Mitigation Measures

**Identify and Implement Safeguards**:

**Technical Measures**:

- Encryption (at rest, in transit, end-to-end)
- Pseudonymization and anonymization
- Access controls (role-based, least privilege)
- Authentication (MFA, strong passwords)
- Network security (firewalls, segmentation)
- Logging and monitoring
- Data loss prevention (DLP)
- Secure deletion/disposal
- Regular security testing

**Organizational Measures**:

- Policies and procedures
- Privacy notices and transparency
- Consent management
- Data minimization practices
- Retention and deletion schedules
- Staff training and awareness
- Incident response plan
- Vendor management (DPA clauses)
- Data subject rights procedures
- Regular audits and reviews

**Governance Measures**:

- DPO involvement and oversight
- Privacy by Design integration
- Third-party assessments
- Compliance monitoring
- Documentation and accountability

**Residual Risk**:

- Re-assess risks after mitigation
- Document residual risk acceptance
- If high residual risk → consult supervisory authority

## Consultation Requirements

### Consult Data Protection Officer (DPO)

- Article 35(2): DPO must provide advice
- Involve DPO throughout DPIA process
- Document DPO input and recommendations

### Consult Data Subjects (Where Appropriate)

- Article 35(9): Seek views of data subjects/representatives
- Not always required but recommended
- Methods: Surveys, focus groups, privacy advocates
- Document consultation outcomes

### Consult Supervisory Authority (If High Residual Risk)

- Article 36: Prior consultation required if:
  - DPIA shows high risk, AND
  - Controller cannot sufficiently mitigate risk
- Submit DPIA and proposed measures
- Authority provides written advice within 8 weeks (extendable)
- Must not process until consultation complete

## DPIA Documentation

### Required Content (Article 35)

1. **Systematic description** of processing operations and purposes
2. **Assessment of necessity and proportionality**
3. **Assessment of risks** to rights and freedoms
4. **Measures to address risks** including safeguards, security, compliance demonstration

### Additional Best Practice Elements

- Executive summary
- DPIA scope and boundaries
- Data controller and DPO details
- Lawful basis and legitimate interests
- Data flow diagrams
- Third-party processors list
- Privacy by Design measures
- Data subject rights implementation
- Compliance checklist (7 principles, rights, obligations)
- Sign-off and approval records
- Review schedule

## Review and Update DPIA

**Triggers for Review**:

- Planned review schedule (e.g., annually)
- Changes to processing operations
- New risks identified
- Technology changes
- Legal/regulatory changes
- Supervisory authority guidance
- Data breaches or incidents
- Organizational changes (merger, acquisition)

**Review Process**:

1. Assess if changes trigger new DPIA
2. Update existing DPIA if appropriate
3. Re-evaluate risks and mitigation
4. Consult DPO on changes
5. Document review and updates
6. Obtain new approvals if needed

## Supervisory Authority DPIA Lists

**Positive Lists**: Processing requiring DPIA
**Negative Lists**: Processing not requiring DPIA

**Check your jurisdiction's DPA** for:

- Country-specific DPIA requirements
- Industry-specific guidance (healthcare, finance, etc.)
- Technology-specific guidance (AI, biometrics, etc.)

## Examples

```bash
# Screen whether DPIA is required for new customer analytics system
/gdpr:dpia "Customer Analytics Platform" screening

# Conduct full DPIA for employee monitoring system
/gdpr:dpia "Employee Monitoring System" assessment

# Review existing DPIA for mobile app processing
/gdpr:dpia "Mobile App User Data" review

# DPIA for AI-powered recruitment tool
/gdpr:dpia "AI Recruitment Tool"

# DPIA for health data processing
/gdpr:dpia "Patient Health Portal" assessment
```

## DPIA Templates and Resources

**Official Guidance**:

- WP29 Guidelines on DPIA (WP248 rev.01)
- ICO DPIA guidance and template
- CNIL PIA methodology and tools
- EDPB Guidelines 09/2020 on relevant criteria

**Template Sections** (Typical Structure):

1. **Introduction** (Purpose, scope, DPIA team)
2. **Screening Assessment** (Threshold determination)
3. **Processing Description** (What, why, how)
4. **Necessity and Proportionality** (Compliance with principles)
5. **Consultation** (DPO, data subjects, stakeholders)
6. **Risk Assessment** (Identified risks, severity, likelihood)
7. **Risk Treatment** (Mitigation measures, residual risk)
8. **Sign-off** (Controller approval, DPO review)
9. **Review Schedule** (Next review date, triggers)

## Common DPIA Mistakes to Avoid

1. **Treating DPIA as checkbox exercise** - Must be meaningful risk assessment
2. **Not involving DPO early** - DPO must advise throughout
3. **Ignoring data subject consultation** - Required where appropriate
4. **Generic risk assessments** - Risks must be specific to processing
5. **Inadequate mitigation** - High risks require strong safeguards
6. **No review process** - DPIAs must be living documents
7. **Skipping prior consultation** - Required if high residual risk remains
8. **Poor documentation** - DPIA must demonstrate accountability

## Output Format

The DPIA assessment provides:

1. **DPIA Necessity Determination**: Required/Not Required with justification
2. **Processing Description**: Comprehensive systematic description
3. **Compliance Analysis**: Assessment against GDPR principles
4. **Risk Register**: Identified risks with severity/likelihood
5. **Mitigation Plan**: Technical and organizational measures
6. **Residual Risk Assessment**: Remaining risks after mitigation
7. **Consultation Records**: DPO, data subjects, authority (if needed)
8. **Approval and Review**: Sign-off and next review date
9. **Action Items**: Specific tasks to complete before/during processing
