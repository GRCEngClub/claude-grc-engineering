import {
  loadProvider,
  listProviders,
  findMatchingTemplate,
  getNISTControl,
  getCloudCommands,
  getAllCloudCommands,
  getControlsByFedRAMPBaseline,
  FEDRAMP_REV5_CLASSES,
  getExportControlCommands,
  generateEvidenceScript as generateBaselineEvidenceScript
} from './config-loader.js';

const LEGACY_TEMPLATES = {
  aws: {
    python: {
      default: `#!/usr/bin/env python3
"""
Evidence Collection Script
Control: {control}
Provider: AWS
Generated: {timestamp}
"""

import boto3
import json
from datetime import datetime

def collect_evidence():
    """Collect evidence for: {control}"""
    evidence = {
        "control": "{control}",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "AWS",
        "results": []
    }

    # Add your evidence collection logic here

    return evidence

if __name__ == "__main__":
    result = collect_evidence()
    print(json.dumps(result, indent=2))
`
    },
    bash: {
      default: `#!/bin/bash
# Evidence Collection Script
# Control: {control}
# Provider: AWS
# Generated: {timestamp}

echo "Collecting evidence for: {control}"

# Add your AWS CLI evidence collection commands here
`
    }
  }
};

/**
 * Generate an evidence collection script for a specific control and provider
 * @param {string} control - The control requirement to collect evidence for
 * @param {string} provider - Cloud provider (aws, azure, gcp, kubernetes)
 * @param {string} format - Output format (python, bash)
 * @returns {Promise<Object>} Generated script and metadata
 */
export async function generateEvidenceScript(control, provider = 'aws', format = 'python') {
  const timestamp = new Date().toISOString();
  const normalizedProvider = provider.toLowerCase();
  const normalizedFormat = format.toLowerCase();

  if (!['python', 'bash'].includes(normalizedFormat)) {
    throw new Error(`Unsupported format: ${format}. Supported: python, bash`);
  }

  let script;
  let templateKey;
  let instructions;

  try {
    const providerConfig = await loadProvider(normalizedProvider);
    const { key, template } = findMatchingTemplate(control, providerConfig);

    templateKey = key;

    if (template.formats && template.formats[normalizedFormat]) {
      script = template.formats[normalizedFormat];
      instructions = template.instructions || generateDefaultInstructions(normalizedProvider, normalizedFormat);
    } else {
      script = LEGACY_TEMPLATES[normalizedProvider]?.[normalizedFormat]?.default ||
               LEGACY_TEMPLATES.aws[normalizedFormat]?.default;
      instructions = generateDefaultInstructions(normalizedProvider, normalizedFormat);
    }
  } catch (error) {
    console.warn(`Config not found for ${provider}, using legacy template: ${error.message}`);
    script = LEGACY_TEMPLATES[normalizedProvider]?.[normalizedFormat]?.default ||
             LEGACY_TEMPLATES.aws[normalizedFormat]?.default;
    templateKey = 'default';
    instructions = generateDefaultInstructions(normalizedProvider, normalizedFormat);
  }

  if (!script) {
    throw new Error(`No template available for provider: ${provider}, format: ${format}`);
  }

  const processedScript = script
    .replace(/{timestamp}/g, timestamp)
    .replace(/{control}/g, control)
    .replace(/{provider}/g, provider.toUpperCase());

  return {
    control,
    provider: normalizedProvider,
    format: normalizedFormat,
    script: processedScript,
    metadata: {
      generated: timestamp,
      template_key: templateKey,
      config_source: templateKey !== 'default' ? 'yaml' : 'legacy'
    },
    instructions
  };
}

