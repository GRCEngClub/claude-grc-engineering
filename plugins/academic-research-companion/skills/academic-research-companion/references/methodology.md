# Phase 3: Methodology

Goal: a defensible research design — the part reviewers attack first and the part hardest to fix after data collection.

## Match method to question

The question's verb usually points at the method:
- "How many / how much / what predicts / does X affect Y" → **quantitative** (analysis of datasets, content coding with counts, experiments/quasi-experiments)
- "How / why / what does it mean / how do people experience" → **qualitative** (interviews, case studies, document analysis, grounded theory)
- "What would a good X look like / does this artifact work" → **design science** (build artifact → evaluate against defined criteria → reflect)
- "What does the literature say" → **systematic/scoping review** (PRISMA-guided)
- Both breadth and depth needed → **mixed methods** (sequence them deliberately; don't bolt on)

Push the user to justify the choice from the question, not from comfort. An engineer defaulting to "build a tool" for a question that's really about human behavior is a common mismatch.

## Design skeleton to produce

Whatever the method, the written design should specify, before any data is touched:
1. **Unit of analysis** — what exactly is being studied (documents? incidents? agencies? tool runs?)
2. **Sampling/selection** — which cases, why those, what's excluded, and what the selection can and cannot generalize to
3. **Data collection procedure** — repeatable by a stranger from the description alone
4. **Analysis plan** — coding scheme, statistical tests, or evaluation criteria, decided in advance
5. **Threats and limitations** — named by the author before a reviewer names them

## Rigor vocabulary (use it, in field-appropriate form)

- Quantitative: internal/external/construct validity, reliability, statistical power (underpowered studies are the classic independent-researcher trap — small n limits what can be claimed)
- Qualitative: credibility, transferability, dependability, confirmability; triangulation; thick description; reflexivity (the user's practitioner role is a lens to declare, not hide)
- Design science: evaluation must be against pre-stated criteria/benchmarks, ideally with a comparison baseline — "I built it and it works" is a demo, not research

## Ethics and human subjects — flag early and honestly

- **Human-subjects research** (interviews, surveys, observation of people) normally requires IRB/ethics review. Independent researchers lack a home IRB. Options, in rough order of preference: redesign around public/secondary data; partner with an affiliated co-author whose institution's IRB can review (see `authorship-collaboration.md`); use a commercial/independent IRB (costs money); as a student, ask whether UMGC provides IRB review for student research. Publishing human-subjects work with **no** ethics review will block most reputable venues and is an integrity problem regardless of venue.
- **Sensitive professional data**: the user works inside government systems. Anything drawn from work must be public, authorized, or fully abstracted — when in doubt, treat it as off-limits and say so. Never let the convenience of insider knowledge contaminate a public research artifact.
- **Dual-use**: for security topics, consider whether methods/results meaningfully lower the bar for attack. Follow coordinated-disclosure norms where applicable.

## Reproducibility (cheap credibility for an independent researcher)

- Preregister the design on OSF when the study is confirmatory — timestamped plans defuse "you fished for this result"
- Publish data and code (GitHub/Zenodo) wherever legally possible
- Version the analysis; a stranger should be able to rerun it

These practices cost little and are exactly how unaffiliated work earns trust.

## Exit criteria for Phase 3

- Written design covering the 5-point skeleton
- Ethics status resolved (not applicable / redesigned / review path identified)
- Limitations list started (it will grow)
- Realistic timeline attached to each design step
- Decision log updated with the method choice and rejected alternatives
