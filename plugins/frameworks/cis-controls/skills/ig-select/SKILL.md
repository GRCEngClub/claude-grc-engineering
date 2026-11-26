---
name: ig-select
description: Determine appropriate CIS Controls Implementation Group (IG1/IG2/IG3)
---

> _CIS Controls v8 content used under CC BY-SA 4.0 from the Center for Internet Security. This command's CIS-derived content is CC BY-SA 4.0. See [LICENSE-CIS.md](../../LICENSE-CIS.md)._

# CIS Controls IG Selection

Helps determine the appropriate Implementation Group (IG1, IG2, or IG3) for your organization based on size, resources, risk profile, and adversary sophistication.

## Arguments

- Argument 1 - Organization size (optional: small, medium, large)
- Argument 2 - Risk profile (optional: low, moderate, high, critical)

## Implementation Group Decision Framework

### IG1 - Essential Cyber Hygiene (56 Safeguards)

**Recommended For**:

- Small to medium businesses (<100 employees)
- Limited IT security resources (1-2 IT staff, no dedicated security team)
- Standard business risk profile
- Not targeted by advanced persistent threats
- Limited regulatory compliance requirements

**Resource Requirements**:

- Part-time security focus (can be handled by IT staff)
- Basic security tools (antivirus, firewall, backup)
- Budget: \$10K-\$50K annually
- Minimal specialized expertise needed

**Threat Profile**:

- Opportunistic attacks (phishing, ransomware)
- Automated scanning/exploitation
- Commodity malware
- Script kiddies, unsophisticated attackers

**Example Organizations**:

- Local retailers
- Professional services firms
- Small healthcare practices
- Regional nonprofits
- Educational institutions (K-12)

### IG2 - Enterprise Security (128 Safeguards)

**Recommended For**:

- Medium to large organizations (100-1,000 employees)
- Dedicated IT team with security responsibilities
- Moderate regulatory requirements (HIPAA, PCI-DSS, etc.)
- Handle sensitive customer or business data
- Potential target for more sophisticated attacks

**Resource Requirements**:

- Dedicated security staff (1-3 FTEs)
- Enterprise security tools (SIEM, EDR, vulnerability scanner)
- Budget: \$100K-\$500K annually
- Some specialized security expertise

**Threat Profile**:

- Targeted phishing campaigns
- Financially motivated cybercriminals
- Ransomware groups
- Industrial espionage
- Nation-state actors (lower tier)

**Example Organizations**:

- Mid-sized healthcare systems
- Financial services companies
- Manufacturing firms
- Regional government agencies
- SaaS providers

### IG3 - Advanced Security (153 Safeguards)

**Recommended For**:

- Large enterprises (1,000+ employees)
- Critical infrastructure organizations
- High-value assets or intellectual property
- Stringent regulatory requirements (CMMC L3, critical infrastructure)
- Known targets of sophisticated adversaries

**Resource Requirements**:

- Security Operations Center (SOC) team (5+ FTEs)
- Advanced security tools (threat intelligence, behavioral analysis, SOAR)
- Budget: \$1M+ annually
- Highly specialized security expertise (threat hunters, forensics, IR)

**Threat Profile**:

- Advanced Persistent Threats (APTs)
- Nation-state actors
- Sophisticated cybercriminal organizations
- Insider threats
- Supply chain attacks

**Example Organizations**:

- Fortune 500 companies
- Defense contractors
- Major healthcare systems
- Critical infrastructure (energy, utilities, transportation)
- Large financial institutions

## Selection Criteria Matrix

| Factor | IG1 | IG2 | IG3 |
|--------|-----|-----|-----|
| **Employees** | <100 | 100-1,000 | 1,000+ |
| **IT Staff** | 1-2 generalists | 3-10 with security focus | 10+ dedicated security |
| **Annual Revenue** | <\$10M | \$10M-\$1B | \$1B+ |
| **Data Sensitivity** | Basic business data | Customer PII, PHI | Trade secrets, critical infrastructure |
| **Regulatory** | Minimal | Moderate (HIPAA, SOX) | High (CMMC, NERC CIP) |
| **Threat Level** | Opportunistic | Targeted | Advanced/persistent |
| **Security Budget** | <\$50K | \$100K-\$500K | \$1M+ |
| **Downtime Tolerance** | Hours-days | Hours | Minutes |

## Progressive Implementation Approach

Organizations should consider a phased approach:

**Phase 1**: Implement IG1 (Foundation)

- Timeline: 6-12 months
- Focus: Essential cyber hygiene
- Quick wins with high impact

**Phase 2**: Advance to IG2 (If needed)

- Timeline: 12-24 months
- Focus: Enterprise processes and automation
- Build on IG1 foundation

**Phase 3**: Advance to IG3 (If needed)

- Timeline: 24-36 months
- Focus: Advanced threat detection and response
- Mature security operations

## Risk-Based Considerations

**High-Risk Factors** (may warrant higher IG):

- Handles sensitive data (PII, PHI, financial, IP)
- Critical infrastructure sector
- Known target of sophisticated threats
- High-profile or controversial organization
- Supply chain for critical industries
- Regulatory enforcement history

**Offsetting Factors** (may allow lower IG):

- Limited attack surface (air-gapped, isolated)
- Strong compensating controls
- Cyber insurance requirements met
- Managed security service provider (MSSP) support
- Cloud-native with strong CSP security

## Industry Benchmarks

**Healthcare**:

- Small practices: IG1
- Mid-sized systems: IG2
- Large hospital networks: IG3

**Financial Services**:

- Credit unions: IG1-IG2
- Regional banks: IG2
- National banks: IG3

**Manufacturing**:

- Job shops: IG1
- Mid-market: IG2
- OEMs with IP: IG3

**Technology**:

- Startups: IG1
- Growth stage: IG2
- Enterprise SaaS: IG3

## Output

1. **Recommended IG Level**: IG1, IG2, or IG3
2. **Justification**: Factors driving the recommendation
3. **Resource Requirements**: Estimated staff, budget, tools needed
4. **Safeguard Count**: How many controls to implement (56, 128, or 153)
5. **Implementation Timeline**: Realistic timeframe to reach target IG
6. **Cost-Benefit Analysis**: Security value vs implementation cost
7. **Progressive Path**: If starting lower, roadmap to advance IG levels

## Examples

```bash
# Determine IG for small healthcare practice
/cis:ig-select small moderate

# Assess IG needs for large financial institution
/cis:ig-select large critical

# Evaluate IG requirements for medium manufacturer
/cis:ig-select medium moderate

# General IG selection guidance
/cis:ig-select
```
