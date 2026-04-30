import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CROSSWALK_PATH = path.join(__dirname, '..', 'config', 'control-crosswalk.yaml');

const FRAMEWORK_ALIASES = {
  nist: 'nist_800_53',
  'nist800-53': 'nist_800_53',
  nist80053: 'nist_800_53',
  'nist-800-53': 'nist_800_53',
  'nist_800_53': 'nist_800_53',
  iso: 'iso_27001',
  iso27001: 'iso_27001',
  'iso-27001': 'iso_27001',
  'iso_27001': 'iso_27001',
  soc2: 'soc2',
  'soc-2': 'soc2',
  pci: 'pci_dss',
  pcidss: 'pci_dss',
  'pci-dss': 'pci_dss',
  'pci_dss': 'pci_dss',
  cis: 'cis_controls',
  'cis-controls': 'cis_controls',
  cmmc: 'cmmc',
  fedramp: 'fedramp'
};

const DEFAULT_FRAMEWORKS = ['soc2', 'nist_800_53'];

const STACK_PROFILES = [
  {
    id: 'aws_iam_users',
    label: 'AWS IAM users',
    matches: ['aws iam user', 'aws iam users', 'iam users', 'iam user', 'aws identity'],
    controlIds: ['access_control_account_management', 'logging_and_monitoring'],
    questions: [
      {
        text: 'Which IAM users are human users, service users, emergency users, or exceptions to federated access?',
        intent: 'Validate account inventory, ownership, and exception handling.',
        hints: [
          "aws iam list-users --query 'Users[*].[UserName,Arn,CreateDate]' --output table",
          'aws iam generate-credential-report && aws iam get-credential-report --query Content --output text | base64 -d > credential-report.csv',
          "aws iam list-account-aliases --query 'AccountAliases[]' --output text"
        ],
        followUps: [
          'Who approves new IAM users and where is the approval recorded?',
          'Which IAM users should be migrated to IAM Identity Center or another IdP?'
        ]
      },
      {
        text: 'How do you detect and disable inactive IAM users, unused access keys, and stale console passwords?',
        intent: 'Confirm lifecycle controls and inactivity thresholds.',
        hints: [
          "aws iam get-credential-report --query 'Content' --output text | base64 -d",
          "aws iam list-access-keys --user-name <user>",
          "aws iam get-access-key-last-used --access-key-id <access-key-id>"
        ],
        followUps: [
          'What inactivity threshold is enforced for privileged users and standard users?',
          'How are break-glass accounts reviewed without disabling required emergency access?'
        ]
      },
      {
        text: 'How do you verify MFA coverage for console-capable IAM users and root account access?',
        intent: 'Assess authentication enforcement for direct AWS identities.',
        hints: [
          "aws iam get-account-summary --query 'SummaryMap.AccountMFAEnabled' --output text",
          "aws iam list-mfa-devices --user-name <user> --query 'MFADevices[*].[SerialNumber,EnableDate]' --output table",
          "aws iam get-credential-report --query 'Content' --output text | base64 -d | awk -F, 'NR==1 || $4==\"true\" {print}'"
        ],
        followUps: [
          'Are MFA exceptions time-bound and risk accepted?',
          'Who receives alerts when root credentials or access keys are used?'
        ]
      }
    ]
  },
  {
    id: 'aws_s3',
    label: 'AWS S3',
    matches: ['aws s3', 's3 bucket', 's3 buckets', 's3'],
    controlIds: ['encryption_at_rest', 'logging_and_monitoring', 'network_security'],
    questions: [
      {
        text: 'Which S3 buckets store regulated, confidential, or customer data, and how is encryption enforced?',
        intent: 'Tie data classification to encryption and key-management controls.',
        hints: [
          "aws s3api list-buckets --query 'Buckets[*].[Name,CreationDate]' --output table",
          'aws s3api get-bucket-encryption --bucket <bucket-name>',
          "aws kms list-aliases --query 'Aliases[*].[AliasName,TargetKeyId]' --output table"
        ],
        followUps: [
          'Which buckets require customer-managed KMS keys?',
          'How are encryption exceptions detected and remediated?'
        ]
      },
      {
        text: 'How do you prevent public or cross-account S3 access from bypassing approved data-sharing paths?',
        intent: 'Assess access boundaries and exposure review.',
        hints: [
          'aws s3api get-public-access-block --bucket <bucket-name>',
          'aws s3api get-bucket-policy-status --bucket <bucket-name>',
          "aws accessanalyzer list-findings --analyzer-arn <analyzer-arn> --filter '{\"resourceType\":{\"eq\":[\"AWS::S3::Bucket\"]}}'"
        ],
        followUps: [
          'Who reviews external bucket grants?',
          'How quickly are unintended public exposures remediated?'
        ]
      }
    ]
  },
  {
    id: 'aws_cloudtrail',
    label: 'AWS CloudTrail',
    matches: ['cloudtrail', 'aws logging', 'aws logs'],
    controlIds: ['logging_and_monitoring'],
    questions: [
      {
        text: 'Which AWS accounts and regions are covered by organization trails, and where are management events retained?',
        intent: 'Confirm audit log completeness, retention, and centralization.',
        hints: [
          "aws cloudtrail describe-trails --include-shadow-trails --query 'trailList[*].[Name,HomeRegion,IsOrganizationTrail,LogFileValidationEnabled]' --output table",
          "aws cloudtrail get-trail-status --name <trail-name> --query '[IsLogging,LatestDeliveryTime,LatestNotificationTime]' --output table",
          "aws logs describe-log-groups --query 'logGroups[*].[logGroupName,retentionInDays]' --output table"
        ],
        followUps: [
          'Who can modify or delete audit logs?',
          'Are log file validation and centralized retention enabled for all in-scope accounts?'
        ]
      }
    ]
  },
  {
    id: 'kubernetes_rbac',
    label: 'Kubernetes RBAC',
    matches: ['kubernetes rbac', 'k8s rbac', 'kubernetes', 'k8s', 'eks', 'aks', 'gke'],
    controlIds: ['access_control_account_management', 'logging_and_monitoring'],
    questions: [
      {
        text: 'Which Kubernetes subjects have cluster-admin or namespace-admin privileges, and how are they approved?',
        intent: 'Review least privilege and privileged access governance.',
        hints: [
          'kubectl get clusterrolebindings -o wide',
          "kubectl get rolebindings,clusterrolebindings --all-namespaces -o jsonpath='{range .items[*]}{.metadata.namespace}{\"\\t\"}{.metadata.name}{\"\\t\"}{.roleRef.kind}/{.roleRef.name}{\"\\n\"}{end}'",
          'kubectl auth can-i --list --as=<user-or-serviceaccount>'
        ],
        followUps: [
          'How are service accounts distinguished from human users?',
          'What is the review cadence for cluster-level bindings?'
        ]
      }
    ]
  },
  {
    id: 'github_repositories',
    label: 'GitHub repositories',
    matches: ['github', 'github repo', 'github repositories', 'repository', 'repositories'],
    controlIds: ['access_control_account_management', 'vulnerability_management', 'logging_and_monitoring'],
    questions: [
      {
        text: 'Which repositories are in scope, and how are admin rights, branch protections, and required reviews enforced?',
        intent: 'Connect source-control governance to access and change-management evidence.',
        hints: [
          'gh repo list <org> --json name,visibility,isArchived',
          'gh api orgs/<org>/teams --paginate',
          'gh api repos/<org>/<repo>/branches/<branch>/protection'
        ],
        followUps: [
          'Who can bypass pull request review or branch protection?',
          'How are departed users and external collaborators removed?'
        ]
      }
    ]
  },
  {
    id: 'okta',
    label: 'Okta',
    matches: ['okta', 'identity provider', 'idp', 'sso'],
    controlIds: ['access_control_account_management', 'logging_and_monitoring'],
    questions: [
      {
        text: 'Which applications and privileged groups depend on Okta, and how are MFA and lifecycle rules enforced?',
        intent: 'Assess centralized identity controls and app assignment governance.',
        hints: [
          'okta apps list',
          "okta users list --search 'status eq \"ACTIVE\"'",
          'curl -s -H "Authorization: SSWS $OKTA_TOKEN" "$OKTA_ORG/api/v1/groups?limit=200"'
        ],
        followUps: [
          'Which groups grant production or administrator access?',
          'How are Joiner-Mover-Leaver events reconciled with HR records?'
        ]
      }
    ]
  }
];

