# us-ccpa — California Consumer Privacy Act (CCPA / CPRA)

Reference-depth framework plugin for the California Consumer Privacy Act, as amended by the California Privacy Rights Act. Codified at California Civil Code §1798.100 et seq. Enforced by the California Privacy Protection Agency (CPPA) and the California Attorney General.

## Install and run

```bash
/plugin install us-ccpa@grc-engineering-suite
/us-ccpa:scope                    # determine applicability first
/us-ccpa:evidence-checklist       # see what to collect
/us-ccpa:assess                   # run the gap assessment
```

## Status: Reference

This plugin is at **Reference depth** — it provides:

- **Scope determination** for the three CPRA-amended applicability thresholds and the federal-statute carve-outs
- **Evidence checklist** organized by California Civil Code section (1798.100 / .105 / .106 / .110 / .115 / .120 / .121 / .125 / .130 / .135 / .140 / .145 / .150 / .185)
- **Gap assessment** delegated to `/grc-engineer:gap-assessment` against the SCF crosswalk (258 SCF controls → 623 framework controls)
- **CPPA-specific context**: risk assessments, cybersecurity audits, Universal Opt-Out Mechanism (GPC) handling, Service Provider / Contractor / Third Party distinctions, and the limited private right of action

### Level up to Full

Full depth would add framework-native workflow commands tied to CPPA enforcement and audit ritual — e.g. risk-assessment generators per the CPPA regulations, DSAR ticket review, or vendor-contract DPA-addendum drafters. See the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `usa-state-ca-ccpa-cpra-2026` |
| Region | Americas |
| Country | United States |
| Regulator | California Privacy Protection Agency (CPPA); California Attorney General |
| Statute | California Civil Code §1798.100 et seq. |
| SCF controls mapped | 258 |
| Framework controls mapped | 623 |
| Depth | Reference |

## References

- [California Privacy Protection Agency (CPPA)](https://cppa.ca.gov) — primary regulator; rulemaking, enforcement, guidance
- [California Attorney General — CCPA page](https://oag.ca.gov/privacy/ccpa) — co-enforcer; pre-CPRA enforcement history
- California Civil Code §1798.100 through §1798.199.100 (current text via the [California Legislative Information portal](https://leginfo.legislature.ca.gov))
- 11 California Code of Regulations §7000 et seq. — CPPA implementing regulations
- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/usa-state-ca-ccpa-cpra-2026.json)
