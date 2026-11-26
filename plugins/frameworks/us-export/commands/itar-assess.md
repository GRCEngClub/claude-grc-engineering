---
description: ITAR-specific compliance assessment for defense articles
---

# ITAR Assessment

> **Engineering guidance only. Not legal advice.** DDTC determines ITAR applicability and jurisdiction, not this toolkit. Citations worth reading alongside this command: [22 CFR 120.54](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-120) (encrypted-technical-data carve-out), [22 CFR 122.5](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-122) (recordkeeping scope). Work with export-control counsel before adopting any of the postures below.

Deep dive assessment for International Traffic in Arms Regulations (ITAR) compliance. Focuses on defense articles, technical data, and defense services under the US Munitions List (USML).

## Arguments

- Argument 1 - Assessment type (optional: readiness, remediation, certification) - defaults to "readiness"

## ITAR Control Assessment

### ITAR-1: US Person Verification

**Requirement**: Only "US persons" as defined in [22 CFR 120.62](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-120/subpart-C/section-120.62) may access ITAR-controlled technical data. That definition is broader than citizens and green-card holders. It also includes "protected individuals" under 8 USC 1324b(a)(3) (certain refugees, asylees, and specific visa holders) and US-incorporated entities / US governmental agencies for entity-level access. Access policies that narrow to "citizens or LPRs only" over-restrict and can trigger employment-law exposure. Use the full 120.62 definition.

**Assessment Questions**:

- Are users with ITAR technical-data access US persons under the full 120.62 definition?
- Is US-person status documented per the 120.62 category (citizen, LPR, protected individual, US entity)?
- Is the verification process reviewed with HR and counsel so it doesn't over-narrow?
- Are non-US-persons explicitly separated from ITAR systems (not granted access by default)?

**Cloud Verification**:

- IAM users tagged with citizenship status
- Access logs show US-person-only access
- Foreign national access attempts are logged and blocked

### ITAR-2: Data-Residency Posture (US-Located by Default)

**Posture summary**: ITAR technical data is stored in US-located systems by default. 22 CFR 120.54 carves out end-to-end-encrypted technical data from the release definition, so properly-encrypted-in-transit-and-at-rest deployment patterns have room that a strict "US regions only" rule doesn't capture. Default to US-located regions; raise the encryption-carve-out question with counsel before relying on it.

**Assessment Questions**:

- Are production resources deployed in US-located regions by default?
- If not, is the encryption posture documented and blessed by counsel?
- Is cross-border data replication intentional and documented?
- Are backups stored with the same posture as primary data?

**Recommended Regions**:

- **AWS**: us-gov-west-1, us-gov-east-1 (GovCloud)
- **Azure**: USGov Virginia, USGov Texas, USGov Arizona
- **GCP**: us-central1, us-east4, us-west1 (with Assured Workloads)

### ITAR-3: FIPS 140-2 Encryption

**Requirement**: All ITAR data must be encrypted with FIPS 140-2 validated cryptographic modules.

**Assessment Questions**:

- Is all data encrypted at rest and in transit?
- Are FIPS 140-2 Level 2+ validated HSMs used?
- Are customer-managed encryption keys (CMEK) configured?

**Verification**:

- EBS volumes encrypted with AWS KMS
- S3 buckets use SSE-KMS encryption
- TLS 1.2+ for data in transit

### ITAR-4: Access Logging and Audit

**Requirement summary**: 22 CFR 122.5 requires ITAR-registered exporters to retain *specific record categories* (manufacturing, export transactions, broker records) for 5 years. It is not a blanket "retain every cloud log for 5 years" rule. Map which of your cloud logs actually carry those record categories, and set 5-year retention on *those*. General security/audit logs that fall outside 122.5 can have shorter retention set by your own policy or other applicable frameworks.

**Assessment Questions**:

- Is CloudTrail or equivalent enabled for all regions?
- Are data events logged for S3 and other services that may carry 122.5-scope records?
- Which logs carry 122.5 record categories, and are those retained for 5 years?
- Is log integrity protection enabled (log-file validation, separate account, MFA delete)?

### ITAR-5: Network Isolation

**Requirement**: ITAR systems should be isolated from non-ITAR systems.

**Assessment Questions**:

- Are dedicated VPCs/VNets used for ITAR workloads?
- Is VPC peering to non-ITAR environments prohibited?
- Are network boundaries clearly defined and enforced?

### ITAR-6: Export Control Marking

**Requirement**: ITAR data must be marked with appropriate export control notices.

**Assessment Questions**:

- Are all ITAR resources tagged with export control classification?
- Are data files marked with ITAR warnings?
- Is classification visible in metadata and labels?

### ITAR-7: Third-Party Access Control

**Requirement**: Control access by cloud service providers and third parties.

**Assessment Questions**:

- Are Service Control Policies (SCPs) configured to restrict third-party access?
- Is Customer Lockbox/approval required for CSP support access?
- Are external access roles audited and restricted?

## DDTC Registration

**Requirement**: Most organizations handling ITAR data must register with DDTC.

**Annual Fee**: \$3,000 per year
**Form**: DS-2032 (Statement of Registration)
**Renewal**: Annual before expiration

## Recommended Cloud Platforms

| Platform | Recommendation | Notes |
|----------|---------------|-------|
| **AWS GovCloud** | Highly Recommended | FedRAMP High, US-located, US persons only |
| **Azure Government** | Highly Recommended | FedRAMP High, screened personnel |
| **GCP Assured Workloads** | Recommended | With ITAR configuration, data residency controls |
| **AWS Commercial** | Limited Use | US regions only, additional controls required |

## Examples

```bash
# Readiness assessment
/us-export:itar-assess readiness

# Remediation planning
/us-export:itar-assess remediation

# Pre-certification assessment
/us-export:itar-assess certification
```

## Key Distinctions from EAR

- **Personnel**: US persons only (ITAR) vs. No person restriction (EAR)
- **Geography**: US-located data by default for ITAR, with the 22 CFR 120.54 encryption carve-out available; EAR geography is driven by ECCN-specific licensing and 15 CFR 746 sanctions
- **Authority**: State Dept DDTC (ITAR) vs. Commerce BIS (EAR)
- **Scope**: Defense articles (ITAR) vs. Dual-use commercial (EAR)
