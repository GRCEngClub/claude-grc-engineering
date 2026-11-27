#!/usr/bin/env node
// Checks the token against GET /companies/ and writes the connector config.
// The token is read from an environment variable and never written anywhere.

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  SOURCE, SOURCE_VERSION, CONFIG_FILE, CACHE_DIR, RUNS_LOG, DEFAULT_TOKEN_ENV,
  ApiError, createClient, fetchCompany, isValidEnvName, resolveBaseUrl,
} from './api.js';

const USAGE = `Usage: node setup.js [--token-env=<NAME>]

Validates a Rippling API token and writes ${CONFIG_FILE}.
The token is read from the environment variable NAME (default ${DEFAULT_TOKEN_ENV}).
It is never accepted as an argument and never stored.
`;

async function main(argv) {
  let tokenEnv = DEFAULT_TOKEN_ENV;
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') { process.stdout.write(USAGE); return 0; }
    if (arg.startsWith('--token-env=')) tokenEnv = arg.slice('--token-env='.length);
    else { process.stderr.write(`[${SOURCE}:setup] Unknown argument: ${arg}\n${USAGE}`); return 2; }
  }
  if (!isValidEnvName(tokenEnv)) { process.stderr.write(`[${SOURCE}:setup] --token-env must be an environment variable name.\n`); return 2; }
  const token = process.env[tokenEnv];
  if (!token) {
    process.stderr.write(`[${SOURCE}:setup] ${tokenEnv} is not set.

Create a token in Rippling under Developer > API credentials > New API token
(https://app.rippling.com/api-tokens/tokens). Select read scopes only:
  companies.read workers.read users.read devices.read app-users.read activity-log.read
Then, in your own terminal (not in this chat):
  export ${tokenEnv}=<token>
and run setup again.
`);
    return 2;
  }
  const client = createClient({ token, baseUrl: resolveBaseUrl() });
  let company = null;
  let note = '';
  try { company = await fetchCompany(client); } catch (err) {
    if (!(err instanceof ApiError) || err.code !== 'FORBIDDEN') throw err;
    note = 'The token is valid but lacks companies.read, so the company ID is unknown.';
  }
  const companyId = (company?.id || 'unknown').replace(/[^A-Za-z0-9_-]/g, '');
  await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true, mode: 0o700 });
  await fs.writeFile(CONFIG_FILE, [
    'version: 1', `source: ${SOURCE}`, `source_version: "${SOURCE_VERSION}"`,
    `company_id: "${companyId}"`, `token_env: "${tokenEnv}"`, '',
  ].join('\n'), { mode: 0o600 });
  await fs.mkdir(CACHE_DIR, { recursive: true, mode: 0o700 });
  await fs.appendFile(RUNS_LOG, '');
  process.stdout.write(`${SOURCE}:setup ok
  company id:    ${companyId}
  token source:  $${tokenEnv}
  config:        ${CONFIG_FILE}
${note ? `  note:          ${note}\n` : ''}
Rippling revokes a token that is unused for 30 days or whose owner is offboarded.
A token sees only what its owner can see, so create it as a full admin for company-wide results.

Next:
  /rippling-inspector:collect
`);
  return 0;
}

main(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch(err => {
  process.stderr.write(`[${SOURCE}:setup] ${err instanceof ApiError ? err.message : `unexpected error: ${err.message}`}\n`);
  process.exitCode = err instanceof ApiError && err.code === 'NETWORK' ? 1 : 2;
});
