# nist-csf-20 — NIST Cybersecurity Framework v2.0

Reference-depth framework plugin for the **NIST Cybersecurity Framework v2.0** (released February 26, 2024). Provides scope determination, evidence collection guidance, and a Profile-style gap assessment organized around the six CSF Functions: Govern, Identify, Protect, Detect, Respond, Recover.

```bash
/plugin install nist-csf-20@grc-engineering-suite
/nist-csf-20:scope                    # decide Functions, Tier target, Profile starting point
/nist-csf-20:evidence-checklist       # evidence patterns per Function
/nist-csf-20:assess                   # Profile gap assessment via SCF crosswalk
```

## Status: Reference

This plugin is at **Reference depth** — it provides scope determination, an evidence checklist organized by Function, and a Profile-style gap assessment, all backed by the SCF crosswalk (250 SCF controls → 134 CSF 2.0 Subcategories).

### Level up to Full

Full depth adds framework-native workflow commands tied to how CSF is actually consumed in practice. Candidate Full-depth commands documented in `skills/nist-csf-20-expert/SKILL.md`:

- `/nist-csf-20:profile-build` — interactive Current/Target Profile authoring
- `/nist-csf-20:tier-assessment` — guided Tier 1–4 evaluation
- `/nist-csf-20:community-profile` — apply published Community Profiles (manufacturing, election infrastructure, electric grid)
- `/nist-csf-20:board-report` — Function-level executive summary for board / audit committee
- `/nist-csf-20:csf1-to-csf2` — migrate an existing CSF 1.1 Profile to 2.0 (accounts for the new Govern Function)
- `/nist-csf-20:sec-disclosure-prep` — map Govern outcomes to SEC Reg S-K Item 106 disclosure requirements

If you have practitioner experience in any of these workflows, see the [Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `general-nist-csf-2-0` |
| Publisher | NIST (U.S. Department of Commerce) |
| Released | February 26, 2024 (final) |
| Region | Global |
| Country origin | United States |
| Status | Voluntary; widely adopted as U.S. cybersecurity baseline |
| SCF controls mapped | 250 |
| Framework controls mapped | 134 |
| Functions | 6 (Govern, Identify, Protect, Detect, Respond, Recover) |
| Categories | 22 |
| Depth | Reference |

## What CSF 2.0 is (and is not)

**CSF 2.0 is**: a cybersecurity outcomes framework, organized as Function → Category → Subcategory, used as a shared vocabulary between CISOs, boards, regulators, and contracting officers. The headline change in 2.0 is the new **Govern (GV)** Function, which holds the cybersecurity program itself (strategy, policy, oversight, supply chain) accountable rather than just incident-response activities.

**CSF 2.0 is not**: a control catalog (use NIST SP 800-53, ISO 27001 Annex A, or CIS Controls v8 for that), a certification program (no CSF certification exists), or a substitute for sectoral regulation (HIPAA, PCI DSS, GLBA, CMMC, etc. still apply on their own terms).

For the full picture — scope decision tree, Tier guidance, Subcategory examples, common misinterpretations, and Full-depth roadmap — see `skills/nist-csf-20-expert/SKILL.md`.

## References

- [Secure Controls Framework](https://securecontrolsframework.com) — crosswalk source
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-csf-2-0.json)
- NIST CSF 2.0 (final, February 26, 2024) — `nist.gov/cyberframework`
- NIST CSF 2.0 Quick Start Guides (SP 1300 series)
- NIST CSF 2.0 Reference Tool — interactive Subcategory browser
