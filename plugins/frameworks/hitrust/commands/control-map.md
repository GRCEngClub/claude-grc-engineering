---
description: Map HITRUST CSF controls to source frameworks
---

# HITRUST Control Mapping

Maps HITRUST CSF control requirements to underlying source frameworks (HIPAA, NIST, ISO, PCI-DSS, etc.).

## Arguments

- Argument 1 - HITRUST control ID (required, e.g., 01.a, 09.ab)
- Argument 2 - Target framework (optional: HIPAA, NIST, ISO27001, PCIDSS, all)

## HITRUST Control ID Format

**Structure**: `[Domain].[Control][Subcontrol]`

- **Domain**: 01-19 (two digits)
- **Control**: Single letter (a-z)
- **Subcontrol**: Optional second letter or number

**Examples**:

- `01.a` - Information Security Management Program, control (a)
- `09.ab` - Physical and Environmental Security, subcontrol (ab)
- `02.d` - Access Control, control (d)

## 19 HITRUST Domains

| Domain | Name | Control Count |
|--------|------|---------------|
| **01** | Information Security Management Program | 12 |
| **02** | Access Control | 14 |
| **03** | Human Resources Security | 8 |
| **04** | Risk Management | 5 |
| **05** | Security Policy | 3 |
| **06** | Organization of Information Security | 8 |
| **07** | Compliance | 6 |
| **08** | Asset Management | 7 |
| **09** | Physical and Environmental Security | 11 |
| **10** | Communications and Operations Management | 23 |
| **11** | Information Systems Acquisition, Development and Maintenance | 15 |
| **12** | Information Security Incident Management | 6 |
| **13** | Business Continuity Management | 5 |
| **14** | Network Protection | 7 |
| **15** | Password Management | 6 |
| **16** | Education, Training and Awareness | 4 |
| **17** | Third Party Assurance | 6 |
| **18** | Mobile Device Security | 5 |
| **19** | Incident Detection and Response | 5 |

## Source Framework Mappings

HITRUST CSF harmonizes 40+ frameworks including:

### Primary Frameworks

- **HIPAA** Security Rule, Privacy Rule
- **NIST** 800-53, Cybersecurity Framework
- **ISO/IEC** 27001:2022, 27002:2022
- **PCI DSS** v4.0.1 (mapped in HITRUST CSF v11.8 and later)
- **FedRAMP** Moderate Baseline

### Additional Frameworks

- COBIT 5
- AICPA Trust Services Criteria (SOC 2)
- GDPR
- FISMA
- State breach notification laws
- FDA guidance for medical devices
- MARS-E (CMS)

## Common Control Examples

### Access Control (Domain 02)

**02.d**: Automated Central Audit Log

- **HIPAA**: 164.308(a)(1)(ii)(D), 164.312(b)
- **NIST 800-53**: AU-2, AU-3, AU-6
- **ISO 27001**: A.8.15
- **PCI DSS**: 10.2.1, 10.2.2, 10.4.1

### Encryption (Domain 10)

**10.k**: Encryption of ePHI at Rest

- **HIPAA**: 164.312(a)(2)(iv)
- **NIST 800-53**: SC-28
- **ISO 27001**: A.8.24
- **PCI DSS**: 3.5.1

### Incident Response (Domain 12)

**12.a**: Incident Response Plan

- **HIPAA**: 164.308(a)(6)
- **NIST 800-53**: IR-1, IR-8
- **ISO 27001**: A.5.24
- **PCI DSS**: 12.10

### Business Associate Management (Domain 17)

**17.a**: Business Associate Agreements

- **HIPAA**: 164.308(b)(1), 164.314(a)
- **NIST 800-53**: SA-9
- **ISO 27001**: A.5.20

## MyCSF Implementation Levels

Controls have different implementation requirements based on:

### Baseline Level

- Minimum required implementation
- Small/low-risk organizations
- Basic security posture

### Enhanced Level (Middle)

- Moderate implementation
- Medium organizations
- Standard security posture

### Advanced Level

- Comprehensive implementation
- Large/high-risk organizations
- Mature security programs

## Output

1. **Control Definition**: What HITRUST requires
2. **Framework Mappings**: Shows alignment to:
   - HIPAA sections
   - NIST 800-53 controls
   - ISO 27001 controls
   - PCI DSS requirements
   - Other relevant frameworks
3. **Implementation Guidance**: How to satisfy the control
4. **Evidence Examples**: What assessors look for
5. **Common Gaps**: Typical deficiencies

## Examples

```bash
# Map encryption control to all frameworks
/hitrust:control-map 10.k all

# Show HIPAA mapping for access control
/hitrust:control-map 02.d HIPAA

# View incident response NIST alignment
/hitrust:control-map 12.a NIST

# Check BAA requirements against ISO
/hitrust:control-map 17.a ISO27001
```
