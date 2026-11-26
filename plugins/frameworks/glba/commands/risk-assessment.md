---
description: GLBA risk assessment methodology and guidance
---

# GLBA Risk Assessment

Provides methodology and guidance for conducting risk assessments required under the GLBA Safeguards Rule.

## Arguments

- Argument 1 - Assessment phase (required: planning, execution, reporting, all)
- Argument 2 - Methodology (optional: nist, iso, qualitative, quantitative)

## Risk Assessment Requirement

**Authority**: 16 CFR Part 314.4(b) - Safeguards Rule Element #2
**Requirement**: "Identify and assess reasonably foreseeable internal and external risks to the security, confidentiality, and integrity of customer information"

**Purpose**:

- Understand threats and vulnerabilities
- Prioritize security investments
- Demonstrate due diligence
- Support board reporting
- Guide safeguard selection

**Frequency**:

- At least annually
- When significant changes occur
- After security incidents
- When new systems/processes introduced

## Risk Assessment Phases

### Phase 1: Planning

**Objectives**:

- Define scope and boundaries
- Select methodology
- Assemble team
- Schedule activities
- Gather preliminary information

**Scope Definition**:

1. **Information Assets**:
   - Customer information (NPI)
   - Systems storing/processing NPI
   - Databases and data repositories
   - Backup systems
   - Cloud services

2. **Physical Locations**:
   - Branch offices
   - Data centers
   - Remote work environments
   - Third-party facilities

3. **Processes**:
   - Account opening
   - Transaction processing
   - Customer service
   - Marketing
   - IT operations

4. **People**:
   - Employees with access to customer data
   - Contractors and vendors
   - Service providers

**Team Composition**:

- Risk assessment lead
- IT/security personnel
- Business unit representatives
- Compliance officer
- Legal counsel (as needed)
- External consultants (if applicable)

### Phase 2: Execution

**Step 1: Asset Identification**

**Information Assets**:

- Customer databases
- Transaction systems
- CRM systems
- Document management
- Email archives
- Backup tapes/systems

**Inventory Details**:

- Asset name/description
- Data classification (customer information, sensitive, public)
- Storage location (on-premise, cloud, hybrid)
- Access controls
- Retention period

**Step 2: Threat Identification**

**External Threats**:

1. **Cyberattacks**:
   - Ransomware
   - Phishing/social engineering
   - DDoS attacks
   - SQL injection
   - Zero-day exploits
   - Advanced persistent threats (APT)

2. **Environmental**:
   - Natural disasters (flood, fire, earthquake)
   - Power outages
   - HVAC failures

3. **Third-Party**:
   - Cloud provider outages
   - Vendor data breaches
   - Supply chain attacks

**Internal Threats**:

1. **Insider Threats**:
   - Malicious employees
   - Negligent employees
   - Compromised credentials
   - Privilege abuse

2. **Operational**:
   - Human error
   - Process failures
   - System misconfigurations
   - Change management failures

3. **Technology**:
   - Aging infrastructure
   - Unpatched vulnerabilities
   - Insufficient capacity
   - Single points of failure

**Step 3: Vulnerability Analysis**

**Technical Vulnerabilities**:

- Missing patches
- Weak authentication
- Unencrypted data
- Open network shares
- Default configurations
- Legacy systems
- Insufficient logging

**Administrative Vulnerabilities**:

- Inadequate policies
- Lack of security awareness
- Unclear roles/responsibilities
- Insufficient vendor oversight
- No incident response plan

**Physical Vulnerabilities**:

- Inadequate access controls
- No visitor management
- Unsecured disposal
- Environmental controls lacking

**Assessment Methods**:

- Vulnerability scanning (automated tools)
- Configuration reviews
- Policy/procedure reviews
- Penetration testing
- Physical security assessments
- Interviews with staff

**Step 4: Likelihood Assessment**

**Factors to Consider**:

- Threat actor capability
- Threat actor motivation
- Ease of exploitation
- Existing controls
- Historical incidents
- Industry trends

**Likelihood Ratings**:

- **Low**: Unlikely to occur (0-25% probability)
- **Medium**: May occur (25-75% probability)
- **High**: Likely to occur (75-100% probability)

**Evidence Sources**:

- Threat intelligence feeds
- Industry reports (Verizon DBIR, etc.)
- Incident history
- Security assessments
- Vulnerability scan results

**Step 5: Impact Analysis**

**Impact Categories**:

1. **Financial Impact**:
   - Direct losses (fraud, theft)
   - Regulatory fines and penalties
   - Legal costs
   - Remediation costs
   - Customer compensation
   - Lost revenue