function generateDefaultInstructions(provider, format) {
  const instructions = {
    aws: {
      python: `## AWS Python Evidence Collection

1. **Install dependencies:**
   \`\`\`bash
   pip install boto3
   \`\`\`

2. **Configure AWS credentials:**
   \`\`\`bash
   aws configure
   # Or set environment variables:
   export AWS_ACCESS_KEY_ID=your-key
   export AWS_SECRET_ACCESS_KEY=your-secret
   export AWS_DEFAULT_REGION=us-east-1
   \`\`\`

3. **Run the script:**
   \`\`\`bash
   python3 evidence_script.py > evidence_report.json
   \`\`\`

4. **Review the output and save for audit documentation**
`,
      bash: `## AWS CLI Evidence Collection

1. **Install AWS CLI:**
   \`\`\`bash
   # macOS
   brew install awscli
   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   \`\`\`

2. **Configure AWS CLI:**
   \`\`\`bash
   aws configure
   \`\`\`

3. **Make script executable and run:**
   \`\`\`bash
   chmod +x evidence_script.sh
   ./evidence_script.sh > evidence_report.txt
   \`\`\`
`
    },
    azure: {
      python: `## Azure Python Evidence Collection

1. **Install dependencies:**
   \`\`\`bash
   pip install azure-identity azure-mgmt-resource azure-mgmt-storage msgraph-sdk
   \`\`\`

2. **Configure Azure credentials:**
   \`\`\`bash
   az login
   # Or use service principal with environment variables
   \`\`\`

3. **Run the script:**
   \`\`\`bash
   python3 evidence_script.py > evidence_report.json
   \`\`\`
`,
      bash: `## Azure CLI Evidence Collection

1. **Install Azure CLI:**
   \`\`\`bash
   # macOS
   brew install azure-cli
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   \`\`\`

2. **Login to Azure:**
   \`\`\`bash
   az login
   az account set --subscription <subscription-id>
   \`\`\`

3. **Make script executable and run:**
   \`\`\`bash
   chmod +x evidence_script.sh
   ./evidence_script.sh > evidence_report.txt
   \`\`\`
`
    },
    gcp: {
      python: `## GCP Python Evidence Collection

1. **Install dependencies:**
   \`\`\`bash
   pip install google-cloud-storage google-cloud-kms google-cloud-resource-manager
   \`\`\`

2. **Configure GCP credentials:**
   \`\`\`bash
   gcloud auth application-default login
   # Or set GOOGLE_APPLICATION_CREDENTIALS
   \`\`\`

3. **Run the script:**
   \`\`\`bash
   python3 evidence_script.py > evidence_report.json
   \`\`\`
`,
      bash: `## GCP CLI Evidence Collection

1. **Install Google Cloud SDK:**
   \`\`\`bash
   # macOS
   brew install google-cloud-sdk
   # Linux
   curl https://sdk.cloud.google.com | bash
   \`\`\`

2. **Authenticate:**
   \`\`\`bash
   gcloud auth login
   gcloud config set project PROJECT_ID
   \`\`\`

3. **Make script executable and run:**
   \`\`\`bash
   chmod +x evidence_script.sh
   ./evidence_script.sh > evidence_report.txt
   \`\`\`
`
    },
    kubernetes: {
      python: `## Kubernetes Python Evidence Collection

1. **Install dependencies:**
   \`\`\`bash
   pip install kubernetes
   \`\`\`

2. **Configure cluster access:**
   \`\`\`bash
   # Ensure kubeconfig is set up
   kubectl cluster-info
   \`\`\`

3. **Run the script:**
   \`\`\`bash
   python3 evidence_script.py > evidence_report.json
   \`\`\`
`,
      bash: `## Kubernetes CLI Evidence Collection

1. **Install kubectl:**
   \`\`\`bash
   # macOS
   brew install kubectl
   \`\`\`

2. **Configure cluster access:**
   \`\`\`bash
   # EKS
   aws eks update-kubeconfig --name CLUSTER_NAME
   # AKS
   az aks get-credentials --name CLUSTER_NAME
   # GKE
   gcloud container clusters get-credentials CLUSTER_NAME
   \`\`\`

3. **Make script executable and run:**
   \`\`\`bash
   chmod +x evidence_script.sh
   ./evidence_script.sh > evidence_report.txt
   \`\`\`
`
    }
  };

  return instructions[provider]?.[format] || 'See script comments for usage instructions.';
}

/**
 * List available providers
 * @returns {Promise<string[]>} Array of provider names
 */
