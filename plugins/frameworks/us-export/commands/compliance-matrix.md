---
description: ITAR vs EAR compliance requirements crosswalk
---

# ITAR vs EAR Compliance Matrix

> **Engineering guidance only. Not legal advice.** The matrix below is a simplified planning aid; DDTC and BIS make the actual determinations. The country lists, retention requirements, and residency postures shown here are starting points to discuss with export-control counsel. Sanctions rules in particular shift fast; verify against the [BIS country guidance](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance) before acting on the country-list rows.

Side-by-side comparison of ITAR and EAR requirements to understand overlaps, differences, and compliance strategies.

## Arguments

- Argument 1 - Focus area (optional: overview, controls, cloud, licensing) - defaults to "overview"

## Framework Overview

| Aspect | ITAR | EAR |
|--------|------|-----|
| **Authority** | State Department (DDTC) | Commerce Department (BIS) |
| **Scope** | Defense articles, services, technical data (USML) | Dual-use commercial items (CCL) |
| **Item List** | US Munitions List (USML) - 21 categories | Commerce Control List (CCL) - 10 categories |
| **Personnel** | US persons per 22 CFR 120.62 (citizens, LPRs, "protected individuals" under 8 USC 1324b(a)(3), US entities) | No personnel restrictions (except deemed exports) |
| **Geography** | US-located data by default; 22 CFR 120.54 carves out properly-encrypted technical data | BIS-driven (15 CFR 734.6). Sanctions rules in 15 CFR 746 cover comprehensive embargoes (CU, IR, KP, SY), Russia/Belarus (746.8), Crimea/DNR/LNR (746.6), and shift; check current BIS country guidance |
| **Registration** | DDTC registration required (\$3,000/year) | No registration (except encryption items) |
| **Licensing** | License required for most exports | License required for high-level ECCNs, exceptions available |

## Control Comparison

| Control Area | ITAR | EAR | Overlap |
|--------------|------|-----|---------|
| **Access Control** | US persons only verification | Denied party screening (Entity List, DPL, SDN) | ⚠️ Different mechanisms |
| **Data Residency** | US-located regions by default (encryption carve-out per 22 CFR 120.54) | Driven by ECCN-specific licensing and current 15 CFR 746 sanctions | ⚠️ Different posture |
| **Encryption** | FIPS 140-2 Level 2+ required | FIPS 140-2 for Category 5 Part 2 | ✅ Same standard |
| **Audit Logging** | 5-year retention for records within 22 CFR 122.5 scope (not all logs) | Varies by requirement | ⚠️ ITAR has scoped recordkeeping |
| **Network Isolation** | Dedicated VPCs for ITAR | No specific requirement | ⚠️ ITAR only |
| **Marking** | ITAR classification on all data | ECCN classification on items | ⚠️ Different schemes |
| **Third-Party Access** | Restricted CSP access | Normal CSP access | ⚠️ ITAR more restrictive |

## Detailed Control Mapping

### 1. Personnel and Access

**ITAR-1: US Person Verification**

- **Requirement**: Access limited to "US persons" per [22 CFR 120.62](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-120/subpart-C/section-120.62). That covers citizens, lawful permanent residents, "protected individuals" under 8 USC 1324b(a)(3), and US-incorporated entities. Don't collapse it to "citizens or LPRs only."
- **Cloud Impact**: Verify US-person status per 120.62 category, tag IAM users with the resulting status
- **Verification**: Personnel files documenting which 120.62 category applies, reviewed with HR and counsel

**EAR-2: End-User Screening**

- **Requirement**: Screen against BIS denied parties lists
- **Cloud Impact**: Automated screening on provisioning
- **Verification**: Entity List, DPL, UVL, SDN checks

**Overlap**: ❌ No overlap - different mechanisms

- ITAR focuses on citizenship
- EAR focuses on entity screening

**Compliance Strategy**: Implement both

- Citizenship verification for ITAR systems
- Denied party screening for all systems (including ITAR)

### 2. Data Residency

**ITAR-2: Data-Residency Posture**

- **Default**: ITAR technical data stored in US-located systems
- **Carve-out**: 22 CFR 120.54 means properly-encrypted technical data isn't automatically released; deployment patterns vary if counsel blesses them
- **Common safe choice**: us-gov-*, us-east-*, us-west-* in commercial regions (with controls), or GovCloud equivalents

**EAR-4: Geographic Access Controls**

- **Authority**: BIS, not this toolkit (15 CFR 734.6)
- **Comprehensive embargoes**: Cuba (CU), Iran (IR), North Korea (KP), Syria (SY) under 15 CFR 746
- **Other current rules**: Russia and Belarus under 15 CFR 746.8; Crimea / so-called DNR / LNR regions of Ukraine under 746.6; sectoral and item-specific rules elsewhere in 746
- **Don't**: treat the four-country list above as complete. The BIS country guidance is the live source.

