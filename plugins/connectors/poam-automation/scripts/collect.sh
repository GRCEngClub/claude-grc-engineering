#!/usr/bin/env bash
set -euo pipefail

CACHE_DIR="${HOME}/.cache/claude-grc/findings/poam-automation"
CONFIG_FILE="${HOME}/.config/claude-grc/connectors/poam-automation.yaml"
POAM_FILE=""
BASELINE="moderate"

usage() {
  echo "Usage: collect.sh --poam <path> [--baseline <low|moderate|high>]" >&2
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --poam=*) POAM_FILE="${1#*=}" ;;
    --poam) POAM_FILE="${2}"; shift ;;
    --baseline=*) BASELINE="${1#*=}" ;;
    --baseline) BASELINE="${2}"; shift ;;
    *) usage ;;
  esac
  shift
done

if [[ -z "${POAM_FILE}" ]]; then
  usage
fi

if [[ ! -f "${POAM_FILE}" ]]; then
  echo "ERROR: POA&M file not found: ${POAM_FILE}" >&2
  exit 2
fi

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "ERROR: Not configured. Run setup.sh first." >&2
  exit 2
fi

TOOL_PATH=$(grep 'tool_path:' "${CONFIG_FILE}" | sed 's/tool_path: *"//' | sed 's/"//')
TOOL_DIR=$(dirname "${TOOL_PATH}")

echo "=== poam-automation collect ==="
echo "  POA&M:    ${POAM_FILE}"
echo "  Baseline: ${BASELINE}"

RUN_ID="poam-automation-$(date +%s)"
COLLECTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OUTPUT_JSON="${CACHE_DIR}/${RUN_ID}.json"

mkdir -p "${CACHE_DIR}"

VDR_OUTPUT="${CACHE_DIR}/vdr_run.xlsx"
cd "${TOOL_DIR}"
python3 grc_tool.py vdr --poam "${POAM_FILE}" --baseline "${BASELINE}" --output "${VDR_OUTPUT}" 2>&1

VDR_JSON="${VDR_OUTPUT/.xlsx/.json}"

if [[ ! -f "${VDR_JSON}" ]]; then
  echo "ERROR: VDR JSON not generated." >&2
  exit 2
fi

python3 - <<PYEOF
import json, sys, uuid
from datetime import datetime, timezone

with open("${VDR_JSON}") as f:
    vdr = json.load(f)

findings = []
run_id = "${RUN_ID}"
collected_at = "${COLLECTED_AT}"

n_to_severity = {"N5": "critical", "N4": "high", "N3": "medium", "N2": "low", "N1": "info"}

nist_map = {
    "SI-2": "NIST-800-53-r5",
    "RA-5": "NIST-800-53-r5",
    "SC-8": "NIST-800-53-r5",
    "SC-28": "NIST-800-53-r5",
    "AC-3": "NIST-800-53-r5",
    "AC-6": "NIST-800-53-r5",
    "IA-2": "NIST-800-53-r5",
    "IA-5": "NIST-800-53-r5",
    "CM-6": "NIST-800-53-r5",
    "CM-7": "NIST-800-53-r5",
    "AU-2": "NIST-800-53-r5",
    "AU-12": "NIST-800-53-r5",
}

for v in vdr.get("active_vulnerabilities", []):
    sev = n_to_severity.get(v.get("adverse_impact", "N2"), "medium")
    cve = v.get("cve", "")
    name = v.get("weakness_name", "")
    kev = v.get("cisa_kev", False)
    epss = v.get("epss_score", "")
    remediation_text = v.get("supplementary_risk", "") or f"Remediate {name}."
    if kev:
        remediation_text = f"[CISA KEV] {remediation_text}"
    if epss:
        remediation_text = f"EPSS: {epss}. {remediation_text}"

    finding = {
        "schema_version": "1.0.0",
        "source": "poam-automation",
        "source_version": "1.0.0",
        "run_id": run_id,
        "collected_at": collected_at,
        "resource": {
            "type": "cloud_workload",
            "id": v.get("asset_identifier", "unknown"),
        },
        "evaluations": [
            {
                "control_framework": "NIST-800-53-r5",
                "control_id": "SI-2",
                "status": "fail",
                "severity": sev,
                "message": f"{name} — CVE: {cve}" if cve else name,
                "remediation": {
                    "summary": remediation_text,
                },
                "assessed_at": collected_at,
            }
        ],
        "findings": [
            {
                "id": v.get("tracking_id", ""),
                "title": name,
                "severity": sev,
                "description": f"CVE: {cve}. CISA KEV: {kev}. EPSS: {epss}. Adverse Impact: {v.get('adverse_impact')}. IRV: {v.get('internet_reachability')}. LEV: {v.get('likely_exploitability')}.",
                "related_control_ids": ["SI-2", "RA-5"],
                "related_resource_ids": [v.get("asset_identifier", "unknown")],
            }
        ],
    }
    findings.append(finding)

for v in vdr.get("accepted_vulnerabilities", []):
    sev = n_to_severity.get(v.get("adverse_impact", "N2"), "medium")
    name = v.get("weakness_name", "")
    cve = v.get("cve", "")
    finding = {
        "schema_version": "1.0.0",
        "source": "poam-automation",
        "source_version": "1.0.0",
        "run_id": run_id,
        "collected_at": collected_at,
        "resource": {
            "type": "cloud_workload",
            "id": v.get("asset_identifier", "unknown"),
        },
        "evaluations": [
            {
                "control_framework": "NIST-800-53-r5",
                "control_id": "SI-2",
                "status": "skipped",
                "severity": sev,
                "message": v.get("acceptance_rationale", "Accepted vulnerability."),
                "assessed_at": collected_at,
            }
        ],
        "findings": [
            {
                "id": v.get("tracking_id", ""),
                "title": name,
                "severity": sev,
                "description": v.get("acceptance_rationale", ""),
                "related_control_ids": ["SI-2"],
                "related_resource_ids": [v.get("asset_identifier", "unknown")],
            }
        ],
    }
    findings.append(finding)

with open("${OUTPUT_JSON}", "w") as f:
    json.dump(findings, f, indent=2)

print(f"  Findings written: {len(findings)}")
print(f"  Output: ${OUTPUT_JSON}")
PYEOF

echo ""
echo "Collect complete. Run status.sh to verify."
