---
name: ear-assess
description: EAR-specific compliance assessment for dual-use commercial items
---

# EAR Assessment

> **Engineering guidance only. Not legal advice.** BIS determines EAR applicability, ECCNs, and license requirements, not this toolkit. Under [15 CFR 734.6](https://www.ecfr.gov/current/title-15/section-734.6), BIS is the authority; the country-specific sanctions rules live in [15 CFR 746](https://www.ecfr.gov/current/title-15/part-746) and change regularly (e.g. [Russia and Belarus under 746.8](https://www.ecfr.gov/current/title-15/section-746.8), Crimea/DNR/LNR under 746.6). Check the [BIS country guidance](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance) for current sanctions text. Work with export-control counsel before relying on any posture below.

Deep dive assessment for Export Administration Regulations (EAR) compliance. Focuses on dual-use commercial items, encryption products, and technology under the Commerce Control List (CCL).

## Arguments

- Argument 1 - Item type (optional: encryption, technology, commodities, software) - defaults to "general"

## EAR Control Assessment

### EAR-1: Export Control Classification (ECCN)

**Requirement**: Determine proper ECCN or EAR99 classification for all controlled items.

**Assessment Questions**:

- Are all items classified with proper ECCN or EAR99?
- Is classification documented and tagged on resources?
- Is source code classified (ECCN 5D002 for encryption)?

**Common ECCNs**:

- **5D002**: Encryption software
- **5A002**: Encryption hardware/equipment
- **5E002**: Encryption technology (technical data)
- **3A001**: Electronic equipment
- **4A003**: Digital computers
- **EAR99**: Items not on CCL (no license required for most exports, but destination, end-user, and end-use rules still apply — see 15 CFR 744, 746)

### EAR-2: End-User and End-Use Screening

**Requirement**: Screen all customers and partners against BIS denied parties lists.

**Screening Lists**:

- **Entity List**: Parties restricted for national security/foreign policy reasons
- **Denied Persons List (DPL)**: Individuals/entities with denied export privileges
- **Unverified List (UVL)**: End-use could not be verified
- **Treasury SDN**: Specially Designated Nationals

**Screening Frequency**:

- Before granting account access
- Quarterly for existing customers
- After any BIS list update

**Assessment Questions**:

- Is screening performed for all new customers?
- Is screening documentation maintained?
- Are denied party matches reported and access blocked?

### EAR-3: Encryption Compliance (FIPS 140)

**Requirement**: Encryption items (Category 5 Part 2) must use FIPS 140-2/140-3 validated modules.

**Assessment Questions**:

- Are FIPS 140-2 Level 2+ HSMs used for encryption?
- Is encryption self-classified or BIS-reviewed?
- Is License Exception ENC applicable?

**Self-Classification**:

- Submit encryption registration to BIS
- Annual self-classification reports for updates
- Maintain documentation of FIPS validation

### EAR-4: Geographic Access Controls

**Requirement**: Block access from comprehensively embargoed countries.

**Embargoed Countries** (no exports without license):

- Cuba (CU)
- Iran (IR)
- North Korea (KP)
- Syria (SY)
- Crimea region of Ukraine

**Partially Sanctioned** (check specific restrictions):

- Russia (RU)
- Belarus (BY)
- Venezuela (VE)

**Assessment Questions**:

- Is WAF/Cloud Armor configured to block embargoed countries?
- Are geo-restrictions enabled on content delivery?
- Are access attempts from embargoed countries logged and blocked?

### EAR-5: Technology Transfer Controls

**Requirement**: Control export of technical data and source code.

**Technical Data** (EAR 734.2):

- Information required for design, development, production, or use
- Blueprints, plans, diagrams, models, formulae
- Engineering designs and specifications
- Manuals and instructions
- Source code (depending on ECCN)

**Assessment Questions**:

- Are code repositories access-controlled by geography?
- Is technical data marked with ECCN classification?
- Are deemed exports controlled (foreign nationals accessing data in US)?

### EAR-6: Cloud Service Provider Attestations

**Requirement**: Verify CSP provides EAR-compliant features.

**CSP Requirements**:

- FIPS 140-2 validated encryption
- Customer-managed encryption keys (CMEK) available
- Data residency controls
- No CSP access to customer data without permission

**Assessment Questions**:

- Is CMEK configured for all controlled data?
- Does CSP provide FIPS 140 attestations?
- Are data residency options available?

### EAR-7: License Exception Applicability

**Requirement**: Determine if License Exception applies to avoid needing export license.

**Common License Exceptions**:

**ENC (Encryption)**:

- Certain encryption items ECCN 5A002, 5D002
- Self-classification reporting required
- Not available for embargoed countries

**TSU (Technology and Software - Unrestricted)**:

- Publicly available technology/software
- Educational information
- Published materials

**BAG (Baggage)**:

- Personal baggage exports
- Tools of trade (laptops with encryption)

**TMP (Temporary)**:

- Temporary exports for testing, demonstrations

**Assessment Questions**:

- Do any License Exceptions apply to your items?
- Is self-classification completed for ENC?
- Is TSU applicability documented for public software?

## BIS Reporting Requirements

**Encryption Registration** (one-time):

- Submit product information to BIS
- Required for ECCN 5A002, 5D002, 5E002 items

**Annual Self-Classification** (if using ENC):

- Report semi-annually to BIS
- Document updates to encryption products

## Classification Decision Tree

```
Is the item on the USML (US Munitions List)?
├─ YES → Use ITAR (not EAR)
└─ NO → Continue to EAR

Is the item on the CCL (Commerce Control List)?
├─ YES → Determine ECCN (e.g., 5D002 for encryption)
│   ├─ High-level ECCN → May require BIS license
│   └─ Check License Exceptions (ENC, TSU, etc.)
└─ NO → Likely EAR99 (no license for most exports)
    ├─ Destination rules still apply (15 CFR 746 embargoes + sanctions)
    ├─ End-user rules still apply (Entity List, DPL, SDN screening)
    └─ End-use rules still apply (15 CFR 744 — "knowledge" standard means
       a license can be required if you know or have reason to know the
       item is destined for a prohibited use, user, or destination)
```

## Examples

```bash
# General EAR assessment
/us-export:ear-assess

# Encryption product assessment
/us-export:ear-assess encryption

# Technology/source code assessment
/us-export:ear-assess technology

# Software product assessment
/us-export:ear-assess software
```

## Key Distinctions from ITAR

- **Personnel**: No blanket US-person requirement (EAR) vs. US persons only (ITAR)
- **Geography**: BIS-driven, ECCN-specific, sanctions per 15 CFR 746 (EAR) vs. US-located by default with 22 CFR 120.54 encryption carve-out (ITAR)
- **Authority**: Commerce BIS (EAR) vs. State DDTC (ITAR)
- **License Exceptions**: Available for EAR, not for ITAR
- **Scope**: Dual-use commercial (EAR) vs. Defense articles (ITAR)
