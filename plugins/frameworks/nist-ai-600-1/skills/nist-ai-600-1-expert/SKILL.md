---
name: nist-ai-600-1-expert
description: NIST AI 600-1 (Generative AI Profile) expert. Reference-depth framework plugin with generative-AI scope determination, an evidence checklist organized by the twelve GAI risks and four primary considerations, and SCF-backed gap review layered on AI RMF 1.0.
allowed-tools: Read, Glob, Grep, Write
---

# NIST AI 600-1 (Generative AI Profile) Expert

Reference-depth expertise for **NIST AI 600-1, "Artificial Intelligence Risk
Management Framework: Generative Artificial Intelligence Profile"**, released
July 26, 2024 and represented in SCF as `general-nist-600-1-gen-ai-profile`.
The plugin bundles the SCF crosswalk (139 SCF controls to 250 distinct profile
and suggested-action items) with profile-specific assessment context. It
reviews evidence; it does not establish compliance.

## Framework identity

- **SCF framework ID**: `general-nist-600-1-gen-ai-profile`
- **Region**: Global
- **Country**: US
- **Issuing body**: NIST (U.S. National Institute of Standards and
  Technology). Voluntary; no regulator, auditor, or certification.
- **Canonical source**: NIST AI 600-1, <https://doi.org/10.6028/NIST.AI.600-1>
- **Parent framework**: NIST AI 100-1, AI RMF 1.0 (see the `nist-ai-rmf`
  plugin). NIST states that AI RMF 1.0 is being revised; the profile is keyed
  to 1.0 subcategories until a revision says otherwise.

## Framework in plain language

AI 600-1 is a **cross-sectoral profile** of AI RMF 1.0. It does not add new
functions or categories. It does two things:

1. Names twelve risks that generative AI creates or makes worse.
2. Lists suggested actions for each AI RMF subcategory where generative AI
   changes what good practice looks like, and tags each action with the GAI
   risks it addresses.

Suggested actions are options. An organization picks the ones that fit its
systems, role, and risk tolerance, and records why.

### Suggested-action IDs

Each action ID combines the AI RMF function, the subcategory, and a sequence
number:

- `GV` = GOVERN, `MP` = MAP, `MS` = MEASURE, `MG` = MANAGE
- `GV-1.1-001` is the first suggested action under GOVERN 1.1; `GV-1.1-002`
  is the second.

The profile's action tables list, for each action, the action ID, the
suggested action, the GAI risks it addresses, and the AI actor tasks
involved. Reference actions by ID in assessment output so results line up
with the crosswalk.

### The twelve GAI risks

| Risk | What it covers |
|---|---|
| CBRN information or capabilities | Easier access to or synthesis of information that helps develop chemical, biological, radiological, or nuclear weapons |
| Confabulation | Confident but false output ("hallucinations") that misleads users |
| Dangerous, violent, or hateful content | Easier production of violent, inciting, radicalizing, or threatening content, self-harm or illegal-activity guidance, and hateful or stereotyping content |
| Data privacy | Leakage, unauthorized use, or de-anonymization of personal or sensitive data |
| Environmental impacts | Effects of high compute use in training and operating models |
| Harmful bias and homogenization | Amplified societal bias, performance gaps across groups or languages, and outputs that converge in ways that skew decisions |
| Human-AI configuration | Anthropomorphizing, automation bias, over-reliance, algorithmic aversion, or emotional entanglement with the system |
| Information integrity | Lower cost of producing content that blurs fact and fiction, including large-scale mis- and disinformation |
| Information security | Lower barriers to offensive cyber activity, and a larger attack surface on the system itself, including training data, code, and model weights |
| Intellectual property | Easier reproduction of copyrighted, trademarked, or licensed material, exposure of trade secrets, or plagiarism |
| Obscene, degrading, and/or abusive content | Easier production of abusive imagery, including synthetic CSAM and nonconsensual intimate images |
| Value chain and component integration | Untraceable third-party components and data, and weak supplier vetting that reduces transparency for downstream users |

The profile also describes how a risk varies: by lifecycle stage, by scope
(model or system, application, or ecosystem), by source (design, training,
operation, inputs, outputs, or human behavior such as misuse), and by time
scale.

### Primary considerations

From NIST's generative AI public working group, the profile highlights four
areas:

- **Governance**: existing governance approaches extend to generative AI.
- **Content provenance**: tracking the origin and history of content, using
  techniques such as watermarking, metadata recording, and digital
  fingerprinting, to help separate synthetic from human-made content.
- **Pre-deployment testing**: test, evaluation, verification, and validation
  (TEVV) done early and repeated, including red-teaming (structured probing
  for flaws, harmful outputs, and vulnerabilities in a controlled setting).
