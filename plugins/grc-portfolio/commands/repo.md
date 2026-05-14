---
description: Create a GitHub repository, initialize git, and push the scaffolded portfolio project.
---

# Create GitHub Repository

Creates a new GitHub repo for your portfolio project, initializes git, and pushes the code. Uses the `gh` CLI.

## Arguments

- `$1` — Project directory containing `site-config.json` (optional; defaults to current directory)

## What It Does

1. Verifies `gh` CLI is installed and authenticated
2. Asks for repo name (suggests `projectName` from config) and visibility (public/private)
3. Creates `.gitignore` if not present
4. `git init` + initial commit
5. `gh repo create` — creates the repo, sets remote, pushes

Saves repo URL and owner to `site-config.json`.

## Prerequisite

Run `/grc-portfolio:build` first (`status.buildComplete === true`).

## Example

```
/grc-portfolio:repo ~/Desktop/repos/my-grc-portfolio
/grc-portfolio:repo
```

## Next Step

Run `/grc-portfolio:cicd` to set up automatic deployment on push to `main`.
