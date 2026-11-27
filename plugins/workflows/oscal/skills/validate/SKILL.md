---
name: validate
description: Validate an OSCAL document (catalog, profile, SSP, SAP, SAR, POA&M, component definition, assessment results) against the official JSON schemas.
---

# /oscal:validate

Validates an OSCAL document against the NIST JSON schemas bundled with `oscal-cli`. Supports JSON, XML, and YAML input (XML/YAML are auto-converted internally for validation).

## How to run

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh" <file> [--quiet] [--json]
```

## Arguments

- `<file>` — path to the OSCAL document to validate.
- `--quiet` — only emit on failure.
- `--json` — structured JSON output `{ok: bool, errors: [...], schema_version: "1.1.3"}` for CI pipelines.

## What it validates

- JSON schema conformance (structural + type)
- Required fields present
- Enum values valid
- UUID format for all identifiers
- OSCAL version declared and supported

## Exit codes

- `0` — valid
- `6` — schema violation(s); details on stderr (or stdout JSON with `--json`)
- `2` — file not found / unreadable
- `5` — `oscal` binary not installed (run `/oscal:setup`)

## Example

```bash
/oscal:validate gap-assessment-20260413/gap-report.oscal-ar
```

This checks that `/engineer:gap-assessment`'s OSCAL Assessment Results output is well-formed before handing it to downstream tooling (Compliance Trestle, eMASS).

## Non-goals

- **Semantic validation** (e.g., does this SSP actually align with its referenced catalog?). Use `oscal-cli resolve` (coming in a future release) or Compliance Trestle for that.
- **FedRAMP-specific checking**. FedRAMP 20x and Rev5 certification packages use FedRAMP's own JSON schemas, not OSCAL. Check those with FedRAMP's validator at <https://www.fedramp.gov/schemas/validator/>. For legacy FedRAMP OSCAL constraints, combine this with the `fedramp-docs` MCP for spec lookups.
