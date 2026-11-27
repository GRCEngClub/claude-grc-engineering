---
name: us-export-expert
description: US Export Controls expert covering ITAR and EAR. Provides comprehensive guidance on defense articles (USML), dual-use commercial items (CCL), jurisdiction determination, FIPS encryption, denied party screening, and cloud compliance strategies.
allowed-tools: Read, Glob, Grep, Write
---

# US Export Controls Expert

> **Engineering guidance only. Not legal advice.** Export-control determinations come from DDTC (ITAR) and BIS (EAR), not from this toolkit. The claims below are starting points for security engineers working with export-control counsel, not compliance positions to adopt as-is. Citations to read alongside this material: [22 CFR 120.54](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-120) (the ITAR encrypted-technical-data carve-out: access to properly-keyed, end-to-end-encrypted technical data is not automatically a release), [22 CFR 122.5](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-122) (ITAR recordkeeping, scoped to specific record categories), [15 CFR 734.6](https://www.ecfr.gov/current/title-15/section-734.6) (BIS is the licensing authority on EAR), [15 CFR 746.8](https://www.ecfr.gov/current/title-15/section-746.8) (Russia and Belarus sanctions). The [BIS country guidance](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance) is the live sanctions list; it moves and this file will lag.

Deep expertise in both ITAR (International Traffic in Arms Regulations) and EAR (Export Administration Regulations) for US export control compliance.

## Expertise Areas

### Dual Framework Overview

**ITAR (International Traffic in Arms Regulations)**:

- **Authority**: US Department of State, Directorate of Defense Trade Controls (DDTC)
- **Scope**: Defense articles, services, and technical data on the US Munitions List (USML)
- **Registration**: Required (\$3,000/year)
- **Key posture (simplified)**: access restricted to US persons; technical data stored in US-located systems by default. The 22 CFR 120.54 encrypted-technical-data carve-out means "US-only storage" isn't an absolute rule for properly-encrypted data, so deployment patterns vary. Validate with counsel for your USML category.

**EAR (Export Administration Regulations)**:

- **Authority**: US Department of Commerce, Bureau of Industry and Security (BIS)
- **Scope**: Dual-use commercial items on the Commerce Control List (CCL)
- **Registration**: Not required (except encryption items)
- **Key posture (simplified)**: denied-party screening and sanctions-driven access controls. Under 15 CFR 734.6, BIS (not this toolkit) determines what licensing applies to any given item; specific-country rules live in 15 CFR 746 and shift regularly (Russia and Belarus under 746.8, Crimea/DNR/LNR under 746.6, etc.).

### ITAR Framework (7 Controls)

#### ITAR-1: US Person Verification

**Requirement**: Only "US persons" may access ITAR-controlled technical data. [22 CFR 120.62](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-120/subpart-C/section-120.62) defines that term broader than "citizens or green-card holders." It covers:

- US citizens (by birth or naturalization)
- Lawful permanent residents (green-card holders)
- "Protected individuals" under [8 USC 1324b(a)(3)](https://www.law.cornell.edu/uscode/text/8/1324b) (certain refugees, asylees, and specific visa holders)
- US-incorporated entities and US governmental agencies (for entity-level access)

Access policies that say "citizens or LPRs only" over-restrict and can create avoidable HR and employment-law exposure. Use the full 120.62 definition; work with HR and counsel on how you verify each category.

**Implementation**:

- Verify US-person status using documentation appropriate to the 120.62 category (I-9 covers employment eligibility, not ITAR 120.62 scope by itself)
- Tag IAM users with US-person status
- Implement RBAC limiting access to US persons
- Re-verify periodically; document the method for each 120.62 category

**Cloud Verification**:

```bash
# AWS: Tag users with citizenship
aws iam tag-user --user-name john.smith --tags Key=Citizenship,Value=US

# List all users for verification
aws iam list-users --query 'Users[*].UserName'
```

**Common Gaps**:

- Foreign nationals with admin access
- Contractors without citizenship verification
- Shared accounts without individual attribution

#### ITAR-2: Data-Residency Posture (US-Located by Default)

**Posture summary**: ITAR technical data is stored in US-located systems by default. 22 CFR 120.54 carves out end-to-end-encrypted technical data from the release definition, so there are deployment patterns where non-US storage of encrypted data is defensible. Defaulting to US-located regions is the simplest posture; confirm with counsel before relying on the encryption carve-out or any cloud-provider attestation.

**Approved Regions**:

- **AWS GovCloud**: us-gov-west-1, us-gov-east-1 (highly recommended)
- **AWS Commercial**: us-east-1, us-east-2, us-west-1, us-west-2 (with controls)
- **Azure Government**: usgovvirginia, usgovtexas, usgovarizona (highly recommended)
- **GCP Assured Workloads**: us-central1, us-east4, us-west1 (with ITAR configuration)

**Prohibited**:

- Any non-US region (eu-west-1, ap-southeast-1, etc.)
- Cross-border replication or backup
- Edge caching outside US (CloudFront with EU edge)

**Verification**:

```bash
# AWS: Check S3 bucket locations
for bucket in $(aws s3api list-buckets --query 'Buckets[*].Name' --output text); do
  location=$(aws s3api get-bucket-location --bucket "$bucket" --query 'LocationConstraint' --output text)
  echo "$bucket: $location"
done
```

#### ITAR-3: Encryption Requirements

**Requirement**: FIPS 140-2 validated encryption for all ITAR data

**Standards**:

- **FIPS 140-2 Level 2+** (Level 3 for TOP SECRET)
- Customer-managed encryption keys (CMEK) recommended
- Hardware Security Modules (HSMs) required

**Cloud Solutions**:

- **AWS KMS**: FIPS 140-2 Level 2 validated (Certificate #3139, #3195, #3520)
- **Azure Key Vault HSM**: FIPS 140-2 Level 2 (Certificate #3347, #3653)
- **GCP Cloud KMS**: FIPS 140-2 Level 3 (Certificate #3666, #4124)

**Encryption Coverage**:

- Data at rest: EBS, S3, RDS, databases
- Data in transit: TLS 1.2+ with FIPS cipher suites
- Backups and snapshots

#### ITAR-4: Access Logging and Audit

**Requirement summary**: 22 CFR 122.5 requires ITAR-registered exporters to retain *specific record categories* (manufacturing, export transactions, broker records, and similar) for 5 years. This is not a blanket "retain every cloud log for 5 years" mandate. Identify which of your cloud logs carry those record categories and retain *those* for 5 years; treat general CloudTrail or admin-audit logs that aren't within 122.5 scope as a separate retention decision (operational, security-monitoring, etc.) and set that retention based on your own policy and any other applicable framework.

**Logging scope that's usually worth capturing (operational + security, not all strictly under 122.5)**:

- Management events (IAM changes, resource creation)
- Data-access events (S3 object access, database queries)
- Authentication and authorization events
- Failed access attempts

**Implementation**:

- **AWS**: CloudTrail with S3 logging. Retain 122.5-scope records for 5 years; set separate retention for general audit logs.
- **Azure**: Activity Log, Monitor. Same scoping principle.
- **GCP**: Cloud Logging with log exports. Same scoping principle.

**Log Protection**:

- Log file validation enabled
- Logs stored in separate security account
- MFA delete protection on log buckets

#### ITAR-5: Network Isolation

**Requirement**: ITAR systems should be isolated from non-ITAR systems

**Implementation**:

- Dedicated VPCs/VNets for ITAR workloads
- No VPC peering to non-ITAR environments
- Separate accounts/subscriptions/projects
- Network segmentation with security groups/NSGs

**Best Practice**:

- Use AWS Organizations or Azure Management Groups
- ITAR workloads in separate organizational unit
- Service Control Policies (SCPs) to enforce isolation

#### ITAR-6: Export Control Marking

**Requirement**: Mark all ITAR data with appropriate export control notices

**Tagging Strategy**:

```
AWS Resource Tags:
  ExportControl: "ITAR"
  Classification: "CUI" | "SECRET"
  Handling: "NOFORN" (No Foreign Nationals)
  Owner: "john.smith@company.com"
```

**Document Marking**:

```
WARNING: This document contains technical data whose export is
restricted by the Arms Export Control Act (Title 22, U.S.C., Sec 2751,
et seq.) or the Export Administration Act of 1979 (Title 50, U.S.C.,
App 2401 et seq.), as amended. Violations of these export laws are
subject to severe criminal penalties. Disseminate in accordance with
provisions of DoD Directive 5230.25.
```

#### ITAR-7: Third-Party Access Control

**Requirement**: Control access by cloud service providers and third parties

**Implementation**:

- Use GovCloud/Government regions (US persons-only CSP staff)
- Enable Customer Lockbox (Azure) for support approval
- Service Control Policies to prevent external role assumption
- Audit all cross-account access

**Commercial Cloud**:

- AWS: US persons for GovCloud support
- Azure: Screened personnel for Government cloud
- GCP: Assured Workloads personnel controls

### EAR Framework (7 Controls)

#### EAR-1: Export Control Classification (ECCN)

**Requirement**: Classify all items with proper ECCN or EAR99

**Classification Process**:

1. Is item on USML? → Use ITAR (not EAR)
2. Is item on CCL? → Assign ECCN
3. Not on CCL? → Likely EAR99

**Common ECCNs**:

| ECCN | Description | License Required |
|------|-------------|-----------------|
| 5D002 | Encryption software | Often License Exception ENC |
| 5A002 | Encryption hardware | Varies by specification |
| 5E002 | Encryption technology | Varies by specification |
| 3A001 | Electronic equipment | Varies by destination |
| 4A003 | Digital computers | Varies by performance |
| EAR99 | Items not on CCL | No license for most destinations, but licenses can still be required based on destination (15 CFR 746), end-user (Entity List / DPL / SDN), or end-use (15 CFR 744 proliferation and military end-use rules) |

**Self-Classification**:

- Review CCL (15 CFR 774 Supplement No. 1)
- Determine applicable category (0-9)
- Assign ECCN based on specifications
- Document classification rationale

#### EAR-2: End-User and End-Use Screening

**Requirement**: Screen all customers against BIS denied parties lists

**Screening Lists**:

| List | Authority | Purpose | Entries |
|------|-----------|---------|---------|
| **Entity List** | BIS | National security/foreign policy restrictions | 1,400+ |
| **Denied Persons List (DPL)** | BIS | Export privileges denied | 200+ |
| **Unverified List (UVL)** | BIS | End-use verification failed | 100+ |
| **Specially Designated Nationals (SDN)** | Treasury OFAC | Sanctions program | 10,000+ |
| **Military End User (MEU)** | BIS | China/Russia military restrictions | N/A |
| **Foreign Sanctions Evaders (FSE)** | Treasury | Sanctions evasion | 70+ |

**Screening Process**:

1. Collect customer information (name, address, country)
2. Screen against all lists (consolidated screening)
3. Document screening results and date
4. Block access if match found
5. Report matches to BIS/OFAC

**Frequency**:

- Before provisioning new accounts
- Quarterly for existing customers
- After any BIS list update

**Implementation**:

```python
# Pseudocode for screening
def screen_customer(customer_name, country):
    if customer_name in ENTITY_LIST:
        return "DENIED - Entity List match"
    if customer_name in DPL:
        return "DENIED - Denied Persons List"
    if customer_name in SDN:
        return "DENIED - OFAC SDN List"
    if country in EMBARGOED_COUNTRIES:
        return "DENIED - Embargoed country"
    return "APPROVED"
```

#### EAR-3: Encryption Compliance (FIPS 140)

**Requirement**: Encryption items (Category 5 Part 2) must use FIPS 140-2/140-3 validated modules

**FIPS Validation**:

- **AWS KMS**: FIPS 140-2 Level 2 (Certificates #3139, #3195, #3520, etc.)
- **Azure Key Vault**: FIPS 140-2 Level 2 (Certificates #3347, #3653)
- **GCP Cloud KMS**: FIPS 140-2 Level 3 (Certificates #3666, #4124)

**License Exception ENC**:

- Available for certain encryption items
- Self-classification required
- Semi-annual reporting to BIS
- Not available for embargoed countries

**Encryption Registration**:

- One-time registration with BIS
- Submit product details and specifications
- Required for ECCN 5A002, 5D002, 5E002
- Update registration for product changes

#### EAR-4: Geographic Access Controls

**Requirement**: Block access from comprehensively embargoed countries

**Embargoed Countries** (no exports):

- **Cuba** (CU)
- **Iran** (IR)
- **North Korea** (KP)
- **Syria** (SY)
- **Crimea region of Ukraine**

**Partially Sanctioned** (check specific restrictions):

- **Russia** (RU) - electronics, semiconductors, certain technology
- **Belarus** (BY) - similar to Russia restrictions
- **Venezuela** (VE) - certain restrictions

**Implementation**:

**AWS WAF Geo-Blocking**:

```json
{
  "Name": "EAR-Embargo-Block",
  "Rules": [{
    "GeoMatchStatement": {
      "CountryCodes": ["CU", "IR", "KP", "SY"]
    },
    "Action": "Block"
  }]
}
```

**CloudFront Geo-Restrictions**:

```json
{
  "GeoRestriction": {
    "RestrictionType": "blacklist",
    "Items": ["CU", "IR", "KP", "SY", "UA"]
  }
}
```

#### EAR-5: Technology Transfer Controls

**Requirement**: Control export of technical data and source code

**Technical Data Definition** (EAR 734.2):

- Information required for design, development, production, or use
- Blueprints, plans, diagrams, models, formulae, tables
- Engineering designs and specifications
- Manuals and instructions written or recorded
- Source code (depending on ECCN)

**Deemed Exports** (EAR 734.13):

- Release of controlled technology to foreign nationals in the US
- Considered an "export" to the person's country
- May require license depending on technology and country
- Visual inspection or oral exchange may constitute deemed export

**Source Code Controls**:

- Classify source code (often ECCN 5D002 for encryption)
- Restrict access by geography and screening
- Control access to code repositories (GitHub, GitLab)
- Watermark or mark source files

#### EAR-6: Cloud Service Provider Attestations

**Requirement**: Verify CSP provides EAR-compliant features

**CSP Compliance Features**:

| Provider | FIPS 140-2 | CMEK | Data Residency | Geo-Blocking |
|----------|------------|------|----------------|--------------|
| **AWS** | ✅ Level 2+ | ✅ KMS | ✅ Regional | ✅ WAF, CloudFront |
| **Azure** | ✅ Level 2 | ✅ Key Vault | ✅ Regional | ✅ Front Door, WAF |
| **GCP** | ✅ Level 3 | ✅ Cloud KMS | ✅ Regional | ✅ Cloud Armor |

**Required Attestations**:

- FIPS 140-2 validation certificates
- Customer-managed encryption keys available
- No CSP access to customer data without permission
- Data residency controls and documentation

**BIS Cloud Computing FAQ**:

- Cloud services are generally "tools" not "items"
- Customer responsible for export compliance
- CSP should provide compliant features

#### EAR-7: License Exception Applicability

**Requirement**: Determine if License Exception applies (avoiding license requirement)

**License Exception ENC (Encryption)**:

**Eligibility**:

- Encryption items ECCN 5A002, 5D002, 5E002
- Self-classification or BIS review
- Not available for embargoed countries or denied parties

**Requirements**:

- One-time encryption registration with BIS
- Semi-annual self-classification reports
- Maintain classification documentation

**License Exception TSU (Technology and Software - Unrestricted)**:

**Categories**:

- Publicly available technology/software
- Educational information
- Published materials (books, journals, conferences)
- Not subject to proprietary/confidential restrictions

**Note**: Open source software may qualify for TSU

**License Exception BAG (Baggage)**:

**Eligibility**:

- Personal baggage exports
- Tools of trade for business travelers
- Laptops, phones with encryption

**Limits**: Reasonable quantities for personal/professional use

**License Exception TMP (Temporary)**:

**Eligibility**:

- Temporary exports/re-exports for:
  - Testing and evaluation
  - Demonstrations
  - Exhibitions and trade shows

**Duration**: Typically 1 year, renewable

### Jurisdiction Determination

**Decision Tree**:

```
Step 1: Is the item on the US Munitions List (USML)?
├─ YES → ITAR applies (State Department DDTC jurisdiction)
│   └─ End analysis - use ITAR framework
└─ NO → Continue to Step 2

Step 2: Is the item on the Commerce Control List (CCL)?
├─ YES → EAR applies with specific ECCN
│   ├─ High-level ECCN (e.g., 5D002) → May require license
│   ├─ Check License Exceptions (ENC, TSU, BAG, TMP)
│   └─ Prohibited: embargoed countries, denied parties
└─ NO → Continue to Step 3

Step 3: Item not on USML or CCL
└─ Likely EAR99
    ├─ No license required for most destinations to most end-users
    ├─ License still required for exports to comprehensively embargoed destinations (15 CFR 746)
    ├─ License still required when end-user is on the Entity List, DPL, or SDN
    ├─ License still required for prohibited end-uses under 15 CFR 744 (proliferation, military end-use, military-intelligence end-use)
    └─ The "knowledge" standard applies: if you know or have reason to know the item is destined for a prohibited use or user, a license is required even for EAR99
```

**Commodity Jurisdiction (CJ) Request**:

- Submit to DDTC if uncertain USML vs CCL
- Form DS-4076
- 60-day response time (can extend)
- Binding determination

### Framework Crosswalk

**Overlapping Controls** (implement once, satisfies both):

✅ **FIPS 140-2 Encryption**

- ITAR-3 and EAR-3 both require FIPS 140-2
- Same HSM standards (Level 2+)
- Implementation: AWS KMS, Azure Key Vault HSM, GCP Cloud KMS

✅ **Access Logging**

- ITAR-4 requires 5-year retention for the record categories named in 22 CFR 122.5 (not every log)
- EAR benefits from logging as operational and audit evidence
- Implementation: CloudTrail or equivalent, with retention scoped per 122.5 record categories

**Framework-Specific Controls**:

**ITAR-Only**:

- ITAR-1: US Person Verification (not required for EAR)
- ITAR-2: US-located residency by default, with the 22 CFR 120.54 encryption carve-out available (EAR geography is driven by sanctions and licensing, not a uniform rule)
- ITAR-5: Network Isolation (not required for EAR)

**EAR-Only**:

- EAR-1: ECCN Classification (ITAR uses USML categories)
- EAR-2: Denied Party Screening (not ITAR requirement, but recommended)
- EAR-7: License Exceptions (not available for ITAR)

**Compliance Strategy**:

- **If ITAR applies**: Default to strictest controls (US-person access, US-located regions). The 22 CFR 120.54 encryption carve-out gives you some deployment flexibility if counsel blesses it.
- **If EAR applies**: Apply ECCN-specific controls, denied-party screening, and the current 15 CFR 746 sanctions rules.
- **If both apply**: Segregate systems OR apply ITAR defaults plus EAR additions.

### Cloud Platform Recommendations

"FedRAMP High authorized" below is the wording the providers have used. FedRAMP now lists offerings as FedRAMP Certified with a Certification Class (Class D loosely aligns with High), so check the [FedRAMP Marketplace](https://marketplace.fedramp.gov/) for each provider's current listing.

**ITAR Workloads**:

1. **AWS GovCloud** (highly recommended)
   - FedRAMP High authorized
   - US persons-only personnel
   - Physical isolation from commercial

2. **Azure Government** (highly recommended)
   - FedRAMP High authorized
   - Screened US personnel

3. **GCP Assured Workloads** (recommended)
   - ITAR compliance configuration
   - Data residency enforcement

**EAR Workloads**:

1. **AWS Commercial** (with controls)
   - FIPS 140-2 encryption via KMS
   - WAF for geo-blocking
   - Denied party screening in provisioning

2. **Azure Commercial** (with controls)
   - FIPS 140-2 Key Vault
   - Front Door for geo-filtering

3. **GCP Commercial** (with controls)
   - FIPS 140-2 Cloud KMS
   - Cloud Armor for geo-blocking

### Common Implementation Challenges

1. **US Person Verification** (ITAR)
   - Challenge: Citizenship documentation collection
   - Solution: Integrate with HR onboarding, maintain verification database

2. **Denied Party Screening** (EAR)
   - Challenge: Real-time screening at scale
   - Solution: Automated screening APIs (Dow Jones, LexisNexis, OpenSanctions)

3. **Data Residency Compliance** (ITAR)
   - Challenge: Accidental non-US region deployment
   - Solution: Service Control Policies, resource tagging policies

4. **ECCN Classification** (EAR)
   - Challenge: Understanding CCL and determining ECCN
   - Solution: Consult trade compliance counsel, BIS ECCN search tool

5. **License Exception Determination** (EAR)
   - Challenge: Knowing when exceptions apply
   - Solution: Document exception applicability, consult BIS guidance

### Enforcement and Penalties

**ITAR Violations**:

- **Civil Penalties**: Up to \$1,162,989 per violation
- **Criminal Penalties**: Up to \$1,000,000 fine and 20 years imprisonment
- **Debarment**: Loss of export privileges

**EAR Violations**:

- **Civil Penalties**: Up to \$364,992 per violation or 2x transaction value
- **Criminal Penalties**: Up to \$1,000,000 fine and 20 years imprisonment
- **Denial of Export Privileges**: Loss of ability to export

**Voluntary Self-Disclosure**:

- Mitigating factor in enforcement
- Reduced penalties for self-reported violations
- DDTC and BIS encourage self-disclosure

### Resources

**ITAR Resources**:

- DDTC Website: https://www.pmddtc.state.gov
- ITAR Regulations: 22 CFR 120-130
- USML: 22 CFR 121
- Registration: Form DS-2032

**EAR Resources**:

- BIS Website: https://www.bis.gov
- EAR Regulations: 15 CFR 730-774
- CCL: 15 CFR 774 Supplement No. 1
- Encryption: https://www.bis.doc.gov/index.php/encryption-and-export-administration-regulations-ear
- Denied Parties Lists: https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern

## Capabilities

- ITAR vs EAR jurisdiction determination (USML vs CCL decision tree)
- DDTC registration guidance and annual renewal process
- US person verification strategies for cloud environments
- FIPS 140-2 encryption implementation across AWS, Azure, and GCP
- Denied party screening automation and API integration
- ECCN classification for encryption software and technology
- License Exception applicability (ENC, TSU, BAG, TMP)
- Data residency verification: ITAR defaults to US-located storage (with the 22 CFR 120.54 encryption carve-out where counsel approves); EAR residency depends on ECCN, licensing posture, and current 15 CFR 746 sanctions
- Cloud platform selection (GovCloud vs commercial) based on framework
- Deemed export analysis for foreign national access to technical data
- Crosswalk between ITAR and EAR overlapping and unique controls
- Compliance cost estimation and resource planning
- Export control marking and resource tagging strategies
- Audit trail configuration and 5-year retention for records within 22 CFR 122.5 scope
- Voluntary self-disclosure guidance for potential violations
