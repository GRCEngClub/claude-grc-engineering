---
description: Rate a vendor's residual risk from its inherent tier and the strength of its reviewed controls, with a stated rationale
---

# Score Risk

Turns an assessment into a residual risk rating that two analysts would reach the same way. The model is deliberately simple: inherent risk comes from the tier (what the vendor touches), control strength comes from the reviewed evidence, and residual risk is read off a matrix. Each input is shown, so the rating can be challenged.

## Arguments

Parse `$ARGUMENTS` as `<vendor> [flags]`.

- Vendor (required): a vendor ID or an assessment folder from `/grc-tprm:assess-vendor` (`~/.cache/claude-grc/tprm/<vendor-id>/<date>-<type>/`).
- `--tier=<critical|high|medium|low>`: override the tier from the record, with `--reason`.
- `--profile=<standard|financial|healthcare>`: adds the profile's must-pass checks (below). Default `standard`.
- `--compare`: list other vendors with the same services or tier and their ratings, from `./grc-data/vendors/`.

## Inputs

- The vendor record in `./grc-data/vendors/<vendor-id>.json`, for the tier and regulated scope.
- The assessment folder: `findings.csv` and the questionnaire analysis.
- The SOC report review: the newest `~/.cache/claude-grc/tprm/<vendor-id>/soc2-review-*/` folder whose report period ended within 12 months of the scoring date (the same lookup `/grc-tprm:assess-vendor` uses). If the tier requires independent assurance (critical and high), a current SOC 2 review or a reviewed, current ISO/IEC 27001:2022 certificate whose scope covers the service (checked in `assess-vendor`) satisfies it. Only when neither exists, warn and treat independent assurance as missing evidence.

If no assessment exists, stop and ask for one. A score with no reviewed evidence is a guess.

## Control strength

Rate each domain from the evidence, not from the questionnaire alone:

| Domain | Strong | Adequate | Weak |
|---|---|---|---|
| Independent assurance | Current SOC 2 Type II with unqualified opinion, or ISO/IEC 27001:2022 certificate with the service in scope | Report or certificate with gaps in scope or currency, bridged | None, expired, or out of scope |
| Identity and access | MFA on all access to our data; least privilege evidenced | MFA on administrative access only | No MFA on administrative access |
| Data protection | Encryption at rest and in transit, key management described, deletion at exit committed | Encryption confirmed, key management unclear | Gaps in encryption or data location |
| Vulnerability management | Pen test in last 12 months with high and critical findings closed | Pen test with open findings on a remediation plan | No recent test |
| Incident response | Plan tested; customer notification time stated in contract | Plan exists; notification time vague | No plan or no notification commitment |
| Resilience | DR tested in last 12 months against stated RTO and RPO | Plan exists, not tested | None |
| Fourth parties | Subprocessors listed, assessed, and change notice given | Listed only | Unknown |

Overall control strength:

- **Strong**: no Weak domains, and at least half Strong.
- **Adequate**: at most one Weak domain, and it is not independent assurance or identity and access for a critical or high vendor.
- **Weak**: anything else.
- **Insufficient evidence**: required evidence for the tier is missing. Do not rate around the gap.

## Residual rating

| Tier \ Control strength | Strong | Adequate | Weak |
|---|---|---|---|
| critical | Medium | High | Critical |
| high | Low | Medium | High |
| medium | Low | Low | Medium |
| low | Low | Low | Low |

**Insufficient evidence is not a rating.** When required evidence for the tier is missing, the result is `Insufficient evidence` with the list of missing items, at every tier. Give no residual rating and no approval until the evidence arrives, or until the vendor is reassessed at a lower tier with a recorded reason.

**Disqualifying findings override the matrix.** If `assess-vendor` found a disqualifying issue (for example no MFA on administrative access to our data, an adverse or disclaimed SOC opinion, or refusal to provide required evidence), the treatment is "Do not approve" whatever the matrix gives. The only way forward is executive risk acceptance recorded with `/grc-internal:manage-risk accept`, with a dated remediation plan.

**Failed must-pass checks block approval.** The profile checks below are preconditions, not rating inputs. If one fails, the result is `Blocked: <check>` (for example `Blocked: no signed business associate agreement`). Show the residual rating as well, so the risk is visible, but give no approval until the check passes:

- `financial`: for EU financial entities, a vendor supporting a critical or important function must have a contract with the DORA Article 30 provisions and an exit strategy; for US banks, follow the interagency third-party risk guidance the organization has adopted.
- `healthcare`: a signed business associate agreement before any PHI is shared.
- Any vendor in PCI DSS scope: a current Attestation of Compliance, and a written split of which PCI DSS requirements the vendor manages (12.8.5).

## Treatment by rating

Apply these only when there is a rating, no disqualifying finding, and no blocked must-pass check (see above).

| Rating | Treatment |
|---|---|
| Critical | Escalate: do not proceed without a risk owner's decision; proceeding needs executive risk acceptance recorded via `/grc-internal:manage-risk accept`, plus a dated remediation plan |
| High | Approve with conditions: remediation dates in the contract, compensating controls on our side, and a risk register entry |
| Medium | Approve; track findings to closure; normal reassessment cadence |
| Low | Approve |

## Output

Shows the score, then, after the user confirms, writes `score.md` to the assessment folder and sets `metadata.residual_rating`, `metadata.control_strength`, `metadata.blocked_by` (empty when nothing is blocked), and `metadata.scored_at` on the vendor record. Nothing is written before confirmation:

```markdown
# Vendor risk score: Acme Payroll (VENDOR-001)

Tier: high (regulated personal data, about 4,000 employees; outage hurts payroll within a week)
Profile: standard

| Domain | Rating | Evidence |
|---|---|---|
| Independent assurance | Strong | SOC 2 Type II, period ending 2026-06-30, unqualified; bridge letter to 2026-10-31 |
| Identity and access | Adequate | MFA for administrators only (SIG IAM row 14); SOC 2 CC6.1 tested without exception |
| Data protection | Strong | SOC 2 CC6.7; contract clause 9.3 on deletion |
| Vulnerability management | Adequate | Pen test 2026-04; 2 medium findings open, due 2026-12-31 |
| Incident response | Strong | Contract: 72-hour customer notification |
| Resilience | Adequate | DR plan exists; last test not provided |
| Fourth parties | Adequate | Subprocessor list provided; no change notice clause |

Control strength: Adequate. Residual rating: Medium. Must-pass checks: none for this profile.
Treatment: approve; track the two pen test findings; request the DR test report.
Next full reassessment: 2027-11.
```

## Framework mapping

| Requirement | What this command supports |
|---|---|
| ISO/IEC 27001:2022 A.5.19 and A.5.22 | Risk-based supplier treatment and ongoing review |
| SOC 2 CC9.2 | Vendor risk assessment and treatment |
| NIST CSF 2.0 GV.SC-04 and GV.SC-07 | Prioritizing suppliers by criticality; assessing and responding to supplier risk |
| DORA Articles 28 and 30 | Proportionate ICT third-party risk management; contract provisions for critical or important functions |
| PCI DSS v4.0.1 12.8.4 and 12.8.5 | Annual monitoring of provider compliance; responsibility split |

## Examples

```bash
/grc-tprm:score-risk VENDOR-001
/grc-tprm:score-risk ~/.cache/claude-grc/tprm/VENDOR-001/2026-11-26-periodic/ --profile=financial
/grc-tprm:score-risk VENDOR-007 --compare
```