export async function getAvailableProviders() {
  return listProviders();
}

/**
 * Generate evidence collection commands for a specific NIST 800-53 control
 * @param {string} controlId - NIST control ID (e.g., "AC-2", "AU-6")
 * @param {string} provider - Cloud provider (aws, azure, gcp, kubernetes)
 * @returns {Promise<Object>} Control information with CLI commands and evidence script
 */
export async function generateNISTControlEvidence(controlId, provider = 'aws') {
  const timestamp = new Date().toISOString();
  const normalizedProvider = provider.toLowerCase();

  const commandInfo = await getCloudCommands(controlId, normalizedProvider);

  let script = `#!/bin/bash
# NIST 800-53 Evidence Collection Script
# Control: ${commandInfo.controlId}
# Title: ${commandInfo.controlTitle || 'N/A'}
# Provider: ${normalizedProvider.toUpperCase()}
# Generated: ${timestamp}

set -e

echo "============================================"
echo "NIST 800-53 Evidence Collection"
echo "Control: ${commandInfo.controlId}"
echo "Provider: ${normalizedProvider.toUpperCase()}"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "============================================"
echo ""
`;

  if (commandInfo.evidence_script) {
    script += commandInfo.evidence_script;
  } else if (commandInfo.commands && commandInfo.commands.length > 0) {
    for (const cmd of commandInfo.commands) {
      script += `
echo ">> ${cmd.description}"
${cmd.cmd} || echo "Command failed or not applicable"
echo ""
`;
    }
  } else {
    script += `echo "No automated evidence collection commands available for this control on ${normalizedProvider}."\n`;
  }

  script += `
echo "============================================"
echo "Evidence Collection Complete"
echo "============================================"
`;

  return {
    controlId: commandInfo.controlId,
    controlTitle: commandInfo.controlTitle,
    controlDescription: commandInfo.controlDescription,
    provider: normalizedProvider,
    commands: commandInfo.commands || [],
    script,
    metadata: {
      generated: timestamp,
      framework: 'NIST 800-53',
      hasAutomatedEvidence: !!(commandInfo.evidence_script || (commandInfo.commands && commandInfo.commands.length > 0))
    }
  };
}

/**
 * Generate evidence collection for all providers for a NIST control
 * @param {string} controlId - NIST control ID
 * @returns {Promise<Object>} Commands organized by provider
 */
export async function generateNISTControlEvidenceAllProviders(controlId) {
  const timestamp = new Date().toISOString();
  const allCommands = await getAllCloudCommands(controlId);

  const result = {
    controlId: allCommands.controlId,
    controlTitle: allCommands.controlTitle,
    controlDescription: allCommands.controlDescription,
    metadata: {
      generated: timestamp,
      framework: 'NIST 800-53'
    },
    providers: {}
  };

  for (const [provider, providerData] of Object.entries(allCommands.providers)) {
    result.providers[provider] = {
      commands: providerData.commands || [],
      evidence_script: providerData.evidence_script || null
    };
  }

  return result;
}

/**
 * Generate a complete evidence collection script for a FedRAMP Rev5 control list.
 *
 * The total is the official control count for the class (rule FRC-CSF-BSL).
 * "Automated" counts the controls this toolkit has a cloud check for; that is a
 * measure of the toolkit's coverage, not of a provider's implementation.
 * @param {string} baseline - Baseline name: low (Rev5 Class B), moderate (Class C), high (Class D)
 * @param {string} provider - Cloud provider
 * @returns {Promise<Object>} Full evidence collection script and metadata
 */
