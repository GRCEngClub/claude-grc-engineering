---
name: nist-ai-rmf-expert
description: NIST AI RMF 1.0 (NIST AI 100-1) expert. Reference-depth framework plugin with scope determination, an evidence checklist organized by GOVERN/MAP/MEASURE/MANAGE, and SCF-backed gap assessment for AI risk management programs.
allowed-tools: Read, Glob, Grep, Write
---

# NIST AI RMF 1.0 Expert

Reference-depth expertise for the **NIST Artificial Intelligence Risk
Management Framework (AI RMF 1.0)**, published as NIST AI 100-1 in January
2023 and represented in SCF as `general-nist-100-1-ai-rmf`. The plugin bundles
the SCF crosswalk (158 SCF controls to 91 AI RMF items) with AI RMF-specific
assessment context.

## Framework identity

- **SCF framework ID**: `general-nist-100-1-ai-rmf`
- **Region**: Global
- **Country**: US
- **Issuing body**: NIST (U.S. National Institute of Standards and
  Technology). Voluntary; no regulator, auditor, or certification.
- **Canonical source**: NIST AI 100-1, "Artificial Intelligence Risk
  Management Framework (AI RMF 1.0)", January 2023,
  <https://doi.org/10.6028/NIST.AI.100-1>
- **Companion resources**: the AI RMF Playbook (suggested actions per
  subcategory), the AI RMF Roadmap, NIST crosswalks to other frameworks, and
  the NIST AI Resource Center.
- **Status**: NIST states that AI RMF 1.0 is being revised as part of the
  White House AI Action Plan. No revised version has been published; treat
  1.0 as the baseline and check the NIST AI RMF page before citing it in a
  deliverable.

## Framework in plain language

AI RMF describes the outcomes of a working AI risk management program. It is
organized as Function, then Category, then Subcategory. Subcategories are
outcomes ("mechanisms are in place to inventory AI systems"), not
prescriptive controls. The organization decides how to achieve each outcome
and how far to go, based on its risk tolerance and the AI systems it has.

The framework is intended to be voluntary, rights-preserving, not specific to
any sector, and not specific to any use case.

### The AI RMF Core

| Function | Categories | Subcategories | What it covers |
|---|---|---|---|
| GOVERN | 6 | 19 | Policies, accountability, workforce, risk culture, engagement with AI actors, third parties |
| MAP | 5 | 18 | Context, categorization, capabilities and costs, component risks, impacts |
| MEASURE | 4 | 22 | Methods and metrics, trustworthiness evaluation, risk tracking, measurement feedback |
| MANAGE | 4 | 13 | Prioritized response, benefit and harm strategies, third-party risk, treatment and communication |

That is 19 categories and 72 subcategories. The SCF crosswalk counts both
levels, which is where its 91 framework items come from.

GOVERN is cross-cutting: it applies once at the organizational level and
supports the other three functions. MAP, MEASURE, and MANAGE are applied per
AI system and repeated across the lifecycle. The functions are not a strict
sequence; MAP usually starts, and the three cycle as systems change.

### Category summary

- **GOVERN 1** policies and practices for mapping, measuring, and managing AI
  risk are in place and followed. Includes legal requirements (1.1),
  trustworthiness in policy (1.2), risk tolerance (1.3), the risk process
  (1.4), periodic review (1.5), the AI system inventory (1.6), and
  decommissioning (1.7).
- **GOVERN 2** accountability: roles, training, and executive responsibility.
- **GOVERN 3** workforce diversity, equity, inclusion, and accessibility in
  AI risk work, and defined human-AI roles.
- **GOVERN 4** a culture that considers and communicates AI risk, including
  testing, incident identification, and information sharing.
- **GOVERN 5** engagement with relevant AI actors, including feedback from
  people outside the team.
- **GOVERN 6** third-party software, data, and supply chain risk.
- **MAP 1** context is established: intended purpose, setting, goals, risk
  tolerance, requirements.
- **MAP 2** the system is categorized: task, method, knowledge limits, human
  oversight, TEVV considerations.
- **MAP 3** capabilities, use, benefits, and costs are understood against
  benchmarks.
- **MAP 4** risks and benefits are mapped for every component, including
  third-party software and data.
- **MAP 5** impacts on individuals, groups, communities, organizations, and
  society are characterized.
- **MEASURE 1** methods and metrics are chosen and applied.
- **MEASURE 2** the system is evaluated for each trustworthiness
  characteristic (thirteen subcategories, 2.1 to 2.13).
- **MEASURE 3** identified risks are tracked over time.
- **MEASURE 4** feedback on whether measurement works is gathered.
- **MANAGE 1** risks from MAP and MEASURE are prioritized and responded to.
- **MANAGE 2** strategies to increase benefit and reduce harm are planned and
  carried out, including the ability to disengage a system.
- **MANAGE 3** risks from third-party entities are managed.
- **MANAGE 4** treatment, response, recovery, and communication are
  documented and monitored.

### Trustworthiness characteristics

AI RMF names seven characteristics of trustworthy AI. MEASURE 2 evaluates
each one, and GOVERN 1.2 expects policies to reflect them:

1. Valid and reliable (the base the others rest on)
2. Safe
3. Secure and resilient
4. Accountable and transparent (cuts across the others)
5. Explainable and interpretable
6. Privacy-enhanced
7. Fair, with harmful bias managed

The characteristics trade off against each other. Record the tradeoff
decisions; an assessor will ask why, for example, explainability was limited
to protect accuracy.

### Profiles

A profile applies the Core to a specific setting. NIST describes three kinds:

- **Use-case profiles** for a specific application, such as hiring or fair
  housing.
