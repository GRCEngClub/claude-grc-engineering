---
name: sdr
description: Build, check and summarise a FedRAMP Security Decision Record for a 20x certification, with one entry per applicable rule and Key Security Indicator tracing implementation, provider validation, independent assessment, tests and evidence. Use where older FedRAMP work would have produced an SSP, an SRTM or a Security Assessment Report.
---

# Security Decision Record

The Security Decision Record (SDR) replaced the System Security Plan. It also took over the job of the Security Assessment Report and its traceability matrix: FedRAMP no longer asks for a separate SAP, SAR, SRTM or Risk Exposure Table, and publishes no templates. For every applicable rule and Key Security Indicator the SDR holds:

- how it is implemented (the provider)
- how the provider validates it
- what the independent assessor found
- for KSIs, the tests and the evidence

`sdr.js` keeps that as a JSON working file you edit, checks it for gaps, writes it in the shape of FedRAMP's SDR schema, and prints a traceability summary.

**What it does not do.** It never fills in a statement or a status, and it does not judge whether a statement is adequate. A complete record shows the record is filled in. Assessment statements are the assessor's to write.

## Arguments

- Argument 1 - `init`, `check`, `build` or `summary`
- Argument 2 - for `init`, the class (`A`, `B` or `C`); otherwise the path of the working file
- Argument 3 - output path (optional for `init` and `summary`, required for `build`)

`$ARGUMENTS`

## Start a working file

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/sdr.js" init --class=C --out=sdr-working.json
```

Lists every rule that applies to providers and every KSI for that 20x class: 154 rules and 46 KSIs for Class B or C, 42 rules and 7 KSIs for Class A. Keys beginning with `_` (`_name`, `_force`, `_statement`) are there to help whoever fills it in and are dropped from the built record. FedRAMP has not published the Class D rules for 20x, so `init` refuses `D`.

## Fill it in

For each entry, write what is true and leave empty what is not known:

| Field | Who writes it | Content |
|---|---|---|
| `frrImplementation`, `ksiImplementation` | Provider | How the rule or KSI is met. For a SHOULD the provider does not follow, the decision and the reason. |
| `frrValidation`, `ksiValidation` | Provider | How the provider checks that it works, and how often |
| `frrAssessment`, `ksiAssessment` | Independent assessor | What was examined, how, what the evidence showed, what failed or is disputed |
| `ksiTests` | Provider | The tests that validate the KSI. Class C must have at least 2 automated methods per KSI. |
| `ksiEvidence` | Provider | Entries with `evidenceType` (Log, Report, Screenshot, Configuration, Policy, Procedure, Audit Record), a description, and a URI or text |
| `frrImplementationStatus`, `ksiImplementationStatus` | Provider | `Implemented`, `Partially Implemented` or `Not Implemented` |

Help the user draft implementation and validation statements from what the repository and their answers show. Mark anything you inferred so they can confirm it. Do not draft assessment statements as if an assessment had happened.

## Check

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/sdr.js" check sdr-working.json
```

Reports three kinds of thing:

- **Errors** stop a build: an ID that is not in the rules, a duplicate, a status or evidence type outside the allowed values, a malformed URI.
- **Gaps**: an applicable rule or KSI with no entry, or an entry missing a statement, status, test or evidence.
- **Notes**: entries recorded as not fully implemented, KSIs with fewer tests than the class expects, a working file created against an older rules release.

## Build

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/sdr.js" build sdr-working.json --out=security-decision-record.json
```

Writes the record in the shape of `fedramp-security-decision-record-schema-2026-06-24.json`. It needs `certificationPackageOverviewUri` and `metadata` filled in, and it will not overwrite an existing file. Validate the result at <https://www.fedramp.gov/schemas/validator/> before sharing it; FedRAMP's schema is the authority, not this script.

## Summary

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/sdr.js" summary sdr-working.json --out=sdr-summary.md
```

A Markdown traceability table: each rule and KSI against status and whether implementation, validation and assessment statements, tests and evidence are present. It ends with the facts an assessor's overall summary has to cover (rule `IVV-IAS-OSA`): what was examined, where verification or validation failed, and what is disputed. The assessor writes that summary; the script leaves those lines for them.

## If the user asks for an SRTM, RET or SAR

Say plainly that FedRAMP does not require them for 20x or for Rev5 Program certification, and that the old templates survive only on FedRAMP's legacy site for reference. What replaced each:

| Legacy artifact | Now |
|---|---|
| SRTM (SAR Appendix B) | The per-rule and per-KSI entries in the SDR. `summary` prints them as a table. |
| Risk Exposure Table (SAR Appendix A) | Assessor summaries in the SDR, plus vulnerability reports and the accepted-vulnerability list. See `/fedramp-20x:ver-report`. |
| SAR | The assessor's per-entry statements in the SDR and an overall summary in the Certification Package Overview |

The one case where the legacy documents still come up is an agency-sponsored Rev5 assessment in which the sponsoring agency asks for them for its own authorization. That path closes to new applications on June 11, 2027, and FedRAMP still requires the overview and SDR alongside.

## Examples

```
/fedramp-20x:sdr init C sdr-working.json
/fedramp-20x:sdr check sdr-working.json
/fedramp-20x:sdr build sdr-working.json security-decision-record.json
/fedramp-20x:sdr summary sdr-working.json
```
