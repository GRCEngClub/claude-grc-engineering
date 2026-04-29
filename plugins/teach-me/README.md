# teach-me

Get up to speed on a framework, control, or GRC role. Built for the practitioner who **doesn't already know the framework** — career transitioners, new hires, engineers asked to own a control they've never touched.

```bash
/plugin install teach-me@grc-engineering-suite

/teach-me:framework SOC2          # primer on a framework
/teach-me:control SCF-IAC-01      # one control across every framework it maps to
/teach-me:role grc-engineer       # "I just got hired as X — what now?"
/teach-me:quiz FedRAMP            # Socratic drill, asks until you've got it
```

## What this plugin is

Every other framework plugin in this toolkit assumes you already know the framework. `teach-me` is the on-ramp that gets you there.

- `/teach-me:framework` — paraphrased primer on a framework's purpose, scope, mandatory artifacts, cadence, and regulator. Names control families and points at the framework's own plugin (`/soc2:scope`, `/fedramp-rev5:assess`, etc.) for the next step. Does not reproduce copyrighted standard text.
- `/teach-me:control` — pulls a control from the [SCF crosswalk](https://grcengclub.github.io/scf-api/) and explains it once, with the mapped framework controls listed below. Useful when "what does CHG-02 mean and where does it show up?" is the actual question.
- `/teach-me:role` — what a `grc-engineer`, `grc-auditor`, `grc-internal`, or `grc-tprm` practitioner does day-to-day, what they touch in this toolkit, and where to start.
- `/teach-me:quiz` — Socratic drill (inspired by [`mattpocock/skills/grill-me`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me)). Asks you a control-application question, evaluates your answer, asks another. Tracks which control families you've covered. Stops when you say so.

## What this plugin is not

- Not a substitute for reading the framework. The user's licensed copy of SOC 2, FedRAMP Rev 5, ISO 27001, etc. is still the source of truth. This plugin paraphrases and points; it does not reproduce normative text.
- Not an exam-prep tool. The quiz drills application, not memorization.
- Not stateful. v0.1 holds quiz coverage in the current CLI session only. No history, no scoring, no leaderboard.

## Reuse, not rebuild

`/teach-me:control` delegates to `/grc-engineer:map-controls-unified` for crosswalk lookups. `/teach-me:framework` delegates to `/grc-engineer:frameworks` for coverage and depth metadata. The tutor doesn't duplicate the SCF client.

## Status

v0.1.0 — first cut. Feedback welcome on issue [#61](https://github.com/GRCEngClub/claude-grc-engineering/issues/61).
