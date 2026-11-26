import fs from 'fs/promises';
import path from 'path';
import { loadFramework, listFrameworks } from './config-loader.js';

const LEGACY_FRAMEWORKS = {
  SOC2: {
    name: 'SOC 2',
    controls: {
      'CC6.1': {
        title: 'Logical and Physical Access Controls',
        description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets.'
      },
      'CC6.2': {
        title: 'Prior to Issuing System Credentials',
        description: 'The entity discontinues the use of user credentials and removes access when appropriate.'
      },
      'CC7.2': {
        title: 'System Communications',
        description: 'The entity authorizes, monitors, and controls the flow of information through systems and networks.'
      }
    }
  },
  ISO27001: {
    name: 'ISO/IEC 27001:2022',
    controls: {
      'A.5.16': {
        title: 'Identity management',
        description: 'The full life cycle of identities shall be managed.'
      },
      'A.8.24': {
        title: 'Use of cryptography',
        description: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.'
      }
    }
  },
  NIST80053: {
    name: 'NIST 800-53',
    controls: {
      'AC-3': {
        title: 'Access Enforcement',
        description: 'The information system enforces approved authorizations for logical access.'
      },
      'AC-6': {
        title: 'Least Privilege',
        description: 'The organization employs the principle of least privilege.'
      },
      'SC-28': {
        title: 'Protection of Information at Rest',
        description: 'The information system protects the confidentiality and integrity of information at rest.'
      }
    }
  }
};

async function getFrameworkConfig(framework) {
  const normalizedName = framework.toUpperCase().replace(/-/g, '');

  const nameMap = {
    'SOC2': 'soc2',
    'ISO27001': 'iso27001',
    'NIST80053': 'nist800-53',
    'NIST800-53': 'nist800-53'
  };

  const yamlName = nameMap[normalizedName] || framework.toLowerCase();

  try {
    const config = await loadFramework(yamlName);
    return config;
  } catch (error) {
    if (LEGACY_FRAMEWORKS[normalizedName]) {
      return LEGACY_FRAMEWORKS[normalizedName];
    }
    throw new Error(`Unsupported framework: ${framework}. Use: soc2, iso27001, nist800-53`);
  }
}

const IAC_PATTERNS = {
  terraform: {
    encryption: [
      { pattern: /storage_encrypted\s*=\s*true/i, control: ['CC7.2', 'A.8.24', 'SC-28'] },
      { pattern: /encrypted\s*=\s*true/i, control: ['CC7.2', 'A.8.24', 'SC-28'] },
      { pattern: /kms_key_id/i, control: ['CC7.2', 'A.8.24', 'SC-28'] }
    ],
    access: [
      { pattern: /aws_iam_role/i, control: ['CC6.1', 'A.5.16', 'AC-3'] },
      { pattern: /aws_iam_policy/i, control: ['CC6.1', 'AC-6'] },
      { pattern: /AdministratorAccess/i, control: ['AC-6'], negative: true }
    ],
    network: [
      { pattern: /aws_security_group/i, control: ['CC7.2', 'AC-3'] },
      { pattern: /vpc_id/i, control: ['CC7.2'] }
    ]
  },
  kubernetes: {
    encryption: [
      { pattern: /encryption-provider-config/i, control: ['CC7.2', 'A.8.24', 'SC-28'] }
    ],
    access: [
      { pattern: /serviceAccountName/i, control: ['CC6.1', 'A.5.16', 'AC-3'] },
      { pattern: /runAsNonRoot:\s*true/i, control: ['AC-6'] }
    ]
  }
};

/**
 * Map IaC file to compliance framework controls
 * @param {string} iacFilePath - Path to IaC file
 * @param {string} framework - Framework name (soc2, iso27001, nist800-53)
 * @returns {Promise<Object>} Mapping results with report
 */
export async function mapControl(iacFilePath, framework = 'SOC2') {
  const frameworkConfig = await getFrameworkConfig(framework);

  const fileContent = await fs.readFile(iacFilePath, 'utf-8');
  const fileExt = path.extname(iacFilePath).toLowerCase();
  const fileName = path.basename(iacFilePath);

  let iacType = 'unknown';
  if (fileExt === '.tf' || fileExt === '.tfvars') {
    iacType = 'terraform';
  } else if (fileExt === '.yaml' || fileExt === '.yml') {
    if (fileContent.includes('apiVersion:') || fileContent.includes('kind:')) {
      iacType = 'kubernetes';
    }
  }

  const patterns = IAC_PATTERNS[iacType] || {};
  const mappings = [];
  const lines = fileContent.split('\n');

  for (const [category, patternList] of Object.entries(patterns)) {
    for (const { pattern, control, negative } of patternList) {
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          const lineNum = index + 1;
          const matchedControls = control.filter(c => 
            frameworkConfig.controls[c] || c.startsWith(framework)
          );

          if (matchedControls.length > 0) {
            mappings.push({
              controlId: matchedControls[0],
              line: lineNum,
              evidence: line.trim(),
              status: negative ? '⚠️ Violation' : '✅ Satisfied',
              category
            });
          }
        }
      });
    }
  }

  const report = generateReport(frameworkConfig, fileName, mappings, iacFilePath);

  return {
    framework: frameworkConfig.name,
    file: iacFilePath,
    mappings,
    report
  };
}

function generateReport(frameworkConfig, fileName, mappings, filePath) {
  const controlGroups = {};
  
  mappings.forEach(m => {
    if (!controlGroups[m.controlId]) {
      controlGroups[m.controlId] = [];
    }
    controlGroups[m.controlId].push(m);
  });

  let report = `# Compliance Mapping Report\n\n`;
  report += `**Framework:** ${frameworkConfig.name}\n`;
  report += `**File Analyzed:** ${fileName}\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `---\n\n`;

  for (const [controlId, evidenceList] of Object.entries(controlGroups)) {
    const control = frameworkConfig.controls[controlId];
    if (!control) continue;

    const hasViolations = evidenceList.some(e => e.status.includes('Violation'));
    const status = hasViolations ? '⚠️ Violation' : '✅ Satisfied';

    report += `## ${controlId}: ${control.title}\n\n`;
    report += `**Status:** ${status}\n\n`;
    report += `**Description:** ${control.description}\n\n`;
    report += `**Evidence:**\n\n`;

    evidenceList.forEach(evidence => {
      report += `- \`${filePath}:${evidence.line}\` - ${evidence.evidence}\n`;
      report += `  - Status: ${evidence.status}\n`;
    });

    report += `\n---\n\n`;
  }

  if (Object.keys(controlGroups).length === 0) {
    report += `## No Compliance Mappings Found\n\n`;
    report += `No patterns matching compliance controls were detected in this file.\n`;
    report += `This may indicate:\n`;
    report += `- The file uses patterns not yet recognized\n`;
    report += `- Manual review is required\n`;
    report += `- Additional configuration is needed\n`;
  }

  return report;
}

/**
 * List available compliance frameworks
 * @returns {Promise<string[]>} Array of framework names
 */
export async function getAvailableFrameworks() {
  return listFrameworks();
}

