---
name: assess
description: HITRUST CSF readiness assessment by assessment type
---

# HITRUST Assessment

Evaluates organizational readiness for HITRUST Common Security Framework (CSF) certification.

## Arguments

- Argument 1 - Assessment type (required: i1, r2, e1)
- Argument 2 - Scope (optional: full, self-assessment, validated)

## HITRUST Assessment Types

| Type | Name | Duration | Assessor | Recertification |
|------|------|----------|----------|----------------|
| **i1** | Implemented, 1-year | Faster | Self or 3rd party | Annual |
| **r2** | Reportable, 2-year | Comprehensive | External assessor required | Biennial |
| **e1** | e1 Assessment | Bridges i1 to r2 | Can be self | N/A - transition |

### i1 Assessment (Implemented, 1-year)

- **Purpose**: Demonstrate control implementation
- **Rigor**: Self-attestation or validated
- **Validity**: 1 year
- **Use Case**: Initial certification, vendor assessments, lower-risk orgs
- **Effort**: 3-6 months typically

### r2 Assessment (Reportable, 2-year)

- **Purpose**: Full independent validation
- **Rigor**: External assessor required
- **Validity**: 2 years
- **Use Case**: Healthcare providers, BAAs, regulatory compliance
- **Effort**: 6-12 months typically

### e1 Assessment

- **Purpose**: Bridge from i1 to r2 in year 2
- **Rigor**: Validates implementation since i1
- **Validity**: Extends to 2-year r2 cycle
- **Use Case**: Organizations wanting staged approach

## HITRUST CSF Structure

**156 Control Objectives** across 19 domains:

1. Information Security Management Program
2. Access Control
3. Human Resources Security
4. Risk Management
5. Security Policy
6. Organization of Information Security
7. Compliance
8. Asset Management
9. Physical and Environmental Security
10. Communications and Operations Management
11. Information Systems Acquisition, Development and Maintenance
12. Information Security Incident Management
13. Business Continuity Management
14. Network Protection
15. Password Management
16. Education, Training and Awareness
17. Third Party Assurance
18. Mobile Device Security
19. Incident Detection and Response

## MyCSF (Customization)

HITRUST MyCSF tailors requirements based on:

- **Organization type**: Healthcare provider, payer, vendor, etc.
- **Organization size**: Small, medium, large
- **System type**: SaaS, on-premise, hybrid
- **Regulatory factors**: HIPAA, state laws, international

**Customization Result**:

- Some requirements "Not Applicable"
- Implementation levels adjusted (baseline, enhanced, advanced)
- Scope tailored to risk profile

## Assessment Output

1. **Readiness Score**: Overall CSF compliance percentage
2. **Control Status by Domain**: 19-domain breakdown
3. **Implementation Levels**: Which controls at baseline/enhanced/advanced
4. **Inherited Controls**: From cloud providers, managed services
5. **Gap Analysis**: Controls not yet implemented or mature
6. **Remediation Roadmap**: Prioritized plan to close gaps
7. **Assessment Timeline**: Projected certification timeline
8. **Estimated Cost**: Assessment and remediation budget

## Source Framework Mapping

HITRUST CSF harmonizes multiple frameworks:

- **HIPAA**: Health Insurance Portability and Accountability Act
- **NIST**: 800-53, Cybersecurity Framework
- **ISO**: 27001/27002
- **PCI DSS**: Payment Card Industry
- **FedRAMP**: Federal Risk and Authorization Management Program
- **GDPR**: General Data Protection Regulation
- **And 40+ other frameworks**

## Examples

```bash
# Full r2 assessment for healthcare provider
/hitrust:assess r2 full

# i1 self-assessment readiness check
/hitrust:assess i1 self-assessment

# Validated i1 assessment scope
/hitrust:assess i1 validated
```
