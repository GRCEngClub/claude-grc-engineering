# Roadmap

This roadmap tracks the next layer of community and product work for the GRC
Engineering Club toolkit. It is directional, not a promise of exact ordering.

## Near-term platform work

- Complete the community foundation: governance, maintainers, contributor
  recognition, issue templates, and CODEOWNERS
- Add contract, markdown, link-check, and contributor-automation workflows
- Seed good first issues that help new contributors land meaningful work

## Tier-2 connector expansion

Priority candidates for new connector scaffolds:

- Azure
- Slack
- Duo
- Zoom
- Webex
- Salesforce
- Datadog
- Splunk
- Sumo Logic
- New Relic
- Elastic
- Tenable
- Qualys
- Veracode
- CrowdStrike
- Palo Alto
- Zscaler
- Snowflake
- Box
- ServiceNow
- PagerDuty
- Zendesk
- LaunchDarkly
- MuleSoft
- KnowBe4

## Framework gaps

High-value framework additions called out in planning:

- HIPAA
- APRA CPS 234
- MAS TRM
- FedRAMP Low

## Architecture v2 categories

The toolkit is expanding beyond framework-centric workflows. The current RFC
lives in [`docs/ARCHITECTURE-V2-RFC.md`](docs/ARCHITECTURE-V2-RFC.md) and
proposes these new categories:

- Reporting
- Dashboards
- Document transformation
- Program management
- Meetings

## Platform integrations (MCP bridges and knowledge sources)

Teams using commercial GRC platforms shouldn't have to choose between their
platform and this toolkit. Bridges pull platform-owned data into the Finding
schema so `/grc-engineer:gap-assessment` can consume it alongside the toolkit's
direct connectors. Vendor-owned Claude Code plugins (when they exist) are
**installed alongside** the Club toolkit, not vendored — bridges are
normalization layers, not forks.

- **Vanta bridge** — normalizes output from [`VantaInc/vanta-mcp-plugin`](https://github.com/VantaInc/vanta-mcp-plugin)
  (official Vanta Claude Code plugin, MIT) into Finding schema. Replaces the
  stale `vanta-go-export` entry.
- **Drata bridge** — companion pattern for [Drata's AI MCP](https://drata.com/products/ai/mcp).
- **OneTrust / Archer / ServiceNow GRC** — candidates for future MCP or SDK bridges
  once those platforms ship stable programmatic surfaces.

Knowledge-source plugins query authoritative external docs at assessment time
rather than baking stale guidance into framework plugins:

- **Google Developer Knowledge API** — GCP and Workspace security/compliance
  documentation retrieval with citation-backed answers.
- **FedRAMP docs MCP** — live FedRAMP documentation lookup (candidate for
  in-house maintenance).
- **NIST / SCF** — the Club already fetches SCF crosswalks; cross-reference
  with NIST 800-53 rev data via the existing SCF API.

## Schema v1.1 candidates

Potential contract work after the current schema baseline stabilizes:

- Stronger provenance fields for connector source, tool version, and collection
  timestamps
- Better evidence references for generated artifacts and supporting materials
- Optional ownership or routing metadata for findings and exceptions
- Companion schemas for metrics, risks, exceptions, vendors, and policy
  lifecycle data
