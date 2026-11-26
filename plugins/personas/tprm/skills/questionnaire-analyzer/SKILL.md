---
name: questionnaire-analyzer
description: Analyzes completed vendor security questionnaires (Shared Assessments SIG Lite and Core, CSA CAIQ v4.1 and v4.0.x, EDUCAUSE HECVAT, custom). Checks completeness, N/A justifications, contradictions, and tier-specific red flags; writes follow-up questions and evidence requests. Used by /tprm:analyze-questionnaire.
allowed-tools: Read, Write, Glob, Grep
---

# Questionnaire Analyzer

A completed questionnaire is a vendor's description of itself. This skill finds where that description is incomplete, inconsistent, or below what the vendor's tier requires, and turns each problem into a question or an evidence request the analyst can send.

## Formats

Read `.csv`, `.json`, `.md`, and `.pdf`. Spreadsheets must be exported to one `.csv` per question sheet before analysis, because the Read tool cannot parse `.xlsx`; ask the user to export rather than guessing at the contents.

- **SIG** (Shared Assessments): yearly releases. SIG Lite for screening and lower tiers, SIG Core for vendors with sensitive or regulated data. The 2026 SIG, released September 19, 2025, aligns its mappings to ISO/IEC 27001:2022 and references ISO/IEC 42001 for AI governance. Record which year the vendor answered.
- **CAIQ** (Cloud Security Alliance): CAIQ v4.1 was released in January 2026 with 283 questions aligned to CCM v4.1; it succeeds CAIQ v4.0.x (CCM v4.0.13 was the last 4.0 release). Each question carries a CCM control ID, and answers name the owner: CSP-owned, CSC-owned (us), third-party-owned, shared CSP and CSC, or shared CSP and third party. Only items that involve the CSC are obligations on our side; list them. Items owned or shared with a third party are fourth-party dependencies; ask for that party's assurance.
- **HECVAT** (EDUCAUSE): common in higher education. Note the version on the cover sheet.
- **Custom**: map each question to the nearest ISO/IEC 27001:2022 Annex A control or SOC 2 criterion so results compare across vendors.

Older versions (CAIQ v3.1, SIG 2023 or earlier) are still usable, but question numbering and coverage differ; say which version was answered.

## Reading answers

- A "Yes" whose comment narrows the scope ("for production systems", "where supported", "planned for Q3") is a partial answer.
- "N/A" needs a reason that fits the service. "N/A, fully hosted on AWS" for physical security is reasonable; "N/A" for access reviews is not.
- Identical comments pasted across many rows, every answer "Yes", or answers that describe another product suggest a template response. Ask who completed it and for which service.
- An answer that cites a policy or report should be backed by that document. Add it to the evidence requests.

## Contradiction checks

Compare answers across domains and flag a contradiction only when both answers cannot be true: "no subcontractors" versus hosting on a cloud provider; incident notification time versus the contract; data location versus the subprocessor list; "MFA for all users" versus "local accounts cannot use MFA". Compatible answers (MFA for all users with optional SSO) are not contradictions. A claim with no proof, such as encryption at rest when copies go to an analytics provider with no encryption statement, is an evidence request, not a contradiction.

## Red flags

The default list in `/tprm:analyze-questionnaire` applies by tier. Organization-specific minimums from `--requirements` are checked in addition. Every red flag cites the question ID and quotes the answer.

## Follow-up questions

One question per problem. Make it specific and answerable: "Is MFA enforced for every administrative login to the production environment that hosts customer data, including break-glass accounts? If any exceptions exist, list them." Avoid compound questions that let the vendor answer only the easy half.

## Evidence requests

Tie each request to the answers it would confirm. Common mappings: access control answers → SOC 2 CC6.1 to CC6.3 test results or an access review record; vulnerability management → pen test summary and scan cadence; resilience → DR test report; fourth parties → subprocessor list with locations; encryption → SOC 2 CC6.7 results or architecture documentation.

## Framework references

- ISO/IEC 27001:2022 A.5.19 and A.5.21
- SOC 2 CC9.2
- NIST CSF 2.0 GV.SC-06 and GV.SC-07
- PCI DSS v4.0.1 12.8.3
