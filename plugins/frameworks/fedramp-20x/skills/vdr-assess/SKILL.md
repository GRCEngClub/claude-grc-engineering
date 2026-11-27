---
name: vdr-assess
description: Review a provider's vulnerability detection, evaluation, response and reporting against FedRAMP's VDR and VER rulesets, with the class-based timeframes. Use when preparing for the December 2026 VDR and VER deadline or checking an existing vulnerability programme.
---

# Vulnerability detection, evaluation and reporting review

FedRAMP's vulnerability rules are two rulesets:

- **VDR**, Vulnerability Detection and Response: find vulnerabilities, and mitigate or remediate them within timeframes.
- **VER**, Vulnerability Evaluation and Reporting: evaluate each one, rate it, and report activity.

They apply to **every** certified offering, 20x and Rev5. They become mandatory on **December 7, 2026**, with a grace period to March 7, 2027.

## Arguments

- Argument 1 - certification class: `A`, `B`, `C` or `D`. Ask if it is not given; every timeframe depends on it.
- Argument 2 - path to vulnerability data, a scanner export or a `/fedramp-20x:ver-report` working file (optional)

`$ARGUMENTS`

## Step 1: print the timeframes for the class

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" timeframes --class=<class>
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" rules --set=VDR --class=<class>
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" rules --set=VER --class=<class>
```

Use the printed numbers. Do not quote timeframes from memory: they differ by class and FedRAMP revises them.

## Step 2: detection (VDR)

- **Breadth.** `VDR-CSO-DET` requires systematic, persistent and prompt discovery by whatever techniques fit: assessment, scanning, threat intelligence, disclosure mechanisms, bug bounties, penetration testing, incident response, automated control testing, supply chain monitoring. A programme that is only a scanner does not meet it. An out-of-date statement in the Security Decision Record counts as a vulnerability, and so does a failure of the detection process itself.
- **Sampling.** Effectively identical resources may be sampled (`VDR-CSO-SIR`) unless that makes detection less effective. Ask how samples are chosen.
- **Cadence.** The rules set how often detection runs on sampled resources, on resources likely to drift and on resources unlikely to drift, by class. The `rules` command lists them (`VDR-TFR-PSD`, `-PDD`, `-PCD`).
- Check that scanning never requires weakening security, and that new resources are not deployed with Known Exploited Vulnerabilities.

## Step 3: evaluation (VER)

Every detected vulnerability gets three evaluations, in the context of the offering:

| Evaluation | Rule | Result |
|---|---|---|
| Likely exploitable | `VER-EVA-ELX` | LEV or not |
| Internet-reachable | `VER-EVA-EIR` | Reachable by a payload from the internet, which is not the same as the host being internet-facing |
| Potential Agency Impact | `VER-EVA-EPA` | An N-rating from N0 (extremely unlikely to affect agencies) to N5 (debilitating effect on more than one agency) |

Points to check:

- FedRAMP prescribes **no scoring formula**. There is no CVSS or EPSS threshold in the rules. A tool that derives the N-rating from scanner severity, or exploitability from an EPSS cut-off, is applying its own heuristic. That can be a reasonable starting point, but the provider has to show the evaluation considered its own context.
- Assume exploitation can be automated unless there is evidence otherwise (`VER-EVA-AIA`).
- The N-rating measures effect on agencies, not technical severity. A critical CVE in a component that cannot touch federal customer data may rate low; a medium one that exposes it may rate high.
- Evaluation should finish within the class timeframe counted from detection (`VER-TFR-EVU`).

## Step 4: response (VDR)

- `VDR-TFR-PVR` gives the time, **counted from evaluation**, to reach a **lower N-rating** by partial mitigation, full mitigation or remediation. The cell depends on class, current N-rating, and whether the vulnerability is likely exploitable and internet-reachable. N1 and N0 have no timeframe.
- Mitigation reduces risk; remediation removes the vulnerability. The rules treat them differently.
- **Known Exploited Vulnerabilities** follow the due dates in CISA's KEV catalog even when fully mitigated (`VDR-TFR-KEV`).
- There are no deviation requests. Anything that is not, or will not be, fully mitigated or remediated within **192 days of evaluation** must be categorised as an **accepted vulnerability** (`VER-TFR-MAV`), with a reason. Accepted vulnerabilities replaced the provider POA&M.

## Step 5: reporting (VER)

- A **human-readable activity report at least monthly** to all necessary parties: FedRAMP and every agency customer (`VER-TFR-MHR`).
- **JSON history for automated retrieval**, updated at the class cadence (`VER-TFR-MRH`).
- Each vulnerability record carries the fields in `VER-RPT-VDT`: tracking ID, detection time and source, evaluation time, reachability, exploitability, current and past N-ratings, completed and planned reductions, overdue status with an explanation, and final disposition. Accepted vulnerabilities add the reason for acceptance.
- Do not disclose detail that would help an attacker, but give enough for a risk decision (`VER-RPT-NID`).
- Reports are shared through the provider's trust center. Nothing is submitted to an assessor as a workbook.

To apply the timeframes to real data and write the reports in FedRAMP's JSON shapes, use `/fedramp-20x:ver-report`.

## Output

- For each of the four areas: what is in place, what is evidenced, what is missing, with the rule ID
- Vulnerabilities past their evaluation or reduction timeframe, and those past 192 days that are not yet listed as accepted
- Any place where a tool's heuristic is standing in for the provider's evaluation
- The class and the rules release used

Most timeframe rules are SHOULD. Say "past the expected timeframe" and name the rule; do not call it a violation. The MUSTs are detection itself, the three evaluations, the accepted-vulnerability categorisation and the monthly report.

## Examples

```
/fedramp-20x:vdr-assess C
/fedramp-20x:vdr-assess B ./exports/vulnerabilities.json
```
