---
name: website-repo
description: Creates a GitHub repository for the website project, initializes git, and pushes the code.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Website Repo Skill

You are running the `/grc-portfolio:repo` skill. Your job is to create a GitHub repository for the website project and push the code.

## Step 1: Locate and Validate Config

Find `site-config.json`:
- Check `$ARGUMENTS` for a project directory path
- Check the current working directory
- Ask the user if not found

Read it and validate that `status.buildComplete === true`. If not, tell the user to run `/grc-portfolio:build` first.

## Step 2: Verify Prerequisites

Check that `gh` CLI is installed and authenticated:
```bash
gh --version
gh auth status
```

If not installed, tell the user to run:
```bash
brew install gh
gh auth login
```

## Step 3: Ask Repository Details

Ask the user:
- **Repo name** (suggest `projectName` from config)
- **Visibility**: public or private (default: private)

## Step 4: Ensure .gitignore

Check if `.gitignore` exists in the project directory. If not, create one:
```
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Lambda packages
lambda/*.zip
```

If it exists, verify it includes at least `node_modules`, `dist`, `.env`, and `.DS_Store`.

## Step 5: Initialize Git and Commit

```bash
cd <projectDir>
git init
git add -A
git commit -m "Initial commit: scaffolded GRC portfolio website"
```

## Step 6: Create GitHub Repo and Push

```bash
gh repo create <repoName> --<visibility> --source . --push
```

This creates the repo on GitHub, sets the remote, and pushes the code.

## Step 7: Update Config

Get the repo URL and owner:
```bash
gh repo view --json url,owner
```

Update `site-config.json`:
- Set `github.repoName` to the repo name
- Set `github.repoUrl` to the full URL
- Set `github.owner` to the owner login
- Set `github.visibility` to public/private
- Set `status.repoCreated = true`

## Step 8: Summary

Tell the user:
- The repo was created at `<github.repoUrl>`
- The code has been pushed
- Suggest running `/grc-portfolio:infra` next (if not done) or `/grc-portfolio:cicd` to set up continuous deployment

## Variables

- `$ARGUMENTS` = arguments passed after `/repo` (expected: project directory path)
