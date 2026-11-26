# irap — Australian IRAP and the Information Security Manual

Reference-depth framework plugin for IRAP (Infosec Registered Assessors Program) assessments against the ASD Information Security Manual (ISM). It covers Essential Eight maturity, classification, and data location.

```bash
/plugin install irap@grc-engineering-suite
/irap:classification
/irap:scope --classification protected
/irap:evidence-checklist all
/irap:assess protected --sources=aws-inspector,okta-inspector
```

## Commands

| Command | What it does |
|---|---|
| `/irap:classification` | Determines the highest classification the system holds and what it changes |
| `/irap:scope` | Defines the system boundary and selects ISM controls by applicability marking |
| `/irap:evidence-checklist` | Evidence grouped by ISM guideline |
| `/irap:essential-8` | Essential Eight maturity self-assessment |
| `/irap:data-residency` | Data location, support access, and HCF questions |
| `/irap:assess` | Gap assessment through the SCF ISM crosswalk |

## Status: Reference

Full depth would add commands for the IRAP engagement itself, such as preparing the system security plan or the assessor evidence pack. See the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md).

## Metadata

| Key | Value |
|-----|-------|
| SCF framework ID | `apac-aus-ism-2024-june` |
| Region | APAC |
| Country | AU |
| Program owner | Australian Signals Directorate (ASD) |
| SCF controls mapped | 336 |
| Framework controls mapped | 802 |
| Depth | Reference |

The SCF crosswalk maps to the June 2024 ISM. ASD updates the ISM regularly; the current release at time of writing is September 2026.

## References

- [ASD: IRAP](https://www.cyber.gov.au/irap)
- [ASD: Information security manual](https://www.cyber.gov.au/ism)
- [ASD: Essential Eight maturity model](https://www.cyber.gov.au/publication/essential-eight-maturity-model)
- [Protective Security Policy Framework](https://www.protectivesecurity.gov.au/)
- [Hosting Certification Framework](https://www.hostingcertification.gov.au/)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/apac-aus-ism-2024-june.json)
