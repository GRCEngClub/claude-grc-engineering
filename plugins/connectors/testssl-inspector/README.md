# testssl-inspector

A Claude Code plugin that wraps [`testssl.sh`](https://github.com/testssl/testssl.sh) and emits the toolkit's v1 Finding shape. Mappings are anchored on SCF (Secure Controls Framework) controls and fanned out at scan time to SOC 2 TSC 2017, NIST 800-53 r5, PCI DSS 4.0.1, and ISO 27002:2022 via the SCF crosswalk.

## What it does

Runs `testssl.sh` against one or more HTTPS endpoints, parses the JSON output, and produces structured findings the rest of the toolkit can consume — gap assessments, evidence packs, continuous-monitoring runs.

| What testssl checks | SCF anchors |
|---|---|
| Protocols (SSLv2/3, TLS 1.0–1.3) | `CRY-01`, `CRY-03`, `NET-09` |
| Cipher suites (incl. NULL, EXPORT, 3DES, RC4) | `CRY-01.2`, `CRY-05` |
| Certificate (expiry, chain, signature, key, CAA, OCSP, CT) | `CRY-08` |
| Known CVEs (Heartbleed, ROBOT, POODLE, SWEET32, FREAK, LOGJAM, DROWN, BEAST, …) | `VPM-01`, `VPM-06` |
| HTTP transport headers (HSTS, HPKP, cookie flags) | `CRY-03`, `WEB-03`, `NET-09` |

At scan startup the connector fetches per-framework crosswalk JSON from `grcengclub.github.io/scf-api/` (cached under `~/.cache/claude-grc/scf/<version>/`, refreshed every 7 days) and uses it to fan each SCF anchor out to the equivalent control IDs in SOC 2, NIST 800-53 r5, PCI DSS 4.0.1, and ISO 27002:2022. Pass `--scf-only` to skip the fan-out, or `--offline` to stay on cached data. If the mirror is unreachable and no cache is present, the connector falls back to a curated hardcoded mapping covering all five frameworks at one canonical control per family.

## Install

```bash
/plugin install testssl-inspector@grc-engineering-suite
```

You'll also need `testssl.sh` itself — the plugin auto-detects it. Install one of:

- macOS: `brew install testssl`
- Debian/Ubuntu: `sudo apt-get install -y testssl.sh`
- From source: `git clone https://github.com/testssl/testssl.sh ~/.local/share/testssl.sh && export PATH="$HOME/.local/share/testssl.sh:$PATH"`
- Or use Docker without installing — pass `--docker` to setup.

## Quick start

```bash
/testssl-inspector:setup --target=example.com
/testssl-inspector:scan --target=example.com --fast
/testssl-inspector:status
```

See `commands/scan.md` for the full option set, and `skills/testssl-inspector-expert/SKILL.md` for remediation guidance per finding family.

## Outputs

- `~/.config/claude-grc/connectors/testssl-inspector.yaml` — config (runner, version, target list)
- `~/.cache/claude-grc/findings/testssl-inspector/<run_id>.json` — one v1 Finding document per scanned endpoint
- `~/.cache/claude-grc/runs.log` — append-only run summary line

## Scope

Only HTTPS endpoints in the current wrapper. `testssl.sh` itself supports `--starttls` for SMTP/IMAP/POP/FTP/etc.; if you need any of those, open an issue.
