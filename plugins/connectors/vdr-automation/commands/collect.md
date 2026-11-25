---
name: collect
description: Import scanner findings, enrich with NIST controls, and generate VDR outputs
---

# VDR Automation — Collect

Runs the full collection pipeline: import scanner findings into the findings workbook, enrich with NIST 800-53 mappings, and generate FedRAMP 20x VDR outputs with live CISA KEV and EPSS enrichment.

## Import Scanner Findings

The upstream tool calls its findings workbook a POA&M, so its file names and `--poam` flag keep that name.

```bash
python3 grc_tool.py convert --input <scanner_export> --scanner <nessus|tenable|qualys|wiz|generic> --output master_poam.xlsx
```

## Enrich with NIST 800-53 Controls

```bash
python3 grc_tool.py enrich --poam master_poam.xlsx
```

## Generate FedRAMP 20x VDR

Produces `vdr_YYYYMMDD.xlsx` and `vdr_YYYYMMDD.json`. The JSON is schema-conformant and ready for API serving.

```bash
python3 grc_tool.py vdr --poam master_poam.xlsx --baseline <low|moderate|high>
```

## Generate Product VDR

For software vendors publishing per-release vulnerability disclosures to customers.

```bash
python3 grc_tool.py product-vdr --input vulns.csv --product "<name>" --version "<version>"
```

## Export for Assessor Submission

```bash
python3 grc_tool.py export --poam master_poam.xlsx --output fedramp_submission.xlsx
```

## JSON Output

`scripts/collect.sh` runs the `vdr` command and converts its `vdr_YYYYMMDD.json` output into documents that conform to the GRC Engineering finding schema, written to `~/.cache/claude-grc/findings/vdr-automation/`. Each vulnerability becomes one document.

`findings[].id` holds the tracking ID from the findings workbook. The evaluation object has:

- `control_framework`: NIST-800-53-r5
- `control_id`: SI-2
- `status`: fail (active) or skipped (accepted)
- `severity`: mapped from N-rating (N5=critical, N4=high, N3=medium, N2=low, N1=info)
- `message`: weakness name and CVE
- `remediation`: overall remediation plan with EPSS and KEV context
