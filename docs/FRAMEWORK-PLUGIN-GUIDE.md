# Framework Plugin Guide

This guide is for anyone authoring or reviewing a framework plugin in `plugins/frameworks/`. It defines what "done" looks like at three depth tiers and how to move a plugin between them.

The Club's goal is a dedicated plugin for every framework in the Secure Controls Framework crosswalk — 249 frameworks. Every framework has its own audit ritual, terminology, and regulator. Plugin depth scales with how much of that the contributor can encode in the moment.

## TL;DR

| Depth | You ship | Ship criterion |
|---|---|---|
| **Stub** | Scaffolded plugin that delegates to `/grc-engineer:gap-assessment` via the SCF crosswalk. 4 files. | Passes CI. Framework identity is correct. Any GRC engineer with no prior knowledge of this framework can install the plugin and get a meaningful gap report. |
| **Reference** | Stub plus scope determination, evidence checklist, and framework-specific context in the SKILL. 6 files, no `TODO:` markers left in the SKILL body. | A practitioner who's never seen this framework before can assess, scope, and prepare evidence with only the plugin as a guide. No copying from the standard itself required. |
| **Full** | Reference plus framework-specific workflow commands tied to the audit ritual. 8+ files. | The plugin handles the *native* assessment artifacts for this framework — SSP outlines for FedRAMP, ROC walkthroughs for PCI DSS, TSC matrices for SOC 2, etc. — not just generic gap-assessment output. |

You can ship at any depth. A Stub is genuinely useful. Contributors should pick the depth that matches their current expertise and ship there.

## How plugins progress

```
┌─────────────────┐   add SKILL + commands   ┌──────────────────┐   add workflow commands   ┌──────────────┐
│      Stub       │ ───────────────────────► │    Reference     │ ────────────────────────► │     Full     │
│ (scaffolded)    │                          │ (authored)       │                           │ (authored)   │
└─────────────────┘                          └──────────────────┘                           └──────────────┘
```

Level-ups are separate PRs. Don't try to go Stub → Full in one PR — the intermediate Reference state is a valuable milestone and gives reviewers a reasonable unit to check.

## Minimum viable plugin structure

Every plugin, regardless of depth, ships this skeleton:

```
plugins/frameworks/<slug>/
├── .claude-plugin/
│   └── plugin.json               # name + framework_metadata
├── commands/
│   └── assess.md                 # always present; routes to gap-assessment
├── skills/
│   └── <slug>-expert/
│       └── SKILL.md              # framework identity + tier-dependent detail
└── README.md                     # install + depth + metadata
```

`plugin.json` must include a `framework_metadata` block:

```json
{
  "name": "<slug>",
  "description": "...",
  "version": "0.1.0",
  "author": {"name": "GRC Engineering Club Contributors"},
  "repository": "https://github.com/GRCEngClub/claude-grc-engineering",
  "license": "MIT",
  "framework_metadata": {
    "scf_framework_id": "<SCF framework_id>",
    "display_name": "<human-readable name>",
    "region": "Americas|APAC|EMEA|Global",
    "country": "<ISO-3166-1 alpha-2 or TBD>",
    "depth": "stub|reference|full",
    "scf_controls_mapped": <integer>,
    "framework_controls_mapped": <integer>,
    "industry": [],
    "regulator": ""
  }
}
```

The `framework_metadata` block drives `/grc-engineer:frameworks` — the discovery command that lists all 249 SCF frameworks and shows which have plugins. Missing metadata means the plugin shows up as "no SCF mapping recorded."

## Stub depth

**When to ship Stub**: you want a dedicated namespace (`/<slug>:assess`) for a framework that's crosswalk-supported today but has no domain-expertise-authored plugin. Any GRC engineer can scaffold and ship this tier.

**Ship criterion**: the scaffold output is valid as-is, framework_metadata is accurate, and no `TODO:` in `plugin.json` (placeholders in the SKILL are expected).

**How to build it**:

```bash
node plugins/grc-engineer/scripts/scaffold-framework.js <scf-framework-id>
```

That's it. The scaffold generates valid files, registers in marketplace.json, and prints what to do next. Commit, open PR, merge. **Do not hand-author a Stub** — use the scaffold command every time.

**Files shipped** (4): `plugin.json`, `commands/assess.md`, `skills/<slug>-expert/SKILL.md`, `README.md`.

**What's acceptable to leave as TODO**: the SKILL.md's "Scope and posture" section. That's what a Reference-depth contributor fills in.

**What's NOT acceptable**: a Stub with the wrong SCF framework_id, wrong region, wrong control counts, or a typo in the plugin slug. These become painful to fix after the plugin has users.

## Reference depth

**When to ship Reference**: you have practitioner-level knowledge of this framework — you've used it in an assessment or implementation, you know the scope rules, you know what evidence auditors actually ask for.

**Ship criterion**: every `TODO:` in the SKILL body is replaced with real content. Scope and evidence checklist commands are present and framework-specific.

**How to build it**:

```bash
node plugins/grc-engineer/scripts/scaffold-framework.js <scf-framework-id> --depth=reference
```

Then fill in the scaffolded TODOs. At Reference depth, expect to write 300-800 lines of framework-specific Markdown.

**Files shipped** (6): Stub's 4 files plus `commands/scope.md` and `commands/evidence-checklist.md`.

### Level-up checklist (Stub → Reference)

A Stub levels up to Reference when all of these land in one PR:

- [ ] `plugin.json` `framework_metadata.depth` changes to `"reference"`
- [ ] `commands/scope.md` present — framework-specific applicability determination (not generic)
- [ ] `commands/evidence-checklist.md` present — evidence patterns organized by the framework's own control families
- [ ] `skills/<slug>-expert/SKILL.md` has substantive content in every section; no `TODO:` markers in the body
- [ ] Framework identity data filled in: regulator name, industry tags if applicable
- [ ] `README.md` updated to reflect Reference depth + install/usage flow
- [ ] No verbatim standard text (see Anti-patterns below)

## Full depth

**When to ship Full**: you're a subject-matter expert for this framework. You've done the audit ritual enough times to know where teams get stuck. You can write commands that reflect how the framework is *actually* consumed — not just its control catalog.

**Ship criterion**: framework-native workflow commands exist that don't fit any generic gap-assessment output. These commands produce the real artifacts auditors and practitioners handle every day.

**Examples that set the bar**:

| Plugin | Full-depth commands |
|---|---|
| `soc2` | `/soc2:service-auditor-prep`, `/soc2:generate-tsc-matrix`, `/soc2:evidence-checklist` |
| `fedramp-rev5` | `/fedramp-rev5:poam-review`, `/fedramp-rev5:ssp-outline`, `/fedramp-rev5:sap-draft` |
| `pci-dss` | `/pci-dss:roc-walkthrough`, `/pci-dss:saq-route`, `/pci-dss:scoping-worksheet` |
| `cmmc` | `/cmmc:c3pao-readiness`, `/cmmc:ssp-generator` |

**Files shipped** (8+): Reference's 6 files plus 2–6 framework-specific workflow commands.

### Level-up checklist (Reference → Full)

- [ ] `plugin.json` `framework_metadata.depth` changes to `"full"`
- [ ] At least 2 framework-specific commands beyond `assess` / `scope` / `evidence-checklist` — commands that wouldn't make sense for a different framework
- [ ] Each workflow command has inputs, outputs, and failure modes documented
- [ ] SKILL.md's "Levelling up to Full" section is removed (it's now Full)
- [ ] `README.md` depth updated; advertises the workflow commands in the install example

## Anti-patterns — what not to ship

Reviewers will reject PRs that do any of the following.

### 1. Verbatim copyrighted standard text

Do not paste normative control text from:

- ISO/IEC 27001, 27002, 27701 (ISO)
- PCI DSS (PCI SSC)
- HITRUST CSF (HITRUST)
- SOC 2 TSC (AICPA)
- ISA/IEC 62443 (IEC)

These standards are copyrighted. Paraphrase control intent, reference by control ID, link users to their licensed copy. *"CC6.1 — access control"* is fine; copying the 200-word TSC description of CC6.1 is not.

This applies to quotes too, not just bulk pastes. If you find yourself copy-pasting more than a control ID and a one-phrase summary, paraphrase.

### 2. Hand-maintained crosswalks

SCF is the canonical vocabulary. Do not add your own framework-to-SCF mapping table inside your plugin. If SCF doesn't have a mapping you need, [open an issue](https://github.com/GRCEngClub/claude-grc-engineering/issues/new) and file upstream at [securecontrolsframework.com](https://securecontrolsframework.com).

### 3. Vendor-specific guidance as a hard requirement

Implementation guidance for AWS/GCP/Azure/K8s is welcome, but plugins must not *require* a specific vendor. A FedRAMP plugin that only works if you're on AWS is a FedRAMP-on-AWS plugin, not a FedRAMP plugin. Write cloud-agnostic guidance first; cloud-specific examples are optional.

### 4. Credentials, tokens, or org-specific context

Plugins ship in public. Never commit API tokens, org IDs, internal URLs, sample PII, or sample evidence that contains real names. Evidence collection happens at runtime against the user's own environment.

### 5. Speculative scope

Don't ship a Full plugin that claims workflows you haven't actually executed. If you've never prepped a SOC 2 auditor engagement, don't invent `/soc2:service-auditor-prep` — or ship it as Reference and let someone who has done it add the Full-depth command.

## Review bar

Reviewers look for, in order:

1. **Accuracy of framework identity** — correct SCF framework_id, correct region/country, correct regulator. This is checked first because errors here propagate.
2. **Copyright compliance** — no verbatim text from proprietary standards.
3. **SCF crosswalk alignment** — evaluations that reference framework-native control IDs should resolve via the crosswalk. If they don't, something is off.
4. **Cloud-agnostic baseline** — implementation guidance is vendor-neutral before it's vendor-specific.
5. **Depth appropriateness** — the shipped depth matches what's actually in the files. A plugin labeled Full that only routes to `gap-assessment` is actually a Stub.
6. **Prose quality** — framework content is paraphrased clearly, with citations to the source regulation by article/section number.

Style issues (markdown lint, heading hierarchy) are enforced by CI. Substantive review focuses on the list above.

## Worked examples

- **Stub**: [`plugins/frameworks/singapore-pdpa/`](../plugins/frameworks/singapore-pdpa/) — scaffolded from `apac-sgp-pdpa-2012`. Has the SKILL TODOs intact as a demonstration of what Stub-before-level-up looks like.
- **Reference**: [`plugins/frameworks/gdpr/`](../plugins/frameworks/gdpr/) — rich SKILL with regulatory context, multiple commands beyond `assess`.
- **Full**: [`plugins/frameworks/soc2/`](../plugins/frameworks/soc2/) — framework-specific commands like `service-auditor-prep`, `trust-service-matrix`, `evidence-checklist` that reflect the actual SOC 2 engagement ritual.

## Getting started

1. Pick a framework. Use `/grc-engineer:frameworks --not-installed` to see what's available.
2. Pick a depth. If you've never touched the framework before → Stub. If you've used it in practice → Reference. If you've done multiple audits of it → Full.
3. Scaffold: `node plugins/grc-engineer/scripts/scaffold-framework.js <scf-framework-id> --depth=<stub|reference>`.
4. Fill in `TODO:` markers if applicable.
5. Open a draft PR. Tag it with the `framework` label. Leadership-team review routes via CODEOWNERS.
6. After merge, comment `@all-contributors please add @your-username for code,doc` on the PR.

Questions: [Discussions → Q&A](https://github.com/GRCEngClub/claude-grc-engineering/discussions/categories/q-a).
