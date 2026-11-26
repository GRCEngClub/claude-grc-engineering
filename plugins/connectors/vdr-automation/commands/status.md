---
name: status
description: Display findings workbook health and VDR compliance status
---

# VDR Automation — Status

Run these commands to get a current snapshot of your findings workbook and VDR compliance state.

## Findings Dashboard

Shows open/closed counts, severity breakdown, overdue findings, and the 5 oldest open items.

```bash
python3 grc_tool.py dashboard --poam master_poam.xlsx
```

## VDR Health Check

Shows CISA KEV findings requiring immediate action, evaluation deadline status, remediation overdue count, and when your next VDR submission is due. Run this every morning.

```bash
python3 grc_tool.py vdr-status --poam master_poam.xlsx --baseline <low|moderate|high>
```

## ConMon Report

Monthly continuous monitoring report showing findings opened and closed in a given month.

```bash
python3 grc_tool.py conmon --poam master_poam.xlsx --month YYYY-MM
```

## Executive Report

Severity summary, aging analysis, and scanner breakdown in Excel format.

```bash
python3 grc_tool.py report --poam master_poam.xlsx
```
