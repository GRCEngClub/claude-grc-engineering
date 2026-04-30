# us-nerc-cip - NERC CIP

Reference-depth framework plugin for NERC Critical Infrastructure Protection
(CIP) Reliability Standards. Install and run:

```bash
/plugin install us-nerc-cip@grc-engineering-suite
/us-nerc-cip:scope
/us-nerc-cip:evidence-checklist
/us-nerc-cip:assess
```

## Status: Reference

This plugin provides scope determination, evidence checklist, and a
framework-specific gap assessment, all backed by the SCF crosswalk (122 SCF
controls to 204 NERC CIP controls).

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual. If
you have domain expertise for NERC CIP, see the
[Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the
level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `usa-federal-nerc-cip-2024` |
| Region | Americas |
| Country | US / North American BES jurisdictions |
| SCF controls mapped | 122 |
| Framework controls mapped | 204 |
| Depth | Reference |
| Regulator | NERC / FERC |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) - crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://hackidle.github.io/scf-api/api/crosswalks/usa-federal-nerc-cip-2024.json)
- [NERC Reliability Standards](https://nerc.com/pa/Stand/Pages/ReliabilityStandards.aspx)
- [NERC Supply Chain Risk Mitigation Program](https://www.nerc.com/pa/comp/Pages/Supply-Chain-Risk-Mitigation-Program.aspx)
- [FERC 2024 Lessons Learned from Commission-Led Reliability Audits](https://www.ferc.gov/news-events/news/ferc-staff-report-offers-lessons-learned-2024-cip-audits)
