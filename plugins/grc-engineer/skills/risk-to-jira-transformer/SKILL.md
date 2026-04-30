---
name: risk-to-jira-transformer
description: Converts unstructured risk assessments into structured Jira tickets. Extracts Likelihood, Impact, Mitigation from natural language and generates JSON formatted for Jira API with clear Definition of Done criteria.
allowed-tools: Bash, Read, Glob, Write, Edit
---

# Risk-to-Jira Transformer

Converts unstructured risk assessments into structured engineering tickets. Turns "Risk Management" into "Task Management."

## Quick Commands

**Transform a risk assessment:**

```bash
node plugins/grc-engineer/scripts/transform-risk.js "Vulnerability in authentication service discovered during pen test. High likelihood, critical impact. Mitigation: Implement OAuth2 with PKCE." SEC
```

**Transform with custom project:**

```bash
node plugins/grc-engineer/scripts/transform-risk.js "<risk description>" INFRA
```

## Input Format

Accepts natural language risk descriptions. Automatically extracts:

- **Risk Description** - What is the risk?
- **Likelihood** - How likely is it to occur? (Low/Medium/High/Critical)
- **Impact** - What is the impact? (Low/Medium/High/Critical)
- **Mitigation** - How to address it?
- **Affected Systems** - Which systems are impacted?

## Output Format

Generates JSON formatted for Jira API:

```json
{
  "fields": {
    "project": { "key": "SEC" },
    "summary": "Implement OAuth2 with PKCE for authentication service",
    "description": "...",
    "issuetype": { "name": "Security Task" },
    "priority": { "name": "Critical" },
    "labels": ["security", "authentication", "risk-mitigation"],
    "customfield_10001": "High",  // Likelihood
    "customfield_10002": "Critical",  // Impact
    "customfield_10003": "Implement OAuth2 with PKCE"  // Mitigation
  }
}
```

## Jira Fields Generated

- **Summary** - Concise risk title
- **Description** - Full risk assessment with context
- **Priority** - Based on Likelihood × Impact matrix
- **Labels** - Auto-tagged with relevant categories
- **Issue Type** - Security Task, Bug, Story, etc.
- **Definition of Done** - Clear acceptance criteria
- **Custom Fields** - Likelihood, Impact, Mitigation (if configured)

## Risk Scoring

Automatically calculates risk score:

- **Critical** - High/Critical Likelihood × High/Critical Impact
- **High** - Medium Likelihood × High Impact, or High Likelihood × Medium Impact
- **Medium** - Other combinations
- **Low** - Low Likelihood × Low Impact

## Example Inputs

- "SQL injection vulnerability found in user input validation. High likelihood of exploitation, critical impact on data integrity. Mitigation: Implement parameterized queries and input sanitization."
- "Missing encryption on database backups. Medium likelihood of data breach, high impact. Mitigation: Enable encryption at rest for all backup storage."
- "Unauthorized access possible due to weak password policy. High likelihood, medium impact. Mitigation: Enforce strong password requirements and MFA."

## Prerequisites

- Risk description (natural language)
- Optional: Jira project key (defaults to SEC)
- Optional: Jira API credentials (for direct posting)
