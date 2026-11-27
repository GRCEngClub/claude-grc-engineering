---
name: status
description: Display findings workbook health and vulnerability evaluation and reporting status
---

# VDR Automation — Status

Run these commands to get a current snapshot of your findings workbook and where it stands against the tool's evaluation and reporting deadlines.

## Findings Dashboard

Shows open/closed counts, severity breakdown, overdue findings, and the 5 oldest open items.

```bash
python3 grc_tool.py dashboard --poam master_poam.xlsx
```

## VDR Health Check

Shows CISA KEV findings requiring immediate action, evaluation deadline status, remediation overdue count, and a "next VDR due" date. Run this every morning.

```bash
python3 grc_tool.py vdr-status --poam master_poam.xlsx --baseline <low|moderate|high>
```

Use `low` for Certification Class B, `moderate` for Class C and `high` for Class D. Class A has no value, and `low` is the closest.

The "next VDR due" date comes from the tool's 30, 14 or 7 day update interval, which matches FedRAMP's cadence for refreshing the JSON vulnerability history. Nothing is submitted to FedRAMP on that date. FedRAMP also requires a human-readable vulnerability activity report to all necessary parties at least monthly, whatever the class. The remediation overdue count compares today with each finding's scheduled completion date. It does not apply FedRAMP's timeframes, which depend on class, N-rating, likely exploitability and internet reachability.

## Monthly Findings Report

The upstream tool calls this command `conmon`. It reports the findings opened and closed in a given month.

```bash
python3 grc_tool.py conmon --poam master_poam.xlsx --month YYYY-MM
```

FedRAMP no longer has a monthly ConMon deliverable. It is replaced by an Ongoing Certification Report every 3 months and a monthly vulnerability activity report. This output can feed the monthly report, but it does not contain everything that report requires.

## Executive Report

Severity summary, aging analysis, and scanner breakdown in Excel format.

```bash
python3 grc_tool.py report --poam master_poam.xlsx
```
