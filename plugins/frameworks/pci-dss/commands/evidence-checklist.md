---
description: Generate evidence checklist for PCI DSS requirements
---

# PCI DSS Evidence Checklist

Generates audit-ready evidence collection checklists for PCI DSS v4.0.1 requirements. Use this to plan a per-requirement evidence binder for cardholder data environment (CDE) controls without copying the PCI DSS catalog text.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. For PCI DSS workflows, raw exports may also contain cardholder data (CHD) or primary account number (PAN) values from logs, packet captures, screenshots, or database samples. Never store PAN unencrypted, never keep sensitive authentication data after authorization, and never commit exports to source control. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/pci-dss:evidence-checklist <requirement> [--saq <A|A-EP|B|B-IP|C|C-VT|D|P2PE>] [--export <markdown|json|csv>]
```

## Arguments

- `<requirement>`: PCI DSS requirement number. Accepts a top-level requirement (`4`, `8`, `12`) or a specific requirement (`1.4.1`, `8.3.6`, `12.10`).
- `--saq`: Self-Assessment Questionnaire scope. Default: `D`, the broad merchant default for all in-scope CDE controls. `A` and `P2PE` intentionally produce leaner checklists for responsibilities that usually remain with the merchant.
- `--export`: Export format (`markdown`, `json`, or `csv`). Default: `markdown`.

## SAQ Scoping Rules

Use SAQ scope to trim evidence to the controls the organization is responsible for. Always confirm scope with the acquirer, QSA, and current PCI SSC SAQ instructions before relying on a checklist.

| SAQ | Typical scope signal | Checklist behavior |
|-----|----------------------|--------------------|
| `A` | Fully outsourced e-commerce payment pages; no electronic storage, processing, or transmission by the merchant | Keep policy, vendor, redirect/iFrame, TLS certificate, and incident-response evidence; omit most internal CDE host, network, and account samples |
| `A-EP` | E-commerce site can affect payment page security | Include web server, change control, vulnerability management, and TLS evidence for the e-commerce environment |
| `B` | Imprint machines or standalone dial-out terminals | Focus on device inventory, physical security, vendor support, and paper handling |
| `B-IP` | Standalone IP-connected terminals | Add network segmentation, terminal configuration, and secure transmission evidence |
| `C` | Payment application connected to the internet, no electronic CHD storage | Include application host, network, access, logging, and secure transmission evidence |
| `C-VT` | Virtual terminal entered through an isolated workstation | Focus on workstation hardening, browser/session controls, physical access, and service-provider evidence |
| `D` | Everything in scope, or service provider scope | Full evidence binder across technical, operational, and governance controls |
| `P2PE` | Validated P2PE solution | Focus on P2PE instruction manual, device custody, POI inventory, and merchant responsibilities |

## Evidence Binder Format

For each selected requirement, produce these sections:

1. Scope statement: systems, networks, applications, service providers, SAQ, and sampling basis.
2. Paraphrased control objective: reference requirement numbers only; do not paste PCI DSS text.
3. Required documentation: policies, procedures, diagrams, standards, approvals, and retention expectations.
4. Automated evidence: commands, exports, screenshots, or system reports with collection frequency.
5. Manual evidence: interview notes, sampled tickets, diagrams, attestations, and QSA-ready narratives.
6. PAN/CHD handling note: confirm masking, encryption, redaction, and evidence locker location.
7. Export block: render the same data as markdown, JSON, or CSV when requested.

## Requirement Family Guidance

| Requirement | Evidence focus |
|-------------|----------------|
| `1` | Network security controls, segmentation diagrams, firewall/router rule reviews, inbound/outbound traffic justification |
| `2` | Secure configuration standards, default account removal, system inventory, configuration baselines |
| `3` | Stored account data inventory, retention, truncation/masking, encryption/key-management evidence |
| `4` | Strong cryptography for transmission, TLS configuration, certificate inventory, trusted channel validation |
| `5` | Malware protection coverage, update status, alert handling, exclusions approval |
| `6` | Secure SDLC, vulnerability remediation, change control, code review, payment page script governance |
| `7` | Need-to-know authorization, role definitions, access approvals, privilege reviews |
| `8` | Unique IDs, authentication factors, MFA, password/session settings, account lifecycle evidence |
| `9` | Facility access, visitor logs, media handling, POI device inspection records |
| `10` | Audit logging, time synchronization, log review, alert triage, retention |
| `11` | Vulnerability scans, penetration tests, IDS/IPS, file integrity monitoring, segmentation testing |
| `12` | Security policy, risk assessment, awareness, service-provider management, incident response |

## Example: Requirement 4 Transmission Security, SAQ D

```bash
/pci-dss:evidence-checklist 4 --saq D
```

**Output:**

```markdown
PCI DSS Evidence Checklist
Requirement: 4 - Protect account data during transmission over open, public networks
SAQ: D
Scope: All CDE ingress/egress paths, payment APIs, administrative channels, third-party integrations, and public endpoints that transmit account data
Export: markdown

