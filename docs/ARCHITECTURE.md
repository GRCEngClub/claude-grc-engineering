# Architecture

`claude-grc-engineering` is a GRC automation toolkit shaped as a Claude Code plugin marketplace. It has three layers stacked like a data pipeline:

```
                    ┌─────────────────────────────────────────────┐
                    │           Persona / framework plugins        │  ← human workflows
                    │  (grc-auditor, grc-internal, grc-tprm,       │    and reference
                    │   soc2, nist-800-53, iso27001, pci-dss, …)   │
                    └────────────┬────────────────────────────────┘
                                 │ uses
                    ┌────────────▼────────────────────────────────┐
                    │            grc-engineer (hub)                │  ← the engineering
                    │  gap-assessment, scan-iac, test-control,     │    hub
                    │  generate-implementation, monitor-continuous │
                    └────────────┬────────────────────────────────┘
                                 │ consumes/produces Findings
                                 │ (schemas/finding.schema.json)
                                 │
                 ┌───────────────┼──────────────────┐
                 │               │                  │
        ┌────────▼───────┐ ┌────▼────────┐ ┌───────▼─────────┐
        │  Connector     │ │  Crosswalk  │ │  Remediation    │
        │  plugins       │ │  (SCF API)  │ │  generators     │
        │                │ │             │ │                 │
        │  /aws:collect  │ │  1,468      │ │  Terraform,     │
        │  /github:…     │ │  controls × │ │  Python evidence│
        │  /gcp:…        │ │  249 frame- │ │  collectors,    │
        │  /okta:…       │ │  works      │ │  OSCAL outputs  │
        └────────┬───────┘ └─────────────┘ └─────────────────┘
                 │ invokes
        ┌────────▼────────┐
        │  External tools │  (separately installed: hackIDLE/*-sec-inspector,
        │                 │   ethanolivertroy/*-audit, oscal-cli, Terrascan,
        │                 │   Prowler-style scanners, etc.)
        └─────────────────┘
```

## The data contract

Every connector emits **Findings**: documents matching [`schemas/finding.schema.json`](../schemas/finding.schema.json). A Finding is one *resource* with one or more *control evaluations*.

```json
{
  "schema_version": "1.0.0",
  "source": "aws-sec-inspector",
  "source_version": "2026.04.01",
  "run_id": "01HXKJ...",
  "collected_at": "2026-04-13T15:04:05Z",
  "resource": {
    "type": "aws_s3_bucket",
    "id": "acme-prod-logs",
    "arn": "arn:aws:s3:::acme-prod-logs",
    "region": "us-east-1",
    "account_id": "123456789012"
  },
  "evaluations": [
    {
      "control_framework": "SCF",
      "control_id": "CRY-05",
      "status": "fail",
      "severity": "high",
      "message": "Bucket has no default encryption configured",
      "remediation": {
        "summary": "Enable SSE-KMS with a customer-managed key",
        "ref": "grc-engineer://generate-implementation/encryption_at_rest/aws",
        "effort_hours": 1,
        "automation": "auto_fixable"
      }
    }
  ]
}
```

### Why a contract at all

Without a contract, `/gap-assessment` would need bespoke parsers for every tool's output. With a contract:

- Any connector that conforms plugs in.
- `/gap-assessment` becomes a pure join over Findings × Crosswalk → Report.
- Third parties can ship connectors without touching this repo.
- Findings are auditable: the schema includes `run_id`, `source_version`, `collected_at`, `evidence_refs` so a compliance record is reproducible.

### Status vs severity

Two independent fields. `status` is the pass/fail semantic; `severity` is the impact if the check were failing. A *low-severity failure* is real (just not urgent). A *passing critical-severity* control produces `status=pass, severity=critical`: it still matters because it tells `/gap-assessment` what the stakes would be if the control regressed.

`inconclusive` is not a workaround for "didn't check." Use it when the tool *tried* and *couldn't determine*: a dropped API call, missing permission, rate-limited. Consumers treat it as a signal to re-run, not a pass.

## The crosswalk layer

The Secure Controls Framework (SCF) is this toolkit's **canonical control vocabulary**. It carries 1,468 controls across 33 families, with bidirectional crosswalks to 249 frameworks. We fetch from the live API at `https://grcengclub.github.io/scf-api/` and cache locally.

```
Connector emits:       evaluations[].control_framework = "SCF", control_id = "CRY-05"
                                             │
                                             ▼
/gap-assessment maps:  SCF CRY-05 → NIST 800-53 SC-28, ISO 27001 A.8.24, SOC 2 CC6.7, PCI 3.5
                                             │
                                             ▼
Report shows:          "Data at rest encryption is failing: violates 4 frameworks"
```

### Why SCF and not a homegrown crosswalk

- **Coverage**: 249 frameworks including the obscure regional ones (Argentina LGPD, Bermuda BMA CoC, etc.).
- **Maintained**: upstream publishes quarterly; the SCF API repo auto-syncs weekly.
- **Neutral**: SCF is framework-agnostic, so mapping "SCF → everywhere else" is the minimum edit distance.
- **Licensable**: SCF data is CC BY-ND. The toolkit fetches, attributes, and never modifies it. See `docs/SCF-ATTRIBUTION.md`.

### Non-SCF evaluations

Connectors can emit evaluations against any framework. SCF isn't required. If a connector emits `control_framework="NIST-800-53-r5", control_id="AC-2"`, `/gap-assessment` still works. It just uses the reverse crosswalk to reach other frameworks. The report flags any control that doesn't resolve in the crosswalk.

## The engineering hub: `grc-engineer`

