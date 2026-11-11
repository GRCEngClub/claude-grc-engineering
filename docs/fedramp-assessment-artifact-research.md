# FedRAMP assessment artifact research

Research snapshot: 2026-11-11. This is a limited inventory for [#170](https://github.com/GRCEngClub/claude-grc-engineering/issues/170), [#171](https://github.com/GRCEngClub/claude-grc-engineering/issues/171), [#172](https://github.com/GRCEngClub/claude-grc-engineering/issues/172), and [#173](https://github.com/GRCEngClub/claude-grc-engineering/issues/173), **not** an authoritative applicability determination or a complete inventory. FedRAMP's [legacy index](https://www.fedramp.gov/legacy/) says its contents are reference-only during the transition to the [Consolidated Rules for 2026](https://www.fedramp.gov/2026/). Confirm applicability and deadlines with the applicable rules and authorizing stakeholders. Rev. 5 and 20x must not be treated as equivalent.

## Examined legacy templates

The version is taken from each downloaded file's template revision history; the SHA-256 pins the exact file examined, not an assertion that it remains current or applicable. The June 2026 revisions add legacy notices. Versions and hashes should be checked again before implementation.

| Artifact and legacy source | Version/date in revision history | SHA-256 of downloaded file | Role |
| --- | --- | --- | --- |
| [SAR Appendix B, Moderate SRTM](https://www.fedramp.gov/legacy/assets/LEGACY%20FedRAMP-SAR-Appendix-B-Moderate-Security-Requirements-Traceability-Matrix-Template.xlsx) | 3.2, 2026-06-16 | `304afffe833065bfd2b1590c1eefb8a617f20582a12984ce41b1d4abf7494a87` | Assessment template; tracks test procedures and results by control |
| [SAR Appendix A, RET](https://www.fedramp.gov/legacy/assets/LEGACY%20SAR-Appendix-A-FedRAMP-Risk-Exposure-Table-%28RET%29-Template.xlsx) | 2.6, 2026-06-16 | `d3c4d10572b81cf0839609fa56585ef363f4ae91d5152afdc6a97d5dfb5ee2a9` | Assessment template; captures identified risks and deficiencies |
| [SAR](https://www.fedramp.gov/legacy/assets/LEGACY%20FedRAMP-Security-Assessment-Report-%28SAR%29-Template.docx) | 5.1, 2026-06-17 | `8bfddb9d35a23341131dcdee7052478efc102f78f0feaad115ffd0833b68964b` | Assessment template; 3PAO report and appendices |

The SRTM workbook has a Control Summary and separate control-family sheets. The RET workbook includes Risk Exposure Table, Risks Corrected During Testing, Configuration Findings and PL-2 Findings sheets. The [legacy SAR playbook](https://www.fedramp.gov/legacy/playbook/csp/authorization/sar/) describes reconciliation of other-than-satisfied controls with open or corrected risks. This is historical guidance, not a rule for every present-day authorization path. The index also lists Low and High SRTMs; their versions and structures have **not** been verified in this research.

## Existing repository support and gaps

- `plugins/frameworks/fedramp-rev5/commands/` offers Markdown command guidance for assessment, baseline selection, SSP and POA&M review. It is not an SRTM, RET or SAR workbook/document generator.
- `schemas/finding.schema.json` defines connector resource evaluations with control IDs, status and optional evidence references. Its pass/fail statuses and connector severity are not automatically equivalent to assessor test conclusions or FedRAMP risk ratings. Per-evaluation deficiency IDs, assessment procedures, risk methodology and reviewer decisions need explicit handling.
- `plugins/grc-engineer/scripts/gap-assessment.js` and crosswalk tooling support general framework gap reporting; mapping a connector evaluation is not proof of baseline coverage, and unmapped controls must not disappear.
- The separate `plugins/connectors/poam-automation/` describes an external POA&M tool and 20x VDR workflow. That is not a legacy RET or SAR generator and does not establish Rev. 5/20x equivalence.
- No complete authorization package or automatic authorization decision is provided by these findings. The original claim of 39 published artifacts remains unverified; the legacy index and current rules must be inventoried separately.

## Proposed sequence, subject to maintainer decisions

1. Resolve applicability, target program, baseline, template version and implementation location first. The #170 thread explicitly asks contributors to wait for the maintainer decision on target and placement. Do not interpret this document as that decision.
2. For #170, establish a versioned assessment-input contract that preserves test, control, evidence and deficiency identifiers, source provenance and unknown/missing mappings. Use synthetic data to test one selected template and baseline; validate workbook sheets, columns and round trips against the exact selected file. Other baselines and formats remain separate work.
3. For #171, cite and pin an applicable risk methodology and template before implementing calculations. Preserve assessor-provided owner, dates, likelihood, impact and rationale; report missing or invalid information rather than inventing it. Test cited examples and workbook round trips.
4. For #172, consume versioned outputs from both artifacts; report inconsistent identifiers and missing inputs. Generate only a clearly marked draft with explicit human-review and attestation placeholders. Never create an apparent assessor signature, authorization recommendation or ATO.
5. For #173, complete a source-by-source inventory with applicability, version, phase, template versus guidance, existing support and owners. Select and separately scope a next artifact only after those decisions. Guidance and authorization decisions are not generatable artifacts.

Any generated artifact is a review aid, not an official assessment, certification or authorization. A qualified assessor and authorizing officials retain their respective responsibilities.