## Control Objective (paraphrased)

Systems that transmit account data over open or public networks should use strong, current cryptography and trusted certificates. Cleartext protocols, weak ciphers, and untrusted channels should be identified, justified only where out of scope, and removed from CDE transmission paths.

## Required Documentation

□ **CDE data-flow diagram**
  - Shows where account data enters, leaves, or traverses the environment
  - Identifies public networks, payment processors, service providers, and administrative access paths
  - Evidence: approved diagram with date, owner, and version
  - Frequency: update after architecture changes; review at least annually

□ **Cryptography and key/certificate standard**
  - Defines approved protocols, minimum TLS versions, certificate issuance, renewal, and deprecation rules
  - Includes exception handling for legacy endpoints
  - Evidence: approved standard and exception register

□ **Certificate and endpoint inventory**
  - Includes endpoint owner, hostname, certificate issuer, expiration date, TLS policy, and CHD/PAN transmission relevance
  - Evidence: inventory export plus owner attestation

## Automated Evidence Collection

✓ **External TLS posture**
```bash
mkdir -p evidence
for host in payments.example.com api-payments.example.com; do
  testssl --jsonfile "evidence/pci-req4-${host}-$(date +%Y%m%d).json" "$host"
done
```
Collection Frequency: Quarterly and after material endpoint changes
Purpose: Demonstrates protocol, cipher, certificate, and vulnerability posture for public payment endpoints
PAN/CHD Note: Do not include live PAN in test URLs, headers, or request bodies.

✓ **Load balancer HTTPS listener inventory**
```bash
aws elbv2 describe-load-balancers --output json \
  > evidence/pci-req4-elb-inventory-$(date +%Y%m%d).json
aws elbv2 describe-listeners --load-balancer-arn <LB_ARN> --output json \
  > evidence/pci-req4-listeners-$(date +%Y%m%d).json
```
Collection Frequency: Quarterly
Purpose: Shows whether CDE-facing listeners use encrypted protocols and managed certificates

✓ **Certificate expiration and policy inventory**
```bash
aws acm list-certificates --output json \
  > evidence/pci-req4-acm-certificates-$(date +%Y%m%d).json
aws cloudfront list-distributions --output json \
  > evidence/pci-req4-cloudfront-tls-$(date +%Y%m%d).json
```
Collection Frequency: Monthly
Purpose: Supports certificate lifecycle and minimum protocol review

## Manual Evidence Collection

□ **Sample payment transaction path walkthrough**
  - Trace a test transaction from browser/device to processor using masked test card data only
  - Capture architecture notes, TLS validation, and service-provider handoff
  - Evidence: walkthrough notes and sanitized screenshots

□ **Quarterly transmission review sign-off**
  - Security owner confirms no cleartext CHD/PAN transmission paths are present
  - Evidence: signed review record and remediation tickets for exceptions

## SAQ D Scope Notes

Because SAQ D is selected, include both merchant-operated CDE controls and service-provider dependencies. Sample every in-scope transmission channel rather than only the outsourced payment page.
```

## Example: Requirement 8 Identification and Authentication, SAQ D

```bash
/pci-dss:evidence-checklist 8.3.6 --saq D --export markdown
```

**Output:**

```markdown
PCI DSS Evidence Checklist
Requirement: 8.3.6 - Authentication factor controls
SAQ: D
Scope: In-scope workforce accounts, administrative access, CDE applications, remote access paths, and service-provider access
Export: markdown

## Control Objective (paraphrased)

Authentication settings should reduce the likelihood of credential guessing, replay, and unauthorized CDE access. Evidence should show current configuration, sampled users, privileged users, remote access, and exception handling.

## Required Documentation

