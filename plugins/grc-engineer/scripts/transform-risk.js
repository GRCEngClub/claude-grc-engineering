import { transformRisk } from '../src/risk-transformer.js';
import fs from 'fs/promises';

async function main() {
  const riskDescription = process.argv[2];
  const projectKey = process.argv[3];

  if (!riskDescription) {
    console.error('Usage: node scripts/transform-risk.js "<risk-description>" [project-key]');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/transform-risk.js "SQL injection found. High likelihood, critical impact. Mitigation: Use parameterized queries." SEC');
    console.error('  node scripts/transform-risk.js "Missing encryption on backups. Medium likelihood, high impact. Mitigation: Enable encryption." INFRA');
    console.error('');
    console.error('Configure custom field IDs via environment variables or config/jira/fields.yaml');
    process.exit(1);
  }

  try {
    const result = await transformRisk(riskDescription, projectKey);
    
    const jiraJson = JSON.stringify(result.jiraTicket, null, 2);
    const jsonFile = `jira_ticket_${Date.now()}.json`;
    await fs.writeFile(jsonFile, jiraJson, 'utf-8');
    
    console.log(`# Jira Ticket Generated\n`);
    console.log(`**Project:** ${result.jiraTicket.fields.project.key}`);
    console.log(`**Summary:** ${result.jiraTicket.fields.summary}`);
    console.log(`**Priority:** ${result.jiraTicket.fields.priority.name}`);
    console.log(`**Issue Type:** ${result.jiraTicket.fields.issuetype.name}`);
    console.log(`**Labels:** ${result.jiraTicket.fields.labels.join(', ')}`);
    console.log(`**Config Source:** ${result.metadata.configSource}\n`);
    
    console.log(`## Risk Analysis\n`);
    console.log(`- **Likelihood:** ${result.metadata.extracted.likelihood}`);
    console.log(`- **Impact:** ${result.metadata.extracted.impact}`);
    console.log(`- **Risk Score:** ${result.metadata.extracted.riskScore}/16`);
    console.log(`- **Mitigation:** ${result.metadata.extracted.mitigation}\n`);
    
    console.log(`## Description\n`);
    console.log(result.jiraTicket.fields.description);
    console.log(`\n---\n`);
    
    console.log(`## Jira JSON\n`);
    console.log(jiraJson);
    console.log(`\n---\n`);
    
    console.log(`JSON saved to: ${jsonFile}\n`);
    console.log(`## Next Steps\n`);
    console.log(`1. Review the generated ticket`);
    console.log(`2. Post to Jira using the API:`);
    console.log(`   curl -X POST https://your-domain.atlassian.net/rest/api/3/issue \\`);
    console.log(`     -H "Authorization: Basic <token>" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d @${jsonFile}`);
    console.log(`\n3. Or import manually via Jira UI`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);

