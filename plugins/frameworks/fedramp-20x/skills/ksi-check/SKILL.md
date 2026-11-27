---
name: ksi-check
description: Walk the FedRAMP 20x Key Security Indicators that apply to a certification class and record how each one is met, validated and evidenced. Use when a provider is preparing for or maintaining a 20x certification.
---

# KSI check

Works through the Key Security Indicators (KSIs) for one 20x certification class and records, for each, what the Security Decision Record needs.

## Arguments

- Argument 1 - certification class: `A`, `B` or `C`. Ask if it is not given. FedRAMP has not published the Class D set.
- Argument 2 - a theme to limit the review, for example `IAM` (optional). Themes: CED, CMT, CNA, IAM, INR, MLA, PIY, RPL, SCR, SVC.
- Argument 3 - a path to existing evidence or to a Security Decision Record working file (optional).

`$ARGUMENTS`

## Step 1: list what applies

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" ksi --class=<class> [--theme=<THEME>]
```

- **Class A** addresses 7 named KSIs.
- **Class B** has all 46, of which 5 are optional: `KSI-CNA-EIS`, `KSI-MLA-ALA`, `KSI-SVC-PRR`, `KSI-SVC-RUD`, `KSI-SVC-VCM`.
- **Class C** has all 46 with none optional.

The script prints the statement of each KSI from the bundled rules release and says which release that is. For the controls FedRAMP lists against one KSI: `node "${CLAUDE_PLUGIN_ROOT}/scripts/rules.js" show KSI-IAM-APM`.

## Step 2: for each KSI, establish five things

These are what the Security Decision Record asks for (rule `SDR-CSX-KSI`):

1. **Measures and objectives.** What the provider does to achieve the outcome, or why there is no measure and what risk that leaves customers.
2. **Cycle.** How often each persistent measure repeats. "Persistently" means in repeated cycles with the status always known, not necessarily continuously.
3. **Verification.** How the provider knows the measures are the ones described.
4. **Automation.** Whether the automation behind the measure is accurate and sufficient, or why none is needed.
5. **Validation.** How the provider knows the measures work.

Ask for what exists rather than assuming. Read configuration, pipeline definitions and policy-as-code in the repository when the user points to them.

## Step 3: count automated methods

Rule `FRC-CSX-VVK` sets how many automated methods persistently verify and validate each KSI:

| Class | Expectation |
|---|---|
| A | May automate |
| B | Should have at least 1 automated method per KSI |
| C | Must have at least 2 automated methods per KSI |

Record each method with what it checks, where its data comes from and how a failure is detected and handled. An assessor will look at the measurement system as well as the security capability.

## Step 4: report

For each KSI give: the measures found, the cycle, the automated methods, the evidence, and what is missing. Then a short list of the KSIs with the least behind them.

Rules for the report:

- Do not write "compliant", "pass" or "fail". FedRAMP defines no pass criteria for a KSI and attaches no MUST or SHOULD to one. Say what is in place, what is evidenced and what is not.
- The SP 800-53 controls FedRAMP lists against a KSI are pointers for analysis. Implementing them does not show the KSI is met.
- An optional Class B KSI still needs a line saying whether it was addressed.
- Say which rules release the review used.

## Step 5: record it

To keep the result in the form FedRAMP's schema expects, put it in a Security Decision Record working file:

```
/fedramp-20x:sdr init C
```

Each KSI entry there has `ksiImplementation`, `ksiValidation`, `ksiAssessment`, `ksiTests` and `ksiEvidence`. Leave `ksiAssessment` for the independent assessor.

## Examples

```
/fedramp-20x:ksi-check C
/fedramp-20x:ksi-check B IAM
/fedramp-20x:ksi-check A ./sdr-working.json
```