const GENERIC_PROFILE = {
  id: 'generic_stack',
  label: 'Provided technology stack',
  controlIds: ['access_control_account_management', 'logging_and_monitoring'],
  questions: [
    {
      text: 'What are the in-scope systems, identity stores, privileged roles, and audit log sources for this technology stack?',
      intent: 'Establish scope before requesting control evidence.',
      hints: [
        'Use the platform CLI/API to export users, privileged roles, policy assignments, and audit log configuration.',
        'Prefer CSV, JSON, or table output with timestamps over screenshots.'
      ],
      followUps: [
        'Which systems are production, customer-facing, or regulated?',
        'Which integrations create or modify access automatically?'
      ]
    }
  ]
};

export async function generateInterviewQuestions(options = {}) {
  const stack = String(options.stack || '').trim();
  if (!stack) {
    throw new Error('Technology stack is required.');
  }

  const crosswalk = await loadCrosswalk();
  const frameworks = normalizeFrameworks(options.frameworks);
  const limit = normalizeLimit(options.limit);
  const profiles = selectProfiles(stack);
  const questions = [];

  for (const profile of profiles) {
    for (const question of profile.questions) {
      questions.push({
        stackArea: profile.label,
        question: question.text,
        auditIntent: question.intent,
        mappedControls: mapControls(profile.controlIds, frameworks, crosswalk),
        programmaticEvidenceHints: question.hints,
        followUps: question.followUps
      });
    }
  }

  return {
    stack,
    frameworks: frameworks.map(displayFramework),
    generatedAt: new Date().toISOString(),
    questionCount: Math.min(questions.length, limit),
    questions: questions.slice(0, limit)
  };
}

