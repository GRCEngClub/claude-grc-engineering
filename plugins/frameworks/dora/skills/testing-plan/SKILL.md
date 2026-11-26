---
name: testing-plan
description: Digital operational resilience testing requirements and planning under DORA
---

# DORA Resilience Testing

Comprehensive guidance on DORA's digital operational resilience testing requirements, including advanced threat-led penetration testing (TLPT).

## Arguments

- Argument 1 - Testing type (required: general, advanced-tlpt, vulnerability, scenario, all)
- Argument 2 - Entity profile (optional: significant, non-significant)

## Testing Framework Overview

**Legal Basis**: Articles 24-27 of DORA
**Purpose**: Ensure systems can withstand, respond to, and recover from ICT-related disruptions
**Principle**: Risk-based and proportionate approach
**Frequency**: Regular basis with minimum annual testing

## Testing Requirements by Entity Type

### Significant Financial Entities

**Characteristics**:

- Systemically important
- Large market share
- Critical infrastructure provider
- Interconnected with financial system

**Testing Requirements**:

- **All general testing** (Article 24)
- **Advanced testing (TLPT)** at least every 3 years (Article 26)
- More rigorous scope and frequency
- External validation required
- TLPT based on TIBER-EU or equivalent

### Non-Significant Financial Entities

**Characteristics**:

- Smaller market footprint
- Limited systemic importance
- Less complex operations

**Testing Requirements**:

- **General testing** (Article 24) required
- **TLPT optional** (but recommended)
- Proportionate scope based on risk profile
- May use simplified methodologies
- Internal testing acceptable with oversight

## General Testing Requirements (Article 24)

### Mandatory Testing Types

#### 1. Vulnerability Assessments and Scans

**Purpose**: Identify security weaknesses in systems and applications

**Scope**:

- Network infrastructure
- Operating systems
- Applications and databases
- Cloud environments
- APIs and interfaces

**Frequency**:

- Quarterly for critical systems
- At least annually for all systems
- After significant changes

**Tools**:

- Automated vulnerability scanners (Nessus, Qualys, Rapid7)
- Manual testing for complex systems
- Authenticated scans for deeper analysis

**Deliverables**:

- Vulnerability scan reports
- Risk-rated findings (Critical, High, Medium, Low)
- Remediation recommendations
- Tracking of fixes

#### 2. Open-Source Analysis

**Purpose**: Identify vulnerabilities in open-source components

**Activities**:

- Software composition analysis (SCA)
- Identification of known vulnerabilities (CVEs)
- License compliance review
- Dependency analysis

**Tools**:

- OWASP Dependency Check
- Snyk
- Black Duck
- WhiteSource

**Output**:

- Inventory of open-source components
- Known vulnerabilities identified
- Remediation plan for outdated/vulnerable components

#### 3. Network Security Assessments

**Purpose**: Evaluate security of network infrastructure

**Testing Areas**:

- Firewall configurations
- Network segmentation
- Intrusion detection/prevention systems
- VPN security
- Wireless network security
- Router and switch configurations

**Methods**:

- Configuration reviews
- Traffic analysis
- Port scanning
- Packet inspection

**Deliverables**:

- Network security assessment report
- Configuration weaknesses
- Segmentation gaps
- Remediation roadmap

#### 4. Gap Analyses

**Purpose**: Compare current state against desired security baseline

**Frameworks**:

- DORA requirements
- ISO 27001
- NIST Cybersecurity Framework
- Industry best practices

**Process**:

- Document current controls
- Map to framework requirements
- Identify gaps
- Prioritize remediation

**Output**:

- Gap analysis report
- Control maturity assessment
- Remediation priorities
- Investment roadmap

#### 5. Physical Security Reviews

**Purpose**: Assess physical security of facilities and assets

**Scope**:

- Data center access controls
- Office premises security
- Equipment security
- Visitor management
- Environmental controls (fire, flood, HVAC)

**Activities**:

- Physical walkthroughs
- Access control testing
- Surveillance review
- Incident log review

**Findings**:

- Physical vulnerabilities
- Access control gaps
- Environmental risks
- Improvement recommendations

#### 6. Questionnaires and Scanning Software Solutions

**Purpose**: Self-assessment and automated security checks

**Types**:

- Security control questionnaires
- Configuration scanning tools
- Compliance checklists
- Third-party risk questionnaires

**Examples**:

- CAIQ (Consensus Assessments Initiative Questionnaire)
- SIG (Standardized Information Gathering)
- Internal control self-assessments
- Vendor security assessments

#### 7. Source Code Reviews

