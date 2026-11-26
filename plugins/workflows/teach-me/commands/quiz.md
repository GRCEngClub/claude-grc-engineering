---
description: Socratic drill on a framework — asks application-level questions and grades your answers until you say stop
---

# /teach-me:quiz

Drill yourself on a framework with application-level questions. Ask, evaluate, ask again. Inspired by [`mattpocock/skills/grill-me`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me).

## Usage

```
/teach-me:quiz <framework> [--focus=<area>] [--difficulty=<level>]
```

## Arguments

- `<framework>` (required) — common name or SCF framework ID. Same resolution as `/teach-me:framework`.
- `--focus=<area>` (optional) — narrow the quiz to a control family or domain (e.g. `--focus=access-control` for IAM-heavy questions, `--focus=incident-response`). Skill resolves the area against the framework's control families.
- `--difficulty=<level>` (optional) — `apprentice` (definitions and scope), `practitioner` (application and edge cases), `audit-defense` (the hard ones — explaining decisions to an assessor). Default `practitioner`.

## How a session goes

1. The skill picks a control or scenario from the framework's mapped SCF controls.
2. It poses an **application-level question** — "your IAM admin enabled MFA for human users but not for service accounts. Which control fails and why?" — not a definition lookup.
3. The user answers in plain language.
4. The skill evaluates: correct, partially correct (with what's missing), or incorrect (with what to look up). It cites the control ID being tested.
5. The skill picks the next question — biased toward control families the user hasn't covered yet in this session.
6. After every 5 questions, the skill summarizes: which families covered, which still untouched, recurring weak spots.
7. User says `stop`, `enough`, or `done` to end. Final summary printed.

## What this produces

A back-and-forth Q&A loop in the terminal. No file output, no scoring history persisted. State is the current CLI session only.

## Delegation

The `socratic-drill` skill drives the loop. It calls:

- `/grc-engineer:frameworks` to validate the framework target.
- The SCF API to enumerate the framework's mapped controls.
- The framework plugin's `<framework>-expert` skill for application context that goes beyond the control text.

## What the quiz will not do

- **Not reproduce normative standard text** in either questions or evaluations. Paraphrased application scenarios only.
- **Not certify the user** for anything. This is a study aid, not an exam-prep platform.
- **Not persist results** in v0.1. A future version may write a coverage map under `grc-data/learning/` if the user opts in.

## Examples

```
/teach-me:quiz SOC2
/teach-me:quiz FedRAMP --focus=access-control --difficulty=audit-defense
/teach-me:quiz "ISO 27001" --difficulty=apprentice
```
