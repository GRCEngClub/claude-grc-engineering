---
name: OSCAL Convert
description: Convert OSCAL documents between JSON, XML, and YAML formats with round-trip fidelity.
---

# /oscal:convert

Converts an OSCAL document between JSON, XML, and YAML. The input format is auto-detected from file extension or content.

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/convert.sh" <input> --to <json|xml|yaml> [--output <path>] [--overwrite]
```

## Arguments

- `<input>` — path to OSCAL document
- `--to <fmt>` — target format: `json`, `xml`, or `yaml`
- `--output <path>` — write to this path (otherwise stdout)
- `--overwrite` — allow overwriting an existing output file

## Example

```bash
# NIST publishes the 800-53 catalog as XML; convert to JSON for programmatic use:
curl -LO https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/xml/NIST_SP-800-53_rev5_catalog.xml
/oscal:convert NIST_SP-800-53_rev5_catalog.xml --to json --output nist-catalog.json

# Round-trip to YAML for human review:
/oscal:convert nist-catalog.json --to yaml --output nist-catalog.yaml

# Convert gap-assessment output to XML for Compliance Trestle import:
/oscal:convert gap-report.oscal-ar --to xml --output gap-report.xml
```

## Round-trip fidelity

`oscal-cli` preserves all semantic content across format conversions. Whitespace and ordering may differ but the deserialized model is byte-equivalent. This is verified by the underlying tool's round-trip tests.

## Exit codes

- `0` — success
- `2` — input file missing or unreadable
- `5` — `oscal` binary not installed
- `6` — input is not a recognized OSCAL document

## When to use

- **Integrate with tools that want a specific format**: some GRC platforms ingest only XML; others JSON. This plugin lets you keep authoring in whichever format your team prefers and export to whatever the downstream wants.
- **Move assessment results** from `/engineer:gap-assessment --output=oscal-ar` into OSCAL SAR consumers that only speak XML.
- **Human review** of machine-authored OSCAL — YAML is usually the most readable.
