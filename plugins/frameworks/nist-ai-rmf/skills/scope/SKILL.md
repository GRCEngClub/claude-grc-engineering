---
name: scope
description: Determine which AI systems, lifecycle stages, and AI RMF outcomes are in scope
---

# NIST AI RMF Scope

Sets the scope for AI RMF work: which AI systems, which organizational role,
which lifecycle stages, and which outcomes matter most. AI RMF is voluntary and
use-case agnostic, so "does it apply?" is rarely the question. The useful
questions are what the organization is using it for and which systems it
covers.

## Usage

```bash
/nist-ai-rmf:scope
```

## What this produces

- **Purpose statement**: why the organization is adopting AI RMF (internal risk
  program, customer or procurement requirement, alignment with a regulation,
  board request). The purpose drives how much evidence is needed.
- **AI system inventory extract**: each in-scope system with owner, purpose,
  model type, whether it is built in-house, fine-tuned, or bought, and the
  people it affects.
- **Organizational role per system**: developer, deployer, or both. AI RMF
  describes many AI actor roles across the lifecycle; for scoping, collapse
  them to what the organization actually does.
- **Lifecycle stages in scope**: plan and design, collect and process data,
  build and use the model, verify and validate, deploy and use, operate and
  monitor.
- **Risk tier per system**: a first-pass rating from intended use, affected
  people, autonomy, and reversibility of harm, used to decide how deep the
  MAP and MEASURE work goes.
- **Profile plan**: whether to build a current profile, a target profile, or
  both, and whether a use-case profile (for example hiring, lending, or
  clinical decision support) or the cross-sectoral Generative AI Profile
  (`/nist-ai-600-1:scope`) applies.
- **Next steps**: `/nist-ai-rmf:evidence-checklist` for the systems in scope,
  then `/nist-ai-rmf:assess`.

## Questions to ask

Ask only what is needed to fill in the outputs above:

1. Why is the organization using AI RMF now? Is a customer, contract, or
   regulator asking for it, or is it internal?
2. Which AI systems exist? Include vendor features with AI inside them (for
   example AI in an HR or CRM platform), not only models the organization
   builds. If there is no inventory, building one is the first finding.
3. For each system: who owns it, what decision or output it produces, and who
   is affected by that output (employees, customers, the public).
4. Is the system built, fine-tuned, or bought? Who holds the training data and
   model documentation?
5. Does the system make or materially shape decisions about people (access to
   jobs, credit, housing, healthcare, education, benefits, legal outcomes)?
6. How autonomous is it? Is a human reviewing outputs before they take effect?
7. Does any system generate content (text, images, code, audio)? If yes, add
   the Generative AI Profile.
8. Which other obligations apply to the same systems: the EU AI Act,
   sector rules, privacy law, ISO/IEC 42001 certification, customer contracts?
9. What is the organization's stated risk tolerance for AI, and who signs off
   on it?

## Scoping rules of thumb

- **Inventory first.** GOVERN 1.6 expects an inventory of AI systems. Most
  first assessments find the inventory is incomplete, especially for AI
  features inside purchased software.
- **GOVERN is organization-wide.** GOVERN outcomes apply once to the
  organization. MAP, MEASURE, and MANAGE outcomes apply per system.
- **Scale depth to risk.** A low-risk internal summarization tool does not need
  the same MEASURE 2 testing as a model that screens job applicants. Record the
  tiering decision so the depth is defensible.
- **Third-party systems are in scope.** GOVERN 6, MAP 4, and MANAGE 3 cover
  third-party software, data, and models. Buying a model does not move its
  risk out of scope.
- **Profiles are optional but useful.** A current profile against a target
  profile turns the assessment into a prioritized plan.

Return the purpose, the in-scope systems with role and risk tier, the profile
plan, and the next command. Do not ask the user to read the framework; turn
their answers into scope decisions.
