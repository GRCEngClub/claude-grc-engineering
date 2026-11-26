---
description: Evidence checklist for NIST AI RMF 1.0, organized by GOVERN, MAP, MEASURE, and MANAGE
---

# NIST AI RMF Evidence Checklist

Lists the evidence that shows AI RMF outcomes are achieved, organized by the
AI RMF Core. The SCF crosswalk maps 158 SCF controls to the 91 AI RMF items
(19 categories, 72 subcategories); this command adds the AI-specific artifacts
the crosswalk alone does not name.

## Usage

```bash
/nist-ai-rmf:evidence-checklist [--function=GOVERN|MAP|MEASURE|MANAGE] [--system=<ai-system-id>]
```

## Arguments

- `--function` (optional) - restrict to one function. Defaults to all four.
- `--system` (optional) - tailor the MAP, MEASURE, and MANAGE items to one AI
  system from the inventory. GOVERN items are organization-wide.

## Output

A Markdown checklist grouped by function and category. Each item lists the
subcategory IDs it supports, the evidence type, and whether a connector can
collect it or it must be supplied by hand. Most items are documents and
records; connectors help with access control, logging, change management, and
monitoring around the AI system.

## GOVERN (organization-wide)

**GOVERN 1 - policies, processes, and practices**

- AI policy or AI risk management policy, approved and dated, that names the
  trustworthiness characteristics the organization commits to (GOVERN 1.1,
  1.2, 1.4).
- Register of legal and regulatory requirements that apply to AI use, with an
  owner for each (GOVERN 1.1).
- Documented AI risk tolerance and the risk tiering method used to decide how
  much review a system gets (GOVERN 1.3).
- AI system inventory with owner, purpose, model source, data sources, risk
  tier, and status, including AI features in purchased software (GOVERN 1.6).
- Monitoring and periodic review schedule for the AI risk program, and the
  last completed review (GOVERN 1.5).
- Decommissioning procedure for AI systems, and records for any system retired
  (GOVERN 1.7).

**GOVERN 2 - accountability**

- RACI or role descriptions for AI risk management, including who can approve
  deployment and who can stop a system (GOVERN 2.1).
- Training records for staff who build, buy, or oversee AI systems
  (GOVERN 2.2).
- Executive sponsor or committee charter, and minutes showing AI risk
  decisions at that level (GOVERN 2.3).

**GOVERN 3 - workforce diversity and human-AI roles**

- Evidence that review and design teams include relevant disciplines and
  perspectives, such as review panel membership and sign-off lists
  (GOVERN 3.1).
- Documented roles and responsibilities for human oversight of each system
  (GOVERN 3.2).

**GOVERN 4 - risk culture**

- Policy or guidance that sets a safety-first approach for design, testing,
  and deployment (GOVERN 4.1).
- Records showing AI risks and impacts are documented and communicated, such
  as impact assessments circulated to owners (GOVERN 4.2).
- Testing, incident identification, and information-sharing procedures
  (GOVERN 4.3).

**GOVERN 5 - engagement with AI actors**

- Channel for external feedback about AI systems (users, affected people,
  researchers), and a log of feedback received (GOVERN 5.1).
- Evidence that feedback changed a design, deployment, or monitoring decision
  (GOVERN 5.2).

**GOVERN 6 - third parties and supply chain**

- Third-party AI policy covering vendor models, datasets, and AI features,
  including intellectual property and data rights (GOVERN 6.1).
- Contingency plan for failure or withdrawal of a third-party model or data
  source (GOVERN 6.2).

## MAP (per AI system)

**MAP 1 - context**

- System description: intended purpose, intended users, deployment setting,
  known limits, and out-of-scope uses (MAP 1.1).
- List of the disciplines involved in mapping risks for the system (MAP 1.2).
- Business case or value statement tied to organizational goals (MAP 1.3,
  1.4).
- Risk tolerance applied to this system (MAP 1.5).
- System requirements that cover socio-technical needs, not only technical
  performance (MAP 1.6).

**MAP 2 - categorization**

- Task and method definition: what the model does and how (classification,
  ranking, generation) (MAP 2.1).
- Documentation of knowledge limits and how humans oversee outputs, such as a
  model card or system card (MAP 2.2).
- TEVV considerations and data provenance notes (MAP 2.3).

