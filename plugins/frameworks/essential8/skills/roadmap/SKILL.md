---
name: roadmap
description: Generate Essential 8 maturity improvement roadmap
---

# Essential 8 Maturity Roadmap

Creates a prioritized implementation and maturity improvement roadmap for Essential 8 mitigation strategies.

## Arguments

- Argument 1 - Current maturity level (required: 0, 1, or 2)
- Argument 2 - Target maturity level (required: 1, 2, or 3)
- Argument 3 - Timeline (optional: aggressive, standard, conservative)

## Roadmap Timeline Options

### Aggressive (Fast-Track)

- **ML0 → ML1**: 3-4 months
- **ML1 → ML2**: 4-6 months
- **ML2 → ML3**: 6-9 months
- **ML0 → ML3**: 15-18 months

**Characteristics**:

- Dedicated project team
- Executive sponsorship
- Significant budget
- Consultant support
- Parallel workstreams

### Standard (Recommended)

- **ML0 → ML1**: 6-9 months
- **ML1 → ML2**: 9-12 months
- **ML2 → ML3**: 12-18 months
- **ML0 → ML3**: 24-36 months

**Characteristics**:

- Balanced resources
- Phased approach
- Internal team with targeted consulting
- Manageable change
- Budget spread across FY

### Conservative (Gradual)

- **ML0 → ML1**: 9-12 months
- **ML1 → ML2**: 12-18 months
- **ML2 → ML3**: 18-24 months
- **ML0 → ML3**: 36-48 months

**Characteristics**:

- Limited resources
- Minimal disruption
- Internal team only
- Incremental change
- Budget constraints

---

## Roadmap Structure

Each roadmap includes:

### 1. Assessment Phase (Weeks 1-4)

- Current state assessment
- Gap analysis
- Resource requirements
- Budget estimation
- Stakeholder alignment

### 2. Planning Phase (Weeks 5-8)

- Project charter
- Detailed implementation plan
- Tool selection
- Vendor selection (if needed)
- Communication plan

### 3. Implementation Phases (By Strategy)

- Prioritized strategy implementation
- Testing and validation
- User training
- Documentation
- Rollout

### 4. Validation Phase

- Independent assessment
- Control testing
- Remediation of findings
- Certification (if required)

### 5. Continuous Improvement

- Ongoing monitoring
- Annual reassessment
- Control refinement
- Maturity progression

---

## Implementation Priority Matrix

### Priority 1 (Immediate) - Foundational Controls

**Weeks 1-12**:

1. **Multi-Factor Authentication** (Strategy 7)
   - Highest ROI
   - Prevents majority of attacks
   - Relatively easy to implement
   - User training required

2. **Regular Backups** (Strategy 8)
   - Critical for recovery
   - Protects against ransomware
   - Can be implemented quickly
   - Test restoration immediately

3. **Restrict Administrative Privileges** (Strategy 5)
   - Limits lateral movement
   - Prevents privilege escalation
   - Policy-based implementation
   - Significant security improvement

### Priority 2 (Quick Wins) - Risk Reduction

**Weeks 13-24**:

4. **User Application Hardening** (Strategy 4)
   - Reduces attack surface
   - Group Policy deployment
   - Low operational impact
   - Fast implementation

5. **Configure Microsoft Office Macro Settings** (Strategy 3)
   - Blocks common malware vector
   - Simple configuration
   - Minimal user disruption
   - High threat reduction

### Priority 3 (Complex) - Technical Controls

**Weeks 25-40**:

6. **Application Control** (Strategy 1)
   - Most complex to implement
   - Requires extensive testing
   - Application inventory needed
   - Potential user impact
   - Deploy in audit mode first

7. **Patch Applications** (Strategy 2)
   - Ongoing process
   - Tool implementation
   - Testing procedures
   - Automation critical

8. **Patch Operating Systems** (Strategy 6)
   - Similar to patch applications
   - Leverage existing WSUS/SCCM
   - Testing required
   - Scheduled maintenance windows

