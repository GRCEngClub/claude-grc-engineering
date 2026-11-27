---
name: vdr-automation-expert
description: "Expertise in vulnerability reporting under FedRAMP's Vulnerability Detection and Response (VDR) and Vulnerability Evaluation and Reporting (VER) rules, vulnerability finding lifecycle management, and reviewing the upstream tool's CISA KEV, EPSS, N-rating, LEV/IRV, and NIST 800-53 classifications."
---

# VDR Automation Expert

## Tool Behavior

This connector wraps networkbm/POAM-Automation-Tool, a Python CLI that manages the vulnerability finding lifecycle from scanner import through a vulnerability report that the tool calls a "FedRAMP 20x VDR".

### Where it fits in FedRAMP's rules

FedRAMP's Consolidated Rules for 2026 (CR26) cover vulnerabilities in two rulesets. Vulnerability Detection and Response (VDR) holds the detection rules and the mitigation and remediation timeframes. Vulnerability Evaluation and Reporting (VER) holds the evaluation and reporting rules. Both apply to every FedRAMP Certified offering, 20x and Rev5, and are mandatory from 2026-12-07.

CR26 replaces provider POA&Ms with a list of accepted vulnerabilities (FedRAMP's narrative pages also say "Accepted Weaknesses"). Agencies keep POA&Ms for their own actions. The upstream tool still calls its findings workbook a POA&M, which is why its file names and `--poam` flag keep that name.

The upstream tool's last commit (2026-04-22) is older than CR26 (released 2026-06-24). Where the two differ, the sections below say so. Treat the tool's output as a draft for a person to review, not as a finished FedRAMP report.

### What it does

- Parses raw scanner exports (Nessus, Tenable, Qualys, Wiz) into a structured findings workbook
- Auto-deduplicates findings across scanner imports using title + asset identifier
- Enriches findings with NIST 800-53 control mappings via keyword matching
- Manages finding lifecycle: update, close, deviation (false positive / operational requirement)
- Generates a vulnerability report (Excel and JSON) with live CISA KEV and EPSS enrichment
- Generates per-release Product VDR reports for customer-facing vulnerability disclosure
- Outputs machine-readable JSON alongside every Excel report

### What FedRAMP requires for each vulnerability

The VER rules require three evaluations of every detected vulnerability, each made in the context of the offering:

- **Likely exploitable or not** (LEV / NLEV), `VER-EVA-ELX`
- **Internet-reachable or not** (IRV / NIRV), `VER-EVA-EIR`. The test is whether a payload from the internet can reach the vulnerable resource.
- **Potential Agency Impact N-rating (PAIN)**, `VER-EVA-EPA`. It runs from N0 (exploitation is extremely unlikely to have any adverse effect on agencies) to N5 (a debilitating effect on more than one agency). It measures the effect on agencies that use the service, not scanner severity.

FedRAMP prescribes no scoring framework for these: the rules contain no CVSS or EPSS threshold and no KEV floor. Providers must assume exploitation can be automated unless they have evidence otherwise (`VER-EVA-AIA`).

### Classification heuristics (the upstream tool's, not FedRAMP rules)

The tool fills in the three evaluations with shortcuts. They are a starting point, and every value needs review before it is reported.

- **CISA KEV**: the finding's CVE is checked against the live CISA Known Exploited Vulnerabilities catalog. The tool rates a KEV finding at least N3. FedRAMP's own KEV rule is different: `VDR-TFR-KEV` says to remediate KEVs by the due dates in the CISA catalog.
- **EPSS**: the Exploit Prediction Scoring System score is fetched from the FIRST.org API. The tool treats a score of 0.10 or higher as LEV.
- **LEV/NLEV**: LEV if the CVE is in KEV, or EPSS is 0.10 or higher, or the scanner severity is Critical or High and the finding has a CVE. Otherwise NLEV.
- **IRV/NIRV**: IRV if the weakness name or description contains one of a fixed list of keywords (for example "public", "internet", "s3", "http"). Otherwise NIRV. This is text matching, not a reachability test.
- **N-rating**: the base comes from scanner severity (Critical N4, High N3, Medium N2, Low N1). It is raised to at least N3 for KEV findings and raised one step when a finding is both IRV and LEV. The tool never assigns N0.

### The `--baseline` flag and Certification Classes

FedRAMP's timeframes depend on the offering's Certification Class (A to D). The upstream tool predates classes and accepts only `--baseline low|moderate|high`. Classes B, C and D loosely align with Low, Moderate and High and are not identical to them, so pick the value by your class:

| Certification Class | `--baseline` value | Tool's evaluation window | Tool's update interval |
|---|---|---|---|
| A | none. `low` is the closest | 7 days (FedRAMP allows 14) | 30 days |
| B | `low` | 7 days | 30 days |
| C | `moderate` | 5 days | 14 days |
| D | `high` | 2 days | 7 days |

### Evaluation Deadlines

`VER-TFR-EVU` says providers should finish evaluating a vulnerability within this many days of detection: Class A 14, Class B 7, Class C 5, Class D 2. The tool's deadline is the detection date plus 7, 5 or 2 days for `low`, `moderate` or `high`.

### Remediation timeframes

`VDR-TFR-PVR` sets how long a provider should take to reduce a vulnerability to a lower N-rating. The time depends on class, N-rating, likely exploitability and internet reachability, and it is counted from evaluation. The tool does not calculate these. Its "remediation overdue" count compares today with the scheduled completion date in the workbook.

### Auto-Acceptance Threshold

The tool moves a finding to its Accepted Vulnerabilities sheet when 192 or more days have passed since the detection date, or when the finding is marked as a false positive or an operational requirement.

FedRAMP's rule (`VER-TFR-MAV`) differs in two ways. The 192 days run from evaluation, not detection. And the rule covers any vulnerability that is not or will not be fully mitigated or remediated in that time, so one you already know will miss the window is an accepted vulnerability now, not on day 192.

### Report cadence

`VER-TFR-MHR` requires a human-readable vulnerability activity report to all necessary parties at least monthly, for every class. The tool's update interval (30, 14 or 7 days) matches a separate rule, `VER-TFR-MRH`, on how often the JSON vulnerability history is refreshed for automated retrieval: Class A monthly (MAY), Class B monthly (SHOULD), Class C every 14 days (SHOULD), Class D every 7 days (SHOULD).

The tool prints a "next VDR submission due" date from that interval. Nothing is submitted to FedRAMP on that date. Reports go to all necessary parties (FedRAMP and every agency customer using the offering) through the provider's FedRAMP-compatible trust center.

### JSON format

FedRAMP publishes JSON schemas for vulnerability reports (`fedramp-vulnerability-detail-report`, `fedramp-accepted-vulnerability-info` and `fedramp-historical-ver-activity`, all ending `-schema-2026-06-24.json`, at <https://www.fedramp.gov/schemas/>). The tool's JSON uses its own field names (`active_vulnerabilities`, `adverse_impact`, `internet_reachability`, `likely_exploitability`) and does not match those schemas. Convert it before publishing it as FedRAMP certification data.

## Control Coverage

This connector maps findings to NIST 800-53 Rev 5 controls via keyword matching across 30+ control families including SI-2, RA-5, AC-2, AC-3, SC-8, SC-28, AU-2, CM-6, CM-7, and others.

## Failure Modes

- **Missing openpyxl**: Install with `pip install openpyxl`
- **CISA KEV unavailable**: Offline fallback uses severity-based LEV classification
- **EPSS unavailable**: Offline fallback uses severity-based LEV classification
- **Findings workbook open in Excel**: Close the file before running any write command
- **Duplicate findings**: Automatically skipped on import, matched on the same title + asset identifier

## Limitations

- Product VDR requires a manually maintained vulnerability CSV. It does not auto-discover product vulnerabilities
- NIST control mapping is keyword-based, not authoritative. Review mappings before reporting
- LEV, IRV and N-rating values are heuristics. FedRAMP requires an evaluation in the context of the offering
- AI remediation text requires Ollama running locally with the Mistral model