**Overlap**: ✅ Partial overlap

- US-located ITAR regions tend to satisfy comprehensive embargo blocking by default
- EAR access controls for items not subject to 15 CFR 746 may permit non-US regions; ECCN-specific licensing applies

**Compliance Strategy**:

- **ITAR workloads**: Default to GovCloud or US-located regions; counsel before relying on the encryption carve-out for non-US storage
- **EAR workloads**: Region choice depends on your ECCN, applicable licensing under 15 CFR 740 (license exceptions), and current 15 CFR 746 sanctions. Geo-block per BIS country guidance, not the four-country shorthand.
- **Mixed**: Segregate systems by framework

### 3. Encryption

**ITAR-3: Encryption Requirements**

- **Requirement**: FIPS 140-2 validated encryption
- **Standard**: Level 2+ HSMs (AWS KMS, Azure Key Vault, GCP Cloud KMS)
- **Keys**: Customer-managed encryption keys (CMEK) recommended

**EAR-3: Encryption Compliance**

- **Requirement**: FIPS 140-2/140-3 for Category 5 Part 2 items
- **Standard**: Same as ITAR - Level 2+ HSMs
- **Classification**: Encryption products require ECCN 5D002/5A002

**Overlap**: ✅ Complete overlap

- Both require FIPS 140-2 validated encryption
- Same HSM standards (Level 2+)

**Compliance Strategy**: Implement once, satisfies both

- Use AWS KMS, Azure Key Vault HSM, or GCP Cloud KMS
- Configure CMEK for all controlled data

### 4. Audit and Logging

**ITAR-4: Access Logging and Audit**

- **22 CFR 122.5 scope**: Specific record categories (manufacturing, export transactions, broker records) for ITAR-registered exporters retained 5 years
- **Not in 122.5**: General CloudTrail/admin audit logs unless they carry 122.5-scope records
- **Engineering action**: Identify which logs carry 122.5-scope records and retain those for 5 years; set general security/audit-log retention based on your own policy and other applicable frameworks (FedRAMP, SOC 2, etc.)

**EAR**: No specific logging requirement

- **Best Practice**: Follow standard audit practices
- **Retention**: As needed for compliance

**Overlap**: ⚠️ ITAR more stringent

- EAR has no specific logging requirement
- ITAR has 5-year retention under 22 CFR 122.5 for specific record categories (not every log)

**Compliance Strategy**:

- **ITAR**: CloudTrail or equivalent. 5-year retention on records within 22 CFR 122.5 scope; shorter retention OK for non-122.5 logs unless another framework requires more
- **EAR**: Standard operational logging; retention per your own policy and other applicable frameworks

### 5. Classification and Marking

**ITAR-6: Export Control Marking**

- **Requirement**: Mark all ITAR data with export control notices
- **Tagging**: "ITAR Controlled" on all resources
- **Notices**: Export warnings on documents

**EAR-1: Export Control Classification**

- **Requirement**: Classify with ECCN or EAR99
- **Tagging**: ECCN codes (5D002, 3A001, etc.)
- **Documentation**: Classification rationale

**Overlap**: ⚠️ Different classification schemes

- ITAR uses "ITAR Controlled" binary marking
- EAR uses granular ECCN codes

**Compliance Strategy**: Use both tags

```
AWS Tags:
  ExportControl: "ITAR"
  ECCN: "5D002"  (if also subject to EAR)
```

## Cloud Platform Recommendations

| Use Case | ITAR | EAR | Recommended Platform |
|----------|------|-----|---------------------|
| **Defense contractor** | ✅ Primary | ⚠️ Maybe | AWS GovCloud, Azure Government |
| **Encryption software** | ❌ No | ✅ Primary | AWS Commercial (US regions), FIPS KMS |
| **Semiconductor manufacturer** | ❌ No | ✅ Primary | AWS/Azure/GCP Commercial with Entity List screening |
| **Aerospace dual-use** | ✅ Primary | ✅ Secondary | Segregated: GovCloud for ITAR, Commercial for EAR |
| **Cloud service provider** | ⚠️ Support customers | ✅ As a tool | Offer GovCloud + Commercial options |

## Licensing and Registration

| Requirement | ITAR | EAR |
|-------------|------|-----|
| **Registration** | DDTC registration required (\$3,000/year) | No registration (except encryption) |
| **License for Export** | Required for most USML items | Required for high-level ECCNs |
| **License Exceptions** | None available | ENC, TSU, BAG, TMP available |
| **Self-Classification** | Not available | Available for encryption (ENC) |
| **Reporting** | Annual registration renewal | Semi-annual (if using ENC exception) |

## Compliance Decision Matrix

