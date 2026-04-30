# Contributing

`claude-grc-engineering` is the official open-source toolkit of the [GRC Engineering Club](https://grcengclub.com). Contributions are welcome from anyone working in GRC — assessors, internal audit, security engineering, CISO teams, TPRM, platform operators, framework experts.

The most valuable contributions are **new connectors** and **improvements to existing connectors**. A second high-value lane is **framework plugin improvements**: especially control-mapping refinements and real-world implementation guidance.

## First-time contributors

If this is your first contribution here, the path is **issue → vouch → PR**:

1. **Open an issue or Discussion** with your idea — even a two-line "I'd like to add a connector for X" works. Browse [`good-first-issue`](https://github.com/GRCEngClub/claude-grc-engineering/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) labels for a self-contained starting task (typically 2–4 hours). The issue also signals you're a real person — we get a steady stream of AI-scaffolded drive-by PRs and triage time matters.
2. **Wait for a vouch.** A maintainer will comment `!vouch` on the issue (or on your profile, if we already know you). This adds you to [`.github/VOUCHED.td`](../.github/VOUCHED.td); see [`GOVERNANCE.md`](../GOVERNANCE.md#vouching-new-contributors) for the mechanics and why we do this.
3. **Open the PR.** Once you're vouched, normal review applies. PRs from unvouched authors are auto-closed with a pointer back here. Bots (Dependabot etc.) and maintainers with write access are exempt.

Stuck on direction? Tag your issue or Discussion with the area (`connector`, `framework`, `docs`). "How would I add a connector for X?" is a welcome question.

## Ground rules

1. **MIT license for new code.** One exception: `plugins/frameworks/cis-controls/` is CC BY-SA 4.0 (see `plugins/frameworks/cis-controls/LICENSE-CIS.md`). Contributions there must stay compatible with that license.
2. **No verbatim copies of copyrighted standards.** ISO 27001/27002, PCI DSS, HITRUST CSF, SOC 2 TSC text: paraphrase only, reference by control ID, and link users to their licensed copy.
3. **Framework control data comes from SCF.** Don't hand-maintain crosswalks. If SCF is missing something, open an issue here and also file upstream at [securecontrolsframework.com](https://securecontrolsframework.com).
4. **Every connector conforms to [`schemas/finding.schema.json`](../schemas/finding.schema.json) v1.** There's a contract test. It runs in CI. Non-conforming output fails the build.
5. **No credentials in the repo.** Connectors rely on the tool's existing credential story (AWS profiles, gcloud ADC, `gh auth`, etc.). If you need a new credential type, document precedence and environment variables: don't add a novel secret store.

## How to add a connector

A connector is a plugin that wraps an external inspector tool and emits conformant Findings. The pattern is:

```
plugins/connectors/<tool>/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── setup.md          # /my-tool:setup
│   ├── collect.md        # /my-tool:collect
│   └── status.md         # /my-tool:status
├── skills/
│   └── <tool>-expert/
│       └── SKILL.md      # teaches Claude the tool's output + failure modes
├── scripts/
│   ├── setup.sh          # idempotent install
│   ├── collect.sh        # runs the tool, translates output → Finding schema
│   └── status.sh         # auth + last-run check
└── tests/
    └── fixtures/         # sample Finding JSON for contract tests
```

### Step by step

**1. Pick a tool.** It should:

- Have a stable CLI or SDK (not just a UI).
- Emit some kind of structured output (JSON ideal; text or CSV workable with a parser).
- Have a credential story that users can replicate without help from the connector (cloud profiles, OAuth token, etc.).

**2. Create the plugin scaffold.**

```bash
mkdir -p plugins/connectors/<tool>/{commands,skills/<tool>-expert,scripts,tests/fixtures}
```

**3. Write `plugin.json`.**

```json
{
  "name": "<tool>-inspector",
  "version": "0.1.0",
  "description": "Connector for <tool>. Emits GRC findings against SCF + SOC 2/NIST/ISO/…",
  "author": { "name": "you", "email": "you@example.com" },
  "license": "MIT",
  "repository": "https://github.com/GRCEngClub/claude-grc-engineering",
  "keywords": ["grc", "compliance", "<tool>"]
}
```

**4. Implement `/<tool>:setup`.**
Idempotent install. Should:

- Detect if the external tool is already installed and usable; if so, just verify config.
- Otherwise, clone it into `~/.local/share/claude-grc/tools/<tool>/` and build or `pip install`.
- Verify credentials (run a read-only no-op call).
- Write `~/.config/claude-grc/connectors/<tool>.yaml` with the connector's config:

  ```yaml
  version: 1
  source: <tool>-inspector
  tool_path: /Users/you/.local/share/claude-grc/tools/<tool>/run
  auth:
    method: env|profile|token_file
    env_var: <TOOL>_API_TOKEN   # if method=env
  defaults:
    scope: ...
  ```

- Emit a clear success message and a dry-run summary.

**5. Implement `/<tool>:collect`.**
This is the core. It should:

- Load the config file.
- Invoke the tool, capturing stdout.
- Translate the tool's native output into an array of Findings conforming to the schema.
- Write results to `~/.cache/claude-grc/findings/<tool>-inspector/<run_id>.json`.
- Append a run manifest to `~/.cache/claude-grc/runs.log`.
- Print a one-line summary: `<tool>: <N> resources, <M> evaluations, <K> findings (<x> high, <y> medium, <z> low).`

Accepted flags: `--refresh`, `--scope=<filter>`, `--output={json|silent}`, `--dry-run`.

**6. Implement `/<tool>:status`.**
Shows: configured? credentials valid? last successful run? cache freshness? To-do work queue?

**7. Write the SKILL.md.**
Teach Claude:

- What this connector does
- The tool's native output shape
- Common failure modes (auth errors, rate limits, permission gaps) and how to recognize + recover
- Which controls the connector evaluates well vs. poorly (honesty > coverage claims)
- Example inputs/outputs

**8. Add contract fixtures.**
Put at least 3 sample Findings in `tests/fixtures/`:

- One with `status=pass`, `severity=info`
- One with `status=fail`, `severity=high`, `remediation` populated
- One with `status=inconclusive` and a clear `message`

**9. Run the contract test.**

```bash
npm run test:contract -- --source=<tool>-inspector
```

Fixtures must validate against `schemas/finding.schema.json`. Mixed types, missing required fields, or unresolvable `control_id`s will fail.

**10. Register the plugin.**
Add an entry to `.claude-plugin/marketplace.json`. Submit a PR.

## Control mapping: use SCF

When your connector evaluates a resource, the `evaluations` array should prefer SCF control IDs:

```json
"evaluations": [
  {"control_framework": "SCF", "control_id": "IAC-10", "status": "pass"}
]
```

SCF is the canonical vocabulary. From SCF, `/gap-assessment` can reach any of 249 frameworks via crosswalk. If you emit SOC 2 or NIST directly, that also works: the reverse crosswalk is consulted: but SCF is the shortest path to everywhere.

To look up SCF controls relevant to your tool's domain:

```bash
curl https://grcengclub.github.io/scf-api/api/families.json | jq '.[] | {code, name, control_count}'
curl https://grcengclub.github.io/scf-api/api/families/IAC.json | jq
```

## How to add or improve a framework plugin

For the full spec — depth tiers, level-up checklists, minimum plugin structure, anti-patterns, and review bar — see the [**Framework Plugin Guide**](FRAMEWORK-PLUGIN-GUIDE.md). Short version:

- To **add a new framework plugin**, use the scaffolding command: `node plugins/grc-engineer/scripts/scaffold-framework.js <scf-framework-id> [--depth=stub|reference]`. Then fill in the `TODO:` markers.
- To **improve an existing framework plugin**, level it up toward Reference or Full depth using the checklists in the guide.
- To **discover which SCF frameworks don't have plugins yet**, run `/grc-engineer:frameworks --not-installed`.

Framework plugins are for implementation guidance, assessment workflows, and evidence checklists: not normative standard text. The bar for contributions:

- **Add implementation guidance** (AWS/GCP/Azure/K8s patterns): high value
- **Add evidence collection patterns**: high value
- **Add SCF control ID references**: high value
- **Paraphrase or summarize the framework's requirements**: acceptable if paraphrased in your own words
- **Copy verbatim control text from the standard**: rejected

## Quality bar

PRs should include:

- A short description of the user problem the change solves
- Contract tests (for connectors) or golden-file tests (for commands that produce reports)
- A note in `CHANGELOG.md` if behavior changes

Reviewers will look for:

- Does it actually work end-to-end against real data?
- Does it fail gracefully when credentials/network/tools are broken?
- Is the output schema-conformant and the user-facing text clear?
- Does it earn its place in the toolkit (vs. something a user could script in 10 lines)?

## Recognition

Everyone who lands a merged PR shows up on the [contributors graph](https://github.com/GRCEngClub/claude-grc-engineering/graphs/contributors). That's the source of truth — no separate file to maintain, no bot to invoke.

## Security

- **Reporting vulnerabilities**: open a [private security advisory](https://github.com/GRCEngClub/claude-grc-engineering/security/advisories/new) on GitHub. Don't file public issues for security problems.
- **Secrets**: never commit credentials, tokens, org IDs, or internal URLs. Run a local secret scanner before pushing: [`git-secrets`](https://github.com/awslabs/git-secrets), [`detect-secrets`](https://github.com/Yelp/detect-secrets), or [`trufflehog`](https://github.com/trufflesecurity/trufflehog). A shipped pre-commit hook is on the v0.2 roadmap; until then, the only gate is the one you run locally.
- **Evidence artifacts**: the evidence-checklist commands write to `evidence/` (gitignored). That directory holds real usernames, credential reports, MFA device states, and privileged-account inventories. Never commit it. If you find it in a PR, reject the PR and ask the contributor to rotate any exposed credentials. For GDPR-scoped work, raw exports may carry personal data subject to Art. 5 minimization and storage-limitation rules: keep only what you need and delete on a schedule.

## Questions?

Open a discussion at https://github.com/GRCEngClub/claude-grc-engineering/discussions. "How would I add a connector for X?" is a welcome question.
