#!/usr/bin/env bash
# fedramp-ssp:convert — DOCX → OSCAL SSP JSON
set -uo pipefail

CONFIG_FILE="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors/fedramp-ssp.yaml"
SOURCE="fedramp-ssp"

SSP_DOCX=""
APPA_DOCX=""
OUTPUT="./ssp-output.json"
VALIDATE=0
for arg in "$@"; do
  case "$arg" in
    --ssp-docx=*)        SSP_DOCX="${arg#*=}" ;;
    --appendix-a-docx=*) APPA_DOCX="${arg#*=}" ;;
    --output=*)          OUTPUT="${arg#*=}" ;;
    --validate)          VALIDATE=1 ;;
    *) echo "[$SOURCE:convert] unknown flag: $arg" >&2; exit 2 ;;
  esac
done

if [[ -z "$SSP_DOCX" || -z "$APPA_DOCX" ]]; then
  echo "Usage: /fedramp-ssp:convert --ssp-docx=<file> --appendix-a-docx=<file> [--output=ssp.json] [--validate]" >&2
  exit 2
fi
[[ -r "$SSP_DOCX" ]]  || { echo "[$SOURCE:convert] cannot read --ssp-docx='$SSP_DOCX'" >&2; exit 2; }
[[ -r "$APPA_DOCX" ]] || { echo "[$SOURCE:convert] cannot read --appendix-a-docx='$APPA_DOCX'" >&2; exit 2; }

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "[$SOURCE:convert] not configured. Run /fedramp-ssp:setup first." >&2
  exit 5
fi
PYTHON=$(awk -F'"' '/^python:/ {print $2; exit}' "$CONFIG_FILE")
TOOL_DIR=$(awk -F'"' '/^tool_dir:/ {print $2; exit}' "$CONFIG_FILE")

if [[ ! -x "$PYTHON" ]]; then
  echo "[$SOURCE:convert] python path in config ('$PYTHON') is not executable. Re-run /fedramp-ssp:setup." >&2
  exit 5
fi
if ! "$PYTHON" -c 'import docx' 2>/dev/null; then
  cat <<EOF >&2
[$SOURCE:convert] python-docx is not importable from $PYTHON.

Fix (pick one):
  $PYTHON -m pip install --user python-docx
  pipx inject python-docx
  Re-run /fedramp-ssp:setup (it may have recorded a broken venv).
EOF
  exit 5
fi

# Find the pipeline entry point — the upstream tool's layout may vary; try common names.
ENTRYPOINT=""
for candidate in "$TOOL_DIR/cli.py" "$TOOL_DIR/main.py" "$TOOL_DIR/frdocx_to_froscal.py" "$TOOL_DIR/convert.py" "$TOOL_DIR/src/main.py"; do
  if [[ -f "$candidate" ]]; then ENTRYPOINT="$candidate"; break; fi
done
if [[ -z "$ENTRYPOINT" ]]; then
  # Last resort: look for a __main__ module in a package
  ENTRYPOINT=$(find "$TOOL_DIR" -maxdepth 3 -name "__main__.py" 2>/dev/null | head -1)
fi
if [[ -z "$ENTRYPOINT" ]]; then
  cat <<EOF >&2
[$SOURCE:convert] Could not locate the pipeline entry-point in $TOOL_DIR.

The upstream tool's layout has changed. Expected one of: cli.py, main.py,
frdocx_to_froscal.py, convert.py, src/main.py, or a __main__.py.

Fix:
  - Inspect $TOOL_DIR/README.md for the current invocation.
  - Run the pipeline manually once; the plugin calls 'python <entrypoint>'.
  - Or file an issue at GRCEngClub/claude-grc-engineering.
EOF
  exit 5
fi

# Call the pipeline. We pass inputs as positional args and/or --ssp / --appendix
# flags; upstream accepts flag-style in recent versions. Try both in order.
set +e
"$PYTHON" "$ENTRYPOINT" \
  --ssp "$SSP_DOCX" \
  --appendix-a "$APPA_DOCX" \
  --output "$OUTPUT" 2>/tmp/frdocx.err
STATUS=$?
if (( STATUS != 0 )); then
  # Fallback: positional args
  "$PYTHON" "$ENTRYPOINT" "$SSP_DOCX" "$APPA_DOCX" "$OUTPUT" 2>>/tmp/frdocx.err
  STATUS=$?
fi
set -e

if (( STATUS != 0 )); then
  cat /tmp/frdocx.err >&2
  echo "[$SOURCE:convert] pipeline exited $STATUS. See above for tool output." >&2
  exit 3
fi

if [[ ! -s "$OUTPUT" ]]; then
  echo "[$SOURCE:convert] pipeline completed but output '$OUTPUT' is missing or empty." >&2
  exit 3
fi

# Quick summary
SIZE=$(wc -c < "$OUTPUT" | awk '{print $1}')
IMPL_COUNT=$(node -e "
const fs=require('fs');
try{
  const d=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
  const ssp=d['system-security-plan']||d.ssp||d;
  const ir=(ssp['control-implementation']||{})['implemented-requirements']||[];
  console.log(ir.length);
}catch{console.log('?')}" "$OUTPUT")

echo "fedramp-ssp:convert ✓"
printf '  source (SSP):      %s\n' "$SSP_DOCX"
printf '  source (Appendix): %s\n' "$APPA_DOCX"
printf '  output:            %s (%s bytes)\n' "$OUTPUT" "$SIZE"
printf '  implemented-req:   %s\n' "$IMPL_COUNT"

if (( VALIDATE )); then
  if bash "$(dirname "$0")/../../oscal/scripts/validate.sh" "$OUTPUT" --quiet 2>/tmp/validate.err; then
    printf '  validation:        ✓ OSCAL 1.2.0 schema check passed\n'
  else
    printf '  validation:        ✗ schema violations:\n' >&2
    cat /tmp/validate.err >&2
    exit 4
  fi
fi
