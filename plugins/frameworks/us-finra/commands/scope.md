---
description: Determine which FINRA and SEC cybersecurity obligations apply to a broker-dealer
---

# FINRA Cybersecurity Scope

Works out which cybersecurity obligations apply to a FINRA member firm and records the reason for each, so the evidence checklist and gap assessment cover the right rules.

## Usage

```bash
/us-finra:scope [--profile <file>]
```

## Arguments

- `--profile <file>` (optional): YAML or JSON describing the firm. Without it, the command asks the questions below one at a time.

## Questions and what each decides

| Question | Decides |
|---|---|
| Is the firm a registered broker-dealer and FINRA member? Is it also an SEC-registered investment adviser or transfer agent? | Whether Reg S-P applies, and to which entities. The 2024 amendments cover broker-dealers (including funding portals), investment companies, registered investment advisers, and transfer agents |
| Is the firm a "larger" or "smaller" entity under the Reg S-P amendments? | Historical compliance date: December 3, 2025 (larger) or June 3, 2026 (smaller). Both have passed, so this matters only for findings about the transition period |
| Does the firm offer or maintain covered accounts (accounts for personal, family, or household purposes, or other accounts with a reasonably foreseeable identity theft risk)? | Whether a Reg S-ID identity theft prevention program is required |
| Does the firm keep customer records electronically? Does it use WORM storage or the audit-trail alternative? | Which Rule 17a-4 electronic-records requirements to test |
| Does the firm rely on security logs to meet Reg S-P Rule 30? | The three-year log retention requirement in Rule 17a-4(e)(14)(ii) |
| Which service providers receive, maintain, process, or access customer information? | Scope of the Reg S-P service-provider oversight and 72-hour notification requirement |
| Is the firm an SCI entity (for example, an alternative trading system above the Reg SCI volume thresholds)? | Whether Regulation SCI applies. The 2023 proposal to bring more broker-dealers under Reg SCI was withdrawn in June 2025 |
| Does the firm have branch offices, remote associated persons, or BYOD devices? | Scope of supervision (Rule 3110) and endpoint controls |
| What systems would a ransomware event take down? | Scope of the business continuity plan (Rule 4370) |

## Output

A scope record with:

- Applicable obligations, each with the rule citation and the answer that triggered it.
- Obligations ruled out, with the reason. For example: "Reg S-ID: no covered accounts, institutional-only business."
- In-scope systems and service providers that hold customer information.
- Open questions to confirm with compliance counsel.

Save the scope record with the exam file. Re-run it when the firm adds a business line, account type, or service provider that holds customer information.

## Notes

- This command does not give legal advice. Rule applicability calls, such as covered-account status or SCI entity status, belong to the firm's compliance and legal teams.
- FINRA's Cybersecurity Effective Practices (August 2026) is guidance, not a rule. Use it to decide how to show compliance, not whether an obligation applies.

## Next step

```bash
/us-finra:evidence-checklist <principle>
```
