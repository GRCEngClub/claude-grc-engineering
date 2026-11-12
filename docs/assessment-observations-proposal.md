# Experimental assessment observations contract

This program-neutral **proposal**, not a FedRAMP implementation or stable API, provides a small JSON input contract and validator for the shared data needs discussed in [#170](https://github.com/GRCEngClub/claude-grc-engineering/issues/170), [#171](https://github.com/GRCEngClub/claude-grc-engineering/issues/171), and [#172](https://github.com/GRCEngClub/claude-grc-engineering/issues/172). Placement and the Rev. 5/20x target remain maintainer decisions. Nothing here selects a baseline, template, program, or methodology, and no official template is included or altered. See the [artifact research](fedramp-assessment-artifact-research.md) for source versions and the #173 inventory limitations.

After `npm install` (including development dependencies), run:

```sh
node scripts/assessment-observations-proposal.mjs tests/fixtures/assessment-observations/synthetic.json
```

The validator checks JSON structure, required fields, duplicate IDs, and internal deficiency references. Missing evidence and missing risk/remediation fields are warnings, not invented values. Empty arrays do not mean no weaknesses or that every control was assessed. A `valid: true` result means only that these limited checks passed; it does not verify evidence, evaluate control coverage, establish mappings, validate ratings, or indicate readiness for an authorization package. Preserve warnings and have qualified humans review the source data.

`control_id`, `test_result`, and risk fields are unvalidated source strings: they are not FedRAMP allowed values. The schema cannot establish whether a deficiency is linked to every applicable observation, whether an evidence reference resolves, or whether a due date or rating is appropriate. Inputs may be sensitive; the tool reads local JSON and prints only validation messages. Treat IDs and messages as potentially sensitive. YAML, CSV, workbook generation, SAR assembly, baseline mappings, risk calculations, template conformance, and attestation are not implemented. This schema is not the versioned SRTM or RET output contract required by #172 and may change incompatibly after maintainer decisions.

The fixture is wholly synthetic and makes no claim about a real system. Any later SAR must retain explicit human-review and attestation placeholders; no assessment conclusion, approval, or authorization can be inferred from this tool.