| Scenario | ITAR | EAR | Action |
|----------|------|-----|--------|
| Item on USML | ✅ Yes | ❌ No | Use `/us-export:itar-assess` |
| Item on CCL with ECCN | ❌ No | ✅ Yes | Use `/us-export:ear-assess` |
| Item on both lists | ✅ Yes | ⚠️ Maybe | ITAR takes precedence |
| Item on neither list (EAR99) | ❌ No | ✅ Yes | No license for most destinations, but destination (15 CFR 746), end-user (Entity List / DPL / SDN), and end-use (15 CFR 744) rules still apply. Screen under the "knowledge" standard. |
| Uncertain jurisdiction | ❓ Unknown | ❓ Unknown | Submit Commodity Jurisdiction (CJ) request |

## Overlapping Controls (Implement Once)

These controls satisfy both ITAR and EAR:

✅ **FIPS 140-2 Encryption**

- AWS KMS, Azure Key Vault HSM, GCP Cloud KMS
- Satisfies ITAR-3 and EAR-3

✅ **Denied Party Screening**

- While not ITAR-required, recommended for defense contractors
- Satisfies EAR-2

✅ **Access Logging**

- ITAR requires 5-year retention for record categories named in 22 CFR 122.5 (not every log)
- EAR benefits from logging as operational and audit evidence
- CloudTrail or equivalent satisfies both, with retention scoped per 122.5

## Framework-Specific Controls

### ITAR-Only Controls

These apply only to ITAR, not EAR:

🔒 **US Person Verification** (ITAR-1)

- Not required for EAR
- Critical for ITAR compliance

🔒 **US-Located Data Residency by Default** (ITAR-2)

- ITAR defaults to US-located storage; 22 CFR 120.54 encryption carve-out is the documented exception
- EAR residency depends on ECCN and current 15 CFR 746 sanctions, not a uniform "embargo countries only" rule

🔒 **Network Isolation** (ITAR-5)

- Not required for EAR
- Recommended for ITAR

### EAR-Only Controls

These apply only to EAR, not ITAR:

📋 **ECCN Classification** (EAR-1)

- Not applicable to ITAR (uses USML categories)
- Required for EAR

📋 **License Exceptions** (EAR-7)

- Not available for ITAR
- ENC, TSU available for EAR

## Cost Comparison

| Cost Item | ITAR | EAR | Notes |
|-----------|------|-----|-------|
| **Registration Fee** | \$3,000/year | \$0 | DDTC registration |
| **Cloud Premium** | +30-50% | Standard | GovCloud premium pricing |
| **Compliance Tools** | \$50-200K/year | \$10-50K/year | Screening, monitoring |
| **Personnel** | US persons only | Standard | May limit talent pool |
| **Audit/Assessment** | \$100-300K | \$25-75K | External audit costs |

## Migration Strategy

### Moving from ITAR to EAR

**If** jurisdiction changes (e.g., product moved from USML to CCL):

1. ✅ **Keep**: FIPS 140-2 encryption (helps EAR compliance)
2. ✅ **Keep**: Access logging (best practice)
3. ⚠️ **Modify**: Region scope shifts from US-located default to ECCN-driven; add geo-blocking aligned with current 15 CFR 746 sanctions, not the four-country shorthand
4. ⚠️ **Modify**: Add ECCN classification
5. ⚠️ **Add**: Denied party screening
6. ❌ **Remove**: US person requirement (can allow foreign nationals)

### Dual Compliance (Both ITAR and EAR)

**For organizations subject to both**:

1. **Segregate Systems**:
   - ITAR workloads → GovCloud/Government regions
   - EAR workloads → Commercial regions

2. **Apply Most Restrictive Controls**:
   - ITAR controls automatically satisfy overlapping EAR requirements
   - Add EAR-specific controls (ECCN, screening)

3. **Tag All Resources**:

   ```
   ExportControl: "ITAR" | "EAR" | "BOTH"
   ECCN: "5D002" (for EAR items)
   Classification: "CUI" | "ITAR-Controlled"
   ```

## Examples

```bash
# View overview comparison
/us-export:compliance-matrix overview

# Focus on control mappings
/us-export:compliance-matrix controls

# Cloud platform recommendations
/us-export:compliance-matrix cloud

# Licensing and registration comparison
/us-export:compliance-matrix licensing
```

## Quick Reference

**When ITAR applies**: Default to strictest controls (US-person access, US-located regions). 22 CFR 120.54 encryption carve-out is available with counsel sign-off.
**When EAR applies**: Apply ECCN-specific controls, denied-party screening, and current 15 CFR 746 sanctions.
**When both apply**: Segregate systems or apply ITAR defaults + EAR additions.
**When uncertain**: Submit a Commodity Jurisdiction request to DDTC and an ECCN classification to BIS via counsel.
