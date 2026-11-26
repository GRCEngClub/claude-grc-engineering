---
description: Work through data location and sovereignty questions for an Australian Government system
---

# Data Residency and Sovereignty

Records where data, backups, and support access are, and checks them against the requirements that apply to the system.

The ISM does not set one rule such as "PROTECTED data must be in a specific region". Location requirements come from these sources:

- **The customer contract or procurement requirement.** This is the most common and most specific source.
- **The customer entity's obligations under the PSPF.**
- **Hosting arrangements.** Some government data has to be hosted with providers certified under the Hosting Certification Framework (HCF).
- **Other laws** that apply to the data, such as privacy law for personal information.

## Usage

```bash
/irap:data-residency [--profile <file>]
```

## Questions

| Question | Record |
|---|---|
| Where is primary data stored? List each cloud region or data centre | Location, provider, and service |
| Where are backups and replicas? | Location and retention |
| Where are logs and telemetry sent? | Location and the tools involved |
| Who can access the system for support and administration, and from which countries? | Roles, locations, and how access is controlled and logged |
| Which subprocessors handle the data, and where? | Name, purpose, and location |
| What does each customer contract require about location, support access, and certification? | Contract clauses |
| Does any customer require HCF certification? | Requirement and certification status |

## Hosting Certification Framework status

The Department of Home Affairs runs the HCF. It is being reformed, and from November 3, 2025 new certification registrations and supplementary assessments are paused until the reforms are complete. Existing certifications are unaffected. Check [hostingcertification.gov.au](https://www.hostingcertification.gov.au/) for the current state before relying on HCF in a plan.

## Output

A data location register: every location where data, backups, logs, or support access exist, checked against each customer requirement, with any gaps listed. Attach it to the scope record from `/irap:scope`.

## Notes

- Name the regions you use. Major cloud providers have more than one Australian region, and customers may require a specific one or a pair for resilience.
- Offshore support access counts as data leaving the country for many customers, even when storage is onshore.
