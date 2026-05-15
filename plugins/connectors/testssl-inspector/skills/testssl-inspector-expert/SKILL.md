---
name: testssl-inspector-expert
description: Interpret testssl-inspector normalized findings, recommend remediations, and tie evidence back to SCF anchor controls plus SOC 2 / NIST 800-53 r5 / PCI DSS 4.0.1 / ISO 27002:2022 equivalents derived from SCF crosswalks.
license: MIT
---

# testssl Inspector Expert

Use this skill when reviewing findings produced by `/testssl-inspector:scan`. The connector wraps `testssl.sh` and emits v1 Findings against `tls_endpoint` resources; this skill translates those into remediation advice an engineer can act on and audit evidence a reviewer can sign off.

## Reading the output

Findings live at `~/.cache/claude-grc/findings/testssl-inspector/<run_id>.json`. Each document covers one TLS endpoint:

- `resource.type = "tls_endpoint"`, `resource.id = "<host>:<port>"`, `resource.uri = "https://<host>:<port>/"`
- `evaluations[]` — one entry per (control_framework, control_id, testssl finding) tuple
- `findings[]` — narrative roll-up for CVEs and critical results (cap 50 per doc)
- `metadata.target`, `metadata.host`, `metadata.port` — the original input

## What testssl IDs mean

Most fails fall into one of five families. The remediation pattern is the same within each family.

### Family 1 — Weak protocol offered

IDs: `SSLv2`, `SSLv3`, `TLS1`, `TLS1_1`. SCF anchors: `CRY-01` (Use of Cryptographic Controls), `CRY-03` (Transmission of Sensitive Data), `NET-09` (Session Authenticity). SCF crosswalk fans these out at scan time — typical resolved targets include NIST `SC-08`, `SC-08(01)`, `SC-08(02)`, `SC-13`, `SC-23`, `SI-07(06)`; SOC 2 `CC6.1`, `CC6.7`; PCI `4.2`, `4.2.1`, `4.2.1.2`, `8.3.2`; ISO 27002 `5.14`, `8.24`, `8.26`.

Remediation:

- Terminate TLS at a load balancer or web server that supports a TLS 1.2+ minimum. AWS ALB: set the security policy to `ELBSecurityPolicy-TLS-1-2-2017-01` or newer. NGINX: `ssl_protocols TLSv1.2 TLSv1.3;`. Apache: `SSLProtocol -all +TLSv1.2 +TLSv1.3`.
- PCI DSS 4.0.1 specifically prohibits SSL and "early TLS" (1.0/1.1) — these are audit-fail conditions, not advisories.

### Family 2 — Weak ciphers in the offered list

IDs: `cipher_negotiated`, `cipherlist_*` (`NULL`, `aNULL`, `EXPORT`, `LOW`, `3DES_IDEA`, `OBSOLETED`), `RC4`, `std_*` variants. SCF anchors: `CRY-01.2` (Algorithm Selection), `CRY-05` (Cryptographic Protection). Resolved targets typically include NIST `SC-13`, `SC-28`, `SC-28(01)`; SOC 2 `CC6.1`, `CC6.7`; PCI `3.5`, `3.5.1.2`, `3.5.1.3`, `8.3.2`; ISO 27002 `8.24`.

Remediation:

- Pin an explicit cipher list. Modern baseline: `TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384`.
- Prefer forward-secrecy ciphers (ECDHE/DHE families). Anything without `(EC)DHE` should be disabled in 2026.

### Family 3 — Certificate posture

IDs: `cert_expirationStatus`, `cert_notAfter`, `cert_signatureAlgorithm`, `cert_keySize`, `cert_chain_of_trust`, `OCSP_*`, `CT`, `DNS_CAArecord`. SCF anchor: `CRY-08` (Public Key Infrastructure). Resolved targets include NIST `SC-12` (Key Establishment & Management) and `SC-17` (PKI Certificates); SOC 2 `CC6.1`.

Remediation depends on the specific failure:

