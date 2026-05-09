---
name: grc-portfolio-planner
description: GRC-specific portfolio questionnaire that creates a site-config.json and SITE-PLAN.md tailored to GRC engineers — certifications, frameworks, audit experience, tools, and projects.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# GRC Portfolio Planner

You are running the `/grc-portfolio:plan` skill. Your job is to guide a GRC (Governance, Risk & Compliance) engineer through a conversational questionnaire and produce a `site-config.json` and `SITE-PLAN.md` configured for a professional GRC portfolio website.

## Step 0: Resolve Plugin Root and Project Directory

**Locate the plugin's bundled scripts** (needed later for `toolkitDir`):

```bash
find ~/.claude -path "*/grc-portfolio/scripts/deploy.sh" 2>/dev/null | head -1
```

Strip `/scripts/deploy.sh` from the result to get `PLUGIN_ROOT`. If nothing is found, fall back to `~/Desktop/repos/websitebuilder` (for users running the standalone toolkit).

**Determine the project directory** from `$ARGUMENTS`. If not provided, ask the user where they want the project created (suggest `~/Desktop/repos/<their-name>-grc-portfolio`). Create the directory if it doesn't exist.

## Step 1: Identity

Ask these questions (3–4 at a time, conversationally):

- Full name
- Current job title (e.g., "Senior GRC Engineer", "Information Security Manager", "Compliance Lead")
- Years working in GRC
- Brief professional summary (2–3 sentences they'd use as a bio — you can draft one based on their answers if they want)
- LinkedIn URL
- GitHub URL (optional)
- Personal/professional email (for contact form)
- Location (city/state or remote)
- Do they have a professional headshot? (yes/no — if yes, note the filename they'll drop in the project)

## Step 2: GRC Expertise

Ask which frameworks they specialize in. Present the full list — let them pick all that apply:

```
SOC 2 | ISO 27001 | NIST 800-53 | FedRAMP | PCI-DSS | HIPAA | CMMC | HITRUST |
GDPR | CIS Controls | DORA | StateRAMP | NIST CSF | NYDFS | Essential Eight |
ISMAP | IRAP | PBMM | CSA CCM | GLBA
```

Also ask:
- Primary specializations (pick all that apply): Compliance auditing, Risk management, Policy development, Compliance engineering/automation, Third-party risk management (TPRM), GRC tooling implementation, Security program management
- Industry verticals they've worked in (SaaS/tech, fintech, healthcare/HIPAA, government/FedRAMP, retail/PCI, critical infrastructure, etc.)

## Step 3: Certifications

Ask about certifications. Present common ones as a checklist — let them select active/in-progress:

**Active certs** (pick all they hold):
CISSP, CISA, CISM, CPA, CIA, CRISC, CCSP, CGEIT, CDPSE, Security+, CEH, OSCP, AWS Security Specialty, GCP Security Engineer, Azure Security Engineer, PCIP, QSA

**In-progress** (optional): what cert are they working toward, and expected completion date?

## Step 4: Experience Highlights

Ask:
- Current employer and role (or note they're "open to opportunities" if job searching)
- 3–5 career accomplishments to feature (e.g., "Led SOC 2 Type II audit for a 300-person SaaS company achieving zero material findings", "Reduced evidence collection time by 70% using Python automation", "Implemented FedRAMP Moderate for a federal contractor from scratch in 14 months")
- GRC tools used professionally (Vanta, Drata, Tugboat Logic, Hyperproof, ServiceNow GRC, Archer, OneTrust, Jira, Confluence, Qualys, Tenable, Splunk, CrowdStrike, etc.)
- Specific cloud platforms they've worked with for compliance (AWS, Azure, GCP, multi-cloud)

## Step 5: Projects & Writing

Ask:
- Any GRC automation or tooling projects they want to showcase? (name, description, GitHub link, technologies used — e.g., "Built an evidence collector that pulls from AWS Config, Okta, and GitHub into a unified dashboard")
- Published articles, blog posts, or LinkedIn long-form content? (title + URL or publication)
- Conference talks, webinars, or podcast appearances? (event name, topic, year)
- Open-source contributions? (repo + what they contributed)

Let them know these are all optional — skip any that don't apply.

## Step 6: Design & AWS Configuration

Ask:
1. **Color scheme** — present options:
   - Deep Navy & Slate (default — authoritative, professional GRC aesthetic)
   - Dark Mode Charcoal (modern security/tech vibe)
   - Clean White & Teal (clean, consulting firm look)
   - Custom (let them specify primary + accent color)
2. **Custom domain?** — yes/no. If yes, which domain?
3. **AWS CLI profile** — what profile name? (default: "default")
4. **Contact form?** — yes/no (uses AWS Lambda + SES; requires SES setup)
5. **Any other pages** they want beyond the standard portfolio sections? (Speaking page, Publications page, GRC Tools page, etc.)

## Step 7: Generate site-config.json

Read the template from `<PLUGIN_ROOT>/templates/site-config-template.json`.

Create a `site-config.json` in the project directory populated with all gathered information:

```json
{
  "projectName": "<kebab-case name>",
  "projectDir": "<absolute path>",
  "toolkitDir": "<PLUGIN_ROOT>",
  "siteType": "portfolio",
  "client": {
    "name": "<full name>",
    "title": "<job title>",
    "email": "<email>",
    "location": "<location>",
    "linkedin": "<url>",
    "github": "<url or null>",
    "yearsInGrc": <number>,
    "summary": "<professional bio>"
  },
  "grc": {
    "frameworks": ["SOC2", "ISO27001", ...],
    "specializations": ["Compliance auditing", ...],
    "industries": ["SaaS/tech", ...],
    "tools": ["Vanta", "Drata", ...]
  },
  "certifications": {
    "active": ["CISSP", "CISA", ...],
    "inProgress": [{"name": "CCSP", "expectedDate": "2025-Q3"}]
  },
  "portfolio": {
    "accomplishments": ["Led SOC 2 Type II...", ...],
    "projects": [
      {
        "name": "<project name>",
        "description": "<description>",
        "technologies": ["Python", "AWS"],
        "url": "<github url or null>"
      }
    ],
    "speaking": [
      {"event": "<event>", "topic": "<topic>", "year": 2024, "url": null}
    ],
    "articles": [
      {"title": "<title>", "publication": "<pub>", "url": "<url>"}
    ],
    "openSource": []
  },
  "design": {
    "colorScheme": "navy-slate",
    "primaryColor": "#1e3a5f",
    "accentColor": "#64748b",
    "style": "professional"
  },
  "pages": ["home", "about", "frameworks", "certifications", "projects", "contact"],
  "features": {
    "customDomain": false,
    "contactForm": false
  },
  "aws": {
    "profile": "default",
    "region": "us-east-1",
    "stackName": "<projectName>-website",
    "domain": null
  },
  "status": {
    "planComplete": true,
    "buildComplete": false,
    "infraDeployed": false,
    "siteDeployed": false
  }
}
```

Set `toolkitDir` to `PLUGIN_ROOT` (the plugin's own directory). Set `status.planComplete = true`.

## Step 8: Generate SITE-PLAN.md

Read `<PLUGIN_ROOT>/templates/SITE-PLAN-TEMPLATE.md` as reference. Create a `SITE-PLAN.md` in the project directory that includes:

- Professional summary and positioning statement
- All GRC frameworks and credentials to feature
- Certifications list with badge recommendations
- Career highlights and accomplishments
- Projects to showcase with descriptions
- Speaking/writing/open-source contributions
- Design choices and color palette
- Planned page structure
- AWS configuration summary
- Next steps (run `/grc-portfolio:build` then `/grc-portfolio:preflight`)

## Step 9: Summary

Tell the user:
- Where `site-config.json` and `SITE-PLAN.md` were created
- Suggest they review `SITE-PLAN.md` and make any edits before building
- Next command: `/grc-portfolio:build` to scaffold the React project
- Full workflow: `plan → build → preflight → infra → deploy → repo → cicd`

## Variables

- `PLUGIN_ROOT` = resolved from `find ~/.claude -path "*/grc-portfolio/scripts/deploy.sh"`; fallback `~/Desktop/repos/websitebuilder`
- `$ARGUMENTS` = arguments passed after `/plan` (expected: project directory path)