One plugin holds the cross-cutting commands. Other plugins either *feed* the hub (connectors) or *consume* the hub's outputs (persona plugins, framework plugins, or user workflows).

| Command | Purpose |
|---|---|
| `/grc-engineer:gap-assessment` | Join Findings × Crosswalk → prioritized gap report |
| `/grc-engineer:scan-iac` | Scan Terraform/CloudFormation/K8s for violations (emits Findings) |
| `/grc-engineer:test-control` | Validate a control is working end-to-end |
| `/grc-engineer:generate-implementation` | Produce remediation code (Terraform, Python, policy-as-code) |
| `/grc-engineer:generate-policy` | Translate natural-language policy → Rego/Cedar |
| `/grc-engineer:monitor-continuous` | Schedule recurring gap-assessment with alerting |
| `/grc-engineer:map-controls-unified` | Show one control across every framework it maps to |
| `/grc-engineer:find-conflicts` | Surface conflicting requirements across frameworks |
| `/grc-engineer:optimize-multi-framework` | "Implement once, satisfy many" ROI report |
| `/grc-engineer:pipeline-status` | Show connector health: last run, auth, cache freshness |
| `/grc-engineer:collect-evidence` | Build framework-specific evidence packages from Findings |
| `/grc-engineer:review-pr` | Review a PR for compliance regressions |

## Plugin categories

1. **Engineering hub**: `grc-engineer`. Holds the cross-cutting commands every other plugin either feeds or consumes.
2. **Framework plugins**: `soc2`, `nist-800-53`, `iso27001`, `pci-dss`, `fedramp-rev5`, `fedramp-20x`, `cmmc`, `hitrust`, `cis-controls`, `gdpr`, `csa-ccm`, `nydfs`, `dora`, `stateramp`, `essential8`, `glba`, `us-export`, `pbmm`, `ismap`, `irap`. These carry framework-specific knowledge and commands (`/soc2:generate-tsc-matrix`, `/fedramp-rev5:poam-review`, etc.). Normative control text stays behind your licensed copy of the standard. These plugins reference control IDs and provide my implementation guidance, not the standards' prose.
3. **Persona plugins**: `grc-auditor` (audit workflows), `grc-internal` (internal GRC team), `grc-tprm` (third-party risk). Orchestrate commands from the hub and framework plugins for a specific role.
4. **Connector plugins**: `aws-inspector`, `github-inspector`, `gcp-inspector`, `okta-inspector`. Thin integration layer over external tools. Emit Findings, conform to the contract.
5. **OSCAL / FedRAMP showcase plugins**: `oscal` (wraps `oscal-cli`), `fedramp-docs` (wraps `fedramp-docs-mcp`). Turn the FedRAMP/OSCAL tooling into first-class Claude commands.

## Connector quality bar

This is what separates a working tool from a demo. Every connector must meet all of these:

| Requirement | What it looks like |
|---|---|
| **Idempotent setup** | `/<tool>:setup` is safe to run repeatedly; writes config to `~/.config/claude-grc/connectors/<tool>.yaml` |
| **Honored auth precedence** | env var → config file → interactive prompt; never prompts in non-TTY mode |
| **Schema-conformant output** | Validates against `schemas/finding.schema.json` v1; CI contract test per connector |
| **Structured exit codes** | `0` success, `2` auth, `3` rate-limited, `4` partial, `5` not installed |
| **Cached, refresh-aware** | Writes `~/.cache/claude-grc/findings/<source>/<run_id>.json`; `/gap-assessment` reads cache unless `--refresh` |
| **Observable** | Appends a run manifest to `~/.cache/claude-grc/runs.log` |
| **CI/CD friendly** | Works with `--output=json --quiet`; no TTY dependencies |
| **Reports its version** | `source_version` field in every Finding; enables reproducibility |
| **Fails loudly, early, and well** | Auth errors explain *what* credential is missing and *how* to supply it |
| **Rate-limit aware** | Backs off on 429s; reports rate-limit headroom in `metadata` |

## Extensibility

### Add a framework plugin

Most frameworks already exist. To add a new one:

1. Create `plugins/frameworks/<name>/` with `.claude-plugin/plugin.json`.
2. Add commands as markdown with frontmatter (see `plugins/frameworks/soc2/commands/assess.md` for reference).
3. Create `skills/<name>-expert/SKILL.md` with paraphrased domain knowledge (never verbatim copy from a licensed standard).
4. Register the plugin in `.claude-plugin/marketplace.json`.
5. Confirm its framework_id resolves in SCF crosswalks (`curl https://grcengclub.github.io/scf-api/api/crosswalks.json | jq '.frameworks[].framework_id' | grep <yourframework>`).

### Add a connector

See `docs/CONTRIBUTING.md`: adding a connector is the most common contribution path.

### Add a crosswalk entry

Don't: use SCF. If SCF doesn't have the control mapping you need, the right fix is to open a PR upstream at [SCF](https://securecontrolsframework.com). Temporarily, you can provide overrides in `plugins/grc-engineer/config/crosswalk-overrides.yaml`.

## Non-goals

- **Not a replacement for commercial GRC platforms** (Vanta, Drata, OneTrust, Archer). This is an engineering toolkit that composes with them.
- **Not a legal or audit opinion**. Outputs are engineering artifacts, not certifications.
- **Not a reproduction of any standard**. For normative framework text, use your licensed copy.
- **Not a runtime service**. Everything is operator-invoked via Claude Code. Scheduling lives in `/grc-engineer:monitor-continuous`, which emits scheduler configs for cron/EventBridge/GitHub Actions.
