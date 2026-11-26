---
name: profile-select
description: Determine appropriate Canadian classification level for your data
---

# Classification Level Selection

Helps determine the appropriate Canadian Government security classification level and corresponding control profile.

## Arguments

- Argument 1 - Data type description (optional)

## Classification Levels

| Level | Full Name | Sensitivity | Injury if Compromised | Example Data Types |
|-------|-----------|-------------|----------------------|-------------------|
| **U** | Unclassified | No sensitivity | None | Public websites, published reports |
| **PA** | Protected A | Low | Limited injury | Internal emails, draft documents |
| **PB** | Protected B | Medium | Serious injury | Personal information, health records, financial data |
| **PC** | Protected C | High | Grave injury | Law enforcement investigations, sensitive intelligence |

## PBMM Profile (Protected B)

The PBMM (Protected B, Medium Integrity, Medium Availability) profile applies when:

**Data Characteristics**:

- Contains personal information (PI) under privacy laws
- Health records subject to provincial privacy acts
- Financial information
- Commercial information that could cause serious injury if disclosed
- Government operational information

**Integrity Requirements**: Medium

- Data accuracy is important
- Unauthorized modification would cause serious consequences
- Error detection and correction required

**Availability Requirements**: Medium

- Service disruptions cause serious inconvenience or financial loss
- Recovery time objective (RTO): Hours to 1 day
- Recovery point objective (RPO): Hours

## Selection Decision Tree

```
Question 1: Is the data publicly available or intended for public release?
├─ YES → Unclassified (U)
└─ NO → Continue to Question 2

Question 2: Would unauthorized disclosure cause injury?
├─ Limited injury (minor embarrassment, inconvenience) → Protected A (PA)
├─ Serious injury (financial loss, reputation damage) → Protected B (PB)
├─ Grave injury (life safety, national security) → Protected C (PC)
└─ No injury → Unclassified (U)

Question 3: Are there specific regulatory requirements?
├─ Personal Information Protection laws → Protected B minimum
├─ Provincial health privacy acts → Protected B minimum
├─ Financial sector regulations → Protected B minimum
└─ Law enforcement / intelligence → Protected C likely
```

## Control Profiles by Classification

| Control Area | Unclassified | Protected A | Protected B (PBMM) | Protected C |
|--------------|-------------|-------------|-------------------|-------------|
| **Canadian Residency** | No | Recommended | Mandatory | Mandatory |
| **Encryption at Rest** | No | Recommended | FIPS 140-2 | FIPS 140-2 Level 3 |
| **Encryption in Transit** | TLS 1.2+ | TLS 1.2+ | TLS 1.2+ FIPS | TLS 1.2+ FIPS |
| **MFA** | No | Recommended | Mandatory | Mandatory (hardware) |
| **Audit Retention** | 1 year | 2 years | 2 years | 7 years |
| **Vulnerability Remediation** | 30 days | 14 days (high) | 48 hours (critical) | 24 hours (critical) |
| **Network Segmentation** | Basic | Recommended | Mandatory | Dedicated infrastructure |
| **Incident Response** | Basic | Documented | CCCS notification | CCCS immediate notification |
| **CCCS Assessment** | No | No | Required | Required |

## Specific Use Cases

### Healthcare Data

**Provincial Health Information**:

- Classification: **Protected B**
- Regulations: PHIPA (ON), HIPA (SK), PHI Act (BC)
- Controls: Full PBMM profile
- Regions: Canadian only

### Personal Information

**Under Privacy Acts** (PIPEDA, provincial acts):

- Classification: **Protected B**
- Controls: Full PBMM profile
- Consent and access controls required
- Breach notification procedures

### Government Contracts

**Contract Data for Government of Canada**:

- Classification: As specified in contract (often Protected B)
- Controls: PBMM or as contractually required
- Security requirements schedules apply

### Financial Services

**Customer Financial Data**:

- Classification: **Protected B**
- Regulations: OSFI, provincial regulators
- Controls: PBMM + sector-specific requirements

### Critical Infrastructure

**Operational Technology Data**:

- Classification: **Protected B or C** (depending on criticality)
- Regulations: Cyber security requirements per sector
- Additional controls may be required

## Cloud Service Provider Selection

### Protected B Requirements

**Mandatory Features**:

- Canadian regions (data residency)
- FIPS 140-2 Level 2+ encryption
- CCCS-assessed cloud service (preferred)
- MFA support
- Comprehensive logging

**Certified Providers**:

- AWS (ca-central-1, ca-west-1) - ITSM.50.100 assessed
- Azure (canadacentral, canadaeast) - PBMM assessed
- GCP (northamerica-northeast1/2) - Check certification status

### Protected C Requirements

**Enhanced Features**:

- Dedicated infrastructure (no multi-tenancy)
- Hardware-based MFA
- Enhanced monitoring and alerting
- CCCS TOP SECRET assessment (for TOP SECRET data)

## Cost Implications

| Classification | Incremental Cost | Drivers |
|---------------|------------------|---------|
| **Unclassified** | Baseline | Standard cloud services |
| **Protected A** | +10-20% | Basic security controls, MFA |
| **Protected B** | +30-50% | CCCS assessment, enhanced controls, Canadian regions |
| **Protected C** | +100-200% | Dedicated infrastructure, advanced controls |

## Examples

```bash
# Determine classification for health data
/pbmm:profile-select "Provincial health information (patient records)"

# Financial services data
/pbmm:profile-select "Customer financial transactions and account data"

# Government operational data
/pbmm:profile-select "Internal government operational information"
```

## Compliance Recommendation

**If Protected A**:

- Consider Protected B controls as best practice
- Canadian regions recommended but not mandatory
- Basic ITSG-33 controls

**If Protected B** (PBMM):

- Use `/pbmm:assess` for detailed readiness assessment
- Canadian regions mandatory (ca-central-1, canadacentral)
- Full PBMM profile (10 controls)
- CCCS assessment required

**If Protected C**:

- Enhanced controls beyond standard PBMM
- Consult CCCS for specific requirements
- Dedicated infrastructure may be required
- Consider Secret or TOP SECRET assessment

## Resources

- **CCCS**: https://cyber.gc.ca
- **ITSG-33**: IT Security Risk Management guidance
- **ITSP.50.103**: Cloud Security Categorization
- **ITSM.50.100**: Cloud Security Assessment process
- **Security Categorization Tool**: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/cloud-services/categorization.html
