---
description: Verify data residency requirements for ITAR and EAR
---

# Data Residency Verification

> **Engineering guidance only. Not legal advice.** ITAR and EAR residency postures vary by USML category, ECCN, deployment model, encryption posture, and CSP attestations. The defaults below are starting points, not compliance positions. The country lists here can lag the live BIS sanctions text; verify against the [BIS country guidance](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance) and 22 CFR 120.54 (the ITAR encrypted-technical-data carve-out) before acting.

Verifies data residency posture for ITAR (US-located by default) and EAR (BIS-driven sanctions and licensing).

## Arguments

- Argument 1 - Framework (optional: itar, ear, both) - defaults to "both"
- Argument 2 - Cloud provider (optional: aws, azure, gcp, all) - defaults to "all"

## ITAR Data Residency Requirements

### Posture: US-Located Storage by Default

ITAR-controlled technical data is stored in US-located systems by default. [22 CFR 120.54](https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M/part-120) carves out properly-encrypted technical data from the release definition, so deployment patterns where end-to-end-encrypted data is stored or transmitted abroad can be defensible. This is not a free pass: the encryption has to actually be end-to-end, the keys have to be controlled by US persons, and counsel needs to bless the posture in writing for your specific USML category and CSP. When in doubt, default to US-located regions.

### Recommended Cloud Regions

#### AWS GovCloud (Highly Recommended)

**US Government Regions**:

- `us-gov-west-1` (Oregon) - US West (GovCloud)
- `us-gov-east-1` (Virginia) - US East (GovCloud)

**Benefits**:

- FedRAMP High authorized
- US persons-only personnel
- Physical isolation from AWS commercial
- ITAR compliance support

**Verification**:

```bash
aws ec2 describe-regions --region us-gov-west-1
aws s3api list-buckets --region us-gov-west-1
```

#### AWS Commercial (US Regions Only)

**Approved US Regions** (with additional controls):

- `us-east-1` (Virginia)
- `us-east-2` (Ohio)
- `us-west-1` (California)
- `us-west-2` (Oregon)

**Prohibited Regions**:

- Any non-US region (eu-west-1, ap-southeast-1, etc.)
- Global services must be configured for US-only

#### Azure Government (Highly Recommended)

**US Government Regions**:

- `usgovvirginia` - US Gov Virginia
- `usgoviowa` - US Gov Iowa (DoD only)
- `usgovtexas` - US Gov Texas
- `usgovarizona` - US Gov Arizona
- `usdodeast` - US DoD East
- `usdodcentral` - US DoD Central

**Benefits**:

- FedRAMP High authorized
- Screened US personnel
- Dedicated infrastructure

**Verification**:

```bash
az cloud list --query '[?name==`AzureUSGovernment`]'
az account list-locations --query '[?name==`usgovvirginia`]'
```

#### GCP with Assured Workloads

**US Regions**:

- `us-central1` (Iowa)
- `us-east1` (South Carolina)
- `us-east4` (Virginia)
- `us-west1` (Oregon)
- `us-west2` (Los Angeles)
- `us-west3` (Salt Lake City)
- `us-west4` (Las Vegas)

**Assured Workloads Configuration**:

- ITAR compliance controls
- Data residency enforcement
- Personnel access controls

**Verification**:

```bash
gcloud compute regions list --filter='name:us-*'
gcloud assured list --location=us-central1
```

## EAR Data Residency Posture

### BIS-Driven, Not "Any Region Worldwide"

