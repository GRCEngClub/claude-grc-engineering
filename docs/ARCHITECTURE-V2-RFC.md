# RFC: Architecture v2 — expanding beyond framework-centric plugins

**Status**: Draft — open for community comment
**Authors**: GRC Engineering Club leadership team
**Target merge**: after 2-week comment window closes
**Replaces**: n/a (first architecture RFC)
**Affected surface**: plugin taxonomy, directory layout, data schemas, namespace conventions

## TL;DR

Today the toolkit is organized around three plugin patterns — **persona** (`grc-engineer`, `grc-auditor`, `grc-internal`, `grc-tprm`), **framework** (`soc2`, `nist-800-53`, …), and **connector** (`aws-inspector`, `github-inspector`, …). That architecture is purpose-built for *assessment workflows*: evidence collection → crosswalk → gap report.

Real GRC work is wider than that. Teams need executive reports, live dashboards, daily-standup digests, document transformation (policy Markdown → OSCAL component, or → exec PDF), risk registers, vendor-management programs, and KPI/KRI tracking. The toolkit should serve those workflows too, and its current taxonomy doesn't have a clean place for them.

This RFC proposes **five new plugin categories** (`reporting`, `dashboards`, `transforms`, `programs`, `meetings`), each with a namespace convention; a **directory restructure** to fit them; and resolution of the design questions each category raises (new data schemas? output formats? statefulness? persona mapping?).

This is a **design document**, not code. It asks for community comment before any implementation lands.

## Why now

Since v0.1 the toolkit has grown from 25 → 30 plugins, added a stable Finding schema (`schemas/finding.schema.json` v1.0.0), and moved to the GRC Engineering Club as an open-source home. Early contributors and the Club's broader audience have named a consistent set of asks that don't fit the existing three patterns:

- *"Can it generate an executive summary PDF?"* — reporting category
- *"I want a daily standup brief of what changed overnight."* — dashboards / meetings
- *"Can it turn my policy markdown into an OSCAL component?"* — document transformation
- *"Where does the risk register go?"* — program management
- *"Can it track KPIs over time, not just point-in-time findings?"* — metrics (a sub-concern of dashboards)

Bolting these onto `grc-engineer` would turn it into a 50-command god plugin. A persona-only grouping doesn't capture workflows that cut across personas (an exec report serves `grc-engineer`, `grc-auditor`, and `grc-internal` alike). The right move is a taxonomy expansion.

## Proposed new plugin categories

### 1. Reporting — `/report:`

**Intent**: render Findings + framework configs + metrics into a deliverable artifact (PDF, DOCX, slides, Markdown) for a specific audience.

| Command (proposed) | Input | Output | Audience |
|---|---|---|---|
| `/report:executive-summary` | Findings (1 run) + framework set | 1-page Markdown → PDF | CISO, board |
| `/report:audit-workpaper` | Findings (multi-run) + framework | OSCAL AR + workpaper docx | Auditor |
| `/report:board-deck` | Metrics (time-series) + recent incidents | PPTX slide set | Board |
| `/report:customer-trust-letter` | Findings + frameworks in scope | PDF w/ SHA-256 attestation | Sales, prospects |
| `/report:risk-summary` | Risk register + residual scoring | Markdown → PDF | Risk committee |

**Data it consumes**: Findings (existing schema), framework control metadata (existing), metrics time-series (new — see below), risk register (new — see below).

**Data it produces**: opaque deliverables. Not fed back into the pipeline.

### 2. Dashboards — `/dashboard:`

**Intent**: render state, *not* deliverables. Dashboards answer "what is the current posture?" and "what changed recently?" — consumed live, not archived.

| Command | Rendering |
|---|---|
| `/dashboard:exec` | Live terminal / HTML — compliance %, open critical findings, trend |
| `/dashboard:standup` | 5-line Markdown: what changed in the last 24h |
| `/dashboard:weekly-security` | Operational pack: incidents, control health, exceptions, open POA&M items |
| `/dashboard:compliance-posture` | Framework-by-framework % green / yellow / red |
| `/dashboard:vendor-risk` | Top-N risky vendors, questionnaire status, upcoming reviews |

**Data it consumes**: Findings (current + historical), metrics time-series, alerts, exceptions, vendor records.

**Open question**: how is historical Finding state stored? (See *Design Question 1* below.)

### 3. Document transformation — `/transform:`

**Intent**: convert documents from one representation to another. Orthogonal to Findings.

| Command | From | To |
|---|---|---|
| `/transform:policy-to-oscal-component` | Markdown policy with frontmatter | OSCAL 1.2.0 component definition |
| `/transform:markdown-to-executive` | Long-form Markdown | 1-page exec summary Markdown |
| `/transform:ssp-to-docx` | OSCAL SSP JSON | FedRAMP-format DOCX |
| `/transform:poam-to-excel` | OSCAL POA&M | .xlsx with tracked columns |
| `/transform:evidence-to-zip` | Evidence directory | Organized zip bundle for auditor handoff |
| `/transform:questionnaire-to-oscal` | SIG / CAIQ responses | OSCAL assessment-plan |