**Purpose**: Identify security flaws in application code

**Scope** (where feasible):

- Custom-developed applications
- Critical business applications
- Applications handling sensitive data
- APIs and integrations

**Methods**:

- Static application security testing (SAST)
- Manual code review
- Secure coding standard compliance

**Tools**:

- SonarQube
- Checkmarx
- Veracode
- Fortify

**Findings**:

- Code vulnerabilities (SQL injection, XSS, etc.)
- Insecure coding practices
- Hardcoded secrets
- Remediation guidance

#### 8. Scenario-Based Testing

**Purpose**: Test response to specific incident scenarios

**Scenarios**:

- Ransomware attack
- DDoS (Distributed Denial of Service) attack
- Data breach
- Insider threat
- System failure
- Third-party provider outage

**Methods**:

- Tabletop exercises
- Simulations
- War games
- Crisis management drills

**Participants**:

- IT and security teams
- Business continuity team
- Crisis management team
- Senior management
- Communications team

**Outputs**:

- Scenario test report
- Response effectiveness assessment
- Communication gaps identified
- Plan improvements

#### 9. Compatibility Testing

**Purpose**: Ensure systems interoperate correctly and securely

**Testing Areas**:

- System integrations
- API compatibility
- Data format compatibility
- Cross-platform functionality
- Browser/device compatibility

**Approach**:

- Integration testing
- Interface testing
- Regression testing
- User acceptance testing

#### 10. Performance Testing

**Purpose**: Validate systems perform under stress and load

**Types**:

- Load testing: Normal expected load
- Stress testing: Beyond normal capacity
- Spike testing: Sudden load increases
- Endurance testing: Sustained load over time

**Metrics**:

- Response times
- Throughput
- Resource utilization
- Error rates
- Recovery time

**Scenarios**:

- Peak transaction volumes
- Market volatility surges
- End-of-day processing
- Batch job performance

#### 11. End-to-End Testing

**Purpose**: Validate entire business processes and systems

**Scope**:

- Complete transaction flows
- Multi-system integrations
- User journeys
- Data flows across systems

**Examples**:

- Account opening to closure
- Trade lifecycle (order to settlement)
- Payment processing end-to-end
- Customer onboarding

**Validation**:

- Functional correctness
- Data integrity
- Security controls throughout
- Error handling and recovery

#### 12. Penetration Testing

**Purpose**: Simulate attacks to identify exploitable vulnerabilities

**Scope**:

- External network perimeter
- Internal network
- Web applications
- Mobile applications
- APIs
- Social engineering (if approved)

**Types**:

- Black box: No prior knowledge
- Gray box: Partial knowledge
- White box: Full knowledge

**Methodology**:

- Reconnaissance
- Scanning and enumeration
- Exploitation
- Post-exploitation
- Reporting

**Deliverables**:

- Penetration test report
- Executive summary
- Detailed findings with proof of concept
- Risk ratings
- Remediation guidance

### Testing Frequency and Triggers

**Minimum Frequency**:

- At least annually for all testing types
- More frequent for high-risk systems (quarterly/semi-annual)

**Additional Testing Triggered By**:

- Significant changes to ICT systems
- Infrastructure upgrades
- Application deployments
- New system implementations
- Major incidents (post-incident validation)
- Merger/acquisition integration
- Third-party changes affecting critical services

**Risk-Based Prioritization**:

- Critical systems: Quarterly testing
- Important systems: Semi-annual testing
- Standard systems: Annual testing
- Low-risk systems: Biennial acceptable (with justification)

## Advanced Testing - TLPT (Articles 26-27)

### Threat-Led Penetration Testing (TLPT) Overview

**Definition**: Sophisticated, intelligence-led testing simulating real-world attack scenarios by actual threat actors

**Applicability**:

- Mandatory for significant entities
- At least every 3 years
- May be required more frequently based on risk

**Framework**: Based on TIBER-EU (Threat Intelligence-Based Ethical Red Teaming) or equivalent national frameworks

### TIBER-EU Framework

**Developed By**: European Central Bank (ECB)
**Purpose**: Harmonized approach to TLPT across EU
**Adoption**: Required for DORA compliance (or equivalent framework)

**Key Principles**:

- Intelligence-led: Based on real threat actors and TTPs
- Bespoke: Tailored to entity's environment
- Controlled: Managed process with oversight
- Safe: No disruption to live services
- Documented: Comprehensive reporting

### TLPT Roles

#### 1. White Team

**Role**: Coordination and oversight

**Responsibilities**:

- Manage overall TLPT process
- Coordinate between red and blue teams
- Ensure rules of engagement followed
- Manage escalations
- Document process
- Oversee closure phase

**Composition**:

- Internal staff from security, risk, compliance
- May include external facilitator

#### 2. Red Team

**Role**: Simulate adversary attacks

**Responsibilities**:

- Execute attack scenarios
- Use real-world TTPs (Tactics, Techniques, Procedures)
- Test technical controls
- Test people and processes
- Document findings
- Brief on techniques used

**Composition**:

- **Must be external and independent**
- Certified ethical hackers
- Threat intelligence experts
- Social engineering specialists (if in scope)

**Requirements**:

- Proven expertise in penetration testing
- Knowledge of threat actor TTPs
- Experience with TIBER-EU or similar
- Appropriate certifications (OSCP, CREST, etc.)
- Professional indemnity insurance

#### 3. Blue Team

**Role**: Detect and respond to attacks

**Responsibilities**:

- Operate as usual (unaware of timing)
- Detect attack indicators
- Respond to incidents
- Execute defensive procedures
- Document response

**Composition**:

- Internal security operations team
- Incident response team
- SOC (Security Operations Center)

**Critical Point**: Blue team should **not know** when testing occurs (blind testing for realism)

#### 4. Purple Team (Optional)

**Role**: Collaboration and learning

**Activities**:

- Post-test review
- Share red team techniques
- Analyze blue team response
- Identify detection gaps
- Enhance defensive capabilities

### TLPT Process Phases

#### Phase 1: Preparation (2-4 months)

**Activities**:

1. **Scoping**:
   - Define critical functions and services
   - Identify in-scope systems
   - Determine threat scenarios
   - Establish boundaries (what's off-limits)
   - Define success criteria

2. **Threat Intelligence Gathering**:
   - Identify relevant threat actors
   - Research TTPs used by those actors
   - Open-source intelligence (OSINT)
   - Dark web reconnaissance
   - Sector-specific threats

3. **Scenario Development**:
   - Create realistic attack scenarios
   - Map scenarios to threat actors
   - Define objectives for each scenario
   - Align with critical functions

4. **Rules of Engagement**:
   - Define what red team can/cannot do
   - Establish communication protocols
   - Define escalation procedures
   - Set testing windows
   - Emergency stop conditions

5. **Red Team Selection**:
   - Procure external red team
   - Verify qualifications and independence
   - Contractual agreements
   - NDA and confidentiality

6. **Stakeholder Preparation**:
   - Brief management and board
   - Prepare white team
   - Ensure blue team readiness (but unaware of timing)
   - Third-party provider notifications (if applicable)

**Deliverables**:

- Test plan document
- Threat intelligence report
- Scenario descriptions
- Rules of engagement
- Stakeholder approval

#### Phase 2: Testing (4-12 weeks)

**Activities**:

1. **Reconnaissance**:
   - Red team gathers information about target
   - OSINT, social engineering (if permitted)
   - Network mapping
   - Identify vulnerabilities

2. **Initial Access**:
   - Exploit vulnerabilities
   - Phishing campaigns (if approved)
   - Physical intrusion (if in scope)
   - Gain foothold in environment

3. **Persistence**:
   - Establish persistent access
   - Deploy backdoors
   - Create rogue accounts
   - Evade detection

4. **Privilege Escalation**:
   - Elevate privileges
   - Compromise credentials
   - Exploit misconfigurations
   - Lateral movement

5. **Achieving Objectives**:
   - Access target systems/data
   - Simulate data exfiltration
   - Demonstrate impact
   - Test incident response

6. **Blue Team Response**:
   - Detection of attack indicators (or lack thereof)
   - Incident response activation
   - Containment efforts
   - Investigation and analysis

7. **White Team Monitoring**:
   - Track red team activities
   - Monitor blue team response
   - Document observations
   - Manage any issues

**Timing**:

- Typically 4-8 weeks of active testing
- May be intermittent (not continuous)
- Blue team not told when testing occurs

**Safety Measures**:

- Red team stays within rules of engagement
- White team monitors for unintended impacts
- Emergency stop procedures if needed
- No actual data exfiltration or destruction

#### Phase 3: Closure (1-2 months)

**Activities**:

1. **Debriefing**:
   - Red team reveals activities
   - Blue team shares detection/response
   - Discussion of gaps and successes
   - Collaborative learning (purple team session)

2. **Reporting**:
   - Red team test report
   - Blue team response analysis
   - White team observations
   - Executive summary

3. **Remediation Planning**:
   - Prioritize findings
   - Assign remediation owners
   - Define timelines
   - Allocate resources

4. **Lessons Learned**:
   - What worked well
   - What needs improvement
   - Process enhancements
   - Training needs

5. **Regulatory Reporting**:
   - Report TLPT execution to NCA
   - Share high-level findings if requested
   - Demonstrate compliance with DORA Article 26

6. **Cleanup**:
   - Remove red team access
   - Close backdoors
   - Restore configurations
   - Verify environment integrity

**Deliverables**:

- Comprehensive test report
- Remediation plan
- Lessons learned document
- Management/board briefing
- Regulatory submission

### TLPT Scope Considerations

**Must Include**:

- Critical functions and services
- Crown jewel data/systems
- Key dependencies
- Third-party connections (if material)

**May Exclude** (with justification):

- Low-risk systems
- Recently tested systems (under 3 years)
- Systems covered by inherited TLPT results (e.g., cloud provider)
- Systems being decommissioned

**Third-Party Involvement**:

- If critical ICT provider, may need to coordinate testing
- Provider may conduct own TLPT that entity can leverage
- Ensure contractual rights to test third-party connections

### TLPT Remediation

**Remediation Requirements**:

- Address critical findings immediately
- Remediate high-risk findings within defined timeline
- Track remediation progress
- Validate fixes effective
- Report to management and board

**Typical Timeline**:

- Critical: 30 days
- High: 90 days
- Medium: 6 months
- Low: 12 months or next TLPT cycle

**Validation**:

- Retest critical findings
- Verify controls effective
- Update documentation
- Confirm with NCA if required

## Testing Documentation

### Testing Policy

**Required Elements**:

- Testing objectives and scope
- Frequency and triggers
- Roles and responsibilities
- Testing methodologies
- Reporting and escalation
- Remediation processes
- TLPT framework (if applicable)

### Test Plans

**Required Elements**:

- Test scope and objectives
- Systems/applications in scope
- Testing methodology
- Schedule and timeline
- Roles and responsibilities
- Success criteria
- Risks and mitigations

### Test Reports

**Required Elements**:

- Executive summary
- Scope and methodology
- Findings and risk ratings
- Evidence (screenshots, logs)
- Recommendations
- Remediation plan

### Remediation Tracking

**Required Elements**:

- Finding description
- Risk rating
- Assigned owner
- Remediation plan
- Due date
- Status
- Validation evidence

## Testing Best Practices

### Planning

- [ ] Conduct testing at appropriate intervals
- [ ] Align testing with risk profile
- [ ] Engage qualified testers (internal or external)
- [ ] Obtain management approval for testing
- [ ] Coordinate with third-party providers if needed

### Execution

- [ ] Follow documented test plans
- [ ] Preserve evidence of testing
- [ ] Document findings in real-time
- [ ] Minimize impact on live services
- [ ] Communicate with stakeholders during testing

### Reporting

- [ ] Provide clear, actionable findings
- [ ] Risk-rate all findings
- [ ] Include evidence and proof-of-concept
- [ ] Make remediation recommendations
- [ ] Brief management on critical findings

### Remediation

- [ ] Prioritize based on risk
- [ ] Assign clear ownership
- [ ] Track remediation progress
- [ ] Validate fixes effective
- [ ] Report completion to stakeholders

### Continuous Improvement

- [ ] Analyze trends across tests
- [ ] Update testing methodologies
- [ ] Enhance controls based on findings
- [ ] Train staff on lessons learned
- [ ] Share insights across organization

## Testing Cost Estimates

### General Testing (Annual)

- **Small Entity**: EUR 20K - 50K
- **Medium Entity**: EUR 50K - 150K
- **Large Entity**: EUR 150K - 500K+

*Costs include tools, external testing services, internal effort*

### TLPT (Every 3 Years)

- **Small Entity**: EUR 100K - 200K
- **Medium Entity**: EUR 200K - 500K
- **Large Entity**: EUR 500K - 1M+

*Costs include red team, threat intelligence, white team facilitation, remediation*

**Cost Drivers**:

- Scope and complexity
- Internal vs. external resources
- Testing frequency
- Remediation effort
- Tools and technology

## Examples

```bash
# Create comprehensive testing plan
/dora:testing-plan all

# Plan TLPT for significant entity
/dora:testing-plan advanced-tlpt significant

# Guidance on vulnerability assessment program
/dora:testing-plan vulnerability

# Scenario-based testing guidance
/dora:testing-plan scenario

# Testing plan for non-significant entity
/dora:testing-plan general non-significant
```