**MAP 3 - capabilities, benefits, and costs**

- Expected benefits and the costs of errors, including who bears them
  (MAP 3.1, 3.2).
- Approved application scope and conditions of use (MAP 3.3).
- Operator proficiency requirements and training (MAP 3.4).
- Human oversight procedures (MAP 3.5).

**MAP 4 - components and third parties**

- Component inventory: base model, fine-tuning data, libraries, APIs, and
  third-party data, with license and IP review (MAP 4.1).
- Internal risk controls for each component (MAP 4.2).

**MAP 5 - impacts**

- Impact assessment that rates likelihood and magnitude of impacts on
  individuals, groups, communities, the organization, and society (MAP 5.1).
- Records of engagement with affected people or their representatives
  (MAP 5.2).

## MEASURE (per AI system)

**MEASURE 1 - methods and metrics**

- Measurement plan listing metrics for each identified risk, and the risks
  that cannot be measured yet (MEASURE 1.1).
- Review of whether metrics are still appropriate (MEASURE 1.2).
- Evidence of independent review, internal or external (MEASURE 1.3).

**MEASURE 2 - trustworthiness evaluation**

- Test, evaluation, verification, and validation (TEVV) reports with datasets,
  metrics, and tools documented (MEASURE 2.1).
- Human-subject evaluation protocols and approvals where people take part in
  testing (MEASURE 2.2).
- Performance results under deployment-like conditions (MEASURE 2.3) and
  production monitoring dashboards or reports (MEASURE 2.4).
- Evidence for each trustworthiness characteristic that matters for the
  system: validity and reliability (MEASURE 2.5), safety (MEASURE 2.6),
  security and resilience, including adversarial testing or red-team reports
  (MEASURE 2.7), transparency and accountability (MEASURE 2.8),
  explainability (MEASURE 2.9), privacy (MEASURE 2.10), fairness and bias
  testing results by relevant group (MEASURE 2.11), and environmental impact
  (MEASURE 2.12).
- Review of whether the TEVV approach itself worked (MEASURE 2.13).

**MEASURE 3 - tracking risk over time**

- Risk tracking for existing, unanticipated, and emerging risks, such as a
  per-system risk register (MEASURE 3.1, 3.2).
- End-user and affected-person reporting channel, and the issues logged
  (MEASURE 3.3).

**MEASURE 4 - feedback on measurement**

- Evidence that measurement results were checked against the deployment
  context and with domain experts (MEASURE 4.1, 4.2).
- Trend records showing performance improvements or declines (MEASURE 4.3).

## MANAGE (per AI system)

**MANAGE 1 - prioritize and respond**

- Go or no-go decision record for deployment, with the reasons
  (MANAGE 1.1).
- Prioritized risk treatment plan with a response per risk: mitigate,
  transfer, avoid, or accept (MANAGE 1.2, 1.3).
- Residual risk statement signed by the accountable owner (MANAGE 1.4).

**MANAGE 2 - maximize benefit, minimize harm**

- Resourcing decision that considered non-AI alternatives (MANAGE 2.1).
- Mechanisms to sustain the system's value over time (MANAGE 2.2).
- Procedure for responding to previously unknown risks (MANAGE 2.3).
- Kill switch or disengagement procedure, and evidence it was tested
  (MANAGE 2.4).

**MANAGE 3 - third-party risk**

- Monitoring records for third-party models and data, including vendor change
  notices and re-evaluations (MANAGE 3.1, 3.2).

**MANAGE 4 - treatment, response, and communication**

- Post-deployment monitoring plan covering user feedback, appeal and override,
  incident response, change management, and decommissioning (MANAGE 4.1).
- Continual-improvement records, such as retraining or rollback decisions
  (MANAGE 4.2).
- AI incident log and communications to affected parties (MANAGE 4.3).

## What connectors can collect

Connectors in this repo cover the infrastructure around an AI system, not the
AI-specific documents above. Useful automated evidence:

- Access control on model registries, training data stores, and inference
  endpoints (`aws-inspector`, `gcp-inspector`, `okta-inspector`).
- Change control and review for model code and prompts (`github-inspector`).
- Logging and monitoring of inference services.

Everything else (inventory, impact assessments, TEVV reports, decision
records) is manual upload or narrative. Flag those items for an owner rather
than marking them as gaps automatically.
