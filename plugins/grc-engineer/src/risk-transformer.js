import { loadConfig } from './config-loader.js';

const DEFAULT_RISK_KEYWORDS = {
  likelihood: {
    critical: ['critical', 'very high', 'extremely likely', 'guaranteed'],
    high: ['high', 'likely', 'probable', 'frequent'],
    medium: ['medium', 'moderate', 'possible', 'occasional'],
    low: ['low', 'unlikely', 'rare', 'seldom']
  },
  impact: {
    critical: ['critical', 'catastrophic', 'severe', 'complete loss', 'data breach'],
    high: ['high', 'significant', 'major', 'substantial'],
    medium: ['medium', 'moderate', 'some', 'partial'],
    low: ['low', 'minimal', 'minor', 'negligible']
  },
  mitigation: ['mitigation', 'fix', 'solution', 'remediation', 'address', 'implement', 'deploy', 'enable']
};

let jiraConfig = null;

async function getJiraConfig() {
  if (jiraConfig) {
    return jiraConfig;
  }

  try {
    jiraConfig = await loadConfig('jira', 'fields');
  } catch (error) {
    jiraConfig = {
      custom_fields: {
        likelihood: { id: process.env.JIRA_FIELD_LIKELIHOOD || 'customfield_10001' },
        impact: { id: process.env.JIRA_FIELD_IMPACT || 'customfield_10002' },
        risk_score: { id: process.env.JIRA_FIELD_RISK_SCORE || 'customfield_10003' },
        mitigation: { id: process.env.JIRA_FIELD_MITIGATION || 'customfield_10004' },
        definition_of_done: { id: process.env.JIRA_FIELD_DOD || 'customfield_10005' }
      },
      default_project: process.env.JIRA_DEFAULT_PROJECT || 'SEC',
      risk_keywords: DEFAULT_RISK_KEYWORDS
    };
  }

  return jiraConfig;
}

function getRiskKeywords(config) {
  if (config?.risk_keywords) {
    return {
      likelihood: config.risk_keywords.likelihood || DEFAULT_RISK_KEYWORDS.likelihood,
      impact: config.risk_keywords.impact || DEFAULT_RISK_KEYWORDS.impact,
      mitigation: config.risk_keywords.mitigation_indicators || DEFAULT_RISK_KEYWORDS.mitigation
    };
  }
  return DEFAULT_RISK_KEYWORDS;
}

/**
 * Transform a risk description into a structured Jira ticket
 * @param {string} riskDescription - The risk assessment text
 * @param {string} projectKey - Jira project key (or uses config default)
 * @returns {Promise<Object>} Jira ticket structure and metadata
 */
export async function transformRisk(riskDescription, projectKey) {
  const config = await getJiraConfig();
  const riskKeywords = getRiskKeywords(config);
  const normalized = riskDescription.toLowerCase();

  const project = projectKey || config.default_project || 'SEC';

  const likelihood = extractLikelihood(normalized, riskKeywords);

  const impact = extractImpact(normalized, riskKeywords);

  const mitigation = extractMitigation(riskDescription, riskKeywords);

  const { riskScore, priority } = calculateRiskScore(likelihood, impact, config);

  const summary = generateSummary(riskDescription, mitigation);

  const description = generateDescription(riskDescription, likelihood, impact, mitigation);

  const labels = generateLabels(riskDescription, likelihood, impact, config);

  const definitionOfDone = generateDefinitionOfDone(mitigation);

  const customFields = config.custom_fields || {};

  const jiraTicket = {
    fields: {
      project: { key: project },
      summary: summary,
      description: description,
      issuetype: { name: determineIssueType(riskDescription, config) },
      priority: { name: priority },
      labels: labels,
      ...(customFields.likelihood?.id && { [customFields.likelihood.id]: likelihood }),
      ...(customFields.impact?.id && { [customFields.impact.id]: impact }),
      ...(customFields.risk_score?.id && { [customFields.risk_score.id]: riskScore }),
      ...(customFields.mitigation?.id && { [customFields.mitigation.id]: mitigation }),
      ...(customFields.definition_of_done?.id && { [customFields.definition_of_done.id]: definitionOfDone })
    },
    customFieldsReadable: {
      likelihood: likelihood,
      impact: impact,
      riskScore: riskScore,
      mitigation: mitigation,
      definitionOfDone: definitionOfDone
    }
  };

  return {
    jiraTicket,
    metadata: {
      extracted: {
        likelihood,
        impact,
        mitigation,
        riskScore,
        priority
      },
      customFieldIds: {
        likelihood: customFields.likelihood?.id,
        impact: customFields.impact?.id,
        risk_score: customFields.risk_score?.id,
        mitigation: customFields.mitigation?.id,
        definition_of_done: customFields.definition_of_done?.id
      },
      generated: new Date().toISOString(),
      configSource: jiraConfig ? 'yaml' : 'defaults'
    }
  };
}

function extractLikelihood(text, riskKeywords = DEFAULT_RISK_KEYWORDS) {
  const likelihoodKeywords = riskKeywords.likelihood || DEFAULT_RISK_KEYWORDS.likelihood;
  for (const [level, keywords] of Object.entries(likelihoodKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return level.charAt(0).toUpperCase() + level.slice(1);
      }
    }
  }
  return 'Medium';
}

