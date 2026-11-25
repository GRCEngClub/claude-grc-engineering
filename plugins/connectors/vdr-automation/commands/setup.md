---
name: setup
description: Install dependencies and verify scanner exports are present
---

# VDR Automation Setup

Run this once before using any other vdr-automation commands.

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh"
```

The script clones the upstream tool, installs `openpyxl` into a virtualenv, and writes `~/.config/claude-grc/connectors/vdr-automation.yaml`, which `collect.sh` requires. If you used this connector under its old name, `poam-automation`, the script also moves the old findings cache out of the findings directory so assessments stop reading it.

The sections below describe the same steps for running the upstream tool by hand. They do not write the connector config.

## Get the Tool

Clone the upstream tool, which is still named POAM Automation Tool:

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
