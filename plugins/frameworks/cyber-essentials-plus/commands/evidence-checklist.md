---
description: Evidence checklist for UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell, organized by the five core controls
---

# UK NCSC Cyber Essentials Plus (CE+) Evidence Checklist

Baseline evidence checklist for a CE+ assessment under the Danzell v3.3 question set (effective 27 April 2026). The SCF crosswalk maps 30 SCF controls to the 5 Cyber Essentials Plus controls; this command enumerates what evidence is expected for each control.

## Usage

```
/cyber-essentials-plus:evidence-checklist [--control=<control-name>]
```

## Arguments

- `--control=<control-name>` (optional) — restrict to a single CE+ control. Valid values: `firewalls`, `secure-configuration`, `user-access-control`, `malware-protection`, `patch-management`. Defaults to all five controls.

## Output

Markdown checklist grouped by CE+ control with:

- CE+ control → mapped SCF control ID(s) (from crosswalk)
- Evidence types typically expected (screenshots, config exports, policy documents, scan reports, audit logs)
- Which connector plugins can collect each type automatically
- Which items require manual upload / narrative

## Evidence by Control

### 1. Firewalls

- Firewall rule sets for all boundary firewalls (exported config or screenshot)
- Host-based firewall configuration for all in-scope end-user devices and servers
- Evidence that default-deny inbound rules are in place
- Network diagram showing firewall placement relative to the certification boundary
- Change management records for recent firewall rule changes
- *Requires manual upload*: network diagram, rule rationale for any non-default allow rules

### 2. Secure Configuration

- Asset inventory listing all in-scope devices with OS version and build
- Evidence that default passwords have been changed on all devices and software
- List of enabled services, ports, and protocols per device type — with justification for any non-essential ones
- Auto-lock / screen-lock configuration evidence (≤10 minutes for CE+)
- *Requires manual upload*: configuration baseline documents, password policy screenshots

### 3. User Access Control

- User account inventory: all accounts, roles, and privilege levels
- Evidence of MFA enforcement for **all cloud services** (mandatory under Danzell v3.3)
- Privileged account register — evidence that admin accounts are separate from standard user accounts
- Evidence of removal or disabling of accounts for leavers (joiners/movers/leavers process)
- Evidence that administrative accounts are not used for email or web browsing
- *Requires manual upload*: MFA policy, access review records, leaver process documentation

### 4. Malware Protection

- Anti-malware product name, version, and signature date for all in-scope devices
- Evidence that real-time scanning is enabled
- Evidence that automatic updates are configured (signatures ≤24 hours old at time of assessment)
- Application allowlisting configuration (where used as alternative to anti-malware)
- *Requires manual upload*: screenshots of anti-malware console, policy documents

### 5. Patch Management

- Patch status report showing all in-scope software and OS versions
- Evidence that critical and high patches are applied within **14 days** of release
- Evidence that unsupported or end-of-life software has been removed, updated/replaced, or excluded from the certification boundary
- Patch management process documentation (cadence, tooling, exception handling)
- *Requires manual upload*: vulnerability scan output, patch deployment records

## CE+-specific evidence (verified testing)

CE+ requires an **independent technical verification** by an accredited assessor — unlike self-assessed Cyber Essentials. Additional evidence the assessor will generate or verify:

- Authenticated vulnerability scan of all in-scope external IP addresses
- Internal network scan of a sample of in-scope devices
- Assessor-conducted checks of firewall rule sets and host configuration
- MFA bypass attempt results for cloud service logins

## Assessor expectations

- All evidence must reflect the state at the time of assessment, not a prior period
- Screenshots must be timestamped or assessor-witnessed
- Cloud tenants (Microsoft 365, Google Workspace, AWS) are commonly in scope; export admin portal settings as evidence