EAR doesn't impose a uniform "store data in US-only regions" rule, but it also isn't "any region worldwide minus four embargoed countries." [15 CFR 734.6](https://www.ecfr.gov/current/title-15/section-734.6) makes clear that BIS determines what licensing applies. The relevant access controls depend on:

- **Your item's ECCN** (or EAR99 status), per the Commerce Control List
- **Whether a license exception applies** under [15 CFR 740](https://www.ecfr.gov/current/title-15/part-740) (ENC, TSU, etc.)
- **Current sanctions** under [15 CFR 746](https://www.ecfr.gov/current/title-15/part-746), which extend well beyond the four "comprehensive embargo" countries

### Sanctions Snapshot (Verify Before Acting)

The list below is a snapshot, not a substitute for the current BIS country guidance. Sanctions move quickly. Before deploying access controls, check the [BIS country guidance page](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance) and the most recent Federal Register entries.

**Comprehensive embargoes** (broad export restrictions, [15 CFR 746](https://www.ecfr.gov/current/title-15/part-746)):

- **Cuba** (CU)
- **Iran** (IR)
- **North Korea** (KP)
- **Syria** (SY)

**Region-specific comprehensive sanctions** (15 CFR 746.6):

- **Crimea, so-called Donetsk People's Republic, and Luhansk People's Republic regions of Ukraine**

**Country-specific item-level controls** (verify scope against current BIS text):

- **Russia** (RU) and **Belarus** (BY): broad item-level restrictions under [15 CFR 746.8](https://www.ecfr.gov/current/title-15/section-746.8); not a partial regime
- **Venezuela** (VE): specific restrictions under [15 CFR 746.10](https://www.ecfr.gov/current/title-15/section-746.10)
- **Other countries**: BIS publishes ongoing entity-list and country-specific actions; the BIS country guidance page is authoritative

### Geographic Access Controls

#### AWS WAF Geo-Blocking

```bash
# Create WAF rule to block embargoed countries
aws wafv2 create-web-acl \
  --name EAR-Embargo-Block \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://embargo-rule.json

# embargo-rule.json includes:
# GeoMatchStatement blocking: CU, IR, KP, SY
```

#### AWS CloudFront Geo-Restrictions

```bash
# Check CloudFront distribution restrictions
aws cloudfront get-distribution-config --id DISTRIBUTION_ID

# Configure geo-restriction
{
  "GeoRestriction": {
    "RestrictionType": "blacklist",
    "Quantity": 5,
    "Items": ["CU", "IR", "KP", "SY", "UA"]
  }
}
```

#### Azure Front Door Geo-Filtering

```bash
# Create Front Door with geo-filtering
az network front-door create \
  --name ear-compliance \
  --resource-group myResourceGroup

# Add geo-filtering rules to block embargoed countries
```

#### GCP Cloud Armor

```bash
# Create Cloud Armor security policy
gcloud compute security-policies create ear-embargo-block \
  --description "Block embargoed countries for EAR compliance"

# Add rule to block countries
gcloud compute security-policies rules create 1000 \
  --security-policy ear-embargo-block \
  --expression "origin.region_code == 'CU' || origin.region_code == 'IR' || origin.region_code == 'KP' || origin.region_code == 'SY'" \
  --action "deny-403"
```

## Data Residency Verification Matrix

| Framework | Requirement | Allowed Regions | Blocked Regions |
|-----------|-------------|-----------------|-----------------|
| **ITAR** | US-located by default; 22 CFR 120.54 encryption carve-out available | us-gov-*, us-east-*, us-west-* by default | Non-US regions unless encryption posture is documented and counsel-approved |
| **EAR** | BIS determines (15 CFR 734.6); ECCN-driven; sanctions per 15 CFR 746 | Depends on ECCN, license exceptions, and current sanctions | At minimum: comprehensive embargoes (CU, IR, KP, SY), Crimea/DNR/LNR (746.6), Russia and Belarus item controls (746.8). Verify against current BIS country guidance. |

## Multi-Region Considerations

### ITAR Multi-Region

**Allowed**: Multiple US regions for redundancy

```
Primary: us-gov-west-1
Backup: us-gov-east-1
```

**Prohibited**: Cross-border replication

```
us-east-1 → eu-west-1  ❌ PROHIBITED
us-gov-west-1 → us-gov-east-1  ✅ ALLOWED
```

### EAR Multi-Region

**Permitted regions depend on the ECCN, applicable license exceptions, and current 15 CFR 746 sanctions.** Without those facts, "any region worldwide" is wrong. With those facts, common patterns:

```
Primary: us-east-1
DR: eu-west-1  ✅ Often OK for EAR99 / unrestricted ECCNs with denied-party screening; verify under your ECCN
DR: ap-southeast-1  ✅ Often OK for the same; check that no entity-list parties are in the access path
```

**Always blocked** (comprehensive embargoes plus region-specific sanctions):

```
Any region → Iran, Syria, Cuba, North Korea  ❌
Any region → Crimea / DNR / LNR regions of Ukraine  ❌
Item-controlled access → Russia, Belarus  ❌ for items under 15 CFR 746.8
```

## Cloud Provider Support Matrix

| Provider | ITAR Support | EAR Support | FIPS 140-2 | Notes |
|----------|--------------|-------------|------------|-------|
| **AWS GovCloud** | ✅ Highly Recommended | ✅ Yes | Level 2+ | FedRAMP High, US persons |
| **AWS Commercial** | ⚠️ Limited (US regions) | ✅ Yes | Level 2+ | Requires additional controls |
| **Azure Government** | ✅ Highly Recommended | ✅ Yes | Level 2 | FedRAMP High |
| **Azure Commercial** | ⚠️ Limited (US regions) | ✅ Yes | Level 2 | Requires additional controls |
| **GCP Assured Workloads** | ✅ Recommended | ✅ Yes | Level 3 | With ITAR configuration |
| **GCP Commercial** | ⚠️ Limited (US regions) | ✅ Yes | Level 3 | Requires configuration |

## Verification Commands

### Check Current Data Locations

**AWS**:

```bash
# S3 bucket locations
aws s3api list-buckets | jq -r '.Buckets[].Name' | while read bucket; do
  location=$(aws s3api get-bucket-location --bucket "$bucket" --query 'LocationConstraint' --output text)
  echo "$bucket: $location"
done

# RDS instances
aws rds describe-db-instances --query 'DBInstances[*].{Name:DBInstanceIdentifier,AZ:AvailabilityZone}'

# EC2 instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].{Id:InstanceId,AZ:Placement.AvailabilityZone}'
```

**Azure**:

```bash
# Resource locations
az resource list --query '[].{Name:name,Location:location}' --output table

# Storage account locations
az storage account list --query '[].{Name:name,Location:location}' --output table
```

**GCP**:

```bash
# Bucket locations
gcloud storage buckets list --format='table(name,location)'

# Compute instances
gcloud compute instances list --format='table(name,zone)'

# Cloud SQL instances
gcloud sql instances list --format='table(name,region)'
```

## Compliance Recommendations

### For ITAR Workloads

1. **Use GovCloud/Government Regions**
   - AWS GovCloud (us-gov-west-1, us-gov-east-1)
   - Azure Government (usgovvirginia, usgovtexas)
   - GCP Assured Workloads (with ITAR config)

2. **Disable Cross-Border Features**
   - No global accelerators
   - No edge caching outside US
   - No replication to non-US regions

3. **Verify US-Only Personnel**
   - CSP support staff are US persons
   - No foreign national access to infrastructure

### For EAR Workloads

1. **Implement Geo-Blocking**
   - AWS WAF, CloudFront restrictions
   - Azure Front Door filtering
   - GCP Cloud Armor policies

2. **Monitor Access Logs**
   - CloudTrail, Azure Monitor, GCP Logging
   - Alert on access from embargoed countries
   - Block and report denied party access

3. **Screen Users by Geography**
   - IP-based geolocation
   - Account provisioning screening
   - Continuous monitoring

## Examples

```bash
# Verify ITAR data residency (US-only)
/us-export:data-residency itar aws

# Verify EAR embargo screening
/us-export:data-residency ear all

# Comprehensive verification for both frameworks
/us-export:data-residency both all

# Azure-specific ITAR verification
/us-export:data-residency itar azure
```

## Common Violations

### Common ITAR Risk Patterns (Validate Each With Counsel)

⚠ **ITAR technical data in a non-US region without the 22 CFR 120.54 encryption carve-out documented**

```
s3://my-bucket (eu-west-1) holding plaintext or single-key-managed-by-CSP technical data  ← high risk
```

⚠ **Cross-border replication of plaintext technical data**

```
us-east-1 → ap-southeast-1 with no end-to-end encryption layer  ← high risk
```

⚠ **CDN with non-US edge caching ITAR technical data**

```
CloudFront with European edge locations caching ITAR-bearing payloads  ← high risk
```

### EAR Violations

❌ **Allowing access from embargoed countries**

```
User login from Iran (IR)  ← VIOLATION
```

❌ **No geo-blocking configured**

```
WAF rules allow all countries  ← VIOLATION
```

❌ **Denied party not screened**

```
Entity List company granted access  ← VIOLATION
```
