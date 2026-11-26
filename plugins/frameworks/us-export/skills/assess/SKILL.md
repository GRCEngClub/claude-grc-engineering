---
name: assess
description: Unified ITAR and EAR compliance assessment
---

# US Export Controls Assessment

> **Engineering guidance only. Not legal advice.** DDTC (ITAR) and BIS (EAR) are the authorities; the toolkit is not. Read alongside this: [22 CFR 120.54](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-120), [22 CFR 122.5](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-122), [15 CFR 734.6](https://www.ecfr.gov/current/title-15/section-734.6), [15 CFR 746.8](https://www.ecfr.gov/current/title-15/section-746.8), and the [BIS country guidance](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance). Work with counsel before adopting any posture.

Evaluates readiness for US export controls compliance across both ITAR (defense articles) and EAR (dual-use commercial) frameworks.

## Arguments

- Argument 1 - Scope (optional: itar, ear, both) - defaults to "both"
- Argument 2 - Assessment depth (optional: quick, detailed) - defaults to "detailed"

## Framework Selection

| Scope | Framework | When to Use |
|-------|-----------|-------------|
| itar | ITAR only | Defense articles on USML, technical data for defense |
| ear | EAR only | Dual-use commercial items on CCL, encryption products |
| both | ITAR + EAR | Uncertain jurisdiction, mixed product portfolio |

## Assessment Output

**ITAR Assessment** (7 controls):

1. **US Person Verification** - Access limited to US citizens / permanent residents
2. **Data-Residency Posture** - US-located storage by default; 22 CFR 120.54 encryption carve-out available with counsel sign-off
3. **Encryption Requirements** - FIPS 140-2 validated encryption
4. **Access Logging** - 5-year retention for records within 22 CFR 122.5 scope (not every log)
5. **Network Isolation** - Dedicated VPCs / VNets for ITAR workloads
6. **Export Control Marking** - Resources tagged with ITAR classification
7. **Third-Party Access Control** - CSP access restrictions

**EAR Assessment** (7 controls):

1. **Export Control Classification** - ECCN or EAR99 determination
2. **End-User Screening** - Denied parties list checking (Entity List, DPL, SDN)
3. **Encryption Compliance** - FIPS 140 for Category 5 Part 2 items
4. **Geographic Access Controls** - Embargo country blocking (Cuba, Iran, NK, Syria)
5. **Technology Transfer Controls** - Source code and technical data access controls
6. **CSP Attestations** - Cloud provider FIPS encryption and CMEK verification
7. **License Exceptions** - ENC, TSU, BAG applicability determination

**Jurisdiction Determination**:

- Is the item on the USML (US Munitions List)? → ITAR
- Is the item on the CCL (Commerce Control List)? → EAR with ECCN
- Neither list? → Likely EAR99. No license for most destinations / end-users, but destination (15 CFR 746), end-user (Entity List / DPL / SDN), and end-use (15 CFR 744) rules still apply. The "knowledge" standard means a license can be required even for EAR99 if you know or have reason to know the item is destined for a prohibited use or user.

**Compliance Status**:

- Compliant, Non-Compliant, Partially Compliant
- Gap analysis with prioritized remediation steps
- Registration/licensing requirements (DDTC for ITAR, BIS for EAR)

## Examples

```bash
# Assess both frameworks (default)
/us-export:assess

# ITAR-only assessment for defense contractor
/us-export:assess itar detailed

# EAR-only quick assessment for commercial exporter
/us-export:assess ear quick

# Full assessment for mixed portfolio
/us-export:assess both detailed
```

## Common Scenarios

**Defense Contractor**: ITAR applies - US person verification, GovCloud recommended
**Encryption Software**: EAR applies - ECCN 5D002, License Exception ENC may apply
**Cloud Service Provider**: Both may apply - implement geographic controls, screening
**Semiconductor Manufacturer**: EAR applies - ECCN classification, Entity List screening
