# reporter

Translate findings, risks, and metrics into narratives leadership actually reads.

This plugin is for the GRC practitioner who needs to communicate up. The CISO, the audit committee, the board, the CEO on a 1:1. You've done the work. This plugin helps you convey the so-what.

Reference implementation of the Reporting category proposed in [RFC #38](https://github.com/GRCEngClub/claude-grc-engineering/issues/38), shipping per migration-plan step 5.

## Install

```text
/plugin install reporter --marketplace GRCEngClub/claude-grc-engineering
```

On Claude Code older than 2.1.275, add the marketplace first with `/plugin marketplace add GRCEngClub/claude-grc-engineering`, then run `/plugin install reporter@grc-engineering-suite`.

## Commands

| Command | Purpose |
| --- | --- |
| `/report:exec-summary` | Weekly 1-page for the CISO and direct leadership |
| `/report:board-brief` | Quarterly audit-committee or board-ready narrative |
| `/report:program-health` | Portfolio view across every framework in scope, sized for CISO 1:1s |
| `/report:automation-coverage` | Week-over-week automation coverage plus ROI narrative. Where GRC engineers prove their worth. |

## How it works

Heavy auto-discover when your toolkit has context. Heavy ask-and-guide when it doesn't.

If you have findings cached, a risk register, and framework plugins installed, commands read all that up front and only ask you the one or two things Claude can't infer (audience, material asks, quarter, incident timeline).

If you're starting cold, commands walk you through setup. Install `engineer`, at least one connector, at least one framework plugin, run a collect, then come back. Hollow reports are worse than no reports.

Risk and metric records referenced by this plugin follow
[`docs/GRC-DATA.md`](../../../docs/GRC-DATA.md).

For automation coverage specifically, seed weekly snapshots with
`/engineer:record-automation-metrics`.

## Output

Markdown files saved to `./grc-reports/<command>-<period>.md` by default. Pipe to pandoc for PDF or DOCX when you need to hand it to a human who expects one.

## Skills

- `so-what-translation` - the core craft. Lead with business impact, not control IDs.
- `exec-narrative-patterns` - audience modulation. Board vs audit committee vs CEO vs weekly CISO.
- `program-portfolio-composition` - cross-framework synthesis without overwhelming the reader.
- `automation-coverage-analysis` - week-over-week delta storytelling, automation ROI framing.
- `context-bootstrap` - setup guidance when the toolkit is empty.

## Status

Pre-1.0 reference implementation. Feedback on commands, naming, and voice is
welcome in repo issues or [RFC #38](https://github.com/GRCEngClub/claude-grc-engineering/issues/38).
