# sg-mas-trm - Singapore MAS TRM

Reference-depth framework plugin for the Monetary Authority of Singapore (MAS)
Technology Risk Management Guidelines. Install and run:

```bash
/plugin install sg-mas-trm@grc-engineering-suite
/sg-mas-trm:scope
/sg-mas-trm:evidence-checklist
/sg-mas-trm:assess
```

## Status: Reference

This plugin provides scope determination, evidence checklist, and a
framework-specific gap assessment, all backed by the SCF crosswalk (214 SCF
controls to 280 MAS TRM controls).

### Level up to Full

Full depth adds framework-native workflow commands tied to the audit ritual. If
you have domain expertise for MAS TRM, see the
[Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the
level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `apac-sgp-mas-trm-2021` |
| Region | APAC |
| Country | SG |
| SCF controls mapped | 214 |
| Framework controls mapped | 280 |
| Depth | Reference |
| Regulator | Monetary Authority of Singapore (MAS) |

## References

- [Secure Controls Framework](https://securecontrolsframework.com) - crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://hackidle.github.io/scf-api/api/crosswalks/apac-sgp-mas-trm-2021.json)
- [MAS Technology Risk Management Guidelines, January 18 2021](https://www.mas.gov.sg/-/media/MAS/Regulations-and-Financial-Stability/Regulatory-and-Supervisory-Framework/Risk-Management/TRM-Guidelines-18-January-2021.pdf)
- [Monetary Authority of Singapore](https://www.mas.gov.sg/)