export async function generateFedRAMPBaselineEvidence(baseline, provider = 'aws') {
  const timestamp = new Date().toISOString();
  const normalizedBaseline = baseline.toLowerCase();
  const normalizedProvider = provider.toLowerCase();

  const controls = await getControlsByFedRAMPBaseline(normalizedBaseline);

  const script = await generateBaselineEvidenceScript(normalizedBaseline, normalizedProvider);

  let automatedCount = 0;
  let manualCount = 0;

  for (const control of controls) {
    if (control.cloud_tests && control.cloud_tests[normalizedProvider]) {
      automatedCount++;
    } else {
      manualCount++;
    }
  }

  return {
    baseline: normalizedBaseline,
    certificationType: 'Rev5',
    certificationClass: FEDRAMP_REV5_CLASSES[normalizedBaseline],
    provider: normalizedProvider,
    script,
    metadata: {
      generated: timestamp,
      totalControls: controls.length,
      automatedControls: automatedCount,
      manualControls: manualCount,
      coveragePercent: controls.length > 0 ? Math.round((automatedCount / controls.length) * 100) : 0
    },
    controlSummary: controls.map(c => ({
      id: c.id,
      title: c.title,
      family: c.family,
      hasAutomatedEvidence: !!(c.cloud_tests && c.cloud_tests[normalizedProvider])
    }))
  };
}

/**
 * Get a summary of a FedRAMP Rev5 control list with evidence availability
 * @param {string} baseline - Baseline name: low (Rev5 Class B), moderate (Class C), high (Class D)
 * @param {string} provider - Cloud provider
 * @returns {Promise<Object>} Summary of controls and evidence availability
 */
export async function getFedRAMPBaselineSummary(baseline, provider = 'aws') {
  const normalizedBaseline = baseline.toLowerCase();
  const normalizedProvider = provider.toLowerCase();

  const controls = await getControlsByFedRAMPBaseline(normalizedBaseline);

  const byFamily = {};
  for (const control of controls) {
    const family = control.family || 'Unknown';
    if (!byFamily[family]) {
      byFamily[family] = {
        familyName: control.familyName,
        total: 0,
        automated: 0,
        controls: []
      };
    }

    byFamily[family].total++;
    const hasAutomated = !!(control.cloud_tests && control.cloud_tests[normalizedProvider]);
    if (hasAutomated) {
      byFamily[family].automated++;
    }

    byFamily[family].controls.push({
      id: control.id,
      title: control.title,
      hasAutomatedEvidence: hasAutomated
    });
  }

  return {
    baseline: normalizedBaseline,
    certificationType: 'Rev5',
    certificationClass: FEDRAMP_REV5_CLASSES[normalizedBaseline],
    provider: normalizedProvider,
    totalControls: controls.length,
    families: byFamily
  };
}

/**
 * Generate evidence collection for export control framework
 * @param {string} framework - Framework name (itar, irap, ismap)
 * @param {string} provider - Cloud provider
 * @returns {Promise<Object>} Evidence collection script and commands
 */
export async function generateExportControlEvidence(framework, provider = 'aws') {
  const timestamp = new Date().toISOString();
  const normalizedProvider = provider.toLowerCase();

  const frameworkData = await getExportControlCommands(framework, normalizedProvider);

  let script = `#!/bin/bash
# Export Control Evidence Collection Script
# Framework: ${frameworkData.framework}
# Version: ${frameworkData.version}
# Provider: ${normalizedProvider.toUpperCase()}
# Generated: ${timestamp}

set -e

echo "============================================"
echo "Export Control Evidence Collection"
echo "Framework: ${frameworkData.framework}"
echo "Provider: ${normalizedProvider.toUpperCase()}"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "============================================"
echo ""
`;

  for (const control of frameworkData.controls) {
    script += `
# ============================================
# ${control.id}: ${control.title}
# ============================================
echo "=== ${control.id}: ${control.title} ==="
`;

    if (control.evidence_script) {
      script += control.evidence_script;
    } else if (control.commands && control.commands.length > 0) {
      for (const cmd of control.commands) {
        script += `echo ">> ${cmd.description}"\n`;
        script += `${cmd.cmd} || echo "Command failed or not applicable"\n`;
        script += `echo ""\n`;
      }
    }
  }

  script += `
echo "============================================"
echo "Evidence Collection Complete"
echo "============================================"
`;

  return {
    framework: frameworkData.framework,
    version: frameworkData.version,
    provider: normalizedProvider,
    script,
    controls: frameworkData.controls,
    metadata: {
      generated: timestamp,
      totalControls: frameworkData.controls.length
    }
  };
}

