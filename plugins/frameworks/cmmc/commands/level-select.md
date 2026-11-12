---
description: Determine required CMMC level based on contract and data types
---

# CMMC Level Selection

> **Review required:** This material is an unverified working aid, not an authoritative assessment or legal determination. Verify every control, objective, scope, assessment type, scoring and contractual claim against current official sources and obtain qualified CMMC and contracting review before use. If a source or contract is unavailable, mark the conclusion unverified; do not infer compliance.

Helps determine the appropriate CMMC level required for your organization based on DoD contract types and data sensitivity.

## Arguments

- `$1` - Contract type (optional: prime, subcontractor, service-provider)
- `$2` - Data type (optional: FCI, CUI, classified)

## Selection Criteria

### Data Types

**FCI (Federal Contract Information)**:

- Contract details, pricing, technical data
- Verify the solicitation or contract and applicable clause; if Level 1 (Self) is specified, annual self-assessment and affirmation apply. If unavailable, leave the conclusion unverified.

**CUI (Controlled Unclassified Information)**:

- Technical data, export-controlled info, ITAR
- Level and assessment type depend on the applicable solicitation, contract and current program requirements; Level 2 may be self-assessed or C3PAO-assessed.

**Classified Information**:

- Beyond CMMC scope
- Requires NISPOM/ICD 503 compliance

### Contract Types

**Prime Contractor**:

- Direct contract with DoD
- Verify the applicable solicitation or contract, specified level and assessment type; data sensitivity alone does not determine the result.

**Subcontractor**:

- Requirements depend on the subcontract and applicable flow-down, not automatic inheritance of the prime’s level. [32 CFR 170.23](https://www.ecfr.gov/current/title-32/section-170.23) specifies minimum levels by data and prime requirement.

**Service Provider**:

- Cloud/IT services to DoD contractors
- Determine the provider’s role, data handled, applicable contract, and scope under [32 CFR 170.19](https://www.ecfr.gov/current/title-32/section-170.19); do not automatically assign a Level 2 status. For cloud services handling covered defense information, check applicable DFARS 252.204-7012 requirements.

## Selection Matrix

| Data Type | Contract Type | Minimum Level | Assessment Type |
|-----------|---------------|---------------|-----------------|
| FCI only | Any | Verify applicable contract; Level 1 if specified | Annual self-assessment and affirmation when Level 1 applies |
| CUI | Prime/Sub | Verify applicable contract | Level 2 may be self or C3PAO; verify contract |
| CUI | Prime | Verify applicable contract | Verify contract and current requirements |

The [DFARS 252.204-7021(f)](https://www.acquisition.gov/dfars/252.204-7021-contractor-compliance-cybersecurity-maturity-model-certification-level-requirements.) flow-down excludes commercially available off-the-shelf items; verify the actual clause, subcontract and applicable exceptions. Without the contract, the requirement is unverified.

## Output

1. **CMMC Level**: Contract-verified requirement, or unverified if unavailable
2. **Justification**: Why this level is required
3. **Assessment Requirements**: Self vs third-party
4. **Timeline Considerations**: Assessment frequency
5. **Cost Implications**: Estimated assessment costs

## Examples

```bash
# Determine level for prime contractor with CUI
/cmmc:level-select prime CUI

# Assess requirements for subcontractor
/cmmc:level-select subcontractor CUI

# Evaluate service provider needs
/cmmc:level-select service-provider
```
