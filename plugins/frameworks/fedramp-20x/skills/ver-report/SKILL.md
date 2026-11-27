---
name: ver-report
description: Build FedRAMP vulnerability activity reports from a list of vulnerabilities, applying the class-based evaluation and mitigation timeframes, moving items past 192 days to accepted vulnerabilities, and writing the JSON reports and the monthly human-readable report. Use where older FedRAMP work would have produced a POA&M or a Risk Exposure Table.
---

# Vulnerability activity reports

Under the VER ruleset a provider reports vulnerability activity at least monthly in human-readable form, and offers JSON history for automated retrieval. Provider POA&Ms are gone; long-lived items become **accepted vulnerabilities**. These rules apply to 20x and Rev5 offerings alike, and are mandatory from December 7, 2026.

`ver-report.js` takes a working file of vulnerabilities, applies FedRAMP's published timeframes for the certification class, and writes the reports.

**What it does not do.** It does not rate anything. Whether a vulnerability is likely exploitable, whether it is internet-reachable, and its Potential Agency Impact N-rating (N0 to N5) are the provider's evaluation, entered in the working file. FedRAMP prescribes no scoring formula, so do not derive these from scanner severity or an EPSS score without the provider confirming them for their own context.

## Arguments

- Argument 1 - `init`, `check` or `build`
- Argument 2 - path of the working file (for `check` and `build`)
- Argument 3 - output directory (for `build`)

`$ARGUMENTS`

## Start a working file

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/ver-report.js" init --out=ver-working.json
```

Keep **every open and accepted vulnerability** in the file, plus those closed during the period, and carry the file forward from month to month. The history snapshot is built from it, so an open item left out of the file disappears from the history. Field names are FedRAMP's: `providerTrackingId`, `detection.detectedAt`, `detection.detectionSource`, `vulnerabilityDescription`, `evaluationCompletedAt`, `isInternetReachable`, `isLikelyExploitable`, `currentRating`, `painReductionEvents`, `projectedNextReduction`, `finalDisposition`. Set `certificationClass` at the top; every timeframe depends on it.

Three fields are this script's own and are left out of the reports: `accepted` (set `true` when the provider decides to accept), `overdueExplanation` (the provider's reason, added to the computed one) and `closedAt` (when work ended).

A `finalDisposition` of Remediated, Fully Mitigated or False Positive closes an item, even if it was accepted earlier, and needs a `closedAt` date-time. The item is reported in the period it closed and is left out of later periods.

The script reads the file as it stands. To rebuild a report for an earlier date, use the copy of the working file from that date: `--as-of` is refused when the file records events later than it.

To load a scanner export, map its rows into this shape and leave the three evaluations empty for the provider to fill in. Do not copy a scanner's severity into `currentRating`.

## Check

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/ver-report.js" check ver-working.json [--as-of=2026-12-01]
```

For each vulnerability, as of today or the date given:

- **Not yet evaluated:** when evaluation was due, counted from detection (`VER-TFR-EVU`: 14, 7, 5 or 2 days for Class A, B, C, D)
- **Evaluated and open:** when a reduction to a lower N-rating is expected, counted from evaluation (`VDR-TFR-PVR`), by class, N-rating, exploitability and reachability. N1 and N0 have no timeframe.
- **Past 192 days from evaluation and not resolved:** listed as accepted (`VER-TFR-MAV`). The check fails until an `acceptanceRationale` is written.
- **Overdue**, with the rule and the date in the explanation

Print the table of timeframes for a class with `node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" timeframes --class=C`.

## Build

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/ver-report.js" build ver-working.json --out-dir=ver-reports
```

Writes four files, readable only by you. It refuses to replace reports that already exist, so use a new directory for each period (`--force` overrides):

| File | Rule | Content |
|---|---|---|
| `vulnerability-detail-report.json` | `VER-RPT-VDT` | Open vulnerabilities that are not accepted, and those closed in the period |
| `accepted-vulnerability-info.json` | `VER-RPT-AVI` | Accepted vulnerabilities and the reason for each |
| `historical-ver-activity.json` | `VER-TFR-MRH` | Snapshot of all active and accepted vulnerabilities for automated retrieval |
| `vulnerability-activity-report.md` | `VER-TFR-MHR` | The monthly human-readable report: counts by N-rating, each item's dates and status, overdue items, rating changes |

The JSON follows FedRAMP's `2026-06-24` schemas. Validate at <https://www.fedramp.gov/schemas/validator/> before publishing; FedRAMP's schemas are the authority.

## Things to tell the user

- Most timeframes are SHOULD. "Overdue" here means past the expected timeframe, and the report has to say why. It is not by itself a finding.
- The timeframe clock runs from evaluation and uses the current N-rating. FedRAMP's rule text is the authority on how a clock restarts after a partial reduction; the script does not restart it.
- Known Exploited Vulnerabilities follow CISA's KEV due dates (`VDR-TFR-KEV`), which this script does not look up.
- Descriptions go in the JSON, which FedRAMP's schema requires, and are left out of the Markdown report. Keep exploitable detail out of both (`VER-RPT-NID`).
- Reports go to FedRAMP and every agency customer through the provider's trust center.
- The timeframes come from the rules release bundled with this plugin, printed at the top of each report. Run `/fedramp-20x:sync-rules` to see whether FedRAMP has published a newer one.

## If the user asks for a POA&M or a Risk Exposure Table

FedRAMP no longer asks providers for either. There is no likelihood-times-impact score in the current rules; the rating is the N-rating. The accepted-vulnerability list is the nearest thing to a POA&M, and the detail report is where open weaknesses are tracked. An agency may still keep a POA&M for its own actions.

## Examples

```
/fedramp-20x:ver-report init
/fedramp-20x:ver-report check ver-working.json
/fedramp-20x:ver-report build ver-working.json ./ver-reports
```
