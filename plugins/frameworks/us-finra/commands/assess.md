---
description: FINRA compliance readiness assessment
---

# FINRA Assessment

Evaluates broker-dealer cybersecurity compliance with FINRA guidance (builds on SEC Reg S-P and SEC 17a-4).

## Arguments

- `$1` - Assessment scope (optional: full, cybersecurity, supervision)

## Assessment

Routes to gap-assessment with SCF framework ID `usa-federal-sro-finra`.

Delegates to: `/grc-engineer:gap-assessment usa-federal-sro-finra $1`
