#!/usr/bin/env node

/**
 * Assessment Interview Question Generator CLI
 *
 * Usage:
 *   node plugins/grc-engineer/scripts/generate-interview-questions.js "<stack>" [frameworks] [--format=markdown|json] [--limit=N]
 */

import {
  generateInterviewQuestions,
  renderInterviewQuestionsMarkdown
} from '../src/interview-question-generator.js';

function parseArgs(argv) {
  const positional = [];
  const options = {
    format: 'markdown',
    limit: 12
  };

  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--format=')) {
      options.format = arg.slice('--format='.length).toLowerCase();
    } else if (arg.startsWith('--limit=')) {
      const rawLimit = arg.slice('--limit='.length);
      const parsedLimit = Number.parseInt(rawLimit, 10);
      if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
        console.error(`Invalid --limit value: "${rawLimit}". Using default limit of 12.`);
      } else if (parsedLimit > 50) {
        console.error(`--limit=${rawLimit} exceeds the maximum of 50. Using 50.`);
      }
      options.limit = rawLimit;
    } else {
      positional.push(arg);
    }
  }

  options.stack = positional[0];
  options.frameworks = positional[1];
  return options;
}

function usage() {
  return `Usage: node plugins/grc-engineer/scripts/generate-interview-questions.js "<stack>" [frameworks] [options]

Generate focused assessment interview questions from a technology stack and map them to framework controls.

Arguments:
  stack        Technology stack or scope, such as "AWS IAM users" or "GitHub repositories, Okta"
  frameworks   Optional comma-separated frameworks. Default: SOC2,NIST-800-53

Options:
  --format=markdown|json   Output format. Default: markdown
  --limit=N                Maximum questions to emit. Default: 12
  --help                   Show this help text

Examples:
  node plugins/grc-engineer/scripts/generate-interview-questions.js "AWS IAM users" SOC2,NIST-800-53,PCI-DSS
  node plugins/grc-engineer/scripts/generate-interview-questions.js "AWS S3, CloudTrail" FedRAMP,NIST --format=json
  node plugins/grc-engineer/scripts/generate-interview-questions.js "Kubernetes RBAC and GitHub repositories" CIS,SOC2 --limit=5
`;
}

async function main() {
  const options = parseArgs(process.argv);

  if (options.help || !options.stack) {
    const output = usage();
    if (options.help) {
      console.log(output);
      return;
    }
    console.error(output);
    process.exit(1);
  }

  if (!['markdown', 'json'].includes(options.format)) {
    console.error(`Unsupported format: ${options.format}. Use markdown or json.`);
    process.exit(1);
  }

  try {
    const result = await generateInterviewQuestions(options);
    if (options.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      process.stdout.write(renderInterviewQuestionsMarkdown(result));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