2. **Operational Impact**:
   - Business disruption
   - System downtime
   - Recovery time
   - Customer service degradation

3. **Reputational Impact**:
   - Customer trust erosion
   - Media coverage
   - Brand damage
   - Competitive disadvantage

4. **Compliance Impact**:
   - Regulatory violations
   - Contractual breaches
   - Certification loss
   - Consent orders

**Impact Ratings**:

- **Low**: Minimal impact, easily recoverable (<\$50K, <1 day disruption)
- **Medium**: Moderate impact, recoverable (\$50K-\$500K, 1-7 days disruption)
- **High**: Severe impact, difficult recovery (>\$500K, >7 days disruption, regulatory action)

**Step 6: Control Evaluation**

**Existing Controls Inventory**:

**Preventive Controls**:

- Firewalls, IDS/IPS
- Multi-factor authentication
- Encryption
- Access controls
- Security awareness training
- Patch management
- Antivirus/anti-malware

**Detective Controls**:

- Log monitoring
- SIEM
- Vulnerability scanning
- Intrusion detection
- Audit reviews

**Corrective Controls**:

- Incident response plan
- Backup and recovery
- Business continuity plan
- Patch deployment

**Control Effectiveness**:

- **Effective**: Control adequately mitigates risk
- **Partially Effective**: Control provides some mitigation
- **Ineffective**: Control does not mitigate risk

**Step 7: Risk Calculation**

**Risk Formula**: Risk = Likelihood × Impact

**Risk Matrix**:

|               | Low Impact | Medium Impact | High Impact |
|---------------|------------|---------------|-------------|
| **High Likelihood** | Medium | High | Critical |
| **Medium Likelihood** | Low | Medium | High |
| **Low Likelihood** | Low | Low | Medium |

**Risk Levels**:

- **Critical**: Immediate action required
- **High**: Address within 30 days
- **Medium**: Address within 90 days
- **Low**: Monitor, address as resources allow

**Residual Risk**: Risk remaining after existing controls applied

### Phase 3: Reporting

**Risk Assessment Report Components**:

1. **Executive Summary**:
   - Assessment scope and methodology
   - Key findings
   - Overall risk posture
   - Top risks
   - Recommendations

2. **Methodology**:
   - Framework used (NIST, ISO, etc.)
   - Assessment activities
   - Data sources
   - Limitations

3. **Asset Inventory**:
   - Systems and data in scope
   - Criticality ratings
   - Data classifications

4. **Threat and Vulnerability Analysis**:
   - Identified threats
   - Discovered vulnerabilities
   - Threat landscape summary

5. **Risk Register**:
   - Risk ID
   - Risk description
   - Threat + Vulnerability
   - Likelihood rating
   - Impact rating
   - Risk level
   - Existing controls
   - Residual risk
   - Treatment recommendation

6. **Risk Treatment Plan**:
   - Mitigation strategies
   - Responsible parties
   - Target completion dates
   - Resource requirements
   - Priority rankings

7. **Metrics and Trends**:
   - Risk level distribution
   - Year-over-year comparison
   - Control maturity
   - Vulnerability trends

**Audience-Specific Reporting**:

- **Board of Directors**: Executive summary, top risks, financial impact, strategic recommendations
- **Management**: Detailed findings, operational recommendations, resource needs
- **Technical Teams**: Vulnerability details, remediation steps, technical controls

## Risk Assessment Methodologies

### NIST-Based Approach

**Framework**: NIST SP 800-30 "Guide for Conducting Risk Assessments"

**Process**:

1. Prepare for assessment
2. Conduct assessment (identify threats, vulnerabilities, likelihood, impact)
3. Communicate results
4. Maintain assessment (ongoing)

**Advantages**:

- Well-documented
- Widely recognized
- Comprehensive
- Free/public resource

**Tools**: NIST 800-30 templates, RMF tools

### ISO 27005 Approach

**Framework**: ISO/IEC 27005 "Information Security Risk Management"

**Process**:

1. Context establishment
2. Risk identification
3. Risk analysis
4. Risk evaluation
5. Risk treatment

**Advantages**:

- International standard
- Aligns with ISO 27001
- Systematic approach

**Considerations**: Requires ISO 27005 standard (not free)

### Qualitative Methodology

**Approach**: Use subjective ratings (High/Medium/Low) for likelihood and impact

**Advantages**:

- Fast and simple
- Low resource requirements
- Understandable to non-technical stakeholders

**Disadvantages**:

- Subjective assessments
- Harder to prioritize
- May lack precision

**Best For**: Small institutions, initial assessments, limited resources

### Quantitative Methodology

