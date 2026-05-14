# testssl-inspector

A Claude Code plugin that wraps [`testssl.sh`](https://github.com/testssl/testssl.sh) and emits the toolkit's v1 Finding shape, mapped to SOC 2, NIST 800-53 r5, PCI DSS 4.0.1, ISO 27001:2022, and SCF controls.

## What it does

Runs `testssl.sh` against one or more HTTPS endpoints, parses the JSON output, and produces structured findings the rest of the toolkit can consume — gap assessments, evidence packs, continuous-monitoring runs.

| What testssl checks | Where it lands in compliance frameworks |
|---|---|
| Protocols (SSLv2/3, TLS 1.0–1.3) | SOC 2 CC6.7 · NIST SC-8/SC-13 · PCI 4.2.1 · ISO A.8.24 · SCF CRY-03 |
| Cipher suites (incl. NULL, EXPORT, 3DES, RC4) | SOC 2 CC6.7 · NIST SC-13 · PCI 4.2.1.1 · ISO A.8.24 · SCF CRY-04 |
| Certificate (expiry, chain, signature, key, CAA, OCSP, CT) | SOC 2 CC6.1 · NIST SC-17 · PCI 4.2.1 · ISO A.8.24 · SCF CRY-08 |
| Known CVEs (Heartbleed, ROBOT, POODLE, SWEET32, FREAK, LOGJAM, DROWN, BEAST, …) | SOC 2 CC6.6 · NIST RA-5/SI-2 · PCI 6.3.3 · ISO A.8.8 · SCF VPM-03 |
| HTTP transport headers (HSTS, HPKP, cookie flags) | SOC 2 CC6.7 · NIST SC-8 · ISO A.8.20 · SCF CRY-03 |

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