□ **Authentication standard**
  - Defines password/passphrase or equivalent authenticator settings, MFA requirements, lockout/session behavior, and service-account handling
  - Evidence: approved standard, review date, and system applicability matrix

□ **Identity source inventory**
  - Lists IdP directories, local accounts, break-glass accounts, service accounts, and third-party access paths
  - Evidence: inventory export with CDE relevance and owner

□ **Account lifecycle procedure**
  - Covers joiner/mover/leaver workflow, temporary access, privileged approval, and emergency access review
  - Evidence: procedure plus sampled tickets

## Automated Evidence Collection

✓ **IAM credential and MFA report**
```bash
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/pci-req8-credential-report-$(date +%Y%m%d).csv
```
Collection Frequency: Monthly and before assessment sampling
Purpose: Shows password age, access key age, MFA status, and stale accounts for AWS IAM users
PAN/CHD Note: Credential reports contain sensitive usernames and access metadata; store only in the encrypted evidence locker.

✓ **SSO permission-set and assignment inventory**
```bash
aws sso-admin list-instances --output json \
  > evidence/pci-req8-sso-instances-$(date +%Y%m%d).json
aws identitystore list-users --identity-store-id <IDENTITY_STORE_ID> --output json \
  > evidence/pci-req8-identitystore-users-$(date +%Y%m%d).json
```
Collection Frequency: Monthly
Purpose: Supports unique user identification and assigned access review

✓ **CloudTrail account-management events**
```bash
for event in CreateUser DeleteUser UpdateLoginProfile AttachUserPolicy DetachUserPolicy; do
  aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=$event \
    --start-time $(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%S) \
    --output json > "evidence/pci-req8-${event}-$(date +%Y%m%d).json"
done
```
Collection Frequency: Quarterly
Purpose: Demonstrates account lifecycle activity and supports sample selection

## Manual Evidence Collection

□ **User access sample**
  - Sample workforce, administrator, service-provider, and terminated users
  - Match each sample to approval ticket, role, MFA status, and last access
  - Evidence: sample workbook with screenshots or system exports

□ **MFA enforcement validation**
  - Verify administrative and remote CDE access paths require MFA
  - Evidence: IdP policy screenshots, VPN policy, and conditional-access export

□ **Exception review**
  - Document any shared, default, emergency, or service accounts with business justification, owner, compensating controls, and review cadence

## SAQ D Scope Notes

Because SAQ D is selected, include all CDE identity stores and remote access paths. Do not limit the checklist to the payment application if administrators can reach supporting infrastructure.
```

## Example: Requirement 4 Transmission Security, SAQ A

```bash
/pci-dss:evidence-checklist 4 --saq A --export csv
```

**Output:**

```csv
requirement,saq,item_type,item,frequency,evidence,handling_note
4,A,documentation,Outsourced payment flow diagram,annual,"Diagram showing redirect or hosted payment page boundary and service provider handoff","Use only masked test card data in screenshots"
4,A,documentation,Service-provider responsibility matrix,annual,"AOC/ROC summary or contract language showing provider handles CHD transmission","Store contracts in encrypted evidence locker"
4,A,automated,Merchant website TLS scan,quarterly,"TLS scan for merchant pages that redirect or embed hosted payment page","Do not include live PAN in requests"
4,A,manual,Payment page redirect or iFrame validation,annual,"Sanitized screenshots proving CHD is entered only on provider-controlled pages","Never commit screenshots to source control"
```

## JSON Export Shape

When `--export json` is requested, emit an object using this shape:

```json
{
  "framework": "PCI DSS v4.0.1",
  "requirement": "8.3.6",
  "saq": "D",
  "scope": "CDE identity and authentication controls",
  "items": [
    {
      "type": "automated",
      "name": "IAM credential and MFA report",
      "frequency": "monthly",
      "evidence_path": "evidence/pci-req8-credential-report-YYYYMMDD.csv",
      "sensitive_data_handling": "encrypted evidence locker; do not commit"
    }
  ]
}
```

## CSV Export Columns

When `--export csv` is requested, include these columns:

```csv
requirement,saq,item_type,item,frequency,evidence,handling_note
```

## Related Commands

- `/pci-dss:requirement <requirement> evidence` - review requirement-level implementation and evidence guidance.
- `/pci-dss:saq-select` - choose the appropriate SAQ before trimming the checklist.
- `/pci-dss:roc-guidance` - prepare assessor-facing Report on Compliance narratives.
