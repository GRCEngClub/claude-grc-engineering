#!/usr/bin/env node
// Deliberately separate from report generation: one reviewed draft per invocation.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function main(args) {
  if (args.length < 3 || args.length > 4 || (args[3] && args[3] !== '--create')) {
    throw new Error('Usage: node create-gap-issue.js PREVIEW.json OWNER/REPO INDEX [--create]');
  }
  const [file, repo, indexText, create] = args;
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]+$/.test(repo) || /\/(?:\.|\.\.)$/.test(repo)) throw new Error('Repository must be an explicit GitHub.com OWNER/REPO');
  if (!/^(0|[1-9][0-9]*)$/.test(indexText) || !Number.isSafeInteger(Number(indexText))) throw new Error('INDEX must be a zero-based integer');
  const preview = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!preview || !Array.isArray(preview.issues)) throw new Error('Invalid preview: missing issues array');
  const issue = preview.issues[Number(indexText)];
  if (!issue || typeof issue !== 'object' || Array.isArray(issue) || ![1, 2].includes(issue.tier) || typeof issue.title !== 'string' || typeof issue.scf_id !== 'string') throw new Error('Invalid or missing tier 1/2 draft');
  // JSON retains all draft fields. Encode @ to prevent mentions and use a fence
  // longer than any in the untrusted data so it cannot break out of the block.
  const data = JSON.stringify(issue, null, 2).replaceAll('@', '\\u0040');
  let longest = 2;
  for (const match of data.matchAll(/`+/g)) longest = Math.max(longest, match[0].length);
  const fence = '`'.repeat(longest + 1);
  const title = `Gap assessment finding (tier ${issue.tier})`;
  const body = `Review this untrusted finding and its mappings before remediation.\n\n${fence}json\n${data}\n${fence}\n`;
  if (!create) {
    process.stdout.write(JSON.stringify({ repository: `github.com/${repo}`, index: Number(indexText), title, body, notice: 'Preview only; no issue created.' }, null, 2) + '\n');
    return;
  }
  const result = spawnSync('gh', ['issue', 'create', '--repo', `github.com/${repo}`, '--title', title, '--body-file', '-'], { input: body, encoding: 'utf8', shell: false });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error || result.status !== 0) throw new Error(`gh failed (${result.error?.message || result.status}); creation may be ambiguous, check GitHub before retrying`);
}
try { main(process.argv.slice(2)); } catch (error) { process.stderr.write(`Error: ${error.message}\n`); process.exitCode = 1; }
