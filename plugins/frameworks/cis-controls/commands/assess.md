---
description: CIS Controls v8 compliance assessment by Implementation Group level
---

> _CIS Controls v8 content used under CC BY-SA 4.0 from the Center for Internet Security. This command's CIS-derived content is CC BY-SA 4.0. See [LICENSE-CIS.md](../LICENSE-CIS.md)._

# CIS Controls Assessment

Evaluates organizational readiness for CIS Controls v8 baseline security framework.

## Arguments

- Argument 1 - Target Implementation Group (required: IG1, IG2, or IG3)
- Argument 2 - Assessment scope (optional: full, gap-analysis, specific-control)

## CIS Controls v8 Implementation Groups

| Group | Target Organizations | Safeguards | Description |
|-------|---------------------|------------|-------------|
| **IG1** | Small/medium businesses, limited IT/cyber resources | 56 | Essential cyber hygiene, foundational controls |
| **IG2** | Medium/large enterprises with IT staff | 128 | Adds enterprise-grade processes and tools |
| **IG3** | Large enterprises, high-value assets, skilled adversaries | 153 | Advanced security practices, threat hunting |

### IG1 - Essential Cyber Hygiene

- **Target**: Small to medium businesses
- **Resources**: Limited IT security expertise
- **Focus**: Foundational safeguards every organization should implement
- **Safeguards**: 56 basic security controls
- **Examples**: Inventory assets, control admin privileges, basic backups

### IG2 - Enterprise Security

- **Target**: Medium to large organizations
- **Resources**: Dedicated IT security staff
- **Focus**: Scalable security operations and enterprise tools
- **Safeguards**: All IG1 + 72 additional (128 total)
- **Examples**: Centralized logging, automated vulnerability management, SIEM

### IG3 - Advanced Security

- **Target**: Large organizations, critical infrastructure, high-value targets
- **Resources**: Specialized security teams (SOC, threat intel, IR)
- **Focus**: Advanced threat detection, response, and recovery
- **Safeguards**: All IG2 + 25 additional (153 total)
- **Examples**: Threat hunting, advanced incident response, security testing

## 18 CIS Controls

1. **Inventory and Control of Enterprise Assets** (IG1)
   - Track all hardware devices
   - Address unauthorized assets

2. **Inventory and Control of Software Assets** (IG1)
   - Track authorized software
   - Remove unauthorized software

3. **Data Protection** (IG1)
   - Classify data
   - Encrypt sensitive data
   - Secure data destruction

4. **Secure Configuration of Enterprise Assets and Software** (IG1)
   - Establish secure configurations
   - Deploy system configuration management

5. **Account Management** (IG1)
   - Centralized account management
   - Strong authentication (MFA)

6. **Access Control Management** (IG1)
   - Least privilege
   - Automated access provisioning/deprovisioning

7. **Continuous Vulnerability Management** (IG1)
   - Automated vulnerability scanning
   - Remediation process

8. **Audit Log Management** (IG1)
   - Collect audit logs
   - Centralize and retain logs

9. **Email and Web Browser Protections** (IG1)
   - Deploy anti-malware
   - Web content filtering

10. **Malware Defenses** (IG1)
    - Deploy signature-based detection
    - Deploy behavioral-based detection

11. **Data Recovery** (IG1)
    - Establish backup process
    - Test data recovery

12. **Network Infrastructure Management** (IG2)
    - Maintain network diagram
    - Secure network boundaries

13. **Network Monitoring and Defense** (IG2)
    - Deploy network IDS
    - Monitor network traffic

14. **Security Awareness and Skills Training** (IG1)
    - Security awareness training
    - Role-based security training

15. **Service Provider Management** (IG1)
    - Inventory service providers
    - Manage third-party security

16. **Application Software Security** (IG2)
    - Secure application development
    - Vulnerability testing

17. **Incident Response Management** (IG1)
    - Designate incident response team
    - Test incident response plan

18. **Penetration Testing** (IG2)
    - Establish penetration testing program
    - Conduct regular tests

## Assessment Output

1. **Readiness Score**: Overall compliance percentage by IG level
2. **Control Gaps**: Which of the 18 controls need implementation or improvement
3. **Safeguard Status**: Per-safeguard implementation tracking
   - IG1: 56 safeguards
   - IG2: 128 safeguards (includes IG1)
   - IG3: 153 safeguards (includes IG1 + IG2)
4. **Asset Security Functions**: Coverage across 5 functions
   - Identify: Asset and software inventory
   - Protect: Configuration, access control, data protection
   - Detect: Continuous monitoring, audit logs
   - Respond: Incident response
   - Recover: Data recovery, business continuity
5. **Implementation Priorities**: Quick wins vs long-term projects
6. **Remediation Roadmap**: Phased plan to achieve target IG level

## Assessment Methodology

**Data Collection**:

- Configuration reviews
- Policy and procedure documentation
- Technical control testing
- Interviews with IT/security staff
- Network and system scans

**Scoring**:

- Per-safeguard implementation status (Not Implemented, Partially Implemented, Implemented)
- Control-level maturity (Ad hoc, Documented, Managed, Optimized)
- Overall IG compliance percentage

**Gap Analysis**:

- Missing safeguards by priority
- Incomplete implementations
- Documentation gaps
- Tool/technology deficiencies

## Examples

```bash
# Full IG1 assessment for small business
/cis:assess IG1 full

# Gap analysis for IG2 compliance
/cis:assess IG2 gap-analysis

# Assess specific control implementation
/cis:assess IG2 "Account Management"

# Advanced security assessment for large enterprise
/cis:assess IG3 full
```
