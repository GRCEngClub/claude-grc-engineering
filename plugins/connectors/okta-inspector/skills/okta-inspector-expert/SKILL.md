---
name: okta-inspector-expert
description: Expertise in evaluating Okta configurations for compliance — policies, MFA, session management, admin accounts, lifecycle. Maps to FedRAMP/NIST/SOC2/PCI identity controls.
---

# okta-inspector expert

You are the interpretation layer between Okta configuration and compliance frameworks.

## Checks this connector runs (v0.1.0)

**Policies**:

| SCF | Check | Source endpoint | Severity |
|---|---|---|---|
| IAC-06 | Password policy: length ≥14, complexity, age ≤90d, history ≥24 | `/api/v1/policies?type=PASSWORD` | high |
| IAC-01.2 | At least one active MFA enrollment policy requires a factor | `/api/v1/policies?type=MFA_ENROLL` | high |
| IAC-15 | Sign-on session lifetime ≤ 720 min (12h) | `/api/v1/policies/{id}/rules` | medium |
| IAC-15.1 | Sign-on session idle ≤ 15 min | same | medium |

**Users**:

| SCF | Check | Severity |
|---|---|---|
| IAC-15.1 | No active users inactive > N days (default 90) | medium |

**Admin factors**:

| SCF | Check | Severity |
|---|---|---|
| IAC-07.1 | ≤5 super admins | medium |
| IAC-01.2 | Every super admin has ≥1 active MFA factor | critical |
| IAC-01.3 | Every super admin has ≥2 active MFA factors (backup) | high |

## Framework mappings (auto-expanded by gap-assessment)

- **IAC-01.2 (MFA)** → SOC 2 CC6.1, CC6.2 · NIST 800-53 IA-02(01), IA-02(02) · FedRAMP IA-02(01) · PCI 8.4, 8.5 · CIS 6.3, 6.5
- **IAC-06 (password policy)** → SOC 2 CC6.1 · NIST 800-53 IA-05 · PCI 8.3 · CIS 5.2
- **IAC-15 (session mgmt)** → SOC 2 CC6.1 · NIST 800-53 AC-11, AC-12 · PCI 8.2.8
- **IAC-15.1 (lifecycle)** → SOC 2 CC6.2, CC6.3 · NIST 800-53 AC-02(03) · PCI 8.2.6

## Interpreting output

### Password policy fails (IAC-06)

Okta's default policy is lenient (minLength=8, no age, no history). Almost every org needs a custom policy assigned to the `Everyone` group with tighter settings. FedRAMP no longer sets password length, age or history values for Rev5: the provider assigns them and records them in its Security Decision Record, and FedRAMP's IA-5 guidance requires authenticators that meet the NIST Digital Identity Guidelines. For FedRAMP 20x, see the `fedramp-20x` plugin. The fix is usually straightforward but requires admin access to Okta.

### MFA enforcement fails (IAC-01.2)

Two distinct failures under this control:

1. **No enrollment policy requires a factor**: users can enroll MFA if they want but don't have to. This fails SOC 2 immediately.
2. **Admin without MFA**: a super-admin user who hasn't enrolled any factor is an active critical finding. These tokens should be revoked until the admin enrolls.

### Session timeouts (IAC-15, IAC-15.1)

FedRAMP's Rev5 control lists for Class C and D include the session controls (AC-11, AC-12), but FedRAMP no longer sets the timeout value. The provider assigns it. Okta's default max is 2 hours which passes; the *idle* timeout is the stricter check — default is often 1 hour or unlimited, which fails a 15-minute assignment. For SOC 2, 30 minutes is usually acceptable — but the connector flags anything over 15m conservatively. Adjust with `--inactive-threshold-days` if your target framework is more lenient.

### Inactive users (IAC-15.1)

FedRAMP's Rev5 control lists for Class C and D include AC-2(3), but FedRAMP no longer sets the inactivity window. The provider assigns it. SOC 2 doesn't have a hard number but most auditors expect ≤90. The default threshold is 90; pass `--inactive-threshold-days=<n>` to match the window in your security documentation (35 is a common strict choice).

**"Never logged in" users**: separate signal. If an account was activated more than N days ago and has never logged in, it's either (a) a dormant service account, (b) a forgotten former-employee ghost, or (c) a future new-hire provisioned early. Any of those warrant review.

### Super admin count (IAC-07.1)

Okta has built-in admin roles: Super Admin, Org Admin, App Admin, Group Admin, Help Desk Admin, Read-Only Admin, etc. The connector specifically counts Super Admins because that's the "root" of the org. 5 is a guideline — some very large orgs need more, some small shops should have 2. FedRAMP and SOC 2 don't mandate a number, but auditors look for "reasonable scope." Pair with the group memberships evaluation (future work) for a complete picture.

## Limits (v0.1.0)

Not covered yet:

- **Factor types evaluated** (is the admin using SMS instead of WebAuthn? FedRAMP's IA-2 guidance requires phishing-resistant MFA, which SMS is not)
- **Okta Identity Engine** (OIE) policy features: authenticators, phishing-resistant constraints
- **Password hashing algorithm** (bcrypt vs older)
- **API token inventory and age** (how many tokens exist, how old, what scope)
- **ThreatInsight / suspicious login analytics**
- **App assignments** (which apps are assigned to which groups / users — orphan apps)
- **Log retention** (System Log is 90 days by default; Log Streaming adds BYO-SIEM)
- **Lifecycle integration** with HRIS — whether offboarding is triggered from an authoritative HR system

When a user asks about these, say "v0.2 roadmap" and point at Okta's built-in reports (Admin → Reports) as complementary.

## Common pitfalls

- **Okta Classic vs Identity Engine (OIE)**: some API responses differ. The connector targets OIE (the current default). If the user is on Classic, `--inactive-threshold-days` still works but some policy settings are named differently; expect more `inconclusive` results.
- **Rate limits**: Okta's per-API-token rate limits are tight (roughly 600 req/minute for the read endpoints). Large orgs with many admins + factors can hit these; the connector wraps to one retry on 429.
- **Admin roles are hierarchical**: a user with Super Admin *and* Org Admin counts once. Don't over-count based on role assignments.
- **Factor-less admins via service accounts**: some orgs have "service" super-admin accounts used only for API calls. These fail the MFA check. The right fix is usually to replace them with an API-service-principal or scoped API tokens rather than a super-admin user.