---

## Maturity Level 1 Roadmap (0 → 1)

### Phase 1: Quick Wins (Months 1-2)

**Strategy 7: MFA**

- Deploy MFA for privileged users
- Implement MFA for remote access
- Deploy MFA for important data access
- User enrollment and training

**Strategy 8: Backups**

- Identify important data
- Implement daily backup solution
- Configure offsite/offline storage
- Test restoration procedures

**Strategy 5: Admin Privileges**

- Audit current admin accounts
- Remove local admin from standard users
- Create separate admin accounts
- Implement logging

### Phase 2: Configuration Controls (Months 3-4)

**Strategy 4: Application Hardening**

- Standardize browser configuration
- Block Flash, Java
- Configure PDF security
- Deploy via Group Policy

**Strategy 3: Office Macros**

- Block macros from internet
- Define Trusted Locations
- Enable AMSI
- User education

### Phase 3: Patching (Months 5-6)

**Strategy 2: Patch Applications**

- Application inventory
- Vulnerability scanning
- Patch testing process
- Deploy critical patches

**Strategy 6: Patch OS**

- Enable Windows Update/WSUS
- Baseline current patch levels
- Remediate critical vulnerabilities
- Establish maintenance windows

### Phase 4: Application Control (Months 7-9)

**Strategy 1: Application Control**

- Application inventory
- Baseline approved applications
- Deploy AppLocker/WDAC in audit mode
- Analyze audit logs
- Transition to enforcement
- User support processes

### Phase 5: Validation (Month 9+)

- Strategy-by-strategy testing
- Gap remediation
- Documentation finalization
- Self-assessment
- Management reporting

---

## Maturity Level 2 Roadmap (1 → 2)

### Phase 1: Enhanced MFA (Months 1-2)

**Strategy 7: MFA for All Users**

- Roll out MFA to all standard users
- Implement conditional access
- Deploy phishing-resistant methods where possible
- Exception management process

### Phase 2: Advanced Backups (Months 2-3)

**Strategy 8: Hardened Backups**

- Implement network segmentation
- Air-gapped/immutable backups
- Increase testing frequency
- Backup monitoring

### Phase 3: Enhanced Controls (Months 3-6)

**Strategy 1: Application Control on Servers**

- Extend to all servers
- Driver/kernel module control
- PowerShell Constrained Language Mode
- Script blocking

**Strategy 5: Privileged Access Management**

- Implement PAM solution
- Just-in-time administration
- Privileged workstation hardening
- Session monitoring

### Phase 4: Accelerated Patching (Months 6-9)

**Strategy 2 & 6: Two-Week Patching**

- Automated patch deployment
- Faster testing procedures
- Staged rollout automation
- Compliance reporting

### Phase 5: Centralization (Months 9-12)

- Central logging (SIEM)
- Security monitoring
- Automated compliance checking
- Continuous improvement

---

## Maturity Level 3 Roadmap (2 → 3)

### Phase 1: Phishing-Resistant MFA (Months 1-4)

**Strategy 7: FIDO2/Smart Cards**

- Procure FIDO2 security keys
- Deploy to all users
- Disable non-phishing-resistant methods
- Fallback procedures

### Phase 2: Advanced Application Control (Months 4-8)

**Strategy 1: Hardened Configuration**

- Independent validation
- Penetration testing
- Automated compliance checking
- Continuous monitoring
- Threat hunting

### Phase 3: 48-Hour Patching (Months 8-14)

**Strategy 2 & 6: Rapid Patching**

- Fully automated testing
- Rapid deployment capabilities
- Real-time vulnerability scanning
- Rollback automation
- Zero-day response process

### Phase 4: Comprehensive Validation (Months 14-18)

- Third-party assessment
- Penetration testing
- Red team exercises
- Gap remediation
- Certification (if required)

---

## Resource Requirements

### Maturity Level 1 Implementation

