#!/usr/bin/env bash
# Validate the GRC draw.io diagram plugin has the expected command/skill surface.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

plugin_root="plugins/grc-diagrams"
manifest="$plugin_root/.claude-plugin/plugin.json"
marketplace=".claude-plugin/marketplace.json"

required_skills=(
  drawio
  grc-system-boundary-diagram
  grc-evidence-flow-diagram
  grc-control-map-diagram
  grc-risk-treatment-diagram
  grc-audit-workflow-diagram
  grc-framework-crosswalk-diagram
  grc-third-party-risk-diagram
  grc-poam-diagram
  grc-data-flow-diagram
  grc-shared-responsibility-diagram
  grc-raci-diagram
  grc-compliance-operating-model-diagram
)

required_commands=(
  drawio
  system-boundary
  evidence-flow
  control-map
  risk-treatment
  audit-workflow
  framework-crosswalk
  third-party-risk
  poam
  data-flow
  shared-responsibility
  raci
  operating-model
)

[[ -f "$manifest" ]] || { echo "missing $manifest" >&2; exit 1; }

node <<'NODE'
const fs = require('fs');
const marketplace = JSON.parse(fs.readFileSync('.claude-plugin/marketplace.json', 'utf8'));
const entry = marketplace.plugins.find((plugin) => plugin.name === 'grc-diagrams');
if (!entry) throw new Error('grc-diagrams is not registered in marketplace.json');
if (entry.source !== './plugins/grc-diagrams') throw new Error(`unexpected grc-diagrams source: ${entry.source}`);
const manifest = JSON.parse(fs.readFileSync('plugins/grc-diagrams/.claude-plugin/plugin.json', 'utf8'));
if (manifest.name !== 'grc-diagrams') throw new Error(`unexpected plugin name: ${manifest.name}`);
NODE

for skill in "${required_skills[@]}"; do
  file="$plugin_root/skills/$skill/SKILL.md"
  [[ -f "$file" ]] || { echo "missing skill $file" >&2; exit 1; }
  grep -q '^---$' "$file" || { echo "skill missing frontmatter fence: $file" >&2; exit 1; }
  grep -q '^name:' "$file" || { echo "skill missing name: $file" >&2; exit 1; }
  grep -q '^description:' "$file" || { echo "skill missing description: $file" >&2; exit 1; }
  if [[ "$skill" != "drawio" ]]; then
    grep -q 'drawio' "$file" || { echo "GRC companion skill must reference drawio: $file" >&2; exit 1; }
    grep -q 'GRC' "$file" || { echo "GRC companion skill must include GRC context: $file" >&2; exit 1; }
  fi
done

grep -q 'https://raw.githubusercontent.com/jgraph/drawio-mcp/main/shared/xml-reference.md' "$plugin_root/skills/drawio/SKILL.md" || {
  echo "drawio skill must reference upstream drawio XML reference" >&2
  exit 1
}
grep -q 'NEVER include ANY XML comments' "$plugin_root/skills/drawio/SKILL.md" || {
  echo "drawio skill must preserve XML well-formedness guidance" >&2
  exit 1
}

for command in "${required_commands[@]}"; do
  file="$plugin_root/commands/$command.md"
  [[ -f "$file" ]] || { echo "missing command $file" >&2; exit 1; }
  grep -q '^---$' "$file" || { echo "command missing frontmatter fence: $file" >&2; exit 1; }
  grep -q '^description:' "$file" || { echo "command missing description: $file" >&2; exit 1; }
  grep -q 'draw.io' "$file" || { echo "command must mention draw.io: $file" >&2; exit 1; }
done

echo "GRC diagram plugin skill/command surface is valid."
