---
name: gap-analysis
description: Identify gaps between current state and HITRUST CSF requirements
---

# HITRUST Gap Analysis

Analyzes current security posture against HITRUST CSF requirements and identifies control gaps.

## Arguments

- Argument 1 - Assessment type target (required: i1, r2)
- Argument 2 - Analysis depth (optional: high-level, detailed, by-domain)

## Gap Analysis Process

### 1. Current State Assessment

Reviews existing security controls and documentation:

- Policies and procedures
- Technical configurations
- Audit logs and monitoring
- Training and awareness programs
- Incident response capabilities
- Business continuity plans

### 2. HITRUST Requirement Mapping

Maps current controls to HITRUST CSF requirements:

- 156 control objectives
- MyCSF customization (org type, size, system)
- Implementation levels (baseline, enhanced, advanced)
- Authoritative source references

### 3. Gap Identification

Identifies three types of gaps:

- **Missing Controls**: No implementation exists
- **Partial Controls**: Implemented but incomplete
- **Documentation Gaps**: Control exists but not documented

### 4. Risk Prioritization

Ranks gaps by:

- **Critical**: High-risk, assessor will flag
- **High**: Important for certification
- **Medium**: Should address before assessment
- **Low**: Nice-to-have or lower risk

## Common Gap Categories

### Policy & Documentation Gaps

- Missing or outdated information security policies
- Incomplete risk assessments
- No business impact analysis (BIA)
- Lack of system security plans
- Missing business associate agreements

**Impact**: Easy to fix, high assessor focus

### Technical Control Gaps

- Multi-factor authentication not implemented
- Encryption at rest/in transit incomplete
- Insufficient logging and monitoring
- Vulnerability management gaps
- Patch management deficiencies

**Impact**: Moderate to fix, critical for compliance

### Process & Procedure Gaps

- Incident response plan not tested
- No formal change management
- Access reviews not performed
- Security awareness training lacking
- Vendor risk assessments missing

**Impact**: Moderate to fix, ongoing effort required

### Organizational Gaps

- No designated security officer (CISO/CSO)
- Unclear roles and responsibilities
- Lack of security governance structure
- Insufficient resources/budget
- No security steering committee

**Impact**: Strategic, requires executive commitment

## MyCSF Scoping Impact

Gaps vary based on MyCSF customization:

### Organization Size

- **Small**: Fewer requirements, focused gaps
- **Medium**: Standard requirements, typical gaps
- **Large**: Enhanced requirements, complex gaps

### Organization Type

- **Provider**: HIPAA-heavy gaps common
- **Payer**: Privacy/claims gaps typical
- **Vendor**: Third-party assurance gaps
- **Business Associate**: BAA-related gaps

### System Type

- **SaaS**: Inherited controls reduce gaps
- **On-Premise**: More infrastructure gaps
- **Hybrid**: Complex scoping, varied gaps

## Output

1. **Executive Summary**: High-level gap overview
2. **Gap Count by Severity**:
   - Critical: X gaps
   - High: Y gaps
   - Medium: Z gaps
   - Low: W gaps
3. **Gap Details by Domain**: 19-domain breakdown
4. **Remediation Effort Estimates**:
   - Quick wins (<1 month)
   - Short-term (1-3 months)
   - Medium-term (3-6 months)
   - Long-term (6-12 months)
5. **Budget Estimates**: Tooling, consulting, staff time
6. **Prioritized Roadmap**: Phased remediation plan
7. **Timeline to Certification**: Based on gap closure

## Gap Analysis Report Sections

### 1. Current Maturity Assessment

- **Initial**: Ad-hoc, inconsistent controls
- **Developing**: Some processes defined
- **Defined**: Documented and followed
- **Managed**: Measured and monitored
- **Optimized**: Continuously improving

### 2. Control Status Summary

- **Implemented**: Meets HITRUST requirements
- **Partially Implemented**: Needs enhancement
- **Planned**: On roadmap but not started
- **Not Implemented**: Critical gap
- **Not Applicable**: MyCSF excluded

### 3. Quick Wins

Controls that can be addressed rapidly:

- Policy updates
- Documentation creation
- Simple technical configs
- Training completion

### 4. Critical Path Items

Gaps that block certification:

- Missing MFA
- No encryption at rest
- Incomplete audit logging
- Lack of incident response plan

## Examples

```bash
# High-level gap analysis for r2 assessment
/hitrust:gap-analysis r2 high-level

# Detailed gap analysis for i1
/hitrust:gap-analysis i1 detailed

# Domain-specific gap analysis
/hitrust:gap-analysis r2 by-domain
```
