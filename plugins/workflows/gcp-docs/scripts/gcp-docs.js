#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
const CONFIG_FILE = path.join(CONFIG_DIR, 'knowledge-sources', 'gcp-docs.yaml');
const ENV_FILE = path.join(CONFIG_DIR, 'knowledge-sources', 'gcp-docs.env');
const DEFAULT_BASE_URL = 'https://developerknowledge.googleapis.com/v1alpha';
const DEFAULT_CACHE_DIR = path.join(os.homedir(), '.cache', 'claude-grc', 'knowledge', 'google');
const CONTROL_QUERIES = {
  'CRY-04': 'Google Cloud KMS key rotation encryption key management',
  'DCH-06': 'Google Cloud data classification data loss prevention sensitive data protection',
  'IAC-02': 'Google Cloud identity access management multi-factor authentication workforce identity',
  'MON-01': 'Google Cloud audit logs logging monitoring security operations',
  'NET-06': 'Google Cloud VPC firewall network segmentation security best practices',
  'VPM-02': 'Google Cloud vulnerability scanning Security Command Center container analysis'
};

async function main(argv) {
  const command = argv.shift();
  if (!command || !['status', 'query', 'cite'].includes(command)) usage();
  const args = parseArgs(argv);
  const cfg = await config(args);
  if (command === 'status') return status(cfg, args);
  const question = args._.join(' ').trim();
  if (!question) usage();
  if (command === 'query') return query(cfg, question, args);
  if (command === 'cite') return cite(cfg, question, args);
}

async function status(cfg, args) {
  const url = new URL(`${cfg.baseUrl}/documents:searchDocumentChunks`);
  url.searchParams.set('query', 'Cloud KMS key rotation');
  url.searchParams.set('pageSize', '1');
  url.searchParams.set('key', cfg.apiKey || '');
  const code = await fetch(url).then(r => r.status).catch(() => 0);
  if (args.output === 'code') process.stdout.write(String(code));
  else process.stdout.write(`gcp-docs: ${code === 200 ? 'ready' : `unavailable (${code})`}\n`);
}

async function query(cfg, question, args) {
  const cacheKey = `answer-${hash(question)}.json`;
  const cached = await readCache(cfg, cacheKey);
  if (cached) return write(cached, args);
  const raw = await requestJson(cfg, '/topLevel:answerQuery', { query: question }, 'POST');
  const out = {
    question,
    answer: raw.answer || raw.answerText || raw.summary || '',
    citations: citations(raw),
    raw
  };
  await writeCache(cfg, cacheKey, out);
  write(out, args);
}

async function cite(cfg, topic, args) {
  const queryText = CONTROL_QUERIES[topic.toUpperCase()] || topic;
  const limit = args.limit || 5;
  const cacheKey = `cite-${hash(queryText)}-${limit}.json`;
  const cached = await readCache(cfg, cacheKey);
  if (cached) return write(cached, args);
  const raw = await requestJson(cfg, '/documents:searchDocumentChunks', { query: queryText, pageSize: String(limit) }, 'GET');
  const results = (raw.results || raw.documentChunks || raw.chunks || []).map((item) => {
    const chunk = item.documentChunk || item.chunk || item;
    return {
      title: chunk.title || chunk.documentTitle || item.title || null,
      uri: chunk.uri || chunk.documentUri || item.uri || parentToUri(chunk.parent || item.parent),
      document: chunk.parent || item.parent || null,
      snippet: chunk.content || chunk.text || item.content || item.snippet || '',
      score: item.score || item.relevanceScore || null
    };
  });
  const out = { topic, query: queryText, results, raw };
  await writeCache(cfg, cacheKey, out);
  write(out, args);
}

async function requestJson(cfg, endpoint, params, method) {
  const url = new URL(`${cfg.baseUrl}${endpoint}`);
  url.searchParams.set('key', cfg.apiKey);
  const init = { method };
  if (method === 'GET') for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  else {
    init.headers = { 'content-type': 'application/json' };
    init.body = JSON.stringify(params);
  }
  const r = await fetch(url, init);
  const raw = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(raw.error?.message || `Developer Knowledge API request failed: HTTP ${r.status}`);
  return raw;
}

async function config(args) {
  const fileCfg = await readYaml(CONFIG_FILE);
  const env = await readEnv(ENV_FILE);
  const apiKey = args.apiKey || process.env.GOOGLE_DEVELOPER_KNOWLEDGE_API_KEY || env.GOOGLE_DEVELOPER_KNOWLEDGE_API_KEY;
  if (!apiKey) throw new Error('missing GOOGLE_DEVELOPER_KNOWLEDGE_API_KEY; run /gcp-docs:setup first.');
  return {
    apiKey,
    baseUrl: args.baseUrl || process.env.GOOGLE_DEVELOPER_KNOWLEDGE_API_BASE_URL || fileCfg.base_url || DEFAULT_BASE_URL,
    cacheDir: expandHome(fileCfg.cache_dir || DEFAULT_CACHE_DIR),
    ttlDays: Number(fileCfg.ttl_days || 7)
  };
}

async function readCache(cfg, name) {
  try {
    const p = path.join(cfg.cacheDir, name);
    const st = await fs.stat(p);
    if ((Date.now() - st.mtimeMs) / 86400000 > cfg.ttlDays) return null;
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch { return null; }
}
async function writeCache(cfg, name, value) { await fs.mkdir(cfg.cacheDir, { recursive: true }); await fs.writeFile(path.join(cfg.cacheDir, name), JSON.stringify(value, null, 2)); }
function write(out, args) {
  if (args.output === 'json') process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  else if (out.answer) process.stdout.write(`${out.answer}\n\n${out.citations.map(c => `- ${c.uri || c.title}`).join('\n')}\n`);
  else process.stdout.write(out.results.map(r => `- ${r.title || r.uri}\n  ${r.uri || ''}\n  ${String(r.snippet || '').slice(0, 240)}`).join('\n') + '\n');
}
function citations(raw) { return raw.citations || raw.groundingAttributions || raw.sources || []; }
function parentToUri(parent) { return parent?.startsWith('documents/') ? `https://${parent.slice('documents/'.length)}` : null; }
async function readYaml(file) { try { const out = {}; for (const line of (await fs.readFile(file, 'utf8')).split(/\r?\n/)) { const m = line.match(/^([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/); if (m) out[m[1]] = m[2]; } return out; } catch { return {}; } }
async function readEnv(file) { try { return Object.fromEntries((await fs.readFile(file, 'utf8')).split(/\r?\n/).map(l => l.match(/^([A-Z0-9_]+)="?(.*?)"?$/)).filter(Boolean).map(m => [m[1], m[2]])); } catch { return {}; } }
function expandHome(v) { return String(v).replace(/^~(?=$|\/)/, os.homedir()); }
function hash(v) { return crypto.createHash('sha256').update(v).digest('hex').slice(0, 16); }
function parseArgs(argv) { const out = { _: [], output: 'summary', limit: 5 }; for (const tok of argv) { if (!tok.startsWith('--')) out._.push(tok); else { const [k, v = ''] = tok.slice(2).split('='); if (k === 'api-key') out.apiKey = v; else if (k === 'base-url') out.baseUrl = v; else if (k === 'output') out.output = v; else if (k === 'limit') out.limit = Number(v); else usage(); } } return out; }
function usage() { process.stderr.write('usage: gcp-docs.js <status|query|cite> [--output=json] <question-or-topic>\n'); process.exit(2); }

main(process.argv.slice(2)).catch(err => { process.stderr.write(`[gcp-docs] ${err.message}\n`); process.exit(1); });
