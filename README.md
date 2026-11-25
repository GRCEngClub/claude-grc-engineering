# claude-grc-engineering

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/GRCEngClub/claude-grc-engineering?utm_source=oss&utm_medium=github&utm_campaign=GRCEngClub%2Fclaude-grc-engineering&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
[![Greptile runs](https://img.shields.io/badge/dynamic/json?label=Greptile%20runs&query=$.total_count&url=https://api.github.com/search/issues?q=repo%253AGRCEngClub%252Fclaude-grc-engineering%2520type%253Apr%2520commenter%253Agreptile-apps%255Bbot%255D&suffix=%20reviews&color=1f6feb&labelColor=171717)](https://github.com/GRCEngClub/claude-grc-engineering/pulls?q=commenter%3Agreptile-apps%5Bbot%5D)
[![OSV-Scanner](https://github.com/GRCEngClub/claude-grc-engineering/actions/workflows/osv-scanner.yml/badge.svg)](https://github.com/GRCEngClub/claude-grc-engineering/actions/workflows/osv-scanner.yml)
[![Greptile: The War on Bugs](https://www.greptile.com/badge.svg)](https://www.greptile.com/?utm_source=oss_badge&utm_medium=readme&utm_campaign=greptile_for_open_source)

https://github.com/user-attachments/assets/a83aa297-9fba-4a7d-b56c-06f962d1ec6b

Open-source GRC engineering toolkit for Claude.

`claude-grc-engineering` collects evidence from cloud, SaaS, code, and security tools and maps it to compliance frameworks. It produces gap reports, remediation guidance, evidence packages, and OSCAL documents.

It is a Claude Code plugin marketplace. The same skills, command runbooks, and schemas also work in Claude Desktop and Claude Cowork when you add this repository as project context.

It is maintained by the [GRC Engineering Club](https://grcengclub.com) for teams that keep compliance work in version control and test it like code.

> Not affiliated with Anthropic. Claude, Anthropic, and related marks are property of their respective owners.

## How it works

```text
connectors collect evidence
        ↓
findings match schemas/finding.schema.json
        ↓
grc-engineer maps findings through SCF
        ↓
reports, remediation, evidence packages, OSCAL outputs
```

Controls are mapped through the Secure Controls Framework (SCF) crosswalk, which links 1,468 controls to 249 frameworks. The toolkit references control IDs and implementation guidance; it does not reproduce copyrighted standards text.

## Install

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

Full walkthrough: [docs/QUICKSTART.md](docs/QUICKSTART.md). For Claude Desktop or Claude Cowork, start with [docs/CLAUDE-COWORK.md](docs/CLAUDE-COWORK.md).

## Common workflows

| Goal | Command |
|---|---|
| Run a gap assessment against one or more frameworks | `/grc-engineer:gap-assessment` |
| Scan Terraform, CloudFormation, or Kubernetes for compliance issues | `/grc-engineer:scan-iac` |
| Run available control checks (results may be indeterminate) | `/grc-engineer:test-control` |
| Generate remediation code, scripts, or policy | `/grc-engineer:generate-implementation`, `/grc-engineer:generate-policy` |
| Map one control across frameworks | `/grc-engineer:map-controls-unified` |
| Find conflicting requirements across frameworks | `/grc-engineer:find-conflicts` |
| Optimize a multi-framework control plan | `/grc-engineer:optimize-multi-framework` |
| Collect evidence from cloud, SaaS, and code systems | each connector's `setup`, `collect`, and `status` commands (`scan` for `testssl-inspector`) |
| Build audit workpapers or evidence packages | `/grc-auditor:generate-workpaper`, `/grc-engineer:collect-evidence` |
| Validate and convert OSCAL documents | `/oscal:*` |
| Draft leadership updates and automation coverage reports | `/report:exec-summary`, `/report:automation-coverage` |
| Create editable GRC diagrams | `/grc-diagrams:drawio`, `/grc-diagrams:system-boundary`, `/grc-diagrams:evidence-flow`, `/grc-diagrams:control-map` |
| Learn a framework, control, or GRC role | `/teach-me:framework`, `/teach-me:control`, `/teach-me:role`, `/teach-me:quiz` |
| Run an academic research project from idea to publication | `/academic-research-companion:research` |

Every command has a reference page in its plugin's `commands/` directory.

## Plugins

Install only the plugins you need. The full list is in [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json), and `/grc-engineer:frameworks` shows framework coverage and plugin depth.

| Category | Plugins |
|---|---|
| Engineering hub | `grc-engineer`: gap assessment, IaC scanning, evidence collection, remediation and policy generation, PR review, continuous monitoring, multi-framework optimization |
| Personas and workflows | `grc-auditor`, `grc-internal`, `grc-tprm`, `grc-reporter`, `grc-loop`, `teach-me`, `academic-research-companion` |
| Frameworks | `soc2`, `nist-800-53`, `iso27001`, `fedramp-20x`, `pci-dss`, `cmmc`, `hitrust`, `cis-controls`, `gdpr`, `dora`, `us-hipaa-security`, and more; see [docs/FRAMEWORK-COVERAGE.md](docs/FRAMEWORK-COVERAGE.md) |
| Connectors | `aws-inspector`, `github-inspector`, `gcp-inspector`, `azure-inspector`, `okta-inspector`, `slack-inspector`, `datadog-inspector`, `crowdstrike-inspector`, `drata-inspector`, `splunk-inspector`, `tenable-inspector`, `snowflake-inspector`, `wiz-inspector`, `testssl-inspector`, `vdr-automation` |
| Secrets connectors | `aws-secrets-inspector`, `gcp-secret-metadata`, `onepassword-connector`, `vault-kv` |
| OSCAL tooling | `oscal` |
| Diagrams | `grc-diagrams`: editable draw.io system boundaries, evidence flows, control maps, crosswalks, and more |
| Dashboards and knowledge sources | `compliance-posture-dashboard`, `gcp-docs` |
| Site builders | `trust-center`, `grc-portfolio` |

## Data contract

Evidence connectors emit Findings that match [schemas/finding.schema.json](schemas/finding.schema.json). A Finding is one resource with one or more control evaluations.

A connector collects and normalizes evidence, and `grc-engineer` uses the Findings for framework mapping, reporting, and remediation. `onepassword-connector`, `vault-kv`, and `gcp-secret-metadata` are the exception: they handle secrets or secret metadata for a local operator and emit no Findings.

For the full architecture and schema example, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

- [docs/QUICKSTART.md](docs/QUICKSTART.md): first gap assessment in about 10 minutes
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): pipeline model, data contract, plugin categories, extensibility
- [docs/FRAMEWORK-COVERAGE.md](docs/FRAMEWORK-COVERAGE.md): generated coverage for SCF-mapped frameworks
- [docs/FRAMEWORK-PLUGIN-GUIDE.md](docs/FRAMEWORK-PLUGIN-GUIDE.md): create and extend framework plugins
- [docs/GRC-DATA.md](docs/GRC-DATA.md): user-owned `grc-data/` contracts for metrics, risks, vendors, exceptions, and policies
- [docs/ENTERPRISE-DEPLOYMENT.md](docs/ENTERPRISE-DEPLOYMENT.md): AWS Bedrock, Claude Platform on AWS, and Google Vertex AI guidance
- [docs/CLAUDE-COWORK.md](docs/CLAUDE-COWORK.md): Claude Desktop and Claude Cowork file-oriented usage, including third-party platform handoff notes
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md): how to contribute connectors, framework guidance, and docs
- [docs/SCF-ATTRIBUTION.md](docs/SCF-ATTRIBUTION.md): SCF licensing and attribution

External references:

- [Anthropic Trust Center](https://trust.anthropic.com/): Anthropic security, compliance, and trust resources
- [Claude Desktop on third-party platforms](https://claude.com/docs/cowork/3p/overview): official Cowork platform guidance

## Contributing

Contributions are welcome, including from commercial GRC vendors. The most useful are:

- New connector plugins
- Improvements to existing connectors
- Framework plugin guidance and evidence patterns
- Remediation examples from real environments
- Documentation

First-time contributors follow the issue → vouch → PR flow described in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [GOVERNANCE.md](GOVERNANCE.md).

Security-sensitive reports should use the private advisory process described in [SECURITY.md](SECURITY.md).

## Status

Pre-1.0. The Finding schema is versioned, and breaking changes are documented in [CHANGELOG.md](CHANGELOG.md).

## Star History

<a href="https://www.star-history.com/?repos=GRCEngClub%2Fclaude-grc-engineering&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=GRCEngClub/claude-grc-engineering&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=GRCEngClub/claude-grc-engineering&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=GRCEngClub/claude-grc-engineering&type=date&legend=top-left" />
  </picture>
</a>

## License

MIT for original code, copyright © GRC Engineering Club contributors. Exceptions are documented in [LICENSE](LICENSE). The CIS Controls plugin is CC BY-SA 4.0 per upstream terms. SCF data is CC BY-ND 4.0 and redistributed verbatim.
