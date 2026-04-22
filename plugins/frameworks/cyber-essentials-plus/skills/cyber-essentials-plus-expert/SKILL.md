---
name: cyber-essentials-plus-expert
description: UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell expert. Reference-depth framework plugin with assessment, scope determination, and evidence checklist — backed by the SCF crosswalk. Five core controls: Firewalls, Secure Configuration, User Access Control (MFA mandatory for all cloud services), Malware Protection, and Patch Management.
allowed-tools: Read, Glob, Grep, Write
---

# UK NCSC Cyber Essentials Plus (CE+) Expert

Reference-depth expertise for **UK NCSC Cyber Essentials Plus (CE+) v3.3 Danzell** (effective 27 April 2026). This plugin bundles the SCF crosswalk (30 SCF controls → 5 CE+ controls) with framework-specific context.

## Framework identity

- **SCF framework ID**: `emea-gbr-ce-2021`
- **Region**: EMEA
- **Country**: GB
- **Regulator/Certifying bodies**: UK National Cyber Security Centre (NCSC) and IASME Consortium (accredited certification body)

## Framework in plain language

Cyber Essentials Plus is a UK government-backed certification scheme that requires organisations to demonstrate they have implemented five foundational technical security controls: Firewalls, Secure Configuration, User Access Control, Malware Protection, and Patch Management. CE+ is the independently-verified tier — unlike self-assessed Cyber Essentials, an accredited assessor conducts hands-on technical testing of the organisation's systems to verify the controls are in place and effective. The scheme is mandated for UK government supply chain contracts involving personal data or sensitive information, and is widely adopted as a baseline security standard across UK public and private sector organisations.

## Territorial scope and applicability

Any organisation operating in the UK, or supplying to UK government, can pursue CE+ certification. There is no revenue, headcount, or sector threshold — sole traders through FTSE 100 companies all use the same question set. The certification applies to a defined **boundary** chosen by the applicant; the boundary must include all devices that can access organisational data or services. UK government contracts handling personal data or sensitive information require CE+ as a minimum; some contracts (particularly MOD and intelligence community supply chain) require Cyber Essentials Plus specifically. There is no territorial carve-out for organisations headquartered outside the UK if they operate systems within a UK boundary or bid for UK government contracts.

## Mandatory artifacts

- **Completed Danzell v3.3 question set** — self-assessment answers submitted to the certifying body before the assessor visit
- **Asset inventory** — all in-scope devices, cloud tenants, and software
- **Network diagram** — showing the certification boundary and firewall placement
- **Firewall rule sets** — exported or screenshot, for all boundary and host-based firewalls
- **Patch status report** — demonstrating critical patches applied within 14 days
- **MFA configuration evidence** — for all cloud services in scope (mandatory under v3.3)
- **CE+ certificate** — issued by the IASME-accredited certifying body upon successful assessment; valid for 12 months

## Cadence and timelines

- **Annual recertification**: CE+ lapses exactly 12 months after the certification date. There is no grace period.
- **Patch window**: Critical and high-severity patches must be applied within **14 days** of release. This is a hard requirement — patches overdue at the time of assessment will cause a failure.
- **Danzell v3.3 effective date**: 27 April 2026. All assessments submitted on or after this date must use the v3.3 question set.
- **Assessor visit**: Typically scheduled after the self-assessment answers are accepted; the assessor conducts technical verification on live systems.
- **No notification window**: CE+ is a certification scheme, not a breach-notification regulation. Incident notification obligations (e.g. ICO under UK GDPR) are separate.

## Regulator and enforcement

The NCSC owns the Cyber Essentials scheme and sets the technical requirements. The IASME Consortium manages the certification body network and accredits assessors. Enforcement is indirect — there is no regulatory penalty for not holding CE+ unless a contract or regulatory condition requires it. UK government procurement rules (published by DSIT / Cabinet Office) mandate CE+ for relevant contracts; failure to maintain certification can result in contract termination or disqualification from future tenders. Maximum financial exposure therefore flows from contract loss rather than direct fines.