function extractImpact(text, riskKeywords = DEFAULT_RISK_KEYWORDS) {
  const impactKeywords = riskKeywords.impact || DEFAULT_RISK_KEYWORDS.impact;
  for (const [level, keywords] of Object.entries(impactKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return level.charAt(0).toUpperCase() + level.slice(1);
      }
    }
  }
  return 'Medium';
}

function extractMitigation(description, riskKeywords = DEFAULT_RISK_KEYWORDS) {
  const mitigationKeywords = riskKeywords.mitigation || DEFAULT_RISK_KEYWORDS.mitigation;
  const sentences = description.split(/[.!?]+/);

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (mitigationKeywords.some(keyword => lower.includes(keyword))) {
      const mitigationIndex = lower.search(new RegExp(mitigationKeywords.join('|')));
      if (mitigationIndex !== -1) {
        return sentence.substring(mitigationIndex).trim();
      }
    }
  }

  if (description.includes('Mitigation:') || description.includes('mitigation:')) {
    const parts = description.split(/[Mm]itigation:/);
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }

  return 'Review and implement appropriate controls';
}

function calculateRiskScore(likelihood, impact, config = {}) {
  const scores = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  const likelihoodScore = scores[likelihood] || 2;
  const impactScore = scores[impact] || 2;
  const riskScore = likelihoodScore * impactScore;

  const mapping = config.priority_mapping || {};
  const criticalThreshold = mapping.critical_threshold || 12;
  const highThreshold = mapping.high_threshold || 6;
  const mediumThreshold = mapping.medium_threshold || 3;

  let priority;
  if (riskScore >= criticalThreshold) {
    priority = 'Critical';
  } else if (riskScore >= highThreshold) {
    priority = 'High';
  } else if (riskScore >= mediumThreshold) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  return { riskScore, priority };
}

function generateSummary(description, mitigation) {
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length > 0) {
    let summary = sentences[0].trim();
    if (summary.length > 100) {
      summary = summary.substring(0, 97) + '...';
    }
    return summary;
  }
  
  if (mitigation && mitigation !== 'Review and implement appropriate controls') {
    return `Implement: ${mitigation.substring(0, 80)}`;
  }
  
  return 'Security Risk - Review Required';
}

function generateDescription(description, likelihood, impact, mitigation) {
  return `h2. Risk Assessment

*Risk Description:*
${description}

h3. Risk Analysis

*Likelihood:* ${likelihood}
*Impact:* ${impact}
*Risk Score:* ${calculateRiskScore(likelihood, impact).riskScore}/16

h3. Mitigation

${mitigation}

h3. Definition of Done

${generateDefinitionOfDone(mitigation)}

---
*This ticket was automatically generated by the GRC Engineering Plugin*`;
}

function generateLabels(description, likelihood, impact, config = {}) {
  const defaultLabels = config.default_labels || ['security', 'risk-mitigation'];
  const labels = [...defaultLabels, `likelihood-${likelihood.toLowerCase()}`, `impact-${impact.toLowerCase()}`];

  const techKeywords = config.technology_keywords || {
    aws: ['aws', 's3', 'ec2', 'lambda', 'iam'],
    azure: ['azure', 'blob', 'ad'],
    gcp: ['gcp', 'gcs', 'bigquery'],
    kubernetes: ['kubernetes', 'k8s', 'pod', 'deployment'],
    database: ['database', 'db', 'sql', 'postgres', 'mysql'],
    authentication: ['authentication', 'auth', 'oauth', 'saml', 'sso', 'mfa'],
    encryption: ['encryption', 'encrypt', 'kms', 'tls']
  };

  const tech = description.toLowerCase();
  for (const [label, keywords] of Object.entries(techKeywords)) {
    if (keywords.some(kw => tech.includes(kw))) {
      labels.push(label);
    }
  }

  return [...new Set(labels)];
}

function generateDefinitionOfDone(mitigation) {
  if (!mitigation || mitigation === 'Review and implement appropriate controls') {
    return `* Review risk assessment
* Identify appropriate controls
* Implement mitigation
* Verify mitigation effectiveness
* Update risk register`;
  }
  
  return `* ${mitigation}
* Verify implementation
* Test controls
* Update documentation
* Close risk in risk register`;
}

function determineIssueType(description, config = {}) {
  const issueTypes = config.issue_types || {
    vulnerability: 'Bug',
    missing_control: 'Task',
    improvement: 'Story',
    default: 'Security Task'
  };

  const lower = description.toLowerCase();

  if (lower.includes('vulnerability') || lower.includes('exploit')) {
    return issueTypes.vulnerability || 'Bug';
  }
  if (lower.includes('missing') || lower.includes('lack of')) {
    return issueTypes.missing_control || 'Task';
  }
  if (lower.includes('improve') || lower.includes('enhance')) {
    return issueTypes.improvement || 'Story';
  }

  return issueTypes.default || 'Security Task';
}