**Approach**: Calculate numerical risk values based on financial impact

**Formulas**:

- **ALE (Annual Loss Expectancy)** = ARO × SLE
- **ARO (Annualized Rate of Occurrence)**: Expected frequency per year
- **SLE (Single Loss Expectancy)**: Expected loss per incident

**Advantages**:

- Objective, data-driven
- Enables cost-benefit analysis
- Supports budget justification

**Disadvantages**:

- Requires extensive data
- Time-consuming
- Difficult to quantify reputational impact

**Best For**: Large institutions, mature risk programs, justifying major investments

## Risk Treatment Options

### 1. Mitigate (Reduce)

**Strategy**: Implement controls to reduce likelihood or impact

**Examples**:

- Deploy MFA to reduce account compromise risk
- Implement encryption to reduce data exposure impact
- Add SIEM to improve detection

**When Appropriate**: Cost of control < risk reduction benefit

### 2. Transfer (Share)

**Strategy**: Shift risk to third party

**Examples**:

- Cyber insurance
- Outsource to managed service provider
- Cloud service provider shared responsibility

**When Appropriate**: Cost-effective transfer available, residual risk acceptable

### 3. Accept (Retain)

**Strategy**: Acknowledge risk and take no additional action

**Examples**:

- Low-likelihood, low-impact risks
- Cost of mitigation exceeds potential loss
- Business justification for accepting risk

**Requirements**:

- Documented risk acceptance by management
- Periodic review
- Monitoring for changes

### 4. Avoid (Eliminate)

**Strategy**: Eliminate the risk by discontinuing activity

**Examples**:

- Decommission vulnerable legacy system
- Discontinue high-risk service
- Exit high-risk market

**When Appropriate**: Risk unacceptable and cannot be adequately mitigated

## Common Risk Assessment Challenges

1. **Scope Creep**:
   - Assessment expands beyond original scope
   - **Solution**: Clear boundaries, phased approach

2. **Data Availability**:
   - Incomplete asset inventory
   - Lack of historical incident data
   - **Solution**: Discovery tools, industry benchmarks, assumptions

3. **Subjectivity**:
   - Inconsistent likelihood/impact ratings
   - **Solution**: Defined rating criteria, calibration sessions

4. **Resource Constraints**:
   - Limited staff time
   - Budget limitations
   - **Solution**: Prioritized scope, automated tools, consultants

5. **Stakeholder Engagement**:
   - Business units unresponsive
   - Lack of executive support
   - **Solution**: Executive sponsorship, communicate value, involve early

## Integration with Safeguards Rule

**Risk Assessment Feeds**:

1. **Safeguard Selection** (Element #3): Use risk assessment to prioritize controls
2. **Monitoring and Testing** (Element #4): Focus testing on high-risk areas
3. **Training** (Element #5): Tailor training to identified threats
4. **Service Provider Selection** (Element #6): Risk-based due diligence
5. **Program Evaluation** (Element #7): Use findings to adjust program
6. **Incident Response** (Element #8): Prepare for likely incident scenarios
7. **Board Reporting** (Element #9): Report top risks to board

**Continuous Process**: Risk assessment not one-time exercise; ongoing risk management

## Examples

```bash
# Complete risk assessment guidance
/glba:risk-assessment all nist

# Planning phase for risk assessment
/glba:risk-assessment planning

# Execution guidance using qualitative methodology
/glba:risk-assessment execution qualitative

# Risk reporting templates and best practices
/glba:risk-assessment reporting

# Quantitative risk assessment approach
/glba:risk-assessment all quantitative
```

## Risk Assessment Checklist

**Planning**:

- [ ] Define assessment scope (systems, locations, processes)
- [ ] Select methodology (NIST, ISO, qualitative, quantitative)
- [ ] Assemble assessment team
- [ ] Schedule assessment activities
- [ ] Gather asset inventory

**Execution**:

- [ ] Identify information assets
- [ ] Identify threats (internal and external)
- [ ] Identify vulnerabilities (technical, administrative, physical)
- [ ] Assess likelihood of threat exploitation
- [ ] Assess impact of successful threat exploitation
- [ ] Evaluate existing controls
- [ ] Calculate inherent and residual risk

**Reporting**:

- [ ] Develop risk register
- [ ] Create risk treatment plan
- [ ] Prepare executive summary for board
- [ ] Document methodology and findings
- [ ] Communicate results to stakeholders

**Follow-Up**:

- [ ] Track risk treatment implementation
- [ ] Monitor high and critical risks
- [ ] Update risk assessment annually or when changes occur
- [ ] Report residual risks to board
- [ ] Integrate findings into security program
