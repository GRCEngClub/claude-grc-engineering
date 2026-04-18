# Security & Feature Gaps

## Critical

- [ ] **Path traversal in `config-loader.js:58`** — `loadConfig(category, name)` passes user-controlled `name` directly to `path.join()` without validation. Other functions in the same file (`loadNISTFamily`, `loadFedRAMPBaseline`, `loadExportControlFramework`) correctly whitelist inputs, but the generic `loadConfig` does not. Add `path.basename()` or whitelist validation.
- [ ] **Command injection in shell status scripts** — `$LATEST` interpolated unquoted into `node -e` strings. Quote the variable or pipe via stdin:
  - `plugins/connectors/aws-inspector/scripts/status.sh:68-69`
  - `plugins/connectors/gcp-inspector/scripts/status.sh:64-65`
  - `plugins/connectors/okta-inspector/scripts/status.sh:57-58`
  - `plugins/grc-engineer/scripts/pipeline-status.sh:58-59`
- [ ] **Unquoted `$ARGUMENTS` in command files** — Shell word-splitting and metacharacter injection possible:
  - `plugins/grc-engineer/commands/map-control.md:34`
  - `plugins/grc-engineer/commands/review-pr.md:26`

## High

- [ ] **Regex injection in `risk-transformer.js:197`** — `new RegExp(mitigationKeywords.join('|'))` with unescaped special chars. Escape regex metacharacters before joining.

## Medium

- [ ] **Custom YAML parsers instead of `js-yaml`** — Hand-rolled parsers in all connector `collect.js` files. Replace with `js-yaml` which is already a project dependency.
- [ ] **Potential ReDoS in `scan-iac.js:186`** — `/resource\s+"([^"]+)"\s+"([^"]+)"\s+{([^}]+)}/gs` — greedy `[^}]+` could cause catastrophic backtracking on large/malformed Terraform files.
- [ ] **World-readable temp files** — Sensitive data written to `/tmp` without restricted permissions. Use `mktemp` with `0600` mode:
  - `plugins/connectors/okta-inspector/scripts/setup.sh:61-62` (`/tmp/okta-me.json`, `/tmp/okta-org.json`)
  - `plugins/connectors/aws-inspector/scripts/setup.sh:55` (`/tmp/aws-setup.err`)

## Low

- [ ] **Info disclosure in error messages** — Env var names leaked in `plugins/connectors/okta-inspector/scripts/collect.js:35-36`. Use a generic message instead of revealing the variable name.

## Removed After Verification

The following items from the original audit were re-evaluated and found to be non-issues:

- ~~Shell chaining in `test-control.js:442`~~ — Command is fully hardcoded (`aws iam generate-credential-report && ...`), not user-controlled. Not exploitable.
- ~~Quoted `$ARGUMENTS` in `transform-risk.md:17`, `collect-evidence.md:28`, `generate-policy.md:24`~~ — These use proper double-quoting (`"$ARGUMENTS"`), which prevents word-splitting. Not a realistic injection vector.
- ~~Token passed as function parameter in `review-pr.js:45`~~ — Token is sourced from `process.env.GITHUB_TOKEN`, not from CLI args. Standard pattern; no stack trace exposure risk.
- ~~Path traversal in `loadNISTFamily`, `loadFedRAMPBaseline`, `loadFedRAMP20xKSI`, `loadExportControlFramework`~~ — All validate input against whitelists before constructing paths. Only the generic `loadConfig` is vulnerable (listed above).
- ~~Info disclosure in `scf-client.js:393-402`~~ — Error messages show resource-not-found details, which is acceptable operational logging.

## Feature Gaps

- [x] **No multi-repo scoping for github-inspector** — Added `--scope=repos-file` and `config/repos.yaml` to support curated repo lists with glob patterns and exclusions.
- [x] **No production scoping for aws-inspector** — Added `config/scope.yaml`, `--scope-file`, `--tag-filter` flags, multi-profile support, S3 tag filtering, and bucket name pattern matching.
