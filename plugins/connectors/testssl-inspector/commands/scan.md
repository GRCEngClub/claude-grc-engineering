---
name: testssl-inspector scan
description: Run testssl.sh against one or more HTTPS endpoints and emit v1 Findings mapped to SOC 2, NIST 800-53, PCI DSS 4.0.1, ISO 27001, and SCF controls.
---

# /testssl-inspector:scan

Wraps `testssl.sh`, normalizes its JSON output into the toolkit's v1 finding contract, and writes one document per target.

## How to run

```bash
node plugins/connectors/testssl-inspector/scripts/scan.js [options]
```

## Options

- `--target=host[:port]` — repeatable; or pass targets positionally. Port defaults to 443.
- `--fast` — `testssl.sh --fast` (~3× faster, drops vulnerability checks).
- `--full` — full check set (default). Slower; includes CVE checks (Heartbleed, ROBOT, POODLE, BEAST, BREACH, SWEET32, FREAK, LOGJAM, DROWN, …).
- `--docker` / `--no-docker` — override the runner choice from the config.
- `--scf-only` — emit only SCF evaluations; skip fan-out to NIST/SOC2/PCI/ISO. Smaller output, no network. Useful for CI or air-gapped environments.
- `--offline` — never make network calls. Uses cached SCF crosswalks if present (under `~/.cache/claude-grc/scf/<version>/`); otherwise falls back to the hardcoded framework table. testssl itself still has to reach the target.
- `--output=summary|silent|json` — default `summary` prints counts to stdout; `json` emits machine-readable run info; `silent` writes the cache file and nothing else.
- `--quiet` — suppress stderr progress lines.

## What it evaluates

Each testssl.sh finding is mapped first to one or more **SCF (Secure Controls Framework) control IDs**, then fanned out to downstream frameworks via the SCF crosswalk at `https://grcengclub.github.io/scf-api/`. Crosswalks are cached at `~/.cache/claude-grc/scf/<version>/` (shared with the `grc-engineer` plugin's SCF client) and refreshed every 7 days.

| testssl finding family | SCF anchors |
|---|---|
| Weak protocols (SSLv2/3, TLS 1.0/1.1) | `CRY-01`, `CRY-03`, `NET-09` |
| Weak ciphers (NULL, EXPORT, 3DES, RC4, anon) | `CRY-01.2`, `CRY-05` |
| Certificate posture (expiry, signature, chain, key size, OCSP, CT) | `CRY-08` |
| Known CVEs (Heartbleed, ROBOT, POODLE, SWEET32, FREAK, LOGJAM, DROWN, BEAST, LUCKY13, …) | `VPM-01`, `VPM-06` |
| HTTP transport headers (HSTS, HPKP, cookie flags) | `CRY-03`, `WEB-03`, `NET-09` |

The SCF crosswalk fan-out resolves each anchor to its equivalent controls in:

- **NIST 800-53 r5** (e.g. `CRY-01` → `SC-08(01)`, `SC-08(02)`, `SC-13`, `SI-07(06)`)
- **SOC 2 TSC 2017** (CC-family controls and POFs)
- **PCI DSS 4.0.1** (§4 cryptography, §6 vulnerability management, §11 testing)
- **ISO 27002:2022** (technical Annex A catalog — same numbering as ISO 27001:2022 Annex A, but the 27002 crosswalk has the technical depth; SCF's 27001:2022 crosswalk is sparse)

If the SCF mirror is unreachable (network error, `--offline` with no cache), the script falls back to a curated hardcoded table that covers the same five frameworks at one canonical control per family. This is the v0 behavior; you'll see a `(scf expansion unavailable; framework fallback used)` note in the summary line when it kicks in.

Severity translation: testssl `FATAL`/`CRITICAL` → `critical`; `HIGH` → `high`; `WARN`/`MEDIUM` → `medium`; `LOW` → `low`; `OK`/`INFO` → `info` (and `pass` for status). Anything else → `inconclusive`.

## Output

- `~/.cache/claude-grc/findings/testssl-inspector/<run_id>.json`
- One Finding doc per target with `resource.type = "tls_endpoint"`, `resource.id = "<host>:<port>"`, and `resource.uri = "https://<host>:<port>/"`.
- Critical findings and any with a CVE are also lifted into a `findings[]` narrative array for quick triage.
- Summary printed to stdout unless `--output=silent`:

  ```
  testssl-inspector: 2 targets, 2 resources, 47 evaluations, 9 failing (1 critical, 3 high, 4 medium, 1 low). → /home/.../<run_id>.json
  ```

## Exit codes

- `0` — clean run, no scan errors
- `2` — usage error (missing target)
- `3` — testssl.sh / docker unavailable (or every target failed)
- `4` — partial run (some targets failed but at least one succeeded)
- `5` — not configured (no config file and no `--target` provided)

## Examples

```bash
# Fast scan of one endpoint
/testssl-inspector:scan --target=example.com --fast

# Full vulnerability scan against two endpoints, Docker runner
/testssl-inspector:scan --target=example.com --target=api.example.com:8443 --docker

# Pipe summary into another step
/testssl-inspector:scan --target=example.com --output=json | jq '.counters'
```

## Targets and scope

- Only HTTPS endpoints. testssl supports `--starttls` for SMTP/IMAP/etc.; not currently wired into this wrapper — open an issue if you need it.
- Scanning runs on the local machine and requires outbound network reach to the target. Not suitable for endpoints behind a private network unless the runner has access.
- Be courteous: testssl makes a couple hundred connections per target. Don't point it at infrastructure you don't own without authorization.
