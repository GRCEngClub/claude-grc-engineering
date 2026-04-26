---
description: India DPDPA personal data breach response — 72-hour clock, parallel sectoral clocks, notification content, post-breach review
---

# India DPDPA Breach Process

End-to-end personal data breach response under DPDPA Section 8(6) and DPDP Rules 2025 R7, with the parallel sectoral clocks every regulated Fiduciary must run alongside.

The single most common DPDPA-era breach failure is **clock collision** — running only the 72-hour DPDPA clock and missing the 6-hour CERT-In / RBI / SEBI clocks that fire in parallel for the same incident. This command's purpose is to prevent that.

## Usage

```bash
/ind-dpdpa:breach-process [--phase=detect|classify|notify|investigate|review] [--sectors=<list>]
```

Phases:

- `detect` — discovery and confirmation of a personal data breach
- `classify` — severity, notifiability, scope, sectoral applicability
- `notify` — DPB, affected Principals, sectoral regulators, internal stakeholders
- `investigate` — forensic preservation and root-cause analysis
- `review` — post-incident review and programme improvement

If `--sectors` is passed, the parallel-clock matrix is rendered for those sectors.

## What is a "personal data breach"?

Section 2(u) covers any incident that compromises the **confidentiality, integrity, or availability** of personal data — including unauthorised processing, accidental disclosure or sharing, alteration, destruction, and loss of access. Consult the Act for the authoritative wording.

This is broader than a "cyber incident":

