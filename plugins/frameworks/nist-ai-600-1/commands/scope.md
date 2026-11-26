---
description: Determine which generative AI systems and GAI risks are in scope for NIST AI 600-1
---

# NIST AI 600-1 Scope

Sets the scope for Generative AI Profile work: which systems generate content,
what role the organization plays for each, and which of the twelve GAI risks
apply. The profile is voluntary and cross-sectoral, so the output is a scoped
risk list, not an applicability verdict.

## Usage

```bash
/nist-ai-600-1:scope
```

## What this produces

- **Generative AI system list**: each system that generates text, images,
  audio, video, or code, with owner, purpose, and model source (built,
  fine-tuned, hosted foundation model, or a feature inside a vendor product).
- **Role per system**: developer of the model, developer of an application on
  top of a model, deployer, or a combination. The profile's suggested actions
  differ in who can carry them out.
- **Risk scope dimensions** the profile uses to describe each risk:
  - lifecycle stage (design, development, deployment, operation,
    decommissioning);
  - scope (model or system, application, or ecosystem level);
  - source (design, training, operation, inputs, outputs, or human behavior,
    including misuse);
  - time scale (sudden or over a long period).
- **GAI risk selection**: which of the twelve risks are relevant for each
  system, with a one-line reason for each risk kept or dropped.
- **Primary considerations** that need attention: governance, content
  provenance, pre-deployment testing, and incident disclosure.
- **Next steps**: `/nist-ai-600-1:evidence-checklist` for the selected risks,
  then `/nist-ai-600-1:assess`. If the organization has no AI RMF baseline,
  run `/nist-ai-rmf:scope` too.

## Questions to ask

1. Which systems generate content? Include chat assistants, coding
   assistants, summarizers, image generators, agents that take actions, and
   generative features inside SaaS tools.
2. For each: which model is underneath, who hosts it, and was it fine-tuned
   or given retrieval access to internal data?
3. Who uses it (employees, customers, the public), and can outputs reach
   people outside the organization without review?
4. What data can it see? Personal data, regulated data, source code, trade
   secrets?
5. Can it take actions (send email, run code, call APIs, change records), or
   only produce text for a person to act on?
6. Is generated content labeled, watermarked, or tracked for provenance?
7. Has the system been red-teamed or otherwise tested before release? Is
   there an incident process that covers AI-specific failures?
8. Which other obligations apply: EU AI Act transparency or general-purpose
   AI model duties, sector rules, privacy law, copyright licensing terms,
   customer contracts?

## Choosing GAI risks

All twelve risks are listed below with a typical trigger. Keep a risk when the
trigger is present; drop it with a reason when it is not.

| GAI risk | Usually in scope when |
|---|---|
| CBRN information or capabilities | The model is general-purpose, public-facing, or able to search and synthesize technical material |
| Confabulation | Outputs are relied on as fact: answers, summaries, code, citations |
| Dangerous, violent, or hateful content | Users can prompt freely or outputs reach the public |
| Data privacy | The model sees personal data in prompts, retrieval, fine-tuning, or training |
| Environmental impacts | The organization trains or fine-tunes models, or runs inference at large scale |
| Harmful bias and homogenization | Outputs affect people differently by group or language, or shape decisions about people |
| Human-AI configuration | People may over-trust outputs, treat the system as a person, or lose skills by relying on it |
| Information integrity | The system generates content others will read as authoritative or publish |
| Information security | Always in scope: prompt injection, data leakage, model or weight theft, and misuse for attacks |
| Intellectual property | Outputs could reproduce licensed or copyrighted material, or inputs include trade secrets |
| Obscene, degrading, and/or abusive content | The system can generate images, video, or unrestricted text |
| Value chain and component integration | The system relies on third-party models, datasets, plugins, or APIs |

Information security and value chain risk apply to almost every deployment.
Confabulation applies to almost every text-generating system.

Return the system list with roles, the selected GAI risks per system with
reasons, the primary considerations that need work, and the next command.
