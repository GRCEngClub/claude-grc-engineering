# us-finra — FINRA Broker-Dealer Cybersecurity

Reference-depth framework plugin for FINRA member firms. FINRA has no single cybersecurity rule. This plugin covers the obligations FINRA examines:

- FINRA Rules 3110 (supervision) and 4370 (business continuity)
- SEC Regulation S-P, including the 2024 amendments
- Regulation S-ID
- SEA Rules 17a-3 and 17a-4

```bash
/plugin install us-finra@grc-engineering-suite
/us-finra:scope
/us-finra:evidence-checklist all
/us-finra:assess --sources=aws-inspector,okta-inspector
```

## Commands

| Command | What it does |
|---|---|
| `/us-finra:scope` | Determines which obligations apply. It checks covered accounts for S-ID, the firm's SCI entity status, and which service providers hold customer information |
| `/us-finra:evidence-checklist` | Builds an evidence list grouped by FINRA's 12 cybersecurity principles (August 2026), with the rule behind each item |
| `/us-finra:assess` | Runs `/grc-engineer:gap-assessment` against the SCF crosswalk |

## Status: Reference

Full depth would add exam-workflow commands, such as Reg S-P incident notification records or a FINRA request-list responder. See the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md).

## Metadata

| Key | Value |
|-----|-------|
| SCF framework ID | `usa-federal-sro-finra` |
| Region | Americas |
| Country | US |
| Regulator | FINRA |
| SCF controls mapped | 17 |
| Framework controls mapped | 39 |
| Depth | Reference |

## References

- [FINRA Cybersecurity Effective Practices (August 2026)](https://www.finra.org/rules-guidance/guidance/cybersecurity-effective-practices)
- [2026 FINRA Annual Regulatory Oversight Report: Cybersecurity](https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/cybersecurity)
- [SEC Regulation S-P amendments (2024)](https://www.sec.gov/newsroom/press-releases/2024-58)
- [Secure Controls Framework](https://securecontrolsframework.com), the crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/usa-federal-sro-finra.json)
