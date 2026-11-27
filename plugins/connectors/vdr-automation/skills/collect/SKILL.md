---
name: collect
description: Import scanner findings, enrich with NIST controls, and generate a vulnerability report for FedRAMP's VDR and VER rules
---

# VDR Automation — Collect

Runs the full collection pipeline: import scanner findings into the findings workbook, enrich with NIST 800-53 mappings, and generate a vulnerability report with live CISA KEV and EPSS enrichment.

The report supports FedRAMP's Vulnerability Detection and Response (VDR) and Vulnerability Evaluation and Reporting (VER) rules. Both apply to every FedRAMP Certified offering, 20x and Rev5, and are mandatory from 2026-12-07. The upstream tool is older than the current rules, and its likely-exploitable, internet-reachable and N-rating values are heuristics, so review the output before you report it. The `vdr-automation-expert` skill lists the differences.

## Import Scanner Findings

The upstream tool calls its findings workbook a POA&M, so its file names and `--poam` flag keep that name.

```bash
python3 grc_tool.py convert --input <scanner_export> --scanner <nessus|tenable|qualys|wiz|generic> --output master_poam.xlsx
```

## Enrich with NIST 800-53 Controls

```bash
python3 grc_tool.py enrich --poam master_poam.xlsx
```

## Generate the Vulnerability Report

Produces `vdr_YYYYMMDD.xlsx` and `vdr_YYYYMMDD.json`. The JSON uses the upstream tool's own field names. It does not match FedRAMP's published vulnerability report schemas (<https://www.fedramp.gov/schemas/>), so convert it before you publish it as FedRAMP certification data.

```bash
python3 grc_tool.py vdr --poam master_poam.xlsx --baseline <low|moderate|high>
```

FedRAMP's timeframes depend on Certification Class, and the upstream tool only accepts `--baseline`. Classes B, C and D loosely align with Low, Moderate and High, so use `low` for Class B, `moderate` for Class C and `high` for Class D. There is no value for Class A. `low` is the closest, and it applies a 7-day evaluation window where FedRAMP allows Class A 14 days.

## Generate Product VDR

For software vendors publishing per-release vulnerability disclosures to customers.

```bash
python3 grc_tool.py product-vdr --input vulns.csv --product "<name>" --version "<version>"
```

## Export the Findings Workbook

Writes a clean copy of the findings workbook in the legacy POA&M layout.

```bash
python3 grc_tool.py export --poam master_poam.xlsx --output findings_export.xlsx
```

FedRAMP no longer takes a POA&M from providers, and vulnerability reports are not submitted to an assessor. They go to all necessary parties (FedRAMP and every agency customer using the offering) through the provider's trust center. Use this export for a program that still uses POA&Ms, such as GovRAMP or a NIST SP 800-171 system.

## JSON Output

`scripts/collect.sh --poam <path>` runs the `vdr` command into the cache directory, `~/.cache/claude-grc/findings/vdr-automation/`, and converts the resulting `vdr_run.json` into one file per run, `vdr-automation-<unix-epoch>.json`. That file is a JSON array with one entry per active or accepted vulnerability, each conforming to the GRC Engineering finding schema.

`findings[].id` holds the tracking ID from the findings workbook. The evaluation object has:

- `control_framework`: NIST-800-53-r5
- `control_id`: SI-2
- `status`: fail (active) or skipped (accepted)
- `severity`: mapped from N-rating (N5=critical, N4=high, N3=medium, N2=low, N1 and N0=info). This mapping is this connector's own, not FedRAMP's
- `message`: weakness name and CVE
- `remediation`: overall remediation plan with EPSS and KEV context
