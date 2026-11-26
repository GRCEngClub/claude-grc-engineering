---
description: Determine appropriate Essential 8 maturity level target
---

# Maturity Level Selection

Helps determine the appropriate Essential 8 maturity level target based on organizational risk profile and requirements.

## Arguments

- Argument 1 - Organization type (optional: government, critical-infrastructure, business, small-business)
- Argument 2 - Risk profile (optional: high, medium, low)

## Maturity Level Decision Framework

### Maturity Level 1 (Partly Aligned)

**Target Organizations**:

- Small businesses with limited resources
- Low-risk environments
- Organizations starting cyber security journey
- Non-critical systems

**Threat Protection**:

- Basic protection against commodity malware
- Prevents common attack techniques
- Reduces likelihood of successful ransomware

**Characteristics**:

- Entry-level security posture
- Foundation for further maturity
- Cost-effective baseline controls
- Minimal operational impact

**Implementation Time**: 3-6 months typically

---

### Maturity Level 2 (Mostly Aligned)

**Target Organizations**:

- Medium-sized businesses
- Organizations with moderate risk
- State/local government agencies
- Non-critical infrastructure
- Most commercial entities

**Threat Protection**:

- Protection against sophisticated adversaries
- Prevents most targeted attacks
- Reduces impact of advanced persistent threats (APTs)
- Strong ransomware defense

**Characteristics**:

- Balanced security vs usability
- Industry-standard practices
- Recommended for most organizations
- Reasonable operational overhead

**Implementation Time**: 6-12 months typically

---

### Maturity Level 3 (Fully Aligned)

**Target Organizations**:

- Federal/state government (mandatory for many)
- Critical infrastructure operators
- Defense contractors
- High-value targets
- Organizations with sensitive data
- Financial services, healthcare (high-risk)

**Threat Protection**:

- Maximum protection against advanced adversaries
- Nation-state actor resilience
- Prevents zero-day exploitation
- Comprehensive incident recovery

**Characteristics**:

- Highest security posture
- Significant operational controls
- Substantial resources required
- Continuous monitoring and validation

**Implementation Time**: 12-24 months typically

---

## Australian Government Requirements

### Mandatory Requirements

**Non-corporate Commonwealth Entities (NCEs)**:

- Must implement Essential Eight at **Maturity Level 3**
- Annual self-assessment required
- Report to Attorney-General's Department

**Corporate Commonwealth Entities (CCEs)**:

- Must implement Essential Eight (level varies)
- Based on risk assessment
- Report through governance processes

**State/Territory Government**:

- Requirements vary by jurisdiction
- Many mandate ML2 or ML3
- Check specific state policies

**Critical Infrastructure**:

- Security of Critical Infrastructure (SOCI) Act 2018
- Enhanced cyber security obligations
- Typically require ML2 or ML3

---

## Risk-Based Selection Criteria

### High-Risk Organizations (Target ML3)

- Handle classified information
- Critical infrastructure sectors (energy, water, healthcare, finance, transport)
- High-profile targets (political, media)
- Defense Industrial Base
- Personal information at scale
- National security implications

### Medium-Risk Organizations (Target ML2)

- Business-critical systems
- Customer data processing
- Regulatory compliance requirements
- Professional services
- Supply chain to government
- Revenue >\$100M

### Low-Risk Organizations (Target ML1)

- Non-critical business functions
- Minimal data sensitivity
- Small business (<50 employees)
- Limited attack surface
- Starting security maturity journey

---

## Implementation Cost Considerations

### Maturity Level 1

- **Tools/Technology**: \$10K-\$50K
- **Consulting/Labor**: \$25K-\$75K
- **Ongoing**: \$10K-\$30K/year
- **Total Initial**: \$35K-\$125K

### Maturity Level 2

- **Tools/Technology**: \$50K-\$150K
- **Consulting/Labor**: \$75K-\$200K
- **Ongoing**: \$30K-\$100K/year
- **Total Initial**: \$125K-\$350K

### Maturity Level 3

- **Tools/Technology**: \$150K-\$500K
- **Consulting/Labor**: \$200K-\$500K+
- **Ongoing**: \$100K-\$300K/year
- **Total Initial**: \$350K-\$1M+

*Costs vary significantly by organization size and current maturity*

---

## Progressive Implementation Approach

**Recommended Path**: ML1 → ML2 → ML3

1. **Phase 1: Achieve ML1** (Months 1-6)
   - Establish baseline controls
   - Quick wins and risk reduction
   - Build security team capability

2. **Phase 2: Progress to ML2** (Months 7-12)
   - Enhance existing controls
   - Implement advanced features
   - Improve automation

3. **Phase 3: Advance to ML3** (Months 13-24)
   - Harden all controls
   - Implement phishing-resistant MFA
   - Comprehensive testing and validation

**Benefits**:

- Manageable resource requirements
- Early risk reduction
- Staff capability development
- Budget spreading across fiscal years

---

## Decision Tree

```
Do you handle classified information or operate critical infrastructure?
├─ YES → Target ML3
└─ NO → Continue

Are you a Commonwealth government entity?
├─ YES → ML3 (NCE) or ML2+ (CCE)
└─ NO → Continue

Are you a high-profile target or handle sensitive data at scale?
├─ YES → Target ML3
└─ NO → Continue

Do you have regulatory compliance requirements or business-critical systems?
├─ YES → Target ML2
└─ NO → Continue

Are you a small business or just starting cyber security journey?
├─ YES → Start with ML1, plan progression
└─ NO → Target ML2 as baseline
```

---

## Examples

```bash
# Determine level for government agency
/essential8:maturity-level government high

# Assess appropriate level for small business
/essential8:maturity-level small-business low

# Critical infrastructure guidance
/essential8:maturity-level critical-infrastructure high

# General business assessment
/essential8:maturity-level business medium
```

## References

- **ACSC Essential Eight Maturity Model**
- **Protective Security Policy Framework (PSPF)**
- **Security of Critical Infrastructure (SOCI) Act 2018**
- **Attorney-General's Department - Cyber Security**
