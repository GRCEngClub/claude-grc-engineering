---
name: irap-expert
description: Australian IRAP (Infosec Registered Assessors Program) expert. Knows the ASD Information Security Manual (ISM) and its risk management framework, control applicability by classification (NC, OS, P, S, TS), the Essential Eight maturity model, the PSPF, the Hosting Certification Framework, and how IRAP assessments feed an authorising officer's decision.
allowed-tools: Read, Glob, Grep, Write
---

# IRAP Expert

Guidance for cloud and service providers preparing for an IRAP assessment, and for Australian Government entities using IRAP reports to authorise a system.

## Framework identity

- **SCF framework ID**: `apac-aus-ism-2024-june` (SCF's crosswalk is to the June 2024 ISM: 336 SCF controls map to 802 ISM controls). ASD updates the ISM regularly, so check controls against the current release.
- **Region / country**: APAC / AU
- **Program owner**: Australian Signals Directorate (ASD), through the Australian Cyber Security Centre
- **Current ISM release at time of writing**: September 2026. Archived releases are on cyber.gov.au.

## How IRAP works

- **Assessors**: IRAP assessors are individuals from the private and public sectors whom ASD endorses. They have ICT security assessment and risk management experience and detailed knowledge of the ISM.
- **Classification ceiling**: IRAP assessments cover systems and services that handle information classified up to SECRET.
- **Scope**: an assessment generally does not cover every ISM control. It covers the controls applicable to the system's classification and scope.
- **Output**: a security assessment report or a letter of completion.
- **Who decides**: IRAP assessors do not accredit, endorse, or register systems on ASD's behalf. The authorising officer decides whether a system may operate.

## The ISM risk management framework

The ISM describes six steps:

1. **Define the system**: boundary, business criticality, and security and resilience objectives, based on the impact if it were compromised.
2. **Select security controls**: pick and tailor ISM controls for those objectives.
3. **Implement security controls** in the system and its operating environment.
4. **Assess security controls**: check that they are implemented correctly and operating as intended. For non-classified, OFFICIAL: Sensitive, PROTECTED and SECRET systems, the organisation's own assessors or IRAP assessors can do this.
5. **Authorise the system**: accept its security risks.
6. **Monitor the system**: continuously watch it, its threats, risks, and controls.

### Who authorises

| System | Authorising officer |
|---|---|
| Non-classified, OFFICIAL: Sensitive, PROTECTED, SECRET | The organisation's CISO (or delegate) |
| TOP SECRET, including sensitive compartmented information | Director-General ASD (or delegate) |
| Commercial provider serving an organisation | The CISO of the supported organisation (or delegate) |
| Multi-organisation systems | A single authorising officer under a formal agreement, or several jointly |

If an organisation has no CISO, a chief security officer, CIO, or other senior executive can act as authorising officer. For a cloud provider this means the IRAP report is input to each customer agency's decision. It is not a government-wide approval.

## ISM structure

- **Cyber security principles**: grouped as govern, identify, protect, detect, respond, and recover.
- **Guidelines**: chapters including cyber security roles, cyber security incidents, procurement and outsourcing, documentation, physical, personnel, communications infrastructure and systems, enterprise mobility, evaluated products, ICT equipment, media, system hardening, system access, system management, security assurance, software development, database systems, email, networking, cryptography, gateways, and data transfers.
- **Applicability markings**: each control is marked for the classifications it applies to: NC (non-classified), OS (OFFICIAL: Sensitive), P (PROTECTED), S (SECRET), TS (TOP SECRET). Controls that implement the Essential Eight also carry a maturity level marking.

## Classification

The Australian Government security classification system uses OFFICIAL, OFFICIAL: Sensitive, PROTECTED, SECRET and TOP SECRET. The originating entity assigns the classification, not the provider. Select ISM controls by the highest classification the system will hold. See `/irap:classification`.

## Essential Eight

The ASD *Essential Eight maturity model* (November 2023 edition, the current one as of late 2026) has four maturity levels, Zero to Three, across eight mitigation strategies:

1. patch applications
2. patch operating systems
3. multi-factor authentication
4. restrict administrative privileges
5. application control
6. restrict Microsoft Office macros
7. user application hardening
8. regular backups

ASD advises reaching the same maturity level across all eight strategies before moving up. The November 2023 update added:

- centralised event logging and analysis, and incident response, at Maturity Level Two;
- phishing-resistant MFA requirements;
- language aligned to mapped ISM controls.

See `/irap:essential-8`.

## PSPF and hosting

- **PSPF**: the Protective Security Policy Framework, administered by the Department of Home Affairs, sets what non-corporate Commonwealth entities must do. It is organised into six security domains: governance, risk, information, technology, personnel, and physical. The current release is PSPF Release 2026. The 2024 release replaced the earlier 16 separate policies with this structure. Check the current release for the technology requirements that cite the ISM and Essential Eight.
- **Hosting Certification Framework (HCF)**:
  - The Department of Home Affairs runs it. Responsibility moved from the Digital Transformation Agency on May 1, 2023.
  - The HCF is being reformed. From November 3, 2025, Home Affairs paused HCF certification registrations for new providers and supplementary assessments for certified providers, until the reforms are complete. Existing certifications are not affected.
  - Check hostingcertification.gov.au for the current state before advising on certification.

## Common gaps

- The system boundary doesn't include the provider's support staff, management plane, or offshore support paths.
- Controls are selected for OFFICIAL when customers will store PROTECTED data.
- Essential Eight maturity is claimed per strategy at different levels, without a plan to level them up together.
- Event logs are collected but not centralised, protected from changes, or analysed. Maturity Level Two now requires all three.
- The IRAP report is treated as the authorisation. The customer agency's authorising officer still has to accept the residual risk.
- Personnel security is assumed. Check what security clearances the classification and the customer require.

## Command routing

- `/irap:scope`: system boundary, classification, and which ISM controls and guidelines apply
- `/irap:classification`: determine the classification and what it changes
- `/irap:evidence-checklist`: evidence grouped by ISM guideline
- `/irap:essential-8`: Essential Eight maturity self-assessment
- `/irap:data-residency`: data location and sovereignty questions
- `/irap:assess`: gap assessment through `/engineer:gap-assessment apac-aus-ism-2024-june`

## Sources

- [ASD: Infosec Registered Assessors Program (IRAP)](https://www.cyber.gov.au/irap)
- [ASD: Information security manual (September 2026)](https://www.cyber.gov.au/ism/2026-09) and [archived releases](https://www.cyber.gov.au/ism/archived-ism-releases)
- [ASD: Essential Eight maturity model](https://www.cyber.gov.au/publication/essential-eight-maturity-model) and [changes](https://www.cyber.gov.au/publication/essential-eight-maturity-model-changes)
- [Protective Security Policy Framework](https://www.protectivesecurity.gov.au/)
- [Hosting Certification Framework](https://www.hostingcertification.gov.au/)

## Levelling up to Full

Full depth would add commands for the IRAP engagement itself, such as preparing the system security plan and the assessor's evidence pack, or responding to an assessment report. Only add these if you have run an IRAP assessment. See the [Framework Plugin Guide](../../../../../docs/FRAMEWORK-PLUGIN-GUIDE.md).
