# nist-ai-rmf - NIST AI 100-1 (AI RMF 1.0)

Reference-depth framework plugin for the NIST Artificial Intelligence Risk
Management Framework (AI RMF 1.0, NIST AI 100-1, January 2023). Install and run:

```bash
/plugin install nist-ai-rmf@grc-engineering-suite
/nist-ai-rmf:scope
/nist-ai-rmf:evidence-checklist
/nist-ai-rmf:assess --sources=aws-inspector,github-inspector
```

## Status: Reference

This plugin provides scope determination, an evidence checklist organized by
the AI RMF Core (GOVERN, MAP, MEASURE, MANAGE), and an SCF-backed gap
assessment (158 SCF controls to 91 AI RMF items: 19 categories and 72
subcategories).

AI RMF 1.0 is voluntary. There is no certification, auditor, or regulator.
Organizations use it to structure an AI risk program, to answer customer and
procurement questionnaires, and as the outcome vocabulary behind other AI
governance work. NIST states that AI RMF 1.0 is being revised under the White
House AI Action Plan; until a revision is published, 1.0 is the baseline.

Pair it with [`nist-ai-600-1`](../nist-ai-600-1/) when the AI systems in scope
include generative AI.

### Level up to Full

Full depth adds framework-native workflow commands, such as a profile builder
or an AI system impact assessment. If you have run AI RMF programs, see the
[Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the
level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `general-nist-100-1-ai-rmf` |
| Region | Global |
| Country | US |
| SCF controls mapped | 158 |
| Framework controls mapped | 91 |
| Depth | Reference |
| Issuing body | NIST (voluntary framework; not enforced) |

## References

- [NIST AI 100-1, AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1)
- [NIST AI RMF overview page](https://www.nist.gov/itl/ai-risk-management-framework)
- [AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/)
- [NIST AI Resource Center](https://airc.nist.gov/)
- [Secure Controls Framework](https://securecontrolsframework.com) - crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-100-1-ai-rmf.json)
