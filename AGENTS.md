# AGENTS.md

Durable, non-obvious notes for coding agents working in this repo. `CLAUDE.md` imports this file and adds the repo layout and plugin rules; `docs/ARCHITECTURE.md` has the architecture and the Finding data contract.

## Repo shape

This repo is a Claude Code plugin marketplace: mostly Markdown/YAML/JSON plugin content, plus a root Node.js (ESM) toolkit of CLI scripts and a schema/contract test suite. There is no backend service or database; "running the app" means running the Node CLI scripts, the test suite, the optional local dashboard server, and/or the Vite frontends.

## Setup, tests, and checks

- Runtime: Node.js 22 (the version CI pins). Plugin scripts use only Node built-ins and files inside their own plugin folder, because Claude Code installs each plugin by copying that folder alone. `npm ci` at the repo root installs the validator dev dependencies from the committed `package-lock.json`.
- Tests/lint/build commands are defined in the root `package.json` scripts and `.github/workflows/`; prefer those as the source of truth. Core checks: `npm run test:contract`, `npm run test:plugin-manifests`, `npm run test:claude-validate`, `npm run test:diagrams`, `npm run test:contract:findings`. These validate JSON and plugin structure; there is no unit test suite at the moment (it was removed for a rewrite), so run a changed script by hand before pushing. Markdown lint matches the pre-commit hook: `npx markdownlint-cli2@0.18.1` (config in `.markdownlint-cli2.jsonc`); note the repo currently has some pre-existing `MD022` warnings.

## Gotchas

- Network-dependent scripts: `frameworks.js` (and other scripts that fetch the SCF API at `grcengclub.github.io/scf-api`) fail in restricted-egress environments with `SCF fetch failed and no cached copy`. This is an environment limitation, not a code bug. For an offline check of core functionality use `node plugins/personas/engineer/scripts/map-control.js <iac-file> soc2` (also supports `iso27001`, `nist800-53`) — it maps IaC patterns (e.g. `aws_iam_role`, `aws_security_group`, `kms_key_id`, `encrypted = true`) to controls with no network access.
- Optional local dashboard: `node plugins/reporting/dashboard/scripts/serve.js --demo --host=127.0.0.1 --port=8787`. Args MUST use `--key=value` syntax (space-separated like `--host 127.0.0.1` is mis-parsed and the server fails to bind). `--demo` serves built-in sample runs so no `grc-data/` is needed.

## Cursor Cloud specific instructions

All of the notes above apply to Cursor Cloud agents. In particular, Cursor Cloud VMs run with restricted egress, so expect the SCF-fetching scripts to fail as described in Gotchas and use the offline check instead.