- **Incident disclosure**: documenting, reporting, and sharing information
  about generative AI incidents so impacts can be traced to their source.

## Scope and posture

### Applicability

The profile is relevant to any organization that builds, fine-tunes, hosts,
integrates, or deploys generative AI, including generative features inside
purchased software. Common triggers for using it:

- Customer or procurement questionnaires asking how generative AI risk is
  managed.
- Internal acceptable-use and release-approval programs for generative AI.
- Preparing evidence for the EU AI Act's transparency or general-purpose AI
  model obligations, or for ISO/IEC 42001 certification.

### Role matters

What the organization can evidence depends on its role:

- **Model developers** can show training data documentation, pre-training
  evaluations, and model-level safety testing.
- **Application developers and deployers** usually rely on the model
  provider for those and must show their own configuration, testing in the
  deployment setting, user controls, monitoring, and vendor oversight.

Record the role per system during scoping and mark actions that belong to
another party in the value chain as "provider-held", with the evidence of
vendor review.

### Obligations and cadence

The profile sets no mandatory obligations or timelines. Practical defaults:

- Test before release and at every model, prompt, or retrieval-source change.
- Re-run red-team and safety tests when the provider ships a new model
  version.
- Review the AI incident log and user reports at least quarterly for
  higher-risk systems.
- Re-scope the GAI risk selection annually or when the system's use changes.

### Enforcement

None under the profile. Exposure comes from laws, contracts, and regulators
that address generative AI outputs, privacy, consumer protection, or
intellectual property. Keep legal conclusions out of profile assessments.

## Interaction with other frameworks

- **NIST AI RMF 1.0**: the parent. Every suggested action sits under an AI
  RMF subcategory. Assess the AI RMF baseline first, then the profile.
- **ISO/IEC 42001:2023**: a certifiable AI management system standard. The
  profile's risk list and actions can feed 42001 risk assessment and
  treatment. SCF maps it as `general-iso-42001-2023`.
- **EU AI Act (Regulation (EU) 2024/1689)**: binding law with obligations for
  general-purpose AI models and transparency duties for some generated
  content. Profile evidence helps, but following the profile is not
  compliance with the Act. SCF maps it as `emea-eu-ai-act-2024`.
- **Security frameworks**: the information security risk leans on existing
  controls under NIST SP 800-53, NIST CSF 2.0, or ISO/IEC 27001, plus
  generative-AI-specific testing such as prompt injection.
- **Privacy frameworks**: the data privacy risk connects to privacy impact
  assessments under GDPR, state privacy laws, or the NIST Privacy Framework.

Use the SCF crosswalk for control mechanics. Do not hand-build a mapping
table inside this plugin.

## Common misinterpretations

- **"AI 600-1 replaces AI RMF for generative AI."** It is a profile of AI RMF
  and assumes the AI RMF program is in place.
- **"Every suggested action is required."** They are options keyed to
  subcategories. Choose by role and risk, and record the choice.
- **"The model provider handles all of this."** Deployers still own
  deployment testing, user controls, monitoring, incident handling, and
  vendor oversight (value chain risk).
- **"Red-teaming once at launch is enough."** Model updates, prompt changes,
  and new retrieval sources change behavior; re-test after changes.
- **"Watermarking solves information integrity."** Provenance is one tool.
  Labeling, review before publishing, and user guidance still matter.
- **Citing prose instead of IDs.** Reference actions by ID (for example
  `MS-2.7-007`) and risks by the profile's names.

## Command routing

- `/nist-ai-600-1:scope` - generative AI systems, roles, and the GAI risks in
  scope.
- `/nist-ai-600-1:evidence-checklist` - evidence by primary consideration and
  GAI risk.
- `/nist-ai-600-1:assess` - gap review through `/engineer:gap-assessment`
  with framework ID `general-nist-600-1-gen-ai-profile`, reported by action
  ID and GAI risk.

## Levelling up to Full

Full-depth candidates for this profile:

- `/nist-ai-600-1:red-team-plan` - build a red-team plan for the selected GAI
  risks and record results against MEASURE 2.6 and 2.7 actions.
- `/nist-ai-600-1:provenance-review` - decide and document labeling,
  watermarking, and provenance for each output type.
- `/nist-ai-600-1:incident-triage` - classify a generative AI incident and
  decide who must be told.
- `/nist-ai-600-1:vendor-model-review` - review a foundation model provider's
  documentation, terms, and change notices for value chain risk.

## References

- [NIST AI 600-1, Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1)
- [NIST AI 100-1, AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1)
- [NIST AI RMF page](https://www.nist.gov/itl/ai-risk-management-framework)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-600-1-gen-ai-profile.json)
