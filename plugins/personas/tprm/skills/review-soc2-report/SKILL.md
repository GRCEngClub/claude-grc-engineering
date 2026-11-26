---
name: review-soc2-report
description: Review a vendor's SOC 2 (or SOC 1) report for opinion, period, scope, exceptions, subservice organizations, and the user entity controls you must operate
---

# Review SOC 2 Report

Reads a vendor's SOC report and pulls out what a customer needs to know: whether the auditor's opinion is clean, whether the report covers the service and period you rely on, which tests found exceptions, which subservice organizations are carved out, and which complementary user entity controls (CUECs) are now your job. Output feeds `/tprm:assess-vendor` and `/tprm:score-risk`.

## Arguments

Parse `$ARGUMENTS` as `<report> [flags]`.

- Report (required): the SOC report as a PDF (or extracted text). A folder is accepted when the report comes with a bridge letter and management responses.
- `--vendor=<VENDOR-ID>`: link the review to a vendor record.
- `--service="<name>"`: the product or service you buy, to check against the report's system description.
- `--bridge=<file>`: the bridge letter, if separate.
- `--reliance-date=<YYYY-MM-DD>`: the date you need coverage through. Default today.

## What to extract

1. **Report type**: SOC 2 Type II (design and operating effectiveness over a period), SOC 2 Type I (design at a point in time), SOC 1 (controls relevant to financial reporting), or SOC 3 (general-use summary without test results). A Type I or SOC 3 does not show that controls operated; say so.
2. **Opinion** (Section 1, independent service auditor's report): unqualified, qualified, adverse, or disclaimer. Quote the paragraph that states any qualification and the criteria it relates to.
3. **Service auditor**: firm name and report date. Note if the firm is unfamiliar so the analyst can check it is a licensed CPA firm.
4. **Period**: start and end. Coverage gap = days between period end and `--reliance-date`.
5. **Criteria in scope**:
   - SOC 2 and SOC 3: the trust services categories. Security is always included; check for Availability, Processing Integrity, Confidentiality, and Privacy. If you rely on the vendor for uptime or for personal data handling, the matching category should be in scope.
   - SOC 1: no trust services categories. Record the control objectives the report covers (controls relevant to the user entities' internal control over financial reporting). A SOC 1 does not evidence the SOC 2 Security category; for security assurance, ask for a SOC 2 or ISO/IEC 27001 certificate.
6. **System description** (Section 3): services, infrastructure, locations, and boundaries. Confirm the service you buy is inside the boundary. A report on the vendor's "corporate platform" may exclude the product you use.
7. **Subservice organizations**: each one named, what it provides, and whether the report uses the carve-out method (its controls are excluded; you rely on the subservice organization's own report) or the inclusive method (its controls are tested here). For carved-out providers that hold your data, request their reports too. List the complementary subservice organization controls (CSOCs) the vendor expects them to run.
8. **CUECs**: every complementary user entity control listed. These are controls the vendor assumes you operate, such as reviewing your own users' access or protecting your API keys. Map each to an owner on your side.
9. **Exceptions** (Section 4): for each control with a testing exception, the criterion, the control, what the auditor found, the sample size if given, and management's response. Rate each exception's relevance to you: high when it touches access to your data, change management for the service you use, or incident response; low when it is unrelated to your use.
10. **Bridge letter**: if the period ended more than about three months before your reliance date, ask for a bridge (gap) letter. It is a management assertion, not auditor-tested, that there were no material changes or known control failures since the period ended. Record its date and whether it covers the gap. Ask for the next report date if the gap exceeds 12 months.

## Red flags

- Qualified, adverse, or disclaimed opinion.
- Period ended more than 12 months before the reliance date, with no newer report scheduled.
- The service you buy is outside the system description.
- In a SOC 2: exceptions in logical access (CC6.1 to CC6.3), change management (CC8.1), or monitoring (CC7.2) without a remediation response.
- A SOC 1 offered as the only assurance for a vendor that holds our data.
- A carved-out subservice organization holding your data, with no report from it.
- CUECs you do not currently operate.

## Output

Written to `~/.cache/claude-grc/tprm/<vendor-id or report-stem>/soc2-review-<YYYY-MM-DD>/`:

- `review.md`: the extracted items above, red flags, and questions for the vendor
- `cuecs.csv`: `cuec_id,text,our_owner,currently_operated,evidence`
- `exceptions.csv`: `criterion,control,finding,sample,management_response,relevance`
- `subservice.csv`: `name,service,method,holds_our_data,report_requested`

Example `review.md` header:

```markdown
# SOC 2 review: Acme Payroll — Type II, 2025-07-01 to 2026-06-30

Opinion: unqualified (Security, Availability, Confidentiality). Auditor: Example & Co. LLP, report dated 2026-08-15.
Coverage: period ended 149 days before the reliance date of 2026-11-26. Bridge letter dated 2026-11-01 covers to 2026-10-31.
Service in scope: yes ("Acme Payroll Cloud", Section 3, p. 14).

## Exceptions relevant to us
1. CC6.2: 2 of 25 sampled terminated users kept access past the 24-hour SLA. Management response: automated deprovisioning since 2026-05. Relevance: high (access to our employee data).

## Subservice organizations
- AWS (hosting), carve-out. Holds our data. Request: the AWS SOC 2 Type II via AWS Artifact.

## CUECs we must operate
- CUEC-3: customers review their administrator accounts quarterly. Owner: HR Systems. Currently operated: unknown.
```

## Framework mapping

| Requirement | What this command supports |
|---|---|
| SOC 2 CC9.2 | Vendor risk assessment using the vendor's own assurance |
| ISO/IEC 27001:2022 A.5.22 | Monitoring and review of supplier service delivery |
| NIST CSF 2.0 GV.SC-07 | Ongoing assessment of supplier risk |
| PCI DSS v4.0.1 12.8.4 | Annual monitoring of provider compliance status (a SOC 2 does not replace a PCI DSS AOC for in-scope providers) |

## Examples

```bash
/tprm:review-soc2-report ./vendors/acme-payroll/2026/soc2-type2.pdf --vendor=VENDOR-001 --service="Acme Payroll Cloud"
/tprm:review-soc2-report ./vendors/cloudco/2026/ --bridge=./vendors/cloudco/2026/bridge-letter.pdf
```
