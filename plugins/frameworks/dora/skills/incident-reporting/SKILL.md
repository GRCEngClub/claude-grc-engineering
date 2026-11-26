---
name: incident-reporting
description: Major ICT-related incident reporting process and requirements under DORA
---

# DORA Incident Reporting

Provides comprehensive guidance on DORA's incident management and reporting requirements for major ICT-related incidents.

## Arguments

- Argument 1 - Incident severity (required: major, non-major, cyber-threat)
- Argument 2 - Reporting stage (optional: initial, intermediate, final, update)

## Incident Reporting Overview

**Legal Basis**: Articles 17-23 of DORA
**Requirement**: Mandatory reporting of major incidents to national competent authorities
**Timeline**: Strict deadlines (4 hours, 72 hours, 1 month)
**Penalties**: Significant fines for non-compliance

## Incident Classification

### Major Incident Criteria (Article 18)

An ICT-related incident is classified as **major** if it meets one or more of these criteria:

#### 1. Impact on Financial Services

**Threshold Indicators**:

- Critical or important functions affected
- Services unavailable or degraded
- Transaction processing disrupted
- Client access to accounts/services blocked
- Payment systems affected

**Examples**:

- Online banking unavailable for >2 hours
- Payment processing system down
- Trading platform outage during market hours
- ATM network failure affecting multiple locations

#### 2. Client/Counterparty Impact

**Threshold Indicators**:

- Large number of clients affected (>10,000 for large entities, proportionate for smaller)
- High-value counterparties impacted
- Multiple member states affected
- Impact duration exceeds tolerance levels

**Examples**:

- Widespread account access issues
- Failed bulk payments affecting thousands
- Trading disruptions affecting multiple clients
- Data breach exposing client information

#### 3. Duration of Impact

**Threshold Indicators**:

- Service unavailable exceeding RTO (Recovery Time Objective)
- Prolonged degradation of critical services
- Extended recovery time
- Multiple business days affected

**Typical Thresholds** (entity-specific):

- Critical services: >2-4 hours
- Important services: >4-8 hours
- Supporting services: >24 hours

#### 4. Geographical Spread

**Threshold Indicators**:

- Incident affects operations in multiple EU member states
- Cross-border service disruption
- International clients impacted
- Widespread system failure

#### 5. Data Loss or Corruption

**Threshold Indicators**:

- Loss of critical data affecting service delivery
- Data corruption preventing transaction processing
- Integrity of financial records compromised
- Personal data breach requiring GDPR notification

**Examples**:

- Transaction database corruption
- Customer account data loss
- Financial records integrity issues
- Backup systems compromised

#### 6. Reputational Impact

**Threshold Indicators**:

- Significant media coverage
- Public confidence affected
- Regulatory scrutiny triggered
- Market impact on share price

**Examples**:

- Major cybersecurity breach publicized
- Extended service outage reported in media
- Data breach affecting thousands of clients
- Ransomware attack with public demands

#### 7. Economic Impact

**Threshold Indicators**:

- Direct financial losses exceeding materiality thresholds
- Operational costs of incident response
- Regulatory fines or penalties
- Client compensation required

**Typical Thresholds**:

- Large institutions: >EUR 100,000
- Medium institutions: >EUR 50,000
- Small institutions: >EUR 10,000
- *(Proportionate to entity size and complexity)*

### Non-Major Incidents

**Characteristics**:

- Limited impact on services
- Contained to single function/system
- Quick resolution (within tolerance)
- Minimal client impact
- No data loss or corruption
- No reputational damage

**Reporting**:

- Internal tracking and documentation required
- No mandatory reporting to authorities
- May aggregate for trend analysis
- Report if incident escalates to major

### Cyber Threats (Article 20)

**Definition**:

- Potential cyber attack identified
- Vulnerability discovered that could be exploited
- Threat intelligence indicating targeting
- Reconnaissance or probing detected

**Reporting**:

- **Voluntary** notification to authorities
- Can share with other financial entities
- Liability protection for good faith sharing
- Helps collective defense

## Incident Reporting Timeline

### Initial Notification (4 Hours)

**Deadline**: Within 4 hours of detection and classification as major incident

**Required Information**:

- Date and time of incident detection
- Indication that incident is classified as major
- Preliminary description of incident
- Affected systems or services
- Initial assessment of impact
- Status of incident (ongoing, contained, resolved)

**Submission Method**:

- Via single point of contact to NCA
- Using standardized template (when available)
- Electronic submission preferred

**Key Point**: This is notification of awareness, not full analysis. Speed is critical.

### Intermediate Report (72 Hours)

**Deadline**: Within 72 hours of initial notification

**Required Information**:

- Updated incident classification and justification
- Actual number of clients/users affected
- Actual duration of impact to date
- Geographical scope of incident
- Root cause analysis (preliminary or final)
- Technical details of incident:
  - Attack vectors (if applicable)
  - Vulnerabilities exploited
  - Systems/services compromised
  - Data affected
