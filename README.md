# claude-grc-engineering

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/GRCEngClub/claude-grc-engineering?utm_source=oss&utm_medium=github&utm_campaign=GRCEngClub%2Fclaude-grc-engineering&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
[![Greptile runs](https://img.shields.io/badge/dynamic/json?label=Greptile%20runs&query=$.total_count&url=https://api.github.com/search/issues?q=repo%253AGRCEngClub%252Fclaude-grc-engineering%2520type%253Apr%2520commenter%253Agreptile-apps%255Bbot%255D&suffix=%20reviews&color=1f6feb&labelColor=171717)](https://github.com/GRCEngClub/claude-grc-engineering/pulls?q=commenter%3Agreptile-apps%5Bbot%5D)
[![OSV-Scanner](https://github.com/GRCEngClub/claude-grc-engineering/actions/workflows/osv-scanner.yml/badge.svg)](https://github.com/GRCEngClub/claude-grc-engineering/actions/workflows/osv-scanner.yml)

https://github.com/user-attachments/assets/a83aa297-9fba-4a7d-b56c-06f962d1ec6b

Open-source GRC Engineering resource for Claude.

`claude-grc-engineering` turns technical evidence from cloud, SaaS, code, and security tools into framework-aligned findings, gap reports, remediation guidance, evidence packages, and OSCAL workflows.

It is built for the Claude ecosystem: Claude Code plugin installs first, with Claude Desktop and Claude Cowork usage supported through the same Markdown skills, command runbooks, schemas, and repository files.

It is maintained by the [GRC Engineering Club](https://grcengclub.com) for people who want compliance work to behave more like engineering work: repeatable, testable, versioned, and easy to extend.

> Not affiliated with Anthropic. Claude, Anthropic, and related marks are property of their respective owners.

## What it does

The toolkit is a Claude Code plugin marketplace. The same plugin skills and command runbooks are also useful in Claude Desktop and Claude Cowork when you add this repository as project context or a shared workspace. Install the pieces you need:

- `grc-engineer`: the core automation hub for gap assessment, IaC scanning, evidence collection, remediation generation, policy generation, PR review, continuous monitoring, and multi-framework optimization.
- Persona plugins: workflows for auditors, internal GRC teams, third-party risk, reporting, learning, and iterative GRC automation.
- Framework plugins: reference guidance for SOC 2, NIST 800-53, ISO 27001, FedRAMP, PCI DSS, CMMC, HITRUST, CIS Controls, GDPR, DORA, HIPAA Security, regional privacy/security regimes, and more.
- Connector plugins: thin wrappers around tools such as AWS CLI, GitHub CLI, gcloud, Azure CLI, Okta, Slack, Datadog, CrowdStrike, Drata, Splunk, Tenable, Snowflake, and POA&M automation.
- Diagram plugins: editable draw.io system boundaries, evidence flows, control maps, risk treatment, audit workflows, framework crosswalks, TPRM, POA&M, data flows, RACI, and operating model visuals.
- OSCAL and bridge plugins: tooling for FedRAMP/OSCAL workflows and integrations with external GRC systems.

The common path is:

```text
connectors collect evidence
        ↓
findings match schemas/finding.schema.json
        ↓
grc-engineer maps findings through SCF
        ↓
reports, remediation, evidence packages, OSCAL outputs
```

The Secure Controls Framework (SCF) crosswalk is used as the control backbone: 1,468 controls mapped to 249 frameworks. The toolkit references control IDs and implementation guidance; it does not reproduce copyrighted standards text.

## Install in 60 seconds

Inside Claude Code:

```bash
/plugin marketplace add GRCEngClub/claude-grc-engineering
/plugin install grc-engineer@grc-engineering-suite
```

For a first run without cloud credentials, use GitHub as the evidence source:

```bash
/plugin install github-inspector@grc-engineering-suite
/plugin install soc2@grc-engineering-suite
/github-inspector:setup
/github-inspector:collect --scope=@me
/grc-engineer:gap-assessment SOC2 --sources=github-inspector
```

Full walkthrough: [docs/QUICKSTART.md](docs/QUICKSTART.md).

Using Claude Desktop or Claude Cowork instead of Claude Code? Start with [docs/CLAUDE-COWORK.md](docs/CLAUDE-COWORK.md). Anthropic's security and compliance posture is documented at [trust.anthropic.com](https://trust.anthropic.com/), and the Claude Cowork third-party platform guide is here: [Use Claude Cowork with third-party platforms](https://support.claude.com/en/articles/14680729-use-claude-cowork-with-third-party-platforms).

## Common workflows

| Goal | Command |
|---|---|
| Run a gap assessment against one or more frameworks | `/grc-engineer:gap-assessment` |
| Scan Terraform, CloudFormation, or Kubernetes for compliance issues | `/grc-engineer:scan-iac` |
| Validate a control end to end | `/grc-engineer:test-control` |
| Generate remediation code, scripts, or policy | `/grc-engineer:generate-implementation`, `/grc-engineer:generate-policy` |
| Map one control across frameworks | `/grc-engineer:map-controls-unified` |
| Find conflicting requirements across frameworks | `/grc-engineer:find-conflicts` |
| Optimize a multi-framework control plan | `/grc-engineer:optimize-multi-framework` |
| Collect evidence from cloud/SaaS/code systems | connector-specific setup, collect, and status commands |
| Build audit workpapers or evidence packages | `/grc-auditor:generate-workpaper`, `/grc-engineer:collect-evidence` |
| Generate OSCAL SSP/SAP/SAR/POA&M outputs | `/oscal:*`, `/fedramp-ssp:*` |
| Draft leadership updates and automation coverage reports | `/report:exec-summary`, `/report:automation-coverage` |
| Create editable GRC diagrams | `/grc-diagrams:drawio`, `/grc-diagrams:system-boundary`, `/grc-diagrams:evidence-flow`, `/grc-diagrams:control-map` |
| Learn a framework, control, or GRC role | `/teach-me:framework`, `/teach-me:control`, `/teach-me:role`, `/teach-me:quiz` |

Every command has a reference page in its plugin's `commands/` directory.

## Plugin map

Use `/grc-engineer:frameworks` to discover framework coverage and plugin depth.

High-level categories:

| Category | Examples |
|---|---|
| Engineering hub | `grc-engineer` |
| Persona/workflow plugins | `grc-auditor`, `grc-internal`, `grc-tprm`, `grc-reporter`, `grc-loop`, `teach-me` |
| Diagram plugin | `grc-diagrams` for editable draw.io GRC diagrams |
| Framework plugins | `soc2`, `nist-800-53`, `iso27001`, `fedramp-rev5`, `fedramp-20x`, `pci-dss`, `cmmc`, `hitrust`, `cis-controls`, `gdpr`, `dora`, `us-hipaa-security`, and others |
| Connector plugins | `aws-inspector`, `github-inspector`, `gcp-inspector`, `azure-inspector`, `okta-inspector`, `slack-inspector`, `datadog-inspector`, `crowdstrike-inspector`, `drata-inspector`, `splunk-inspector`, `tenable-inspector`, `snowflake-inspector` |
| Bridges, dashboards, knowledge sources | `vanta-bridge`, `compliance-posture-dashboard`, `gcp-docs` |
| OSCAL/FedRAMP tooling | `oscal`, `fedramp-ssp`, POA&M automation plugins |

The marketplace manifest lives at [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json).

## Data contract

Every connector emits Findings that match [schemas/finding.schema.json](schemas/finding.schema.json). A Finding is one resource with one or more control evaluations.

That contract keeps connectors small: each connector only needs to collect and normalize evidence. `grc-engineer` handles framework expansion, reporting, remediation, and downstream workflows.

For the full architecture and schema example, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

- [docs/QUICKSTART.md](docs/QUICKSTART.md): first gap assessment in about 10 minutes
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): pipeline model, data contract, plugin categories, extensibility
- [docs/FRAMEWORK-COVERAGE.md](docs/FRAMEWORK-COVERAGE.md): generated coverage for SCF-mapped frameworks
- [docs/FRAMEWORK-PLUGIN-GUIDE.md](docs/FRAMEWORK-PLUGIN-GUIDE.md): scaffold and level up framework plugins
- [docs/GRC-DATA.md](docs/GRC-DATA.md): user-owned `grc-data/` contracts for metrics, risks, vendors, exceptions, and policies
- [docs/ENTERPRISE-DEPLOYMENT.md](docs/ENTERPRISE-DEPLOYMENT.md): AWS Bedrock, Claude Platform on AWS, and Google Vertex AI guidance
- [docs/CLAUDE-COWORK.md](docs/CLAUDE-COWORK.md): Claude Desktop and Claude Cowork file-oriented usage, including third-party platform handoff notes
- [Anthropic Trust Center](https://trust.anthropic.com/): Anthropic security, compliance, and trust resources
- [Use Claude Cowork with third-party platforms](https://support.claude.com/en/articles/14680729-use-claude-cowork-with-third-party-platforms): official Cowork platform guidance
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md): how to contribute connectors, framework guidance, and docs
- [docs/SCF-ATTRIBUTION.md](docs/SCF-ATTRIBUTION.md): SCF licensing and attribution

## Contributing

Contributions are welcome from GRC practitioners, auditors, security engineers, platform teams, framework experts, and commercial GRC vendors.

The highest-value contributions are:

- New connector plugins
- Improvements to existing connectors
- Framework plugin guidance and evidence patterns
- Real-world remediation examples
- Documentation that helps practitioners learn GRC engineering

First-time contributors follow the issue → vouch → PR flow described in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [GOVERNANCE.md](GOVERNANCE.md).

Security-sensitive reports should use the private advisory process described in [SECURITY.md](SECURITY.md).

## Status

Pre-1.0. The Finding schema is versioned, and breaking changes are documented in [CHANGELOG.md](CHANGELOG.md).

## License

MIT for original code, copyright © GRC Engineering Club contributors. Exceptions are documented in [LICENSE](LICENSE). The CIS Controls plugin is CC BY-SA 4.0 per upstream terms. SCF data is CC BY-ND 4.0 and redistributed verbatim.