- **Expired / near-expiry**: rotate via ACM (AWS), Let's Encrypt, or your CA portal. Set up rotation alerts at T-30, T-14, T-7 days.
- **Weak signature** (SHA-1, MD5): reissue with SHA-256+ signature.
- **Weak key size** (RSA <2048): reissue with RSA 2048+ or ECDSA P-256+.
- **Broken chain**: server is missing an intermediate. Re-deploy the cert bundle with the full chain (your CA's portal shows the bundle order).
- **No CAA record**: add a `CAA` DNS record naming your authorized issuer(s) — defense against unauthorized certificate issuance.

### Family 4 — Known TLS CVEs

IDs: `heartbleed`, `CCS`, `ticketbleed`, `ROBOT`, `secure_renego`, `secure_client_renego`, `CRIME_TLS`, `BREACH`, `POODLE_SSL`, `fallback_SCSV`, `SWEET32`, `FREAK`, `DROWN`, `LOGJAM`, `BEAST`, `LUCKY13`, `RC4`, `winshock`. SCF anchors: `VPM-01` (Vulnerability & Patch Management), `VPM-06` (Vulnerability Scanning). Resolved targets include NIST `SI-02`, `SI-03`, `RA-05`; SOC 2 `CC7.1` and `CC3.x` POFs; PCI `6.3`, `6.3.1`, `6.3.3`, `11.3`, `11.3.1`; ISO 27002 `8.8`.

These are not configuration tuning — they're vulnerability remediation. Treat any non-`OK` finding here as an audit-tracked vuln with a remediation deadline. Most are addressed by:

- Patching OpenSSL / the TLS implementation on the server.
- Disabling vulnerable protocols/ciphers (e.g., POODLE → drop SSLv3; SWEET32 → drop 3DES/Blowfish; BEAST → use TLS 1.2+).
- For BREACH (HTTP-layer): disable HTTP compression for responses containing sensitive data, or add a per-request masking token.

### Family 5 — HTTP transport headers

IDs: `HSTS`, `HSTS_preload`, `HSTS_time`, `HPKP`, `cookie_secure`, `cookie_httponly`, `banner_*`, `security_headers`. SCF anchors: `CRY-03` (Transmission of Sensitive Data), `WEB-03` (Web App Hardening), `NET-09` (Session Authenticity). Resolved targets include NIST `SC-08`, `SC-08(01)`, `SC-07(17)`, `SC-23`; PCI `4.2`, `6.4`, `6.4.1`.

Remediation:

- **HSTS missing or short max-age**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` and submit to the HSTS preload list (hstspreload.org) for the strongest posture.
- **Cookies without `Secure` or `HttpOnly`**: fix the application — set both flags on every session cookie.
- **HPKP**: deprecated; if testssl flags HPKP usage, plan to remove it (browsers no longer enforce).

## Evidence packaging

For an audit, the auditor wants three things per finding:

1. The raw testssl JSON or its normalized v1 doc (already in `~/.cache/claude-grc/findings/testssl-inspector/<run_id>.json`).
2. The scan timestamp (`collected_at` field).
3. A remediation narrative tying each failed evaluation to a specific control and a future check.

Workflow:

```bash
/testssl-inspector:scan --target=auth.example.com --target=api.example.com
# Inspect the resulting findings file. Attach it to the audit evidence packet
# alongside the remediation tickets opened for each fail.

/grc-engineer:gap-assessment SOC2,PCI-DSS --sources=testssl-inspector
# Aggregates testssl evaluations with your other connector outputs into a
# control-by-control posture view.
```

## What you will not do

- Don't run testssl against endpoints you don't own or are not authorized to test. testssl makes hundreds of connections per target and looks like a scanner to defenders.
- Don't recommend ignoring a fail because "the application is internal." TLS 1.0/1.1 and weak ciphers are no less broken on intranets.
- Don't recommend disabling individual checks just because they're noisy. If a check produces too many false positives, raise an issue against this connector with the testssl `id` and reasoning so we can refine the mapping table.
- Don't claim a finding maps to a framework beyond the five listed in `scan.md`. If a user asks about SP 800-52 Rev. 2 specifically, point them at the relevant framework plugin instead.
