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

## Schema v1.1 candidates

Potential contract work after the current schema baseline stabilizes:

- Stronger provenance fields for connector source, tool version, and collection
  timestamps
- Better evidence references for generated artifacts and supporting materials
- Optional ownership or routing metadata for findings and exceptions
- Companion schemas for metrics, risks, exceptions, vendors, and policy
  lifecycle data
