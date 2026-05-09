---
description: Scaffold a production-ready React/Vite portfolio website from site-config.json, with components populated from your GRC credentials and experience.
---

# GRC Portfolio Build

Generates a complete React/Vite project from the `site-config.json` created by `/grc-portfolio:plan`. Components are pre-populated with your actual GRC content — no placeholder text.

## Arguments

- `$1` — Project directory containing `site-config.json` (optional; defaults to current directory)

## What It Creates

```
src/
  components/
    Navbar.jsx
    Hero.jsx
    About.jsx
    Frameworks.jsx     ← GRC frameworks you specialize in
    Certifications.jsx ← Active and in-progress certs
    Projects.jsx       ← GRC automation projects
    Speaking.jsx       ← Talks, articles, podcasts
    ContactForm.jsx    ← (if contact form enabled)
    Footer.jsx
  main.jsx
  App.jsx
  index.css
public/
  index.html
package.json
vite.config.js
```

## Prerequisite

Run `/grc-portfolio:plan` first to create `site-config.json`.

## Example

```
/grc-portfolio:build ~/Desktop/repos/my-grc-portfolio
/grc-portfolio:build
```

## Next Step

Preview locally with `npm run dev`, then run `/grc-portfolio:preflight` to validate AWS readiness.