| Event | DPDPA personal data breach? | CERT-In cyber incident? |
|---|---|---|
| Ransomware encrypts customer database; production access lost | Yes (availability) | Yes |
| Unauthorised employee exports customer list to personal cloud | Yes (confidentiality) | Maybe (insider threat) |
| DDoS causes service unavailability; no data exfil | Context-dependent — likely **Yes** if the unavailability blocks Data Principals from accessing their personal data (loss of access falls within Section 2's availability/loss-of-access limb). Document the determination basis. | Yes |
| Misconfigured S3 bucket exposes customer records publicly | Yes (confidentiality) | Yes |
| Bug deletes a Principal's account record without backup | Yes (availability for that Principal) | Possibly |
| Cross-tenant data leak in SaaS product | Yes | Yes |
| Lost laptop with encrypted customer data; key custody intact | Likely No (current interpretation; document the basis) | Maybe (per CERT-In) |
| Phishing attempt unsuccessful | No | Possibly (per CERT-In) |

When the events overlap, both regulator obligations fire. Both clocks run.

## Parallel-clock matrix

For a regulated Fiduciary, identify which clocks apply to a given incident **before** the first notification goes out. Missing the fastest clock is the typical failure.

| Source | Trigger | Timeline | To whom |
|---|---|---|---|
| **CERT-In Direction 20(3)/2022** | Cyber incident (broad scope including unauthorised access, data breach, identity theft, malware, defacement, DDoS, etc.) | **6 hours** from awareness | CERT-In via incident@cert-in.org.in |
| **RBI Cyber Security Framework** | Cyber incident at scheduled commercial banks, urban cooperative banks, NBFCs, payment system operators | **6 hours** | RBI / IDRBT CSITE Cell |
| **SEBI CSCRF** | Cyber incident at MIIs, intermediaries, AMCs, depositories | **6 hours** | SEBI / CERT-In / NCIIPC per matrix |
| **IRDAI Information & Cyber Security Guidelines (2023)** | Cyber incident at insurer / intermediary | Per current direction (typically rapid; check current circular) | IRDAI |
| **DoT / TRAI Telecom Cyber Security Rules 2024** | Cyber-security incident in a telecom network | Per the Rules' reporting matrix | DoT / TRAI / CERT-In |
| **NCIIPC** | Incident affecting Critical Information Infrastructure | Immediate | NCIIPC |
| **DPDPA 8(6) + DPDP Rules 2025 R7** | Personal data breach | **72 hours** from awareness | Data Protection Board of India + each affected Data Principal |
| **Contractual obligations** | As specified in customer / partner / B2B contracts | Often **24 – 48 hours** | The contractual counterparty |

**Operating principle**: when you can't yet tell whether a clock applies, start the clock anyway and extend if the analysis disconfirms applicability. Stopping a clock you've started costs nothing; missing one is unrecoverable.

## Phase 1: Detect

**Trigger sources**:

- Internal: SIEM alert, EDR alert, anomaly detection, employee report, customer complaint, audit finding.
- External: regulator inquiry, third-party security researcher disclosure, media report, sub-processor notification, threat-intel feed.

**Detect-phase actions**:

1. **Open a tracked incident record** — unique ID, time of awareness (this is **t-zero** for every clock).
2. **Activate the on-call structure** — incident commander, scribe, comms lead, legal lead, privacy lead, sectoral compliance lead (where applicable).
3. **Preserve volatile evidence** — log snapshots, memory captures, configuration baseline, suspect-account session details. Chain-of-custody log starts here.
4. **Containment** — without destroying evidence: isolate affected systems, rotate credentials, revoke tokens, network segment, remove malicious accounts.
5. **Initial scope estimate** — which systems, which data categories, which Principals (count or estimate range).

**Output of Phase 1**: an incident record with t-zero, initial scope, on-call activated.

## Phase 2: Classify

**Within 1 – 4 hours of t-zero**, complete the classification before the fastest clock expires.

**Classification axes**:

- **Personal data involved?** Yes / No / Suspected → DPDPA scope.
- **Cyber incident per CERT-In?** Yes / No → CERT-In 6h.
- **Sectoral applicability?** Banking / securities / insurance / telecom / health / DPI → sectoral 6h or per direction.
- **Severity**: Critical / High / Medium / Low (based on data sensitivity, volume, and harm potential).
- **Affected Principal count**: known / estimated range.
- **Cross-border component?** Was data transferred to or from India during the incident?
- **Active exfiltration vs contained event?** Determines pace and content of notification.
- **Children's data involved?** Adds Section 9 emphasis.

**Severity criteria (illustrative — calibrate to organisation)**:

| Severity | Indicator |
|---|---|
| Critical | Confirmed exfil of large-volume personal data; or sensitive categories (financial, health, biometric, child); or active threat actor with persistence |
| High | Suspected exfil; or unauthorised access to personal-data-bearing systems; or material integrity compromise |
| Medium | Limited unauthorised access; data plausibly intact; controlled containment |
| Low | Theoretical exposure; no evidence of access |

**Notifiability decision** — for each clock, document the determination basis. If the determination is "not notifiable," document why. The DPB may inquire later; the determination basis is the defensible record.

**Output of Phase 2**: classification record with severity, applicable clocks, notifiability determination per clock, target notification times.

## Phase 3: Notify

### 3.1 CERT-In (6 hours from awareness)

If the incident qualifies as a cyber incident under Direction 20(3)/2022, file the CERT-In report within 6 hours. Direction-prescribed format; submit to incident@cert-in.org.in (or the current channel CERT-In specifies).

Include: affected systems, attack vector if known, indicators of compromise, initial impact assessment, contact point.

### 3.2 Sectoral regulator (6 hours, where applicable)

Concurrent with CERT-In. Use the sectoral format:

- **RBI**: report via the designated cybersecurity reporting channel; include impact on customer service availability.
- **SEBI**: per the CSCRF reporting flow.
- **IRDAI**: per current circular.
- **DoT / TRAI**: per Telecom Cyber Security Rules 2024 reporting matrix.
- **NCIIPC**: where the incident affects CII.

The sectoral regulator's expectations on content go beyond CERT-In's — typically including business-continuity status, customer-impact estimate, market-functioning impact (for capital markets).

### 3.3 DPDPA — Data Protection Board of India (72 hours)

The Section 8(6) intimation goes to the **DPB** in the form and manner prescribed under the DPDP Rules 2025. The 72-hour clock is from awareness — the same t-zero used for the sectoral 6-hour clocks.

**Notification content (Rules-aligned baseline)**:

| Field | What to include |
|---|---|
| Nature of breach | Confidentiality / integrity / availability compromise; root cause if known. |
| Date and time of breach | Best-known; range acceptable if exact unknown. |
| Date and time of awareness | t-zero — drives the 72-hour calculation. |
| Categories and approximate number of affected Data Principals | Range acceptable if exact unknown; commit to update on confirmation. |
| Categories and approximate volume of personal data records | E.g. "names, email addresses, phone numbers, partial card numbers — approx 120,000 records." |
| Likely consequences | What harm Principals may suffer — financial, reputational, identity, safety. |
| Measures taken or proposed to mitigate | Technical containment, credential rotation, monitoring, customer notifications. |
| Contact point | Person and channel for the Board to reach. |

If material facts change after submission, **submit an update**. The Board prefers a timely first report with updates over a delayed first report.

### 3.4 DPDPA — affected Data Principals (72 hours)

In parallel with the Board notification, give intimation to each affected Principal. The Rules prescribe form and content. Practical posture:

- Use the channel the Principal would expect: in-app banner + push, registered email, registered SMS / WhatsApp Business message.
- Plain-language; avoid legalese.
- State: what happened, what data, what consequences, what the Principal can do (steps to protect themselves), what the Fiduciary is doing, the contact point.
- Do not under-claim: stating "no harm expected" when harm is plausible is a regulator-trust failure even if technically correct.

For very large affected populations, a **conspicuous public notice** (top of website, in-app top banner, social media, press release where appropriate) is generally considered to constitute reasonable best efforts when individual outreach is impracticable. The Rules-prescribed mechanism for public notice should be followed.

### 3.5 Internal and contractual notifications

- **Board of Directors / Audit Committee** — for Critical / High severity.
- **Customer / partner contractual counterparties** — per their contracts (often 24 – 48 hours).
- **Cyber insurance carrier** — per policy terms, typically within 24 – 48 hours.
- **Investors / acquirers** (for material events at listed entities) — per disclosure obligations.

**Output of Phase 3**: dispatched notifications with timestamps and acknowledgements; updates queued for new material facts.

## Phase 4: Investigate

Forensic and remediation work continues in parallel with notifications.

**Investigation actions**:

- **Forensic preservation** — disk images, memory captures, log archives. Chain of custody.
- **Root cause analysis** — technical, procedural, and contextual. Don't stop at "phishing"; ask "why was the access this email yielded so wide?"
- **Lateral-movement scoping** — confirm bounds; don't assume the first-discovered scope is the actual scope.
- **Affected-Principal census** — refine the count; reconcile with the initial estimate.
- **Threat-actor analysis** (where relevant) — attribution, motivation, persistence indicators.
- **Engagement of external assistance** — incident response retainer, regulator-recognised forensic firm, legal counsel.
- **Remediation tracking** — every remediation item ticketed with owner and SLA.
- **Update notifications** as material facts firm up — to the Board, to Principals (if scope materially changed), to sectoral regulators.

**Output of Phase 4**: forensic report; root-cause statement; remediation tracker; reconciled affected-population count.

## Phase 5: Review

Within 30 days of incident closure:

- **Post-incident review (PIR)** — chronology, decisions, what worked, what didn't.
- **Control failure analysis** — which control should have prevented or detected; why it didn't.
- **Programme improvement actions** — owned, scheduled, measurable.
- **Tabletop or live drill** of the lesson learned, within 60 days.
- **Briefing to leadership / Board** — facts, root cause, regulatory posture, programme improvements.
- **Update breach playbook** — incorporate the learning. Versioned.
- **Update training** — incorporate the lesson into security and privacy awareness.
- **Update vendor expectations** — if a Processor / sub-processor was involved, contract or process changes.

**Regulator follow-through**:

- Track DPB inquiry status — written submissions, hearings, orders.
- Track sectoral regulator follow-through — show-cause notices, penalty proceedings.
- Maintain a **DPB filing register** — every notification, response, and order.

## Common failure modes

1. **Starting only the 72-hour clock.** The 6-hour clocks fire first; the failure is silent until the 6-hour-clock regulator comes back asking why they weren't told.
2. **Under-scoping affected Principals.** Initial estimate is too low; subsequent confirmation triggers a "second wave" notification that erodes trust.
3. **Notifying Principals before regulators.** Most sectoral regulators expect them to be informed first or concurrent. Public statements that beat the regulator filing damage the relationship.
4. **Drafting the Principal notification in legalese.** Principals can't act on it; Board / regulator views it as evasive.
5. **No update mechanism.** First filing is filed and forgotten; the Board never receives the confirmation that scope was bounded.
6. **No tabletop drill in the past 12 months.** Plays out in slow motion at the worst possible time.
7. **No chain-of-custody on logs.** The forensic finding is challengeable.
8. **Conflating "encrypted, key custody intact" with "no breach."** Document the determination basis; don't assume.
9. **Not informing the cyber insurance carrier in time.** Coverage forfeited.
10. **Treating the breach as IT-only.** Privacy, legal, comms, sectoral-compliance, customer-service have parallel runbooks. Run them concurrently.

## Templates

This command does not vendor regulator-specific templates (they change with each circular). Maintain in your incident response repository:

- DPB-notification template (Rules-aligned content fields)
- Affected-Principal notification (per channel: email, in-app, SMS)
- CERT-In incident report (Direction 20(3)/2022 fields)
- Sectoral regulator template (RBI / SEBI / IRDAI / DoT)
- Internal Board / Audit Committee briefing
- Cyber insurance notification
- Customer contractual notification
- Public notice (where applicable for large-scale events)

Each template carries a version, an owner, and a "last reviewed" date — reviewed at minimum on regulator circular changes.

## Drill cadence

| Drill | Cadence |
|---|---|
| Full clock-collision tabletop (DPDPA + sectoral + CERT-In + contractual) | Annual |
| Channel-specific drill (DPB filing, Principal notification at scale, sectoral filing) | Twice a year per channel |
| New-staff onboarding scenario | Within 30 days of role start |
| Lessons-learned drill | Within 60 days of any actual incident |

## Disclaimer

Engineering and assessment guidance only. **Not legal advice.** The Board, sectoral regulators, and counsel determine what is required in any specific incident. Confirm posture before treating any output as definitive for an active incident.
