# CLAUDE.md

Guidance for Claude Code when working in this repository.

@AGENTS.md

## What this repo is

The open-source Claude Code plugin marketplace of the [GRC Engineering Club](https://grcengclub.com) for governance, risk and compliance work. `.claude-plugin/marketplace.json` is the authoritative plugin list (marketplace name: `grc-engineering-suite`).

| Kind | Where | Notes |
|---|---|---|
| Personas | `plugins/personas/` | `engineer` (script-backed), `auditor`, `internal`, `tprm` (prompt-only) |
| Frameworks | `plugins/frameworks/` | One per framework, mostly prompt-only. [docs/FRAMEWORK-COVERAGE.md](docs/FRAMEWORK-COVERAGE.md) is the generated list |
| Connectors | `plugins/connectors/` | Script-backed. Emit Findings matching `schemas/finding.schema.json` |
| Reporting | `plugins/reporting/` | `reporter`, `diagrams`, `compliance-posture` (local dashboard) |
| Workflows | `plugins/workflows/` | `loop`, `teach-me`, `oscal`, `gcp-docs`, `academic-research-companion` |

Every plugin sits exactly one level below a category folder; `schemas/marketplace.schema.json` enforces it. `portfolio` is listed in the marketplace but lives in [GRCEngClub/grc-portfolio](https://github.com/GRCEngClub/grc-portfolio).

## Layout

```
.claude-plugin/marketplace.json   # every plugin is registered here
plugins/<category>/<plugin>/
  .claude-plugin/plugin.json      # manifest; nothing else goes in this folder
  commands/<name>.md              # user-invoked: /<plugin>:<name>
  skills/<name>/SKILL.md          # model-invoked expertise
  hooks/hooks.json                # optional
  scripts/, src/, config/         # script-backed plugins only
tools/                            # repo maintenance: scaffold-framework, generate-coverage, assessment scripts
schemas/                          # Finding, plugin, marketplace and grc-data schemas
tests/                            # node:test suites, contract fixtures, validators
docs/                             # architecture, contributing, guides
```

## How plugins reach users, and the rules that follow

Claude Code installs a plugin by copying its folder, alone, into `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`. Nothing outside the folder comes along: no repo-root `node_modules`, no sibling plugins, no `schemas/`. Code that works in a clone can still be broken for every installed user. CI enforces every rule below except the last; [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md#plugin-rules-that-ci-enforces) explains them.

- A plugin is self-contained. Scripts import only Node built-ins and files inside their own plugin. `engineer` vendors `js-yaml` in `vendor/`.
- Commands, skills and hooks call scripts as `node "${CLAUDE_PLUGIN_ROOT}/scripts/x.js"`, never `node plugins/.../scripts/x.js`. CI examples that check out this repo are the exception.
- Every script handles `--help` without collecting, writing or using the network.
- Every command and `SKILL.md` has frontmatter with a `description`.
- In command files, Claude Code replaces `$0`, `$1`, ... with the typed arguments (counting from 0) wherever they appear. Escape literal ones (`\$1,000`, `awk '{print \$1}'`), describe arguments in words, and use `$ARGUMENTS` for the typed text.
- `plugin.json` uses only fields Claude Code knows. Repo-specific data goes under `metadata` (framework plugins: `metadata.framework`).
- Plugin output goes to the user's working directory or `~/.cache/claude-grc/`, never to a path computed from the plugin's own location.

## Common tasks

- **New framework plugin**: `node tools/scaffold-framework.js <scf-framework-id>` creates the folder and registers it. Depth tiers (Stub, Reference, Full) are defined in [docs/FRAMEWORK-PLUGIN-GUIDE.md](docs/FRAMEWORK-PLUGIN-GUIDE.md). Afterwards run `npm run generate-coverage`.
- **New connector**: follow [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md#how-to-add-a-connector). Add contract fixtures under `tests/fixtures/`.
- **New `engineer` command**: add `commands/<name>.md`, `scripts/<name>.js` (logic in `src/` when shared), and a test in `tests/`.
- **Any new plugin**: add it to `.claude-plugin/marketplace.json` and to the README plugin table.
- **Try a plugin locally**: `claude --plugin-dir ./plugins/<path-to-plugin>`.

## Checks

Run what CI runs before pushing:

```bash
npm ci
npm run test:unit              # every tests/*.test.{js,mjs,cjs}
npm run test:contract          # fixtures against every schema
npm run test:plugin-manifests  # repo schemas for plugin.json and marketplace.json
npm run test:claude-validate   # claude plugin validate --strict, marketplace and every plugin
```

`CHANGELOG.md` gets an entry under `[Unreleased]` for any behavior change.

## Versions

Every `plugin.json` carries `version`, and installed users stay on their cached copy until that string changes. A merged fix does not reach them until the plugin's version is bumped.

## Licensing

Plugins are MIT, except `cis-controls`, which is `CC-BY-SA-4.0 AND MIT`. The toolkit references control IDs and implementation guidance; it does not reproduce copyrighted standards text.

## Issue tracking (Linear)

This repo ships a **project-scoped** Linear MCP server in `.mcp.json` named `linear-grc-club`, pointing at `https://mcp.linear.app/mcp`. It loads only when Claude Code starts in this directory and does not affect MCP configuration in any other repo.

**First-time setup per machine:**

1. Start a Claude Code session in this directory.
2. Run `/mcp` and authenticate `linear-grc-club` via OAuth.
3. **Select the GRC Engineering Club workspace** at the consent screen (not a personal Linear). OAuth tokens are stored in the user's Claude config, not in the repo.

Linear operations from this repo should target the GRC Engineering Club workspace through the `linear-grc-club` MCP. If a global `claude.ai Linear` MCP is also active in the session (authenticated to a different workspace), prefer the project-scoped tools so issues land in the right workspace.

**Default Linear scope for toolkit work:**

- **Team**: `GRC Engineering Club` (key `GRC`) — ID `f11daee3-f05b-4410-bcee-2e76df7acb91`
- **Project (default for toolkit issues)**: [`Claude GRC Engineering Toolkit`](https://linear.app/grc-engineering-club/project/claude-grc-engineering-toolkit-8f6001008c85) — ID `f6ae9cc5-5bfc-496b-b938-c00fe51bafbe`

Day-to-day bug reports and feature requests should still be filed as GitHub issues on this repo. Use the Linear project for cross-cutting toolkit work — roadmap, RFCs, releases, contributor coordination, and threads that span multiple GitHub issues.

## Where the detail lives

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): plugin categories, the Finding contract, data flow
- [docs/ENGINEER-WORKFLOWS.md](docs/ENGINEER-WORKFLOWS.md): cross-framework mapping, code generation, IaC scanning, control testing, monitoring, access review triage
- [docs/GRC-DATA.md](docs/GRC-DATA.md): the user-owned `grc-data/` state and its schemas
- [docs/ENTERPRISE-DEPLOYMENT.md](docs/ENTERPRISE-DEPLOYMENT.md): Amazon Bedrock and Google Vertex AI
- [docs/QUICKSTART.md](docs/QUICKSTART.md): the user-facing install and first run