**Data it consumes**: arbitrary. Not tied to Findings.
**Data it produces**: other documents. Some (e.g. `policy-to-oscal-component`) feed back into the toolkit; others are deliverables.

### 4. Program management — `/program:`

**Intent**: stateful GRC programs that track things over time. This is where the statefulness question bites hardest.

| Command | Manages |
|---|---|
| `/program:risk-register` | Risks (id, likelihood × impact, owner, treatment, residual) |
| `/program:metrics` | KPI/KRI definitions, computation, history |
| `/program:vendor-management` | Vendor lifecycle: onboard → assess → monitor → offboard |
| `/program:policy-lifecycle` | Policy catalog: version, owner, review cadence, approval status |
| `/program:exception-tracker` | Exceptions to standard: rationale, owner, expiration, compensating controls |
| `/program:audit-calendar` | Upcoming audits, who owns prep, evidence readiness |

**Data it consumes/produces**: persistent state — see *Design Question 3*.

### 5. Meetings — `/meeting:`

**Intent**: render the outputs other categories produce into meeting-ready narrative. Thin composition layer.

| Command | Produces |
|---|---|
| `/meeting:daily-standup` | A one-screen brief from `/dashboard:standup` with talking points |
| `/meeting:weekly-security` | Slide-deck-friendly pack: top incidents, metric deltas, ask list |
| `/meeting:quarterly-grc` | Quarterly management-review pack per ISO 27001 §9.3 |
| `/meeting:audit-kickoff` | Scoping-meeting pack for a new audit engagement |
| `/meeting:board-quarterly` | Narrative wrapper around `/report:board-deck` |

**Data it consumes**: outputs of other categories. **Data it produces**: meeting artifacts (not recursively consumed).

## Proposed directory layout

Today:

```
plugins/
├── grc-engineer/        # engineering hub + 4 persona plugins at top level
├── grc-auditor/
├── grc-internal/
├── grc-tprm/
├── frameworks/          # 21 framework plugins, nested
│   ├── soc2/
│   ├── ...
├── connectors/          # 4 Tier-1 connectors, nested
│   ├── aws-inspector/
│   ├── ...
├── oscal/               # OSCAL plugins at top level
└── fedramp-ssp/
```

Proposed v2:

```
plugins/
├── personas/            # grouped — parallel structure
│   ├── grc-engineer/    # still the engineering hub
│   ├── grc-auditor/
│   ├── grc-internal/
│   ├── grc-tprm/
│   └── grc-ciso/        # new — see Design Question 4
├── frameworks/          # unchanged
├── connectors/          # unchanged
├── oscal/               # unchanged, retained at top level (spans categories)
├── fedramp-ssp/         # unchanged
├── reporting/           # new
├── dashboards/          # new
├── transforms/          # new
├── programs/            # new
└── meetings/            # new
```

**Breaking change**: moving persona plugins into `plugins/personas/` changes their path. The marketplace registers plugins by `source` path — marketplace.json must update, and any external references to `plugins/grc-engineer/**` break. This is the sharpest downside of the restructure.

**Mitigation options**:

- (A) Full move + deprecation notice in CHANGELOG v0.3. One clean break.
- (B) Add symlinks from old paths for one minor version, remove in v0.4. Reduces blast radius for external consumers but complicates tooling.
- (C) Leave persona plugins at top level; only new categories get new dirs. Less clean but zero breakage.

**Leadership recommendation**: **(A)** — full move. The toolkit is pre-1.0; breaking changes are expected and documented.

## Design questions

### Design Question 1 — Historical state for dashboards

Dashboards need Finding history ("compliance over the last 30 days"). Today, Findings are written to `~/.cache/claude-grc/findings/<source>/<run_id>.json` — cached but not indexed for time-series queries.

**Options**:

1. **Filesystem + glob + jq**. Dashboards scan the cache dir. Free, zero deps, slow above a few hundred runs.
2. **SQLite index** (optional). Background indexer writes finding metadata into a local SQLite DB. `/dashboard:*` queries the DB. Adds a dep (already Claude Code-adjacent territory, minor).
3. **External store** (Parquet, DuckDB, Postgres). Full flexibility, explicit infra burden, out of scope for a CLI-first tool.

**Leadership recommendation**: **(2) SQLite index** gated behind an opt-in. `/dashboard:*` degrades gracefully to (1) if SQLite isn't available. Matches the "thin connectors, no forced infra" principle.

### Design Question 2 — New schemas

Some categories need data shapes that don't fit the Finding schema:

- **Metrics**: `{metric_id, timestamp, value, dimensions{}}` — time-series rows.
- **Risks**: `{risk_id, title, likelihood, impact, treatment, owner, residual, linked_findings[]}`.
- **Exceptions**: `{exception_id, control_id, rationale, compensating_controls[], expiration, approved_by}`.
- **Vendors**: `{vendor_id, tier, last_review, contact, risks[]}`.
- **Meetings**: probably no schema — render from other schemas.

**Recommendation**: add sibling schemas under `schemas/` with their own versioning. Do **not** overload the Finding schema. Proposed files:

```
schemas/
├── finding.schema.json         # existing v1.0.0 — untouched
├── metric.schema.json          # new v1.0.0
├── risk.schema.json            # new v1.0.0
├── exception.schema.json       # new v1.0.0
├── vendor.schema.json          # new v1.0.0
└── policy.schema.json          # new v1.0.0 (for policy-lifecycle)
```

Each schema gets its own contract test in CI.

### Design Question 3 — Where stateful data lives

Risk registers, policy catalogs, vendor lists, exceptions, and metrics time-series are **user-owned data**, not toolkit state. They must be portable and versionable.

**Recommendation**: **GitOps default**.

- User creates a `./grc-data/` directory in their own repo (or a separate data repo).
- `/program:risk-register add ...` writes YAML/JSON files under `grc-data/risks/*.yaml` — human-readable, reviewable via PR.
- `/dashboard:*` reads from `grc-data/` + findings cache + metric index.
- For teams that want a DB backend, a config option points at SQLite / Postgres, but the YAML path remains canonical.

This mirrors how `terraform`, `opa`, and `compliance-trestle` approach state. It avoids a hidden-state failure mode where the toolkit holds data the user can't easily export.

### Design Question 4 — Persona mapping and new personas

Some new categories obviously serve existing personas: `/program:risk-register` maps to `grc-internal`; `/report:audit-workpaper` to `grc-auditor`. Others (executive reports, board decks) don't fit any current persona — they serve a CISO, director, or VP of GRC.

**Recommendation**: add `grc-ciso` persona. Cross-cutting commands (exec-summary, board-deck, program-level KPIs) go there. This is a real persona with distinct information needs — not a manufactured one.

### Design Question 5 — Output formats

- **Markdown → PDF/DOCX**: `pandoc` is the best-in-class tool, universally installed, MIT. Use it.
- **Slides**: `python-pptx` for PPTX, `reveal.js` for HTML. Start with PPTX; HTML decks can follow.
- **Excel**: `openpyxl` (Python) or `xlsx-js-style` (Node). Node preferred to match existing script language; revisit if Node options feel brittle.

**Recommendation**: standardize on **`pandoc` for docs**, **`python-pptx` for slides**, **Node for everything else**. Document the install story in each plugin's `setup` command.

## What this RFC is not deciding

- **Exact command signatures** — those are each plugin's PR to design.
- **UI for dashboards** — terminal-native first, HTML export second, no hosted UI in scope.
- **Commercial hosting / SaaS version** — out of scope. This remains an open-source CLI toolkit.
- **Whether to adopt the existing `grc-engineer` commands into the new categories** — migration path is its own follow-up RFC. Initial direction: new commands use new namespaces; old commands stay where they are until deprecation.
- **AI-specific categories** (LLM policy, model risk management, AI BOM) — worthy but deserve a dedicated RFC. Mentioned here only to note they're *not* in scope for v2.

## Migration plan (if approved)

1. **Land this RFC**: merge as `docs/ARCHITECTURE-V2-RFC.md` after comment window. Status: `Accepted`.
2. **Update `ARCHITECTURE.md`** to describe 8 categories (existing 3 + 5 new), without yet moving any plugins.
3. **Add sibling schemas** (`metric`, `risk`, `exception`, `vendor`, `policy`) with CI contract tests. v0.2.
4. **Add `grc-ciso` persona plugin** with a minimal command set. v0.2.
5. **Reference implementation**: ship one plugin in each new category as a proof-of-concept — `/report:executive-summary`, `/dashboard:standup`, `/transform:markdown-to-executive`, `/program:risk-register`, `/meeting:weekly-security`. v0.2.
6. **Directory restructure** (breaking, per Option A above). v0.3. Full migration guide in CHANGELOG.

Each step is a separate PR. RFC acceptance does not pre-approve the PRs.

## Comment window

This RFC is open for comment for **2 weeks from the merge date** at:

- **Tracking issue**: (to be created with PR)
- **Discussions**: [github.com/GRCEngClub/claude-grc-engineering/discussions](https://github.com/GRCEngClub/claude-grc-engineering/discussions) — `RFC` category

Comments are welcome on anything, but especially:

- Categories we're missing or merging incorrectly
- The `grc-ciso` persona — valid or manufactured?
- Statefulness approach — GitOps-first, opt-in SQLite
- The directory restructure blast radius
- Schemas we'd need that aren't listed

Silence = assent. At the end of the window, the leadership team resolves open threads and marks this document `Accepted` (or `Revised` with a follow-up RFC).
