# AGENTS.md

See `CLAUDE.md` for the full architecture overview (plugin structure, frameworks, connectors, and the Finding data contract). This file captures durable, non-obvious notes for coding agents working in this repo.

## Repo shape

This repo is a Claude Code plugin marketplace: mostly Markdown/YAML/JSON plugin content, plus a root Node.js (ESM) toolkit of CLI scripts, a schema/contract test suite, and a few independent React/Vite apps. There is no backend service or database; "running the app" means running the Node CLI scripts, the test suite, the optional local dashboard server, and/or the Vite frontends.

## Setup, tests, and checks

- Runtime: Node.js (CI pins Node 20; Node 22 works). Single `npm install` at the repo root installs all toolkit + test deps. There are no committed lockfiles, so installs resolve latest within semver ranges.
- Tests/lint/build commands are defined in the root `package.json` scripts and `.github/workflows/`; prefer those as the source of truth. Core checks: `npm run test:contract`, `npm run test:plugin-manifests`, `npm run test:grc-diagrams`, `npm run test:contract:findings`, `npm run test:wiz-inspector`. Markdown lint matches the pre-commit hook: `npx markdownlint-cli2@0.18.1` (config in `.markdownlint-cli2.jsonc`); note the repo currently has some pre-existing `MD022` warnings.

## Gotchas

- Network-dependent scripts: `frameworks.js` (and other scripts that fetch the SCF API at `grcengclub.github.io/scf-api`) fail in restricted-egress environments with `SCF fetch failed and no cached copy`. This is an environment limitation, not a code bug. For an offline core-functionality smoke test use `node plugins/grc-engineer/scripts/map-control.js <iac-file> soc2` (also supports `iso27001`, `nist800-53`) — it maps IaC patterns (e.g. `aws_iam_role`, `aws_security_group`, `kms_key_id`, `encrypted = true`) to controls with no network access.
- Known pre-existing breakage: `scan-iac.js` and `test-control.js` use CommonJS `require(...)` while the root `package.json` is `"type": "module"`, so running them directly throws `require is not defined in ES module scope`. Don't treat this as something your change broke.
- Optional local dashboard: `node plugins/dashboards/compliance-posture/scripts/serve.js --demo --host=127.0.0.1 --port=8787`. Args MUST use `--key=value` syntax (space-separated like `--host 127.0.0.1` is mis-parsed and the server fails to bind). `--demo` serves built-in sample runs so no `grc-data/` is needed.
- Optional React/Vite apps are independent npm projects (not wired into the root via workspaces); each needs its own `npm install` in its directory: `demo/claude-grc-portfolio` (Vite dev on port 5173, `npm run dev`/`npm run build`) and `plugins/trust-center/frontend` (its backend is AWS serverless / deploy-only, not runnable locally).

## Cursor Cloud specific instructions

All of the notes above apply to Cursor Cloud agents. In particular, Cursor Cloud VMs run with restricted egress, so expect the SCF-fetching scripts to fail as described in Gotchas and use the offline smoke test instead.