export function renderInterviewQuestionsMarkdown(result) {
  const lines = [];
  lines.push('# Assessment Interview Questions');
  lines.push('');
  lines.push(`**Technology stack:** ${result.stack}`);
  lines.push(`**Frameworks:** ${result.frameworks.join(', ')}`);
  lines.push(`**Generated:** ${result.generatedAt}`);
  lines.push('');

  result.questions.forEach((item, index) => {
    lines.push(`## ${index + 1}. ${item.stackArea}`);
    lines.push('');
    lines.push(`**Question:** ${item.question}`);
    lines.push('');
    lines.push(`**Audit intent:** ${item.auditIntent}`);
    lines.push('');
    lines.push('**Mapped controls:**');
    for (const control of item.mappedControls) {
      lines.push(`- ${control.controlName}: ${control.frameworkMappings.join(', ') || 'No selected framework mapping found'}`);
    }
    lines.push('');
    lines.push('**Programmatic evidence hints:**');
    for (const hint of item.programmaticEvidenceHints) {
      lines.push(`- \`${hint}\``);
    }
    lines.push('');
    lines.push('**Follow-ups:**');
    for (const followUp of item.followUps) {
      lines.push(`- ${followUp}`);
    }
    lines.push('');
  });

  return `${lines.join('\n')}\n`;
}

async function loadCrosswalk() {
  const raw = await fs.readFile(CROSSWALK_PATH, 'utf8');
  return yaml.load(raw);
}

function selectProfiles(stack) {
  const normalized = stack.toLowerCase();
  const selected = STACK_PROFILES.filter(profile =>
    profile.matches.some(match => normalized.includes(match))
  );
  return selected.length > 0 ? selected : [GENERIC_PROFILE];
}

function normalizeFrameworks(frameworks) {
  if (!frameworks) return DEFAULT_FRAMEWORKS;

  const parts = Array.isArray(frameworks)
    ? frameworks
    : String(frameworks).split(',');

  const normalized = parts
    .map(part => FRAMEWORK_ALIASES[String(part).trim().toLowerCase().replace(/\s+/g, '')])
    .filter(Boolean);

  return normalized.length > 0 ? [...new Set(normalized)] : DEFAULT_FRAMEWORKS;
}

function normalizeLimit(limit) {
  const parsed = Number.parseInt(limit, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 12;
  return Math.min(parsed, 50);
}

function mapControls(controlIds, frameworks, crosswalk) {
  return controlIds.map(controlId => {
    const control = crosswalk.controls[controlId] || {};
    const mappings = frameworks.flatMap(framework => {
      const values = control[framework] || getFrameworkFallbackValues(control, framework);
      if (!values) return [];
      if (Array.isArray(values)) return values.map(value => `${displayFramework(framework)} ${formatControlValue(value)}`);
      return [`${displayFramework(framework)} ${formatControlValue(values)}`];
    });

    return {
      controlId,
      controlName: control.name || controlId,
      frameworkMappings: mappings
    };
  });
}

function getFrameworkFallbackValues(control, framework) {
  if (framework === 'fedramp' && control.nist_800_53) {
    return control.nist_800_53.map(controlId => `(via NIST 800-53) ${controlId}`);
  }
  return null;
}

function formatControlValue(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(' ');
  }
  return String(value);
}

function displayFramework(framework) {
  const names = {
    nist_800_53: 'NIST 800-53',
    iso_27001: 'ISO 27001',
    soc2: 'SOC 2',
    pci_dss: 'PCI DSS',
    cis_controls: 'CIS Controls',
    cmmc: 'CMMC',
    fedramp: 'FedRAMP'
  };
  return names[framework] || framework;
}
