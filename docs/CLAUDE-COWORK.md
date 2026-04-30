# Claude Cowork Compatibility

Claude Cowork brings Claude Code-style agent work into a desktop workflow for
knowledge workers. This repository is still authored as a Claude Code plugin
marketplace, but most of the useful GRC material is plain Markdown, JSON
schemas, scripts, commands, and skills that Cowork can work with when the repo
folder is available to the session.

Official Cowork overview: <https://www.anthropic.com/product/claude-cowork>

## What Works Well

Use Cowork for document-heavy and file-heavy GRC work:

- reviewing framework plugin guidance under `plugins/frameworks/*`
- drafting assessment plans from command docs in `plugins/*/commands/`
- summarizing findings, risks, metrics, and vendor records under `grc-data/`
- editing Markdown deliverables, evidence checklists, and workpaper drafts
- preparing PR-ready documentation changes for this repository

These workflows do not require shell access beyond Cowork's normal file editing
and document generation capabilities.

## What Still Needs Claude Code Or A Shell

Some toolkit commands intentionally wrap local CLIs or scripts. Run these from
Claude Code or a terminal-backed environment when the workflow needs to execute:

| Workflow | Why |
| --- | --- |
| Plugin install commands | Claude Code plugin manager commands |
| Connector setup and collection | Requires local CLIs or inspector tools |
| `npm run test:contract` | Requires Node.js dependencies and shell execution |
| Manifest validation | Requires Node.js dependencies and shell execution |
| `/grc-engineer:monitor-continuous` | Emits scheduler artifacts and may run scripts |
| OSCAL conversion commands | Wraps external OSCAL tooling |

If Cowork has shell execution available in your environment, the same command
docs remain useful as runbooks. If it only has file access, ask Cowork to prepare
the config, evidence request, or report draft, then run the command from Claude
Code or CI.

## Recommended Cowork Folder Layout

Give Cowork access to the repository plus any operator-owned GRC state you want
it to analyze:

```text
claude-grc-engineering/
|-- docs/
|-- plugins/
|-- schemas/
|-- grc-data/
|   |-- metrics/
|   |-- risks/
|   |-- exceptions/
|   |-- vendors/
|   `-- policies/
`-- evidence/
    `-- uploaded-artifacts/
```

Keep sensitive raw exports in `evidence/` or another clearly named folder. Use
`grc-data/` for curated records that should conform to the repository schemas.

## Cowork Prompt Patterns

Use direct, file-oriented prompts:

```text
Read docs/QUICKSTART.md and plugins/grc-engineer/commands/gap-assessment.md.
Draft a SOC 2 assessment plan for the findings in grc-data/ and list any
missing evidence as a table.
```

```text
Use plugins/frameworks/soc2 and plugins/grc-reporter as references. Turn the
latest metrics in grc-data/metrics into a weekly executive update in Markdown.
Do not invent missing values; call out gaps explicitly.
```

```text
Review plugins/frameworks/<framework>/skills/<framework>-expert/SKILL.md and
commands/evidence-checklist.md. Create an evidence request list for an external
auditor, grouped by owner and system.
```

## Compatibility Checklist For Contributors

When adding or updating plugins, keep the content useful in both Claude Code and
Cowork:

- Put domain guidance in `skills/*/SKILL.md`, not only in shell scripts.
- Keep command docs self-contained enough that Cowork can use them as runbooks.
- Document required external CLIs in `commands/setup.md` and plugin READMEs.
- Prefer schema-backed JSON examples in `tests/fixtures/` or `grc-data/`.
- Avoid assuming every user can execute commands from the active session.
- For generated reports, make the output path and source files explicit.

## Quick Compatibility Matrix

| Plugin type | Cowork fit | Notes |
| --- | --- | --- |
| Persona plugins | Strong | Mostly Markdown workflows and structured prompts |
| Framework plugins | Strong | Skills and command docs work as references |
| Reporter plugin | Strong | Works well with `grc-data/` files and cached findings |
| Connector plugins | Mixed | Setup and collection usually need CLI execution |
| Dashboard plugin | Mixed | Editing works; running the app needs a local server |
| OSCAL plugin | Mixed | Guidance is useful; conversion requires external tools |

## Security Notes

- Treat Cowork folder access as intentional data access. Only include evidence
  files that are appropriate for the task.
- Keep secrets out of Markdown and JSON fixtures.
- Use connector caches and `grc-data/` records for normalized, reviewable state
  instead of pasting raw credentials or exports into prompts.
- Verify final regulatory or audit conclusions with the appropriate accountable
  owner; this toolkit provides engineering guidance, not legal advice.