**Team**:

- Project Manager (0.5 FTE)
- Security Engineer (1 FTE)
- Systems Administrator (0.5 FTE)
- Training Coordinator (0.25 FTE)

**Budget**:

- Tools/Software: \$10K-\$50K
- Consulting: \$25K-\$75K
- Training: \$5K-\$15K
- Hardware (MFA tokens): \$5K-\$20K
- **Total**: \$45K-\$160K

### Maturity Level 2 Implementation

**Team**:

- Project Manager (1 FTE)
- Security Engineers (2 FTE)
- Systems Administrator (1 FTE)
- Training Coordinator (0.5 FTE)

**Budget**:

- Tools/Software: \$50K-\$150K
- Consulting: \$75K-\$200K
- Training: \$15K-\$40K
- Hardware: \$20K-\$60K
- **Total**: \$160K-\$450K

### Maturity Level 3 Implementation

**Team**:

- Project Manager (1 FTE)
- Security Engineers (3 FTE)
- Systems Administrators (2 FTE)
- Compliance Analyst (1 FTE)
- Training Coordinator (0.5 FTE)

**Budget**:

- Tools/Software: \$150K-\$500K
- Consulting: \$200K-\$500K
- Assessment/Testing: \$50K-\$150K
- Training: \$30K-\$80K
- Hardware: \$50K-\$150K
- **Total**: \$480K-\$1.38M

---

## Success Metrics

### Technical Metrics

- % systems with application control enabled
- Average patch deployment time
- % users with MFA enabled
- % privileged accounts separated
- Backup success rate
- Configuration compliance score

### Security Metrics

- Reduction in malware incidents
- Failed attack attempts blocked
- Mean time to patch (MTTP)
- Unauthorized access attempts
- Successful backup restorations

### Business Metrics

- Cyber insurance premium reduction
- Compliance posture improvement
- Customer confidence increase
- Audit findings reduction
- Recovery time objective (RTO) improvement

---

## Common Challenges and Mitigations

### Challenge 1: User Resistance

**Mitigation**:

- Executive communication
- User training and awareness
- Gradual rollout
- Help desk support
- Feedback mechanisms

### Challenge 2: Legacy Applications

**Mitigation**:

- Application inventory and assessment
- Remediation or retirement plan
- Compensating controls
- Exceptions with risk acceptance

### Challenge 3: Resource Constraints

**Mitigation**:

- Phased approach
- Leverage automation
- Managed service providers
- Open-source tools where appropriate
- Budget across fiscal years

### Challenge 4: Technical Complexity

**Mitigation**:

- Consultant expertise
- Vendor professional services
- Pilot testing
- Documentation
- Knowledge transfer

### Challenge 5: Operational Impact

**Mitigation**:

- Change management process
- Maintenance windows
- Rollback procedures
- Stakeholder communication
- Incident response planning

---

## Governance and Reporting

### Monthly Reporting

- Implementation progress by strategy
- Budget vs actual
- Issue log and risk register
- Upcoming milestones
- Stakeholder updates

### Quarterly Reviews

- Maturity assessment
- Control effectiveness testing
- Roadmap adjustments
- Budget forecast
- Executive briefing

### Annual Assessment

- Full Essential 8 assessment
- Maturity level validation
- Continuous improvement plan
- Budget for next fiscal year
- Compliance reporting (if required)

---

## Examples

```bash
# Standard roadmap from nothing to ML1
/essential8:roadmap 0 1 standard

# Aggressive progression from ML1 to ML3
/essential8:roadmap 1 3 aggressive

# Conservative improvement from ML2 to ML3
/essential8:roadmap 2 3 conservative

# Default (standard) timeline from current state to ML2
/essential8:roadmap 1 2
```

## References

- **ACSC Essential Eight Maturity Model**
- **Essential Eight Assessment Process Guide**
- **ACSC Implementation Guidance**
- **Case Studies and Lessons Learned**
