# Changelog

All notable changes follow the format from [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] — 2026-04-18

This release marks the official handoff of the toolkit to the [GRC Engineering Club](https://grcengclub.com). Content below summarizes the handoff + community scaffolding that landed between 0.0.1 and 0.0.2.

### Added

**Community scaffolding**

- `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)
- `CONTRIBUTORS.md` seeded via the all-contributors pattern; AJ Yawn and Ethan Troy listed as co-leads
- `GOVERNANCE.md` — co-lead governance model, decision process, path to maintainership
- `MAINTAINERS.md` — leadership team with expertise areas
- `SECURITY.md` — private advisory-first vulnerability reporting
- `ROADMAP.md` — Tier-2 connectors, framework gaps, schema v1.1 candidates
- `.github/ISSUE_TEMPLATE/{bug_report, connector_request, framework_request, plugin_proposal, config}.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS` with leadership team ownership and sensitive-file routing

**Continuous integration**

- `.github/workflows/contract-test.yml` — validates every `tests/fixtures/findings/**/*.json` against `schemas/finding.schema.json` v1 on every PR
- `.github/workflows/markdown-lint.yml` — `markdownlint-cli2` with a docs-aware config
- `.github/workflows/link-check.yml` — `lychee` on PR and weekly cron
- `.github/workflows/all-contributors.yml` — contributor-recognition bot wired to PR comments
- `package.json` gains `test:contract` and `lint:md` scripts plus `ajv-cli` / `markdownlint-cli2` devDependencies

**Architecture v2 RFC**

- `docs/ARCHITECTURE-V2-RFC.md` — design proposal for five new plugin categories (reporting, dashboards, transforms, programs, meetings), sibling schemas for metrics/risks/exceptions/vendors/policies, a new `grc-ciso` persona, and a GitOps-first statefulness model. 2-week community comment window tracked in [#38](https://github.com/GRCEngClub/claude-grc-engineering/issues/38).

**Roadmap seeding**

- Public project board at [github.com/orgs/GRCEngClub/projects/1](https://github.com/orgs/GRCEngClub/projects/1) with custom fields (Category, Difficulty, Target release, Plugin depth, Region) and 29 seeded issues covering 15 framework-plugin gaps, 7 Tier-2 connectors, tooling, docs, and the framework-coverage meta tracker.

### Changed

**Ownership transfer to GRC Engineering Club**

- Repository transferred from `ethanolivertroy/claude-grc-engineering` to [`GRCEngClub/claude-grc-engineering`](https://github.com/GRCEngClub/claude-grc-engineering). The toolkit is now the official open-source project of the [GRC Engineering Club](https://grcengclub.com).
- `LICENSE` copyright updated to "GRC Engineering Club contributors" (MIT terms unchanged). Third-party attributions (SCF CC BY-ND 4.0, CIS Controls CC BY-SA 4.0) preserved.
- All 30 `plugin.json` files: `author` and `repository` fields now reflect Club ownership.
- `.claude-plugin/marketplace.json`: `owner` updated to the Club (homepage: grcengclub.com).
- `package.json`: `author`, `repository`, `homepage`, `bugs`, and license URLs migrated.
- `schemas/finding.schema.json`: `$id` updated to the Club-owned URL. Schema contract unchanged — still v1.0.0, no behavioral break.
- Documentation and helper scripts: install commands and issue-tracker URLs point at the Club repo.
- External tool references (e.g., `ethanolivertroy/oscal-cli`, `ethanolivertroy/frdocx-to-froscal-ssp`, `ethanolivertroy/compliance-trestle-skills`, `hackIDLE/*`) remain unchanged. These are independent upstream projects the toolkit wraps; their attribution stays accurate.
- Founding author: Ethan Troy (`@ethanolivertroy`). Co-leads of the Club's leadership team: AJ Yawn (`@ajy0127`) and Ethan Troy. See forthcoming `GOVERNANCE.md` and `MAINTAINERS.md`.

**Migration note for existing users**: If your `/plugin marketplace add` points at the old `ethanolivertroy/claude-grc-engineering` URL, re-add the marketplace using `GRCEngClub/claude-grc-engineering`. GitHub auto-redirects the old URL, but updating avoids future ambiguity.

### Added

**Foundations**

- `schemas/finding.schema.json` v1.0.0. The canonical output contract for connector plugins.
- `LICENSE` at repo root (MIT with third-party attributions for SCF and CIS Controls).
- Secure Controls Framework (SCF) as the canonical crosswalk backbone. 1,468 controls mapped to 249 frameworks, fetched from [`hackidle.github.io/scf-api`](https://hackidle.github.io/scf-api/) and cached locally under CC BY-ND 4.0.
- `docs/ARCHITECTURE.md`, `docs/QUICKSTART.md`, `docs/CONTRIBUTING.md`, `docs/SCF-ATTRIBUTION.md`.

**Orchestration**

- `/grc-engineer:gap-assessment`. Unified cross-framework command that joins connector findings with the SCF crosswalk and emits a tiered gap report (markdown, JSON, SARIF, or OSCAL Assessment Results).
- `/grc-engineer:pipeline-status`. Aggregate connector health: auth validity, cache freshness, resource and evaluation counts.

**Connectors (Tier 1)**

- `aws-inspector`. IAM (root MFA, password policy, access keys), S3 (encryption, public access, versioning), CloudTrail (multi-region, log validation, active logging), EBS (default encryption).
- `github-inspector`. Branch protection, required status checks, secret scanning, Dependabot, code scanning. Tested end-to-end against live GitHub.
- `gcp-inspector`. IAM primitive roles, service-account key age, Cloud Storage (public-access prevention, uniform access, logging, CMEK), log sinks, KMS rotation (≤90d), Compute OS Login.
- `okta-inspector`. Password, MFA enrollment, and sign-on policies. Session lifetime and idle timeouts. Inactive users, super-admin count, per-admin factor enrollment.

**OSCAL / FedRAMP showcase plugins**

- `oscal`. Wraps `ethanolivertroy/oscal-cli` for validate and convert commands across catalogs, profiles, SSPs, SAPs, SARs, POA&Ms, assessment results, and component definitions. Auto-installs from source. Degrades gracefully when the upstream binary isn't available.
- `fedramp-ssp`. Wraps `ethanolivertroy/frdocx-to-froscal-ssp` to convert FedRAMP Rev 5 SSP DOCX templates into OSCAL 1.2.0 SSP JSON (323 implemented-requirements across 18 NIST 800-53 Rev 5 families). Tolerates venv and Homebrew-Python edge cases with clear remediation.

**Licensing and hygiene**

- CIS Controls plugin isolation: `plugins/frameworks/cis-controls/LICENSE-CIS.md` plus CC BY-SA 4.0 attribution headers on every command and SKILL in that directory.
- HITRUST plugin carries a reference-only disclaimer. Paraphrased one CSF-echoing phrase in `evidence-checklist.md`.
- SOC 2 command documentation renamed the fictional example audit firm from "Deloitte" / "Deloitte & Touche LLP" to "Example Audit LLP". These were always illustrative placeholders in command examples. No real auditor engagement or contact was ever in the repo. The new name makes the illustrative intent unambiguous.
- `.gitignore` covering in-progress work (`data/`, `grc-audit-manager/`, `grc-cert-manager/`, `grc-program-manager/`) and runtime artifacts.

### Changed

- README rewritten around capability-first workflows and the data-pipeline model.
- Plugin taxonomy restructured into five categories: engineering hub, persona, framework, connector, OSCAL / FedRAMP showcase.

### Planned (v0.2 roadmap)

- `compliance-trestle` plugin: first-class integration with `ethanolivertroy/compliance-trestle-skills` for OSCAL authoring workflows.
- `fedramp-docs` plugin: MCP server integration with `ethanolivertroy/fedramp-docs-mcp` for live FedRAMP documentation lookup.
- `vanta-bridge` plugin: wraps `ethanolivertroy/vanta-go-export` to pull Vanta evidence and normalize to v1 findings.
- `azure-inspector` connector (Tier 2 promotion).
- Deeper connector coverage: per-user IAM for AWS, shielded-VM + VPC-SC for GCP, factor-type analysis for Okta.
- `/grc-engineer:monitor-continuous` cron-friendly scheduling wrapper with EventBridge and GitHub Actions templates.