- Mitigation actions taken
- Recovery actions initiated
- Expected recovery timeline
- Whether incident is ongoing
- Estimated further impact

**Analysis Required**:

- More detailed impact assessment
- Initial root cause if identified
- Evidence of mitigation effectiveness

### Final Report (1 Month)

**Deadline**: Within 1 month after initial notification (may be extended in complex cases)

**Required Information**:

- **Comprehensive Incident Description**:
  - Full timeline of events
  - Complete impact assessment
  - Final client/service impact numbers
  - Total duration of incident

- **Root Cause Analysis**:
  - Definitive root cause identification
  - Contributing factors
  - Why incident occurred
  - Why incident was not prevented/detected earlier

- **Remediation Actions**:
  - Immediate fixes implemented
  - System restoration details
  - Data recovery efforts
  - Compensating controls deployed

- **Lessons Learned**:
  - What went well
  - What needs improvement
  - Gaps identified in defenses
  - Process failures

- **Preventive Measures**:
  - Long-term fixes planned/implemented
  - Control enhancements
  - Process improvements
  - Technology upgrades

- **Estimated Costs**:
  - Direct incident costs
  - Recovery costs
  - Remediation costs
  - Business impact (if calculable)

**Quality Expectations**:

- Thorough and accurate
- Evidence-based conclusions
- Clear action plan
- Demonstrates learning

### Significant Updates (As Needed)

**When Required**:

- Material change to impact assessment
- Discovery of additional affected systems/data
- Extended recovery timeline
- New information about root cause
- Incident evolves or escalates
- Regulatory inquiry requires response

**Timeline**: As soon as reasonably practicable after new information emerges

## Incident Management Process

### 1. Detection and Logging

**Activities**:

- Continuous monitoring detects anomaly
- Alerts triggered via SIEM or monitoring tools
- Incident logged in incident management system
- Initial timestamp recorded

**Tools**:

- SIEM (Security Information and Event Management)
- IDS/IPS (Intrusion Detection/Prevention Systems)
- Monitoring dashboards
- Anomaly detection systems

### 2. Initial Assessment

**Activities**:

- Security/IT team reviews alert
- Validates incident is genuine (not false positive)
- Assesses initial scope and impact
- Determines if incident could be major

**Timeframe**: Within 30-60 minutes of detection

### 3. Classification

**Activities**:

- Apply major incident criteria
- Consult classification matrix/decision tree
- Engage management if borderline
- Document classification decision

**Key Decision**: Major or Non-Major?

**If Major**:

- Initiate 4-hour notification clock
- Activate major incident response plan
- Notify senior management and board

**If Non-Major**:

- Continue internal incident response
- Document in internal register
- Monitor for escalation

### 4. Containment

**Activities**:

- Isolate affected systems
- Prevent spread of incident
- Preserve evidence for investigation
- Implement emergency workarounds

**Examples**:

- Network segmentation
- System isolation
- Account lockdowns
- Service redirects to backup systems

### 5. Initial Notification (if Major)

**Activities**:

- Prepare initial notification form
- Submit to NCA within 4 hours
- Copy to internal stakeholders
- Update incident log

**Checklist**:

- [ ] Incident detected and classified
- [ ] Senior management notified
- [ ] Initial notification form completed
- [ ] Submitted to NCA within 4 hours
- [ ] Confirmation received from NCA
- [ ] Internal stakeholders informed

### 6. Investigation and Analysis

**Activities**:

- Forensic investigation
- Root cause analysis
- Impact assessment
- Evidence collection
- Timeline reconstruction

**Outputs**:

- Incident timeline
- Root cause report
- Impact quantification
- Evidence package

### 7. Remediation and Recovery

**Activities**:

- Implement fixes
- Restore services
- Verify integrity
- Test functionality
- Communicate with clients

**Validation**:

- Services fully restored
- No residual vulnerabilities
- Monitoring confirms stability
- Clients notified of resolution

### 8. Intermediate Reporting (if Major)

**Activities**:

- Compile intermediate report
- Include all required elements
- Submit within 72 hours
- Update incident management system

### 9. Post-Incident Review

**Activities**:

- Lessons learned session
- Documentation of findings
- Improvement action items
- Update procedures/playbooks

**Attendees**:

- Incident response team
- Affected business units
- Senior management
- Risk and compliance

### 10. Final Reporting (if Major)

**Activities**:

- Compile comprehensive final report
- Complete root cause analysis
- Document all remediation
- Submit within 1 month
- Close incident in system

### 11. Continuous Improvement

**Activities**:

- Implement lessons learned
- Update incident response plans
- Enhance monitoring/detection
- Training on new procedures
- Test improvements

## Reporting Channels and Contacts

### National Competent Authority (NCA)

**Identify Your NCA**:

- Credit institutions: National banking supervisor (e.g., ECB, national central bank)
- Investment firms: National securities regulator
- Payment institutions: Payment services authority
- Insurance: National insurance regulator

**Single Point of Contact**:

