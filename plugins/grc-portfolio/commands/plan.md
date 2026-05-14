---
description: Launch an interactive GRC-specific questionnaire to capture your credentials, frameworks, certifications, and experience, then write site-config.json and SITE-PLAN.md.
---

# GRC Portfolio Plan

Guides a GRC engineer through building a professional portfolio website plan. Asks about frameworks mastered, certifications held, career accomplishments, GRC tools used, projects, and published work — then produces a `site-config.json` and `SITE-PLAN.md` ready for the build step.

## Arguments

- `$1` — Target project directory (optional; prompted if not provided)

## What It Produces

- `site-config.json` — Full site configuration with all GRC content, design choices, and AWS settings
- `SITE-PLAN.md` — Human-readable summary to review before building

## Example

```
/grc-portfolio:plan ~/Desktop/repos/my-grc-portfolio
/grc-portfolio:plan
```

## Next Step

After reviewing `SITE-PLAN.md`, run `/grc-portfolio:build` to scaffold the React project.
