---
name: evidence-checklist
description: Evidence checklist for NIST AI 600-1, organized by the four primary considerations and the twelve GAI risks
---

# NIST AI 600-1 Evidence Checklist

Lists evidence that shows generative AI risks are being managed in the way
the profile suggests. The SCF crosswalk maps 139 SCF controls to 250 profile
and suggested-action items; this command names the generative-AI artifacts
behind them. Items reference AI RMF subcategories, which is how the profile
keys its suggested actions (a suggested action such as `MS-2.7-xxx` sits
under AI RMF `MEASURE 2.7`).

## Usage

```bash
/nist-ai-600-1:evidence-checklist [--risks=<gai-risk-list>] [--system=<ai-system-id>]
```

## Arguments

- `--risks` (optional) - limit the risk-specific section to the GAI risks
  chosen in `/nist-ai-600-1:scope`. Defaults to all twelve.
- `--system` (optional) - tailor items to one generative AI system.

## Output

A Markdown checklist in three parts: the AI RMF baseline the profile
assumes, the four primary considerations, and evidence per GAI risk. Each
item names the AI RMF subcategories it supports and whether a connector can
collect it.

## Part 1: AI RMF baseline

The profile builds on an AI RMF program. Confirm these exist first; if they
do not, run `/nist-ai-rmf:evidence-checklist`.

- AI policy that explicitly covers generative AI, including acceptable use
  for employees (GOVERN 1.1, 1.2).
- AI system inventory that lists generative AI systems and generative
  features inside purchased tools (GOVERN 1.6).
- Named owners and an approval path for releasing generative AI systems
  (GOVERN 2.1, 2.3).
- Third-party AI policy covering foundation model providers and their terms
  (GOVERN 6.1).

## Part 2: Primary considerations

The profile highlights four areas from NIST's public working group.

**Governance**

- Generative AI risk tolerance and use restrictions, approved by leadership
  (GOVERN 1.3, 1.4).
- Review that legal, privacy, security, and affected-business owners sign off
  before release (GOVERN 4.1, MAP 1.2).

**Content provenance**

- Decision record on whether generated content is labeled, watermarked, or
  carries provenance metadata, and for which outputs (MEASURE 2.8, MANAGE 4.1).
- Technical configuration or vendor documentation for the provenance method
  used.
- Records of provenance checks on inbound content where the organization
  relies on authenticity (MEASURE 2.7).

**Pre-deployment testing**

- Test plan and results for the selected GAI risks, with datasets, prompts,
  and metrics documented (MEASURE 2.1, 2.3).
- Red-team report: scope, testers and their independence, attack categories,
  findings, and fixes (MEASURE 2.6, 2.7, 1.3).
- Evaluation of the model in the deployment setting, not only vendor
  benchmarks (MEASURE 2.3, 4.1).

**Incident disclosure**

- Incident response procedure that covers AI-specific incidents, such as
  harmful outputs, data leakage through prompts, jailbreaks, and confabulated
  advice that caused harm (MANAGE 4.3, GOVERN 4.3).
- AI incident log with severity, root cause, and remediation.
- Criteria and contacts for disclosing incidents to affected people,
  customers, vendors, or authorities (MANAGE 4.3).

## Part 3: Evidence per GAI risk

**CBRN information or capabilities**

- Model provider safety documentation and the organization's review of it
  (GOVERN 6.1, MAP 4.1).
- Test results showing refusals or filtering for dangerous technical requests
  in the deployed configuration (MEASURE 2.6).

**Confabulation**

- Accuracy and groundedness evaluation results for the system's real tasks
  (MEASURE 2.5).
- User-facing notices and design choices that keep a human checking outputs
  that matter (MAP 3.5, GOVERN 3.2).
- Citation or retrieval grounding configuration, where used (MAP 2.2).

**Dangerous, violent, or hateful content**

- Content filtering or moderation configuration and its test results
  (MEASURE 2.6, MANAGE 2.2).
- Abuse reporting channel and the reports handled (MEASURE 3.3).

**Data privacy**

- Data flow map for prompts, retrieval sources, logs, and any training or
  fine-tuning data (MAP 4.1).
- Privacy impact assessment for the system (MEASURE 2.10, MAP 5.1).
- Vendor terms on prompt retention and training use, and the settings applied
  (GOVERN 6.1).
- Tests for leakage of personal data through outputs (MEASURE 2.10).

**Environmental impacts**

- Compute and energy estimates for training, fine-tuning, and inference, or
  the provider's published figures (MEASURE 2.12).

**Harmful bias and homogenization**

- Bias and performance-disparity testing across relevant groups and
  languages (MEASURE 2.11).
- Review of training or fine-tuning data representativeness, where the
  organization controls it (MAP 2.3).

**Human-AI configuration**

- Human oversight design: what a person must review before outputs take
  effect (MAP 3.5, GOVERN 3.2).
- User training and guidance on limits of the system (MAP 3.4).
- Monitoring for over-reliance, such as review-rate or override-rate metrics
  (MEASURE 2.4).

**Information integrity**

- Controls on publishing generated content, including labeling and review
  (MANAGE 2.2, MEASURE 2.8).
- Provenance decision record from Part 2.

**Information security**

- Threat model covering prompt injection, indirect injection through
  retrieved content, data exfiltration, model and weight theft, and tool or
  agent misuse (MAP 5.1, MEASURE 2.7).
- Security test and red-team results for those threats (MEASURE 2.7).
- Access control and logging on model endpoints, prompts, retrieval stores,
  and model weights (MEASURE 2.7; connectors can collect much of this).
- Least-privilege configuration for any tools or actions the system can
  invoke (MEASURE 2.7).

**Intellectual property**

- License and terms review for models, datasets, and retrieval sources
  (MAP 4.1, GOVERN 6.1).
- Controls or tests for reproduction of protected material in outputs, and
  the vendor's indemnity terms if relied on (MANAGE 3.1).

**Obscene, degrading, and/or abusive content**

- Filtering configuration and test results for sexual and abusive content,
  including specific blocks for CSAM and nonconsensual intimate imagery
  (MEASURE 2.6).
- Reporting and takedown procedure (MANAGE 4.3).

**Value chain and component integration**

- Component inventory: base model and version, fine-tunes, embeddings,
  plugins, datasets, and APIs (MAP 4.1).
- Vendor due diligence and monitoring records, including model version change
  notices and re-testing after changes (MANAGE 3.1, 3.2).
- Contingency plan if a provider changes or withdraws a model (GOVERN 6.2).

## What connectors can collect

Connectors cover the infrastructure around generative AI systems: access to
model endpoints and data stores, logging, and change control for prompts and
code (`aws-inspector`, `gcp-inspector`, `github-inspector`, `okta-inspector`).
Test reports, red-team results, provenance decisions, and incident records
are manual uploads. Assign each to an owner instead of marking it as a gap
automatically.