- Designate internal contact person for NCA
- Provide contact details to NCA in advance
- Ensure 24/7 availability for major incidents
- Maintain backup contacts

**Submission Methods**:

- Electronic portal (varies by country)
- Secure email (encryption required)
- Dedicated incident reporting system
- Phone notification followed by written report

### Internal Escalation

**Notification Chain**:

1. IT/Security Operations Center (SOC)
2. Chief Information Security Officer (CISO)
3. Chief Information Officer (CIO)
4. Chief Risk Officer (CRO)
5. Chief Executive Officer (CEO)
6. Board of Directors (for major incidents)

**Timing**:

- Immediate: SOC, CISO, CIO
- Within 1 hour: CRO, CEO (if major)
- Within 4 hours: Board chair (if major and ongoing)
- Next scheduled meeting: Full board briefing

## Incident Response Documentation

### Incident Log (All Incidents)

**Required Fields**:

- Incident ID
- Date and time of detection
- Date and time of classification
- Incident type (e.g., cyber attack, system failure, data breach)
- Affected systems and services
- Impact assessment
- Classification (major/non-major)
- Actions taken
- Status (open, contained, resolved, closed)
- Lessons learned

### Major Incident File

**Additional Documentation**:

- Initial notification submission and NCA confirmation
- Intermediate report submission
- Final report submission
- All updates and significant changes
- Evidence collected (logs, forensics, screenshots)
- Root cause analysis
- Post-incident review notes
- Remediation tracking
- Cost tracking

### Incident Response Plan

**Required Components**:

- Incident response team roles and responsibilities
- Classification criteria and decision trees
- Escalation procedures
- Communication templates
- NCA contact information
- Technical response procedures
- Recovery procedures
- Testing and training schedule

## Common Reporting Challenges

### Challenge 1: Classification Uncertainty

**Issue**: Unclear if incident meets major criteria
**Solution**:

- Use documented decision tree
- Consult with risk/compliance
- When in doubt, report as major (can downgrade later)
- Document classification rationale

### Challenge 2: Timeline Pressure

**Issue**: 4-hour notification deadline is tight
**Solution**:

- Pre-populate templates
- Automate data collection
- Designate on-call responders
- Conduct incident drills

### Challenge 3: Incomplete Information

**Issue**: Not all details available within deadlines
**Solution**:

- Provide best available information
- Clearly state what is preliminary/estimated
- Commit to updates as information emerges
- Document information gaps

### Challenge 4: Cross-Border Incidents

**Issue**: Incident affects multiple EU countries, unclear which NCA to notify
**Solution**:

- Notify NCA of home member state
- Indicate cross-border nature
- NCA will coordinate with other regulators
- May need to notify multiple NCAs (follow their guidance)

### Challenge 5: Third-Party Incidents

**Issue**: Incident originates from ICT service provider
**Solution**:

- Financial entity still responsible for reporting
- Coordinate with service provider for details
- Ensure service provider contractual obligation to provide incident information
- Report even if incident is provider's fault

## Penalties for Non-Compliance

**Failure to Report**:

- Administrative fines up to 1% of annual turnover
- Reputational damage
- Increased regulatory scrutiny
- Potential license implications

**Late Reporting**:

- Proportionate penalties based on delay
- Supervisory action
- Remediation requirements

**Inaccurate Reporting**:

- Penalties for misleading information
- Requirement to resubmit
- Loss of regulatory trust

## Best Practices

### Preparation

- [ ] Maintain up-to-date incident response plan
- [ ] Conduct regular incident response drills
- [ ] Pre-populate notification templates
- [ ] Establish clear communication channels with NCA
- [ ] Train all personnel on classification criteria

### Detection

- [ ] Implement 24/7 monitoring for critical systems
- [ ] Deploy automated alerting
- [ ] Integrate threat intelligence
- [ ] Regular review of detection effectiveness

### Response

- [ ] Activate incident response team immediately
- [ ] Document everything in real-time
- [ ] Preserve evidence (logs, forensics)
- [ ] Communicate clearly and frequently with stakeholders

### Reporting

- [ ] Start clock immediately upon classification
- [ ] Submit initial notification well before 4-hour deadline
- [ ] Provide accurate, complete information
- [ ] Flag uncertainties and estimate ranges
- [ ] Follow up proactively with updates

### Learning

- [ ] Conduct thorough post-incident review
- [ ] Document lessons learned
- [ ] Update procedures and controls
- [ ] Share insights with team
- [ ] Test improvements

## Examples

```bash
# Get guidance for reporting a major incident (initial notification)
/dora:incident-reporting major initial

# Prepare intermediate report for major incident
/dora:incident-reporting major intermediate

# Understand non-major incident handling
/dora:incident-reporting non-major

# Guidance on voluntary cyber threat reporting
/dora:incident-reporting cyber-threat

# Prepare final report for major incident
/dora:incident-reporting major final

# Update reporting for evolving incident
/dora:incident-reporting major update
```