## Interaction with other frameworks

- **UK GDPR / GDPR**: ICO guidance references CE+ as evidence of appropriate technical measures under Article 32. CE+ does not substitute for a full GDPR assessment but satisfies the baseline technical-security element. Run `/cyber-essentials-plus:assess` before a GDPR gap assessment to avoid re-covering the same ground.
- **ISO 27001**: CE+ five controls align with ISO Annex A domains A.8, A.9, A.12, A.13. Organisations pursuing ISO 27001 should implement CE+ first — it is lower effort and provides demonstrable quick wins. Use `/grc-engineer:map-controls-unified` to identify overlaps.
- **NIST CSF**: CE+ maps primarily to the Protect function (PR.AC, PR.DS, PR.IP, PR.PT). The CSF is broader; CE+ is a useful entry point for organisations not yet ready for a full NIST programme.
- **DSPT (Data Security and Protection Toolkit)**: NHS and health/social care organisations must complete the DSPT annually; CE+ certification satisfies several DSPT assertions and can simplify the DSPT submission.

## Common misinterpretations

1. **"MFA is only required for admin accounts."** Incorrect under Danzell v3.3 (effective 27 April 2026): MFA is mandatory for **all user accounts** accessing **any cloud service** within the certification boundary. This includes standard user accounts accessing Microsoft 365, Google Workspace, AWS, and any other SaaS platform in scope.

2. **"We can risk-accept unsupported software and stay in scope."** Incorrect: unsupported or end-of-life software (OS or applications) must be **removed from the boundary** to achieve CE+ certification. A risk acceptance or compensating control is not sufficient — the system must either be updated, replaced, or excluded from the certification boundary.

3. **"CE (self-assessed) and CE+ are the same certification at different levels."** They are different certifications. Cyber Essentials is self-assessed; CE+ requires independent technical verification by an accredited assessor who tests live systems. Many organisations discover gaps during CE+ verification that their self-assessment missed. This plugin covers CE+ only.

4. **"Our cloud provider's compliance certifications mean we're covered."** Cloud provider certifications (AWS ISO 27001, Azure SOC 2, etc.) cover the provider's infrastructure, not the organisation's configuration of that infrastructure. The organisation is responsible for their tenant configuration — firewall rules, MFA settings, patch levels, and account controls in the cloud tenancy are in scope for CE+.

## Command routing

- `/cyber-essentials-plus:scope` — determine applicability and define certification boundary
- `/cyber-essentials-plus:assess` — run a gap assessment against all five controls
- `/cyber-essentials-plus:evidence-checklist` — enumerate evidence requirements by control

All three delegate to `/grc-engineer:gap-assessment` with SCF framework ID `emea-gbr-ce-2021` for the control-by-control mechanics, and wrap the results in CE+-specific terminology.

## Levelling up to Full

Full-depth plugins add framework-specific workflow commands tied to the audit ritual. Candidates for CE+:

- `/cyber-essentials-plus:question-set` — walk through the Danzell v3.3 question set interactively and pre-populate answers from connector evidence
- `/cyber-essentials-plus:assessor-prep` — generate the assessor pack (asset inventory, network diagram, firewall exports, patch report) ready for the technical verification visit
- `/cyber-essentials-plus:boundary-review` — help the organisation define and justify their certification boundary, flag devices that must be included, and identify candidates for explicit exclusion
- `/cyber-essentials-plus:mfa-audit` — enumerate all cloud services in scope and verify MFA is enforced on every one, given the mandatory MFA requirement under Danzell v3.3

## References

- [Secure Controls Framework](https://securecontrolsframework.com)
- [SCF API entry for this framework](https://www.securecontrolsframework.com)
- [NCSC Cyber Essentials overview](https://www.ncsc.gov.uk/cyberessentials/overview)
- [IASME Consortium](https://iasme.co.uk/cyber-essentials/)
- [Danzell question set (IASME portal)](https://iasme.co.uk/cyber-essentials/preview-the-self-assessment-questions-for-cyber-essentials/)
