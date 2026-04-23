---
name: collect
description: Import scanner findings, enrich with NIST controls, and generate VDR outputs
---

# POA&M Automation — Collect

Runs the full collection pipeline: import scanner findings into the POA&M, enrich with NIST 800-53 mappings, and generate FedRAMP 20x VDR outputs with live CISA KEV and EPSS enrichment.

## Import Scanner Findings

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

The `vdr` command produces a `vdr_YYYYMMDD.json` file that conforms to the GRC Engineering finding schema. Each active vulnerability maps to an evaluation object with:

- `control_framework`: FedRAMP-20x
- `control_id`: Tracking ID (POA&M ID)
- `status`: fail (active) or skipped (accepted)
- `severity`: mapped from N-rating (N5=critical, N4=high, N3=medium, N2=low, N1=info)
- `message`: weakness name and CVE
- `remediation`: overall remediation plan with EPSS and KEV context
