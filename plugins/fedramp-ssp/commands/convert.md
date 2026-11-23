---
name: FedRAMP SSP Convert
description: Convert FedRAMP Rev 5 SSP DOCX templates (main SSP + Appendix A) to OSCAL 1.2.0 SSP JSON.
---

# /fedramp-ssp:convert

Runs the DOCX→OSCAL pipeline on a pair of FedRAMP Rev 5 SSP templates and emits a validated OSCAL 1.2.0 SSP JSON file.

## How to run

```bash
bash plugins/fedramp-ssp/scripts/convert.sh \
  --ssp-docx=<path-to-FedRAMP-SSP-Template.docx> \
  --appendix-a-docx=<path-to-SSP-Appendix-A-Moderate.docx> \
  [--output=<path-to-ssp-output.json>] \
  [--validate]
```

## Arguments

- `--ssp-docx=<path>` (required) — official FedRAMP Rev 5 High/Moderate/Low LI-SaaS SSP template, filled in.
- `--appendix-a-docx=<path>` (required) — FedRAMP Appendix A Moderate control responses document.
- `--output=<path>` — where to write the OSCAL JSON (default: `./ssp-output.json`).
- `--validate` — after generation, run `/oscal:validate` on the result (requires the `oscal` plugin set up).

## What the pipeline does

1. **Extract front matter** from the main SSP DOCX: system identification, parties, roles, authorization boundary, data types, leveraged authorizations.
2. **Extract control responses** from Appendix A: 323 implemented-requirements across 18 NIST SP 800-53 Rev 5 control families with FedRAMP-specific implementation narratives.
3. **Assemble** an OSCAL 1.2.0 SSP document:
   - 9 components (`this-system` + 8 AWS infrastructure services)
   - 18 FedRAMP-standard roles, 7 parties, 3 locations, 3 user types
   - FedRAMP-namespaced props: `implementation-status`, `control-origination`, cloud deployment model
4. **Validate** (optional) with `oscal-cli` — JSON-to-YAML round-trip must pass.

## Where to get the DOCX templates

```bash
# Main SSP template (High/Moderate/Low/LI-SaaS)
curl -sLO "https://www.fedramp.gov/legacy/assets/LEGACY_FedRAMP-High-Moderate-Low-LI-SaaS-Baseline-System-Security-Plan-(SSP).docx"

# Appendix A Moderate
curl -sLO "https://www.fedramp.gov/legacy/assets/LEGACY%20SSP-Appendix-A-Moderate-FedRAMP-Security-Controls.docx"
```

Both are published on the [FedRAMP legacy documentation page](https://www.fedramp.gov/legacy/).

## Typical output

```
fedramp-ssp:convert ✓
  source (SSP):       FedRAMP-SSP-Template.docx
  source (Appendix):  SSP-Appendix-A-Moderate.docx
  output:             ./ssp-output.json (783 KB)
  implemented:        323 requirements (18 families)
  narratives:         89 (0 placeholder)
  components:         9 (1 this-system + 8 AWS services)
  validation:         ✓ OSCAL 1.2.0 round-trip passes
```

## Exit codes

- `0` — success
- `2` — missing or unreadable input DOCX
- `3` — DOCX could not be parsed (malformed or not a FedRAMP template)
- `4` — OSCAL assembly produced an output but validation failed
- `5` — pipeline not installed (run `/fedramp-ssp:setup`)

## Next steps

```bash
/oscal:validate ./ssp-output.json            # strict schema check
/oscal:convert ./ssp-output.json --to yaml    # human-readable review
# Hand to Compliance Trestle, eMASS, or FedRAMP 20X workflows.
```

## Customization

The pipeline has `config.json` and `narratives.json` inside the tool directory that control defaults (AWS-centric components, leveraged authorization, narratives). Point a copy at your own overrides by setting `FRDOCX_CONFIG=<path>` and `FRDOCX_NARRATIVES=<path>` before running `/fedramp-ssp:convert`.

## Non-goals

- **Not a substitute for authoring the DOCX**: you still need to fill in the FedRAMP templates with your system's content. This plugin converts a filled-in DOCX.
- **Not a full 800-53 control generator**: narratives that aren't provided default to the pipeline's canned text. Review and replace with organization-specific content before submission.
