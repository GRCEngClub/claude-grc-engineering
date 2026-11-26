#!/usr/bin/env bash
set -uo pipefail

CONFIG_DIR="${CLAUDE_GRC_CONFIG_DIR:-$HOME/.config/claude-grc}/connectors"
FINDINGS_DIR="$HOME/.cache/claude-grc/findings"
SCF_CACHE="$HOME/.cache/claude-grc/scf"
REPO_ROOT="${CLAUDE_GRC_REPO_ROOT:-}"
if [[ -z "$REPO_ROOT" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
fi
CONNECTORS_ROOT="$REPO_ROOT/plugins/connectors"

# A checkout keeps connectors under plugins/connectors. An installed copy sits at
# <cache>/<marketplace>/grc-engineer/<version>, so its connectors are siblings at
# <cache>/<marketplace>/<name>/<version>.
find_status_script() {
  local name="$1" candidate newest=""
  if [[ -f "$CONNECTORS_ROOT/$name/scripts/status.sh" ]]; then
    printf '%s' "$CONNECTORS_ROOT/$name/scripts/status.sh"
    return
  fi
  for candidate in "$REPO_ROOT/$name"/*/scripts/status.sh; do
    [[ -f "$candidate" ]] || continue
    if [[ -z "$newest" || "$candidate" -nt "$newest" ]]; then newest="$candidate"; fi
  done
  printf '%s' "$newest"
}

printf 'CLAUDE-GRC PIPELINE STATUS (%s)\n\n' "$(date -u +'%Y-%m-%d %H:%M UTC')"

EXIT_CODE=0
CONFIGURED=0
HEALTHY=0
TOTAL_RESOURCES=0
TOTAL_EVALS=0
OLDEST_AGE=0
OLDEST_SOURCE=""

if [[ ! -d "$CONFIG_DIR" ]]; then
  printf 'No connectors configured. Install one and run its setup, e.g.:\n'
  printf '  /github-inspector:setup\n'
  printf '  /aws-inspector:setup\n'
  exit 2
fi

shopt -s nullglob
for cfg in "$CONFIG_DIR"/*.yaml; do
  name=$(basename "$cfg" .yaml)
  CONFIGURED=$((CONFIGURED + 1))
  status_script="$(find_status_script "$name")"
  if [[ -n "$status_script" ]]; then
    if bash "$status_script" 2>/dev/null; then
      HEALTHY=$((HEALTHY + 1))
    else
      EXIT_CODE=2
    fi
  else
    printf '%s\n  status:        unknown (connector plugin %s is not installed)\n' "$name" "$name"
    EXIT_CODE=2
  fi
  printf '\n'

  src_dir="$FINDINGS_DIR/$name"
  if [[ -d "$src_dir" ]]; then
    latest=$(ls -t "$src_dir"/*.json 2>/dev/null | head -1 || true)
    if [[ -n "$latest" ]]; then
      r=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(Array.isArray(a)?a.length:1)}catch{console.log(0)}" "$latest")
      e=$(node -e "try{const a=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const arr=Array.isArray(a)?a:[a];let n=0;for(const d of arr)n+=(d.evaluations||[]).length;console.log(n)}catch{console.log(0)}" "$latest")
      TOTAL_RESOURCES=$((TOTAL_RESOURCES + r))
      TOTAL_EVALS=$((TOTAL_EVALS + e))
      if stat -f%m "$latest" >/dev/null 2>&1; then m=$(stat -f%m "$latest"); else m=$(stat -c%Y "$latest"); fi
      age=$(( $(date +%s) - m ))
      if (( age > OLDEST_AGE )); then OLDEST_AGE=$age; OLDEST_SOURCE=$name; fi
    fi
  fi
done

printf 'SCF\n'
if [[ -d "$SCF_CACHE" ]]; then
  latest_ver=$(ls -t "$SCF_CACHE" 2>/dev/null | head -1 || true)
  if [[ -n "$latest_ver" ]]; then
    summary="$SCF_CACHE/$latest_ver/api/summary.json"
    if [[ -f "$summary" ]]; then
      if stat -f%m "$summary" >/dev/null 2>&1; then sm=$(stat -f%m "$summary"); else sm=$(stat -c%Y "$summary"); fi
      scf_age=$(( ($(date +%s) - sm) / 86400 ))
      refresh_in=$((7 - scf_age))
      printf '  version:       %s\n' "$latest_ver"
      printf '  cache age:     %sd (%s)\n' "$scf_age" "$((refresh_in > 0 ? refresh_in : 0))d until refresh"
    else
      printf '  version:       %s (summary missing)\n' "$latest_ver"
    fi
  else
    printf '  status:        not-cached (will fetch on next gap-assessment)\n'
  fi
else
  printf '  status:        not-cached\n'
fi
printf '\n'

printf 'Aggregate\n'
printf '  configured:    %d connectors\n' "$CONFIGURED"
printf '  healthy:       %d / %d\n' "$HEALTHY" "$CONFIGURED"
printf '  cached total:  %d resources, %d evaluations\n' "$TOTAL_RESOURCES" "$TOTAL_EVALS"
if [[ -n "$OLDEST_SOURCE" ]]; then
  h=$((OLDEST_AGE / 3600))
  if (( h < 24 )); then label="${h}h"; else label="$((h / 24))d"; fi
  printf '  oldest cache:  %s (%s)\n' "$label" "$OLDEST_SOURCE"
fi

exit $EXIT_CODE
