# nist-ai-600-1 - NIST AI 600-1 (Generative AI Profile)

Reference-depth framework plugin for **NIST AI 600-1, Artificial Intelligence
Risk Management Framework: Generative Artificial Intelligence Profile** (July
2024). Install and run:

```bash
/plugin install nist-ai-600-1@grc-engineering-suite
/nist-ai-600-1:scope
/nist-ai-600-1:evidence-checklist
/nist-ai-600-1:assess --sources=aws-inspector,github-inspector
```

## Status: Reference

This plugin provides generative-AI scope determination, an evidence checklist
organized by the profile's twelve GAI risks and the AI RMF functions, and an
SCF-backed gap review (139 SCF controls to 250 mapped profile and
suggested-action items).

AI 600-1 is a cross-sectoral profile of AI RMF 1.0, not a separate framework.
It names risks that generative AI creates or makes worse and lists suggested
actions keyed to AI RMF subcategories (IDs such as `GV-1.1-001` or
`MS-2.7-007`). Everything in it is voluntary. Install
[`nist-ai-rmf`](../nist-ai-rmf/) alongside it; the profile assumes the AI RMF
program around it.

The SCF crosswalk is a mapping aid, not evidence of equivalence or compliance.
Determine applicability and review evidence before drawing conclusions. Laws
or contracts may impose separate obligations.

### Level up to Full

Full depth adds framework-native workflow commands, such as a red-team plan or
a content provenance review. See the
[Framework Plugin Guide](../../../docs/FRAMEWORK-PLUGIN-GUIDE.md) for the
level-up checklist.

## Metadata

| | |
|---|---|
| SCF framework ID | `general-nist-600-1-gen-ai-profile` |
| Region | Global |
| Country | US |
| SCF controls mapped | 139 |
| SCF-mapped profile items | 250 |
| Depth | Reference |
| Issuing body | NIST (voluntary framework; not enforced) |

## References

- [NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1) - official profile
- [NIST AI 100-1, AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1) - parent framework
- [NIST AI RMF page](https://www.nist.gov/itl/ai-risk-management-framework)
- [Secure Controls Framework](https://securecontrolsframework.com) - crosswalk source (CC BY-ND 4.0)
- [SCF API entry](https://grcengclub.github.io/scf-api/api/crosswalks/general-nist-600-1-gen-ai-profile.json)
