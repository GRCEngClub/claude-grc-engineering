---
name: setup
description: Install dependencies and verify scanner exports are present
---

# POA&M Automation Setup

Run this once before using any other poam-automation commands.

## Get the Tool

Clone the POAM Automation Tool repo:

```bash
git clone https://github.com/networkbm/POAM-Automation-Tool
cd POAM-Automation-Tool
```

## Steps

1. Install the required Python dependency:

```bash
pip install openpyxl
```

2. Verify your scanner export files are present. Supported formats:

| Scanner | Format |
|---|---|
| Nessus | `.csv` or `.xml` / `.nessus` |
| Tenable.io | `.csv` |
| Qualys | `.csv` |
| Wiz | `.csv` |
| Generic | `.csv` |

3. Confirm `grc_tool.py` and `poam_converter.py` are in the same directory.

4. Run a quick check:

```bash
python3 grc_tool.py --help
```

If you see all 12 commands listed, setup is complete.
