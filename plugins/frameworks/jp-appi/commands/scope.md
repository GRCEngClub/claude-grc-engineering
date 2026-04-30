---
description: Determine which parts of Japan - Act on the Protection of Personal Information (2020) apply to the organization
---

# Japan APPI Scope

Determines whether and how **Japan's Act on the Protection of Personal Information (APPI)** applies to the organization. Reference-depth scope is a decision-tree prompt; Full-depth plugins extend this with jurisdiction-aware logic.

## Usage

```
/jp-appi:scope
```

## What this produces

- **Applicability verdict**: In-scope / out-of-scope / partially in-scope, with the triggers that led there
- **In-scope APPI roles**: personal information handling business operator, entrustee, joint-use participant, or third-party recipient
- **In-scope data/systems**: personal information, personal data, retained personal data, personal-related information, and pseudonymously or anonymously processed information
- **Jurisdiction reach**: Japan operations and qualifying offshore goods or services offered to individuals in Japan
- **Carve-outs**: statutory exclusions or low-risk populations the organization can document
- **Next steps**: whether to proceed with `/jp-appi:assess` or `/jp-appi:evidence-checklist`

## Framework-specific scope triggers

Ask the minimum questions needed to classify APPI applicability:

- Does the organization handle personal information about individuals in Japan?
- Does it provide goods or services to individuals in Japan, even from outside Japan?
- Is the organization acting as a personal information handling business operator, an entrusted processor, or both?
- Does it handle retained personal data used for access, correction, suspension of use, or deletion requests?
- Are there third-party provisions, joint-use arrangements, outsourced processing, or cross-border transfers?
- Are there pseudonymously processed information, anonymously processed information, or personal-related information flows?
- Are sector rules also relevant, such as finance, healthcare, telecom, public-sector, or critical infrastructure obligations?

Return an applicability verdict, the data populations in scope, the APPI roles involved, and which follow-up command should run next. Do not ask users to search the Act; translate answers into practical APPI scoping outcomes.
