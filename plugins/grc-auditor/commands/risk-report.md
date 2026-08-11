---
description: Draft a ranked, evidence-cited risk report from a folder of raw evidence
---

# Risk Report

Reads every file in an evidence folder, clusters findings into risks, rates likelihood and impact from the evidence, and drafts a prioritized risk report in the audience's language. This is the workflow taught in CGE-AUD Chapter 5.4 (Drafting a Risk Report).

## Arguments

- `$1` - Evidence folder or file path (required)
- `$2` - Audience (optional: `leadership`, `ciso`, `audit-committee`, `engagement-manager`; defaults to `leadership`)

Flag-style arguments are also accepted: `--input=<path>` and `--audience=<audience>` map to `$1` and `$2`.

## Instructions

1. Read every file in the evidence folder as-is. Evidence arrives raw (JSON, CSV, Terraform, logs) exactly as the tools produced it — do not ask for reformatting. The point is that every claim in the report traces back to an original evidence file.

2. Cross-reference between files. Resource IDs, account IDs, and usernames that appear in one artifact often reappear in others; a risk supported by multiple artifacts is stronger than one supported by a single line.

3. Cluster related findings into risks. A risk is not a finding — several findings across files may describe one risk (e.g. a permissive IAM policy plus CloudTrail events exercising it).

4. Rate each risk likelihood × impact, grounded only in what the evidence shows. Do not inflate ratings; be prepared to defend each one from a specific file and line.

5. Draft the ranked risk report for the audience. For `leadership` and `audit-committee`, use plain business language, not auditor jargon. Every risk gets:
   - A plain-language risk statement
   - A likelihood × impact rating with one-line justification
   - A citation to the exact evidence file (and line or record) it came from
   - A recommended next step

6. Do not invent findings. If a configuration in the evidence is fine, do not flag it. If the evidence does not support a risk, leave it out — an empty section is better than an unsupported claim.

7. Append a traceability block: a `run_id` (date-based, e.g. `2026-08-11-r1`), the plugin name and version, the draft date, and an inventory of the evidence files read. Anyone questioning a risk should be able to walk from the risk statement to the evidence file to the original system.

8. Close with the reviewer's split: this is a draft. The practitioner still owns challenging the ratings, deciding what is top-five versus noise, adding business context the evidence cannot show, and presenting the briefing.

## Examples

```bash
# Draft a leadership risk report from an evidence folder
/grc-auditor:risk-report ./evidence leadership

# Run against the CGE-AUD Ch 5.4 practice pack
/grc-auditor:risk-report examples/sample-evidence/

# Flag-style form
/grc-auditor:risk-report --input=./evidence --audience=leadership
```
