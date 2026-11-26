---
description: IRAP readiness gap assessment against the ASD Information Security Manual via the SCF crosswalk
---

# IRAP Assessment

Checks readiness for an IRAP assessment against the ASD Information Security Manual (ISM). Delegates to `/grc-engineer:gap-assessment` with the SCF framework ID `apac-aus-ism-2024-june` (336 SCF controls map to 802 ISM controls).

## Usage

```bash
/irap:assess [official|official-sensitive|protected|secret] [--sources=<connector-list>]
```

Delegates to:

```bash
/grc-engineer:gap-assessment "apac-aus-ism-2024-june" [--sources=<connector-list>]
```

## Arguments

- `$1`: the highest classification the system will hold. Defaults to `official`. It is used to filter results by ISM applicability marking; it does not change the crosswalk.
- `--sources=<connector-list>` (optional): connectors to pull evidence from.

## Before you run it

1. `/irap:classification`: confirm the classification with the data owner.
2. `/irap:scope`: define the boundary and select controls.
3. `/irap:evidence-checklist`: collect the documents that connectors can't read, such as plans, contracts, and personnel records.

## Reading the output

- The gap report groups findings by SCF family and maps them back to ISM controls.
- Drop findings for controls not marked for your classification.
- The SCF crosswalk is built on the June 2024 ISM. Check flagged controls against the release you are being assessed on, because ASD changes and renumbers controls between releases.
- An IRAP assessor tests implementation and effectiveness. A clean gap report shows readiness, not an assessment outcome.

## Further reading

- [ASD: IRAP](https://www.cyber.gov.au/irap)
- [ASD: Information security manual](https://www.cyber.gov.au/ism)
- [SCF API entry for the ISM crosswalk](https://grcengclub.github.io/scf-api/api/crosswalks/apac-aus-ism-2024-june.json)