- **Temporal profiles**: a current profile (outcomes achieved now) and a
  target profile (outcomes needed). The gap between them is the work plan.
- **Cross-sectoral profiles** for risks common to many sectors. The Generative
  AI Profile, NIST AI 600-1 (July 2024), is the main example; see the
  `nist-ai-600-1` plugin. In April 2026 NIST also released a concept note for
  an AI RMF Profile on Trustworthy AI in Critical Infrastructure, which is
  still in development.

### Lifecycle and AI actors

AI RMF describes the lifecycle as plan and design; collect and process data;
build and use the model; verify and validate; deploy and use; and operate and
monitor, with people who use or are affected by the system at the center. Many
actor roles appear across these stages. For assessments, record whether the
organization is a developer, a deployer, or both for each system; that decides
which evidence it can be expected to hold.

## Scope and posture

### Applicability

AI RMF applies wherever an organization chooses to use it. Common triggers:

- A customer, contract, or federal procurement asks for alignment.
- A regulation or regulator points to it as recognized practice. Several U.S.
  state laws and agency guidance documents reference it; confirm the specific
  citation before relying on it.
- The board or leadership wants a structured AI risk program.
- The organization wants a common vocabulary before pursuing ISO/IEC 42001
  certification or preparing for the EU AI Act.

### Obligations

None are mandatory under AI RMF itself. What an assessor or customer will
expect once an organization claims alignment:

- An AI system inventory and a documented risk tolerance.
- Defined accountability, including who can stop a system.
- Per-system context, impact, and test documentation scaled to risk.
- Post-deployment monitoring, incident handling, and decommissioning.

### Cadence

AI RMF sets no fixed timelines. GOVERN 1.5 expects ongoing monitoring and
periodic review, and MANAGE 4 expects post-deployment monitoring. A practical
default is an annual program review, a per-system review at every significant
model or data change, and continuous production monitoring for higher-risk
systems. State whatever cadence the organization chose and why.

### Enforcement

There is no enforcement under AI RMF. Exposure comes from what it is attached
to: contract terms, procurement requirements, consumer protection or
anti-discrimination law, or a regulation that references it. Keep legal
conclusions out of AI RMF assessment output.

## Interaction with other frameworks

- **NIST AI 600-1 (Generative AI Profile)**: adds generative-AI risks and
  suggested actions keyed to AI RMF subcategories. Use both plugins together
  for generative AI systems.
- **ISO/IEC 42001:2023**: a certifiable AI management system standard. AI RMF
  gives the outcomes vocabulary; 42001 gives a management system an auditor
  can certify. SCF maps both (`general-iso-42001-2023`), so the crosswalk can
  show overlap.
- **EU AI Act (Regulation (EU) 2024/1689)**: binding law with risk-based
  obligations for AI systems placed on the EU market. AI RMF evidence helps
  with risk management, data governance, documentation, and human oversight
  work, but alignment with AI RMF is not compliance with the Act. SCF maps it
  as `emea-eu-ai-act-2024`.
- **NIST CSF 2.0 and NIST SP 800-53**: cover the security of the systems
  hosting AI. MEASURE 2.7 (security and resilience) leans on them.
- **Privacy frameworks**: MEASURE 2.10 and MAP 5 connect to privacy impact
  assessments under the NIST Privacy Framework, GDPR, or state privacy law.

Use the SCF crosswalk for control mechanics. Do not hand-build a mapping table
inside this plugin.

## Common misinterpretations

- **"AI RMF is a checklist of 72 controls."** Subcategories are outcomes.
  Organizations prioritize them by risk tolerance; no one is expected to
  evidence all 72 at the same depth for every system.
- **"The four functions are maturity levels."** They are concurrent areas of
  work, not stages of maturity.
- **"Bought models are the vendor's problem."** GOVERN 6, MAP 4, and MANAGE 3
  keep third-party models and data in scope for the deployer.
- **"We can be AI RMF certified."** There is no AI RMF certification. If a
  certificate is needed, look at ISO/IEC 42001.
- **"Bias testing covers fairness."** MEASURE 2.11 testing is necessary, but
  fairness also depends on MAP 5 impact work and GOVERN 3 team composition.
- **Citing prose instead of IDs.** Reference subcategories by ID (for example
  `MAP 5.1`) so results line up with the crosswalk and other assessments.

## Command routing

- `/nist-ai-rmf:scope` - purpose, AI systems in scope, role, risk tier, and
  profile plan.
- `/nist-ai-rmf:evidence-checklist` - evidence by function and category.
- `/nist-ai-rmf:assess` - gap assessment through `/grc-engineer:gap-assessment`
  with framework ID `general-nist-100-1-ai-rmf`, reported by subcategory ID.

## Levelling up to Full

Full-depth candidates for this framework:

- `/nist-ai-rmf:profile-builder` - build current and target profiles and the
  gap plan between them.
- `/nist-ai-rmf:impact-assessment` - run the MAP 5 impact assessment for one
  AI system and record the results.
- `/nist-ai-rmf:inventory-review` - build or check the GOVERN 1.6 AI system
  inventory, including AI features in purchased software.
- `/nist-ai-rmf:deployment-decision` - assemble the MANAGE 1.1 go or no-go
  record from MAP and MEASURE outputs.

## References

- [NIST AI 100-1, AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1)
- [NIST AI RMF page](https://www.nist.gov/itl/ai-risk-management-framework)
- [AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/)
- [NIST AI 600-1, Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1)
- [Concept note: AI RMF Profile on Trustworthy AI in Critical Infrastructure](https://www.nist.gov/programs-projects/concept-note-ai-rmf-profile-trustworthy-ai-critical-infrastructure)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-100-1-ai-rmf.json)
