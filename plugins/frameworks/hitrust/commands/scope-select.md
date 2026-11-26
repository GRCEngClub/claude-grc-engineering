---
description: Determine appropriate HITRUST assessment scope (i1 vs r2)
---

# HITRUST Scope Selection

Helps determine whether to pursue i1, r2, or e1 HITRUST CSF assessment based on organizational needs and constraints.

## Arguments

- Argument 1 - Organization type (optional: provider, payer, vendor, business-associate)
- Argument 2 - Primary driver (optional: hipaa, baa-requirement, vendor-requirement, competitive)

## Decision Factors

### i1 Assessment (Implemented, 1-year)

**Choose i1 when**:

- First-time HITRUST certification
- Vendor/supplier requirement (not provider)
- Annual recertification acceptable
- Budget constraints (<\$100K for assessment)
- Want to test readiness before r2
- Self-attestation preferred (validated optional)

**i1 Validated vs Self-Assessment**:

- **Validated**: External assessor reviews and validates
  - More credible to customers
  - ~\$30K-\$80K assessment cost
  - Recommended for BAAs, vendors
- **Self-Assessment**: Internal team completes
  - Lower cost (~\$10K-\$30K tools/training)
  - Less third-party credibility
  - Good for internal readiness

### r2 Assessment (Reportable, 2-year)

**Choose r2 when**:

- Healthcare provider or payer
- BAA partners require r2
- Regulatory compliance driver (OCR, state regs)
- 2-year validity needed
- Higher assurance level required
- Competitive differentiation
- External assessor mandatory

**r2 Requirements**:

- External HITRUST assessor required
- More rigorous testing and validation
- Higher cost (\$100K-\$300K+ assessment)
- Longer timeline (6-12 months)
- Greater ongoing maintenance

### e1 Assessment (Bridge)

**Choose e1 when**:

- Currently have i1, want to upgrade to r2
- Year 2 of certification cycle
- Incremental approach to r2
- Budget spreading across 2 years
- Want to maintain continuous certification

## Organization Type Guidance

### Healthcare Providers (Hospitals, Clinics)

**Recommendation**: r2

- Regulatory scrutiny highest
- Patient trust critical
- OCR expectations
- BAA requirements from partners

### Health Plans/Payers

**Recommendation**: r2

- Large member populations
- Regulatory requirements
- Vendor management
- Public reporting often required

### Business Associates

**Recommendation**: i1 validated or r2

- BAA requirements dictate
- Customer expectations
- Competitive landscape
- Risk profile of data

### Technology Vendors (SaaS, Cloud)

**Recommendation**: i1 validated minimum, r2 preferred

- Customer requirements vary
- Inherited controls from infrastructure
- Velocity of product changes
- Certification as sales enabler

### Smaller Organizations (<50 employees)

**Recommendation**: i1 self-assessment or validated

- Resource constraints
- Cost sensitivity
- Risk-appropriate
- Can upgrade to r2 later

## Cost Comparison

| Assessment Type | Assessment Cost | Remediation Cost | Timeline | Validity |
|-----------------|----------------|------------------|----------|----------|
| **i1 Self** | \$10K-\$30K | \$50K-\$150K | 3-6 months | 1 year |
| **i1 Validated** | \$30K-\$80K | \$50K-\$150K | 3-6 months | 1 year |
| **r2** | \$100K-\$300K+ | \$150K-\$500K+ | 6-12 months | 2 years |
| **e1** | \$40K-\$100K | Variable | 3-6 months | Extends to 2yr |

*Costs vary by scope, assessor, and readiness level*

## Output

1. **Recommended Assessment Type**: i1, r2, or e1
2. **Justification**: Why this type fits
3. **Timeline Projection**: Expected duration
4. **Budget Estimate**: Assessment + remediation
5. **Alternative Paths**: e.g., "Start with i1, plan for r2"
6. **Key Considerations**: Org-specific factors

## Examples

```bash
# Vendor needing BAA compliance
/hitrust:scope-select business-associate baa-requirement

# Healthcare provider evaluating options
/hitrust:scope-select provider hipaa

# Determine best path for SaaS vendor
/hitrust:scope-select vendor competitive
```
