# claude-grc-engineering

The official open-source GRC toolkit from the [GRC Engineering Club](https://grcengclub.com). Checkbox compliance to engineered systems, shipped as [Claude Code](https://docs.claude.com/claude-code) plugins: persona plugins for engineers, auditors, internal GRC teams, and TPRM; 20+ framework reference plugins from SOC 2 to FedRAMP to APRA; and thin cloud/SaaS connectors that emit a common Finding contract. Assessors, platform engineers, and GRC teams everywhere rebuild the same pipeline on their own. Pull evidence, crosswalk to a framework, generate a gap report, wrestle OSCAL. One open toolkit, maintained by the community, end-to-end.

```
/grc-engineer:gap-assessment SOC2,FedRAMP-High --sources=aws,github
```

A prioritized, effort-estimated, remediation-linked gap report backed by 1,468 [Secure Controls Framework](https://securecontrolsframework.com) controls crosswalked to 249 frameworks.

> Not affiliated with Anthropic. Community open-source project. Claude, Anthropic, and any related marks are property of their respective owners.

## Design positions

A few opinionated choices worth naming up front. These are the engineering principles the community is building around. They shape what good contributions look like.

**SCF is the right crosswalk source.** Most GRC tools roll their own control-mapping tables. They're usually incomplete, and nobody maintains them past the quarter they were built in. SCF has 1,468 controls mapped bidirectionally to 249 frameworks, publishes quarterly, and ships as a static JSON API. The toolkit uses it as the backbone. No hand-maintained CSVs.

**Connectors should be thin.** Thick all-in-one agents are hard to audit, hard to extend, and hard to swap. Every connector here is a few hundred lines that shells out to tools teams already have (`aws`, `gcloud`, `gh`, direct Okta API). Any connector can be ripped out and replaced without touching the rest of the toolkit. That makes it easy for commercial platforms, platform teams, and individual engineers to each ship one.

**Framework plugins don't reproduce standard text.** ISO 27001, PCI DSS, and HITRUST CSF text is copyrighted. This toolkit references control IDs and ships implementation guidance in paraphrased form. Each team's licensed copy of the standard is the source of truth. Anyone can ship a framework plugin without legal exposure, which is how this scales to 249.

**This is GRC in Claude Code. It's not a replacement for your GRC platform.** This toolkit gives practitioners an open place to learn the engineering layer and ship it in public. Commercial platforms, internal GRC teams, 3PAOs, and individual engineers all land in Claude Code eventually. The Finding contract is designed to normalize output from any source, so anyone can plug their stack in and contribute.

## 60-second install

```bash
# In Claude Code
/plugin marketplace add GRCEngClub/claude-grc-engineering
/plugin install grc-engineer@grc-engineering-suite
```

For a first run with no cloud credentials, use a GitHub account as the data source:

```bash
/plugin install github-inspector@grc-engineering-suite
/plugin install soc2@grc-engineering-suite
/github-inspector:setup
/github-inspector:collect --scope=@me
/grc-engineer:gap-assessment SOC2 --sources=github-inspector
```

Full walkthrough: [`docs/QUICKSTART.md`](docs/QUICKSTART.md).

## What you can do with it

| Workflow | Command |
|---|---|
| Gap-assess an environment against one or many frameworks at once | `/grc-engineer:gap-assessment` |
| Scan Terraform, CloudFormation, or Kubernetes for compliance violations, optionally auto-fix | `/grc-engineer:scan-iac` |
| Validate a control end-to-end: config, functionality, compliance | `/grc-engineer:test-control` |
| Generate remediation (Terraform modules, Python evidence scripts, Rego/Cedar policies) | `/grc-engineer:generate-implementation`, `generate-policy` |
| See one control across every framework it maps to | `/grc-engineer:map-controls-unified` |
| Find conflicting requirements across frameworks, with "most-restrictive wins" resolution | `/grc-engineer:find-conflicts` |
| Optimize multi-framework implementation (satisfy many with one) | `/grc-engineer:optimize-multi-framework` |
| Continuous monitoring with Slack, PagerDuty, or email alerts | `/grc-engineer:monitor-continuous` |
| Write automation coverage snapshots into `grc-data/metrics/` | `/grc-engineer:record-automation-metrics` |
| Draft a weekly leadership update from findings, risks, and metrics | `/report:exec-summary` |
| Report week-over-week automation coverage and ROI | `/report:automation-coverage` |
| Check pipeline health: which connectors are configured, last-run, cache freshness | `/grc-engineer:pipeline-status` |
| Review a PR for compliance regressions before merge | `/grc-engineer:review-pr` |
| Build audit workpapers and evidence packages | `/grc-auditor:generate-workpaper`, `/grc-engineer:collect-evidence` |
| Generate OSCAL SSP, SAP, SAR, or POA&M from findings and framework configs | `/oscal:*` (see OSCAL plugin) |
| Analyze a vendor security questionnaire (SIG, CAIQ, Yardstick) | `/grc-tprm:analyze-questionnaire` |
| Discover which of the 249 SCF-mapped frameworks have dedicated plugins | `/grc-engineer:frameworks` |
| Scaffold a new framework plugin from the SCF crosswalk | `/grc-engineer:scaffold-framework` |

Every command's reference page lives in its plugin's `commands/` directory with full input and output documentation.

## Plugin categories

### Engineering hub

| Plugin | Purpose |
|---|---|
| **grc-engineer** | Where the pipeline lives: `/gap-assessment`, `scan-iac`, `test-control`, `generate-implementation`, `generate-policy`, `map-controls-unified`, `find-conflicts`, `optimize-multi-framework`, `monitor-continuous`, `collect-evidence`, `record-automation-metrics`, `review-pr`, `pipeline-status`. |

### Persona plugins

| Plugin | Namespace | Who it's for |
|---|---|---|
| **grc-auditor** | `/grc-auditor:` | External or internal auditors: evidence review, workpaper generation, control validation |
| **grc-internal** | `/grc-internal:` | Internal GRC teams: risk registers, policy lifecycle, cert portfolio tracking |
| **grc-reporter** | `/report:` | GRC practitioners communicating up: exec summaries, board briefs, program-health, automation ROI |
| **grc-tprm** | `/grc-tprm:` | Third-party risk: vendor assessments, questionnaire analysis, risk scoring |

### Framework plugins

A reference layer: control IDs, families, implementation guidance, evidence patterns, and framework-specific workflow commands. Normative control text is not reproduced. Consult your licensed copy of the standard for authoritative requirements.

> **249 frameworks, one command to discover them**: the Club's goal is a dedicated plugin for every framework in the [SCF crosswalk](https://securecontrolsframework.com). Run `/grc-engineer:frameworks` to see which have plugins and which are crosswalk-supported today via `/grc-engineer:gap-assessment`. New frameworks can be scaffolded in one command with `/grc-engineer:scaffold-framework <scf-framework-id>` — see the [Framework Plugin Guide](docs/FRAMEWORK-PLUGIN-GUIDE.md) for the three depth tiers (Stub / Reference / Full).

| Plugin | Namespace | Scope |
|---|---|---|
| **soc2** | `/soc2:` | SOC 2 TSC (Security, Availability, Confidentiality, Processing Integrity, Privacy) |
| **nist-800-53** | `/nist:` | NIST 800-53 Rev 5 (Low, Moderate, High baselines) plus overlays |
| **iso27001** | `/iso:` | ISO/IEC 27001:2022 ISMS and Annex A controls |
| **fedramp-rev5** | `/fedramp-rev5:` | FedRAMP Rev 5 (SSP, SAP, SAR, POA&M workflow) |
| **fedramp-20x** | `/fedramp-20x:` | FedRAMP 20X automated ATO with KSIs. Auto-syncs from `FedRAMP/docs`. |
| **pci-dss** | `/pci-dss:` | PCI DSS v4.0.1 including March 2025 mandatory requirements |
| **cmmc** | `/cmmc:` | CMMC 2.0 (Levels 1 to 3) |
| **hitrust** | `/hitrust:` | HITRUST CSF (i1, r2, e1) |
| **cis-controls** | `/cis:` | CIS Controls v8 (IG1, IG2, IG3). See the plugin's [LICENSE-CIS.md](plugins/frameworks/cis-controls/LICENSE-CIS.md). |
| **gdpr** | `/gdpr:` | GDPR (DPIA, breach process, data subject rights) |
| **csa-ccm** | `/ccm:` | Cloud Security Alliance Cloud Controls Matrix and CAIQ |
| **nydfs** | `/nydfs:` | NYDFS 23 NYCRR 500 |
| **dora** | `/dora:` | EU DORA (effective Jan 2025) |
| **stateramp** | `/stateramp:` | State and local government cloud authorization |
| **essential8** | `/essential8:` | Australian Essential 8 and maturity levels |
| **glba** | `/glba:` | GLBA Safeguards and Privacy Rules |
| **us-export** | `/us-export:` | ITAR and EAR combined. **Engineering guidance only, not legal advice.** Export-control determinations come from DDTC and BIS; confirm postures with counsel. |
| **pbmm** | `/pbmm:` | Canadian Protected B cloud (ITSG-33) |
| **ismap** | `/ismap:` | Japanese ISMAP gov cloud |
| **irap** | `/irap:` | Australian IRAP gov cloud (ISM and Essential Eight) |

### Connector plugins

Thin integration plugins that wrap an external inspector tool and emit findings matching [`schemas/finding.schema.json`](schemas/finding.schema.json). External tools install separately. `/<tool>:setup` handles install and credential verification.

Tier 1, ship-ready:

| Plugin | Wraps | Coverage |
|---|---|---|
| **aws-inspector** | `aws` CLI | IAM (root MFA, password policy, access keys), S3, EBS, RDS, CloudTrail, VPC, Security Hub, Config |
| **gcp-inspector** | `gcloud` CLI | IAM, Cloud Storage, Compute, Audit Logs, Security Command Center |
| **github-inspector** | `gh` CLI | branch protections, Actions, secret scanning, deploy keys, Dependabot |
| **okta-inspector** | direct Okta REST API | authentication policies, MFA, session, password, admin factor enrollment |

Tier 2, roadmap: azure, slack, duo, zoom, webex, salesforce, datadog, splunk, sumologic, newrelic, elastic, tenable, qualys, veracode, crowdstrike, paloalto, zscaler, snowflake, box, servicenow, pagerduty, zendesk, launchdarkly, mulesoft, knowbe4.

Want a connector that isn't here? [Contribute one](docs/CONTRIBUTING.md). A typical wrapper is around 200 lines.

### OSCAL / FedRAMP plugins

| Plugin | Purpose |
|---|---|
| **oscal** | Wraps [`ethanolivertroy/oscal-cli`](https://github.com/ethanolivertroy/oscal-cli) (Go rewrite of NIST's oscal-cli): `/oscal:validate`, `/oscal:convert`, `/oscal:ssp-export` |
| **fedramp-ssp** | Wraps [`ethanolivertroy/frdocx-to-froscal-ssp`](https://github.com/ethanolivertroy/frdocx-to-froscal-ssp): DOCX SSP to OSCAL 1.2.0 SSP conversion |
| **compliance-trestle** | Wraps [`ethanolivertroy/compliance-trestle-skills`](https://github.com/ethanolivertroy/compliance-trestle-skills) for OSCAL authoring (roadmap) |
| **fedramp-docs** | MCP integration with [`ethanolivertroy/fedramp-docs-mcp`](https://github.com/ethanolivertroy/fedramp-docs-mcp) for live FedRAMP documentation search (roadmap) |
| **vanta-bridge** | `/vanta:export-evidence` using `vanta-go-export` to pull Vanta evidence and normalize to Findings (roadmap) |

The OSCAL tooling plugins wrap independent upstream projects maintained outside the Club. Their attribution stays with the original authors; the plugin wrappers are part of this toolkit.

## The data contract

Every connector emits Findings matching [`schemas/finding.schema.json`](schemas/finding.schema.json). One Finding is one resource with one or more control evaluations. Example:

```json
{
  "schema_version": "1.0.0",
  "source": "github-inspector",
  "source_version": "0.4.1",
  "run_id": "01HXKJTSZPWX7Z1T8E8RQRN5QX",
  "collected_at": "2026-04-13T15:04:05Z",
  "resource": {
    "type": "github_repository",
    "id": "acme/prod-api",
    "uri": "https://github.com/acme/prod-api"
  },
  "evaluations": [
    {
      "control_framework": "SCF",
      "control_id": "CHG-02",
      "status": "fail",
      "severity": "high",
      "message": "Main branch has no protection rule. Direct pushes allowed.",
      "remediation": {
        "summary": "Enable branch protection on main with required reviews.",
        "ref": "grc-engineer://generate-implementation/change_management/github",
        "effort_hours": 0.25,
        "automation": "auto_fixable"
      }
    }
  ]
}
```

The contract is versioned. Consumers pin a major version. Contract tests run in CI for every connector.

## How the crosswalk works

SCF is the canonical control vocabulary. 1,468 SCF controls map bidirectionally to 249 frameworks. When a connector reports an SCF control failure, `/gap-assessment` expands it into every requested framework via the crosswalk.

SCF data is fetched from [`grcengclub.github.io/scf-api`](https://grcengclub.github.io/scf-api/) and cached locally. Licensing (CC BY-ND 4.0): the toolkit fetches and redistributes verbatim, never modified. See [`docs/SCF-ATTRIBUTION.md`](docs/SCF-ATTRIBUTION.md).

## Documentation

- [`docs/QUICKSTART.md`](docs/QUICKSTART.md): zero to first gap report in 10 minutes
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): pipeline model, plugin categories, extensibility
- [`docs/ARCHITECTURE-V2-RFC.md`](docs/ARCHITECTURE-V2-RFC.md): proposed 5 new plugin categories — open for comment through 2026-05-02
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md): add a connector, improve a framework plugin
- [`docs/FRAMEWORK-PLUGIN-GUIDE.md`](docs/FRAMEWORK-PLUGIN-GUIDE.md): depth tiers (Stub / Reference / Full), level-up checklists, anti-patterns
- [`docs/FRAMEWORK-COVERAGE.md`](docs/FRAMEWORK-COVERAGE.md): auto-generated status of all 249 SCF-mapped frameworks — which have plugins, at what depth
- [`docs/GRC-DATA.md`](docs/GRC-DATA.md): user-owned `grc-data/` contracts for metrics, risks, exceptions, vendors, and policies
- [`docs/SCF-ATTRIBUTION.md`](docs/SCF-ATTRIBUTION.md): SCF licensing and usage
- [`docs/ENTERPRISE-DEPLOYMENT.md`](docs/ENTERPRISE-DEPLOYMENT.md): AWS Bedrock and Google Vertex AI configuration
- [`schemas/finding.schema.json`](schemas/finding.schema.json): the data contract

## Enterprise deployment

The toolkit runs on any Claude Code model backend. For enterprise data residency or compliance requirements, point Claude Code at AWS Bedrock or Google Vertex AI:

```bash
# AWS Bedrock (FedRAMP High available in GovCloud)
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Google Vertex AI (FedRAMP High as of October 2025)
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id
```

Full guide: [`docs/ENTERPRISE-DEPLOYMENT.md`](docs/ENTERPRISE-DEPLOYMENT.md).

## Adjacent open-source tools

The toolkit wraps or interoperates with a number of independent projects maintained outside the Club. Each can be used on its own:

- **Inspector family** ([`hackIDLE`](https://github.com/hackIDLE)): 30+ multi-framework compliance audit tools for AWS, Azure, GCP, OCI, Cloudflare, GitHub, Okta, Duo, Slack, Zoom, Webex, Salesforce, Snowflake, Datadog, Splunk, Sumologic, NewRelic, Elastic, Tenable, Qualys, Veracode, CrowdStrike, Palo Alto, Zscaler, KnowBe4, Box, ServiceNow, PagerDuty, Zendesk, LaunchDarkly, MuleSoft.
- **OSCAL tooling** (maintained by [`@ethanolivertroy`](https://github.com/ethanolivertroy)): `oscal-cli` (Go rewrite of NIST's Java tool), `compliance-trestle-skills`, `frdocx-to-froscal-ssp`, `fedramp-docs-mcp`, `emass-skills`.
- **FedRAMP audit scripts**: cloud-shell-audit tools for AWS, Azure, and GCP, plus `duo-audit`, `slack-audit`, `splunk-audit`, `crypto-widget-evidence-collector`.
- **Policy-as-code**: `terrascan` (fork), `llm-cloudpolicy-scanner`, `wilma` (AWS Bedrock security), `mesh-security`, `mesh-config-analyzer`.
- **Reference datasets**: [`scf-api`](https://github.com/GRCEngClub/scf-api) (this toolkit's crosswalk backbone — Club-maintained), `NIST-CMVP-API`, `cmvp-tui`, `kevs-tui`, `fedramp-browser`.
- **Curated lists**: [`awesome-grc-engineering`](https://github.com/ethanolivertroy/awesome-grc-engineering), [`awesome-grc-ai`](https://github.com/ethanolivertroy/awesome-grc-ai).

These projects are not part of this repo or governed by the Club. They're listed here because they pair well with the toolkit.

## Community

This toolkit is developed openly by the [GRC Engineering Club](https://grcengclub.com). The goal: build the biggest open-source self-learning repo for GRC engineering, the way Learn the Cloud did for cloud. Contributions are welcome from anyone working in GRC: assessors, internal audit, security engineering, CISO teams, TPRM, platform operators, framework experts, and the commercial GRC platforms whose customers also live in Claude Code.

- **Contributing**: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md). The highest-value contributions are new connectors (Tier-2 roadmap above), framework plugin improvements, and real-world implementation guidance. A typical connector is ~200 lines.
- **Discussions**: [github.com/GRCEngClub/claude-grc-engineering/discussions](https://github.com/GRCEngClub/claude-grc-engineering/discussions) — "how would I add a connector for X?" and similar design questions welcome.
- **Issues**: Use a template when opening. Security-sensitive issues go to a private advisory; see `SECURITY.md`.
- **Recognition**: contributors are credited via the [all-contributors](https://allcontributors.org) bot on every PR. Comment `@all-contributors please add @you for code,doc` after your PR merges, or ask a maintainer.

### Maintainers

This project is co-led by members of the [GRC Engineering Club leadership team](https://github.com/orgs/GRCEngClub/teams/grc-eng-leadership-team). Current co-leads:

- **AJ Yawn** ([@ajy0127](https://github.com/ajy0127)) — founder of the GRC Engineering Club; GRC Engineering Lead at NR Labs; formerly VP/Director of GRC Engineering, Principal Consultant at Coalfire, and U.S. Army Captain.
- **Ethan Troy** ([@ethanolivertroy](https://github.com/ethanolivertroy)) — founded this toolkit in 2025 and contributed it to the Club in 2026; former 3PAO FedRAMP assessor; multi-framework advisor across SOC 2, PCI DSS, FISMA, and NIST 800-53.

See `GOVERNANCE.md` and `MAINTAINERS.md` for the decision process and how to become a maintainer.

## Status

Pre-1.0. The schema is versioned (v1.0.0) and Tier-1 connectors are the focus of the early releases. Breaking changes are documented in `CHANGELOG.md` and guarded by the schema version.

## Star History

<!-- markdownlint-disable MD033 -->
<a href="https://www.star-history.com/?repos=GRCEngClub%2Fclaude-grc-engineering&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=GRCEngClub/claude-grc-engineering&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=GRCEngClub/claude-grc-engineering&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=GRCEngClub/claude-grc-engineering&type=date&legend=top-left" />
  </picture>
</a>
<!-- markdownlint-enable MD033 -->

## License

MIT for original code, copyright © GRC Engineering Club contributors. Exceptions are documented in [LICENSE](LICENSE). One plugin (`plugins/frameworks/cis-controls/`) is CC BY-SA 4.0 per upstream terms. SCF data is CC BY-ND 4.0 and redistributed verbatim.
