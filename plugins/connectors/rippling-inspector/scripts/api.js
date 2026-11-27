// Read-only client for the Rippling REST API (v2, https://rest.ripplingapis.com).
// Node built-ins only. Every request is a GET, and the token is sent to one
// origin only: the API base URL.

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const SOURCE = 'rippling-inspector';
export const SOURCE_VERSION = '0.1.0';
export const DEFAULT_BASE_URL = 'https://rest.ripplingapis.com';
export const API_VERSION = '2024-08-01';
export const DEFAULT_TOKEN_ENV = 'RIPPLING_API_TOKEN';

export const CONFIG_DIR = process.env.CLAUDE_GRC_CONFIG_DIR || path.join(os.homedir(), '.config', 'claude-grc');
export const CONFIG_FILE = path.join(CONFIG_DIR, 'connectors', `${SOURCE}.yaml`);
export const CACHE_ROOT = path.join(os.homedir(), '.cache', 'claude-grc');
export const CACHE_DIR = path.join(CACHE_ROOT, 'findings', SOURCE);
export const RUNS_LOG = path.join(CACHE_ROOT, 'runs.log');

const MAX_RETRIES = 4;
const MAX_REDIRECTS = 2;
const REQUEST_TIMEOUT_MS = 60_000;

export class ApiError extends Error {
  constructor(code, message, status = null) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// The override exists so the connector can be pointed at a local mock. It is
// limited to loopback hosts so a stray environment variable cannot redirect
// the token to another server.
export function resolveBaseUrl(env = process.env) {
  const override = env.RIPPLING_API_BASE_URL;
  if (!override) return DEFAULT_BASE_URL;
  let url;
  try { url = new URL(override); } catch { throw new ApiError('USAGE', 'RIPPLING_API_BASE_URL is not a valid URL.'); }
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new ApiError('USAGE', 'RIPPLING_API_BASE_URL may only point at localhost, for testing against a mock.');
  }
  return url.origin;
}

export function isValidEnvName(name) {
  return typeof name === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

// Rippling returns four different error shapes: an array of strings,
// {detail}, {ok, error} and {code, message}.
export function errorDetail(body) {
  let text = '';
  if (Array.isArray(body)) text = body.filter(item => typeof item === 'string').join(' ');
  else if (body && typeof body === 'object') text = [body.detail, body.error, body.message].find(v => typeof v === 'string') || '';
  return text.replace(/\s+/g, ' ').trim().slice(0, 200);
}

function retryDelayMs(res, attempt) {
  const header = res?.headers?.get('retry-after');
  const seconds = header && /^\d+$/.test(header) ? Number(header) : null;
  const backoff = 1000 * 2 ** attempt;
  return Math.min(seconds !== null ? seconds * 1000 : backoff, 30_000);
}

export function createClient({ token, baseUrl = DEFAULT_BASE_URL, fetchImpl = fetch, sleep = ms => new Promise(r => setTimeout(r, ms)) }) {
  const origin = new URL(baseUrl).origin;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Rippling-Api-Version': API_VERSION,
    'User-Agent': `claude-grc-${SOURCE}/${SOURCE_VERSION}`,
  };

  async function get(target) {
    let url = new URL(target, `${origin}/`);
    let attempt = 0;
    let redirects = 0;
    for (;;) {
      if (url.origin !== origin) throw new ApiError('BAD_LINK', `Refusing to follow a link to ${url.origin}; the token is only sent to ${origin}.`);
      let res;
      try {
        res = await fetchImpl(url, { method: 'GET', headers, redirect: 'manual', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      } catch (err) {
        if (attempt < MAX_RETRIES) { await sleep(1000 * 2 ** attempt++); continue; }
        throw new ApiError('NETWORK', `Network error calling ${url.pathname}: ${err.cause?.code || err.name}.`);
      }
      if ([301, 302, 307, 308].includes(res.status)) {
        const location = res.headers.get('location');
        if (!location || ++redirects > MAX_REDIRECTS) throw new ApiError('HTTP', `Unexpected redirect from ${url.pathname}.`, res.status);
        url = new URL(location, url);
        continue;
      }
      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_RETRIES) { await sleep(retryDelayMs(res, attempt++)); continue; }
        if (res.status === 429) throw new ApiError('RATE_LIMIT', `Rippling rate limit on ${url.pathname} after ${MAX_RETRIES} retries.`, 429);
        throw new ApiError('HTTP', `Rippling returned HTTP ${res.status} on ${url.pathname} after ${MAX_RETRIES} retries.`, res.status);
      }
      const text = await res.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch { body = null; }
      if (res.ok) {
        if (!body || typeof body !== 'object') throw new ApiError('HTTP', `Rippling returned a non-JSON response on ${url.pathname}.`, res.status);
        return body;
      }
      const detail = errorDetail(body);
      const requestId = res.headers.get('x-rippling-request-id');
      const suffix = `${detail ? ` ${detail}` : ''}${requestId ? ` (request ${requestId})` : ''}`;
      if (res.status === 401) {
        throw new ApiError('AUTH', 'Rippling rejected the token (HTTP 401). It may be wrong, revoked, unused for more than 30 days, or its owner may have been offboarded.', 401);
      }
      if (res.status === 403) throw new ApiError('FORBIDDEN', `HTTP 403 on ${url.pathname}.${suffix}`, 403);
      if (res.status === 404 && /invalid cursor/i.test(detail)) throw new ApiError('CURSOR', `Pagination cursor expired on ${url.pathname}.`, 404);
      throw new ApiError('HTTP', `HTTP ${res.status} on ${url.pathname}.${suffix}`, res.status);
    }
  }

  // Follows next_link exactly as returned until it is null or maxPages is hit.
  async function list(target, { maxPages = 200 } = {}) {
    const results = [];
    const redacted = new Set();
    let next = target;
    let pages = 0;
    while (next) {
      if (pages >= maxPages) return { results, redacted, truncated: true };
      const body = await get(next);
      pages += 1;
      if (Array.isArray(body.results)) results.push(...body.results);
      for (const field of body.__meta?.redacted_fields || []) {
        if (field && typeof field.name === 'string') redacted.add(field.name);
      }
      next = typeof body.next_link === 'string' && body.next_link ? body.next_link : null;
    }
    return { results, redacted, truncated: false };
  }

  return { get, list, origin };
}

export function query(pathname, params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `${pathname}?${text}` : pathname;
}

// Reads the flat "key: value" file that setup writes. Not a general YAML parser.
export function parseConfig(text) {
  const out = {};
  for (const raw of text.split('\n')) {
    const match = raw.match(/^([A-Za-z0-9_]+):\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1);
    out[match[1]] = value;
  }
  return out;
}

export async function readConfig() {
  let text;
  try { text = await fs.readFile(CONFIG_FILE, 'utf8'); } catch { return null; }
  return parseConfig(text);
}

export async function fetchCompany(client) {
  const body = await client.get(query('/companies/', { limit: 1 }));
  const company = Array.isArray(body.results) ? body.results[0] : null;
  return company && typeof company.id === 'string' ? { id: company.id, name: typeof company.name === 'string' ? company.name : null } : null;
}
