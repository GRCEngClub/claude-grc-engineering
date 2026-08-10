# Changelog

All notable changes follow the format from [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **NIST AI RMF framework plugin (stub).** Added `nist-ai-rmf`, the toolkit's first AI-governance framework plugin, scaffolded at Stub depth from the SCF crosswalk (`general-nist-100-1-ai-rmf`, 158 SCF controls → 91 AI RMF subcategories across GOVERN/MAP/MEASURE/MANAGE, counts verified against scf-api v2026.1), with marketplace registration. Reference-depth level-up (scope, evidence checklist, substantive SKILL) planned as a follow-up, along with a Generative AI Profile (AI 600-1) companion plugin. Closes [#195](https://github.com/GRCEngClub/claude-grc-engineering/issues/195).

### Changed

- **Required CI checks now run on every PR.** Removed the `paths:` filters from the `pull_request` triggers of `validate-plugin-manifests.yml` and `contract-test.yml`. Both jobs are required status checks on `main`, but path-filtered required checks never report on PRs outside their paths (docs-only PRs, bot coverage PRs), leaving those PRs permanently blocked and forcing admin-bypass merges. Both jobs finish in under a minute, so the cost of always running them is negligible.

### Removed

- **`vanta-bridge` plugin removed.** Vanta now ships an official Claude Code plugin (`vanta-mcp-plugin` in `anthropics/claude-plugins-official`) and an official MCP server (`mcp.vanta.com/mcp` and regional variants). The community bridge predated both and added a manual-export step that's now obsolete. Users should install Vanta's official plugin instead — see [GHSA #150](https://github.com/GRCEngClub/claude-grc-engineering/issues/150). Drops the bridge plugin, marketplace registration, test fixtures, and documentation references.

### Fixed

- **Connector evaluations that reported false compliance verdicts.** Seven connectors returned a confident wrong answer rather than an error. `okta-inspector` discarded `maxSessionLifetimeMinutes`/`maxSessionIdleMinutes` values of `0` via `filter(Boolean)` — `0` is how Okta encodes *unlimited*, so the worst case passed, and `Math.max` also ranked it as the strictest setting; policies declaring no session setting now report `inconclusive` instead of passing on no evidence. `splunk-inspector` fell back to `maxGlobalDataSizeMB` (a size cap) when `frozenTimePeriodInSecs` was absent and divided it by 86400 as though it were seconds. `datadog-inspector` compared the integer `priority` field against the string `'p1'`, which never matched. `tenable-inspector` aged vulnerabilities with unparseable dates as `0` days, counting them as fresh. `tenable-inspector` and `crowdstrike-inspector` shared a flat YAML matcher that only accepted unindented keys, so the nested `defaults:` block written by their own `setup.sh` was silently ignored. `snowflake-inspector` emitted findings with an undefined `resource.id` when `account` was unset, violating the finding schema. `wiz-inspector` paginated without a page cap or cursor-repeat check. Covered by `tests/connector-evaluation-logic.test.mjs`.
- **`node:test` suites now run in CI.** The contract-test and manifest workflows ran the schema validator and the shell validators, but nothing invoked the `node:test` suites, so `tests/wiz-inspector-collect.test.js` had been green-by-default since it landed and any newly contributed test file would be silently skipped. Added `npm run test:unit`, which discovers every `tests/*.test.*` file, and wired it into the contract-test workflow.
- **`scan-iac`, `test-control`, and `cross-framework-analyzer` were unrunnable.** All three were written as CommonJS while the root `package.json` declares `"type": "module"`, so each threw `ReferenceError: require is not defined` before executing a line, taking `npm run scan-iac`, `npm run test-control`, and the documented `/grc-engineer:scan-iac` and `:test-control` workflows down with them. Converting `scan-iac.js` surfaced a second fault behind the first: its rules database bound `this.checkK8sEncryption`, which was never implemented, so the constructor threw on every invocation.
- **Plugin install failures.** Removed non-standard top-level fields (`commands`, `skills`, `hooks`, `namespace`) from `us-hipaa-security`, `grc-loop`, `us-ccpa`, `ch-fadp`, and `nist-csf-20` manifests — Claude Code's install-time validator was rejecting them. Commands and skills are auto-discovered from their directories; hooks were already wired correctly via `hooks/hooks.json`. Closes [#150](https://github.com/GRCEngClub/claude-grc-engineering/issues/150).
- **`plugin.schema.json` tightened.** Explicitly forbids `namespace`, `commands`, `skills`, and `hooks` as top-level keys in `plugin.json` so future PRs catch the same install-time validation drift at CI time rather than at user install.
- **Marketplace install failures.** Removed the non-standard `commands: [strings]` field from the `gcp-docs` and `grc-diagrams` entries in `.claude-plugin/marketplace.json` — same class of bug as the plugin.json cleanup above but at the marketplace-entry level, missed in the previous sweep. `claude plugin marketplace add GRCEngClub/claude-grc-engineering` was failing with `plugins.6.commands: Invalid input, plugins.8.commands: Invalid input`. Commands are auto-discovered from each plugin's `commands/` directory.
- **`marketplace.schema.json` tightened.** Explicitly forbids `namespace`, `commands`, `skills`, and `hooks` on plugin entries in `.claude-plugin/marketplace.json`, mirroring the `plugin.schema.json` tightening above. Completes the sweep from [#156](https://github.com/GRCEngClub/claude-grc-engineering/pull/156) and [#202](https://github.com/GRCEngClub/claude-grc-engineering/pull/202): the marketplace-entry level was the remaining spot where this install-time validation drift could pass CI and break `claude plugin marketplace add` for users.
- **Broken `vanta-mcp-plugin` links.** `ROADMAP.md` and `docs/ARCHITECTURE-V2-RFC.md` pointed at `github.com/VantaInc/vanta-mcp-plugin`, which now returns 404 and was failing the `link-check` workflow on every pull request. Repointed at `anthropics/claude-plugins-official`, where the official Vanta plugin actually ships, as the removal note further down this file already states.
- **Stale inventory claims in `CLAUDE.md` and `docs/ARCHITECTURE.md`.** Both described a repo of 30 plugins, 21 frameworks, and 4 connectors; the marketplace now registers 65 plugins, 35 frameworks, and 15 connectors. Replaced the hand-maintained lists with pointers to `.claude-plugin/marketplace.json` and `docs/FRAMEWORK-COVERAGE.md` so they cannot drift again, corrected the claims that all plugins are MIT (`cis-controls` is `CC-BY-SA-4.0 AND MIT`), that Node scripts live only in persona plugins, and that all framework plugins are prompt-only (`fedramp-20x` ships a script). Dropped a reference to a `fedramp-docs` plugin that does not exist (the OSCAL plugin is `fedramp-ssp`) and to `plugins/grc-engineer/config/crosswalk-overrides.yaml`, which is not in the repo.
- **Broken SCF framework IDs in `us-hipaa-security` and `cyber-essentials-plus`.** Both plugins declared `scf_framework_id` values that do not exist in the SCF crosswalk index (`US-HIPAA-Security` and `emea-gbr-ce-2021`), so `/grc-engineer:gap-assessment` lookups for them failed. Corrected to the canonical `usa-federal-law-hipaa-security-rule-2013` (136 SCF → 87 framework controls) and `emea-gbr-cyber-essentials-requirements-3-3` (26 → 5), including all command/skill/README references. Landed in [#201](https://github.com/GRCEngClub/claude-grc-engineering/pull/201).
- **CSA CCM crosswalk resolution enabled.** `scf-client.js` still refused to resolve `csa-ccm` with a stale "not in the SCF crosswalk index" error, even though SCF 2026.1 publishes the crosswalk as `general-csa-cmm-4-1-0` (the `cmm` spelling is the upstream ID). Removed the refusal and added `csa-ccm`/`ccm` aliases. Landed in [#201](https://github.com/GRCEngClub/claude-grc-engineering/pull/201).

## [0.0.4] — 2026-04-30

### Added

- **Tier-2 connector wave.** Added Azure, Slack, Datadog, Drata, Splunk, CrowdStrike, Tenable, and Snowflake inspector plugins with setup/status/collect commands, expert skills, v1 Finding fixtures, and marketplace registration.
- **Vanta bridge.** Added `vanta-bridge` to normalize Vanta MCP/plugin outputs into v1 Findings, including command metadata and marketplace registration.
- **Google Developer Knowledge API source.** Added `gcp-docs` under `plugins/knowledge-sources/` for API-key-backed Google documentation search, citation lookup, grounded query answers, and local 7-day caching. Closes [#46](https://github.com/GRCEngClub/claude-grc-engineering/issues/46).
- **Socket Basics security workflow.** Added a secret-gated, SHA-pinned Socket Basics workflow for PR/build security scanning. Closes [#76](https://github.com/GRCEngClub/claude-grc-engineering/issues/76).
- **Additional reference framework plugins.** Added Japan APPI, Singapore MAS TRM, APRA CPS 234, and NERC CIP reference plugins with marketplace registration.
- **Assessment and automation workflows.** Added the assessment interview question generator, scheduled automation metrics snapshot workflow, and automation-total derivation from framework metadata.
- **Claude Cowork and AWS Claude Platform docs.** Added compatibility/deployment guidance for Claude Cowork and AWS Claude Platform environments.

### Changed

- **Architecture v2 accepted.** Marked the Architecture v2 RFC accepted, including Amendment A1 decisions for bridges, knowledge sources, and the non-breaking directory-layout recommendation. Closes [#38](https://github.com/GRCEngClub/claude-grc-engineering/issues/38).
- **Quickstart and marketplace expanded.** Registered the new connector, bridge, framework, and knowledge-source plugins in the marketplace and kept the quickstart plugin-selection guidance aligned with the growing toolkit.
- **Lychee stability.** Excluded the PCAOB auditing standards URL that returns scraper-only 522 responses, preventing unrelated PRs from being blocked by an external regulator-site availability issue.

### Closed as not planned

- **FFIEC CAT and K-ISMS framework requests.** Closed [#18](https://github.com/GRCEngClub/claude-grc-engineering/issues/18) and [#22](https://github.com/GRCEngClub/claude-grc-engineering/issues/22) after validating that the requested `US-FFIEC-CAT` and `KR-K-ISMS` SCF framework IDs are not present in the current SCF index.

## [0.0.3] — 2026-04-30

### Added

- **Quickstart plugin decision tree.** `docs/QUICKSTART.md` now includes a "Which plugin do I need?" flowchart covering connectors, framework plugins, persona plugins, learning support, OSCAL/FedRAMP utilities, and the compliance posture dashboard. Closes [#36](https://github.com/GRCEngClub/claude-grc-engineering/issues/36).
- **Reference-depth framework plugins.** Added EU NIS2, NIST CSF 2.0, SOX, and CCPA/CPRA framework plugins with scope, assessment, evidence-checklist commands, expert skills, and marketplace registration. Closes [#14](https://github.com/GRCEngClub/claude-grc-engineering/issues/14), [#15](https://github.com/GRCEngClub/claude-grc-engineering/issues/15), [#16](https://github.com/GRCEngClub/claude-grc-engineering/issues/16), and [#23](https://github.com/GRCEngClub/claude-grc-engineering/issues/23).
- **Compliance posture dashboard plugin.** Added `compliance-posture-dashboard`, a dependency-free localhost dashboard for `/grc-engineer:monitor-continuous` JSON output, with marketplace registration.
- **`teach-me` plugin (v0.1.0).** Socratic primer + drill plugin for new-to-GRC practitioners and career transitioners — the on-ramp the toolkit was missing for people who don't already know the framework. Four commands: `/teach-me:framework <name>` produces a paraphrased primer (purpose, scope, artifacts, cadence, regulator, control families), `/teach-me:control <id>` explains one control across every framework it maps to via the SCF crosswalk, `/teach-me:role <persona>` outputs a first-90-days onboarding for the four GRC personas, and `/teach-me:quiz <framework>` runs a Socratic drill loop (inspired by [`mattpocock/skills/grill-me`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me)) that tracks coverage in-session. Reuses `/grc-engineer:map-controls-unified` and `/grc-engineer:frameworks` rather than duplicating the SCF client. No normative standard text is reproduced. Closes [#61](https://github.com/GRCEngClub/claude-grc-engineering/issues/61).

### Removed

- **`markdown-lint` CI workflow and `markdownlint-cli2` devDependency.** The lint gate was rejecting valid `<picture>`/`<source>` HTML in the README's star-history block (and similar legitimate HTML) faster than it was catching real prose problems. Removed `.github/workflows/markdown-lint.yml`, `.markdownlint-cli2.jsonc`, the `lint:md` package script, and the `markdownlint-cli2` devDependency.

### Changed

- **SCF API source migrated to the Club-owned mirror.** Default `DEFAULT_BASE_URL` in `plugins/grc-engineer/scripts/scf-client.js` switched from `hackidle.github.io/scf-api` to [`grcengclub.github.io/scf-api`](https://grcengclub.github.io/scf-api/) ([repo](https://github.com/GRCEngClub/scf-api)). The new mirror is API-compatible — same SCF v2026.1 workbook, identical endpoint shapes, identical response payloads — so cached data and framework alias tables remain valid. Users who want to pin to the previous origin can still set `CLAUDE_GRC_SCF_BASE_URL=https://hackidle.github.io/scf-api`. Closes [#55](https://github.com/GRCEngClub/claude-grc-engineering/issues/55).

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
