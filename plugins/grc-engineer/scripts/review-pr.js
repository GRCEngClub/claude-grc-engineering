import { reviewPR } from '../src/pr-reviewer.js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const repo = process.argv[2];
  const prNumber = parseInt(process.argv[3]);
  const framework = process.argv[4] || 'SOC2';
  const githubToken = process.env.GITHUB_TOKEN;

  if (!repo || !prNumber) {
    console.error('Usage: node scripts/review-pr.js <repo> <pr-number> [framework]');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/review-pr.js myorg/infrastructure 42 SOC2');
    console.error('  node scripts/review-pr.js myorg/infrastructure 42 ISO27001');
    console.error('');
    console.error('Environment:');
    console.error('  GITHUB_TOKEN - Required (GitHub personal access token with repo scope)');
    process.exit(1);
  }

  if (!githubToken) {
    console.error('Error: GITHUB_TOKEN environment variable is required');
    console.error('');
    console.error('Set it in .env file or export:');
    console.error('  export GITHUB_TOKEN=your_token_here');
    process.exit(1);
  }

  try {
    const result = await reviewPR(repo, prNumber, framework, githubToken);
    
    console.log(`# PR Compliance Review\n`);
    console.log(`**PR:** #${result.pr.number} - ${result.pr.title}`);
    console.log(`**URL:** ${result.pr.url}`);
    console.log(`**Framework:** ${framework}\n`);
    console.log(`---\n`);
    
    console.log(`## Summary\n`);
    console.log(`- Total Issues: ${result.summary.total}`);
    console.log(`- Critical: ${result.summary.critical}`);
    console.log(`- High: ${result.summary.high}`);
    console.log(`- Medium: ${result.summary.medium}\n`);
    
    if (result.issues.length === 0) {
      console.log('✅ No compliance issues found!\n');
    } else {
      console.log(`## Issues Found\n`);
      
      const byFile = {};
      result.issues.forEach(issue => {
        if (!byFile[issue.file]) {
          byFile[issue.file] = [];
        }
        byFile[issue.file].push(issue);
      });
      
      for (const [file, issues] of Object.entries(byFile)) {
        console.log(`### ${file}\n`);
        issues.forEach(issue => {
          const emoji = {
            critical: '🚨',
            high: '⚠️',
            medium: '📝'
          }[issue.severity] || 'ℹ️';
          
          console.log(`${emoji} **Line ${issue.line}** - ${issue.message}`);
          console.log(`   Control: ${framework} ${issue.control}`);
          console.log(`   Code: \`${issue.content}\`\n`);
        });
      }
      
      console.log(`## Review Comments\n`);
      console.log(`The following comments can be posted to the PR:\n`);
      
      result.comments.forEach((comment, index) => {
        console.log(`### Comment ${index + 1}: ${comment.path}:${comment.line}\n`);
        console.log(comment.body);
        console.log(`\n---\n`);
      });
    }
    
    const reviewFile = `pr_${prNumber}_review_${Date.now()}.md`;
    const reviewContent = `# PR Compliance Review\n\n` +
      `**PR:** #${result.pr.number} - ${result.pr.title}\n` +
      `**URL:** ${result.pr.url}\n` +
      `**Framework:** ${framework}\n\n` +
      `## Summary\n\n` +
      `- Total Issues: ${result.summary.total}\n` +
      `- Critical: ${result.summary.critical}\n` +
      `- High: ${result.summary.high}\n` +
      `- Medium: ${result.summary.medium}\n\n` +
      result.comments.map(c => `## ${c.path}:${c.line}\n\n${c.body}`).join('\n\n---\n\n');
    
    await fs.writeFile(reviewFile, reviewContent, 'utf-8');
    console.log(`\nReview saved to: ${reviewFile}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`GitHub API Error: ${error.response.status} ${error.response.statusText}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);

