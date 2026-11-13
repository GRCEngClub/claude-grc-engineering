/**
 * Trust Center API Client
 *
 * Demo mode is explicit and never contacts the backend. Otherwise an empty
 * base URL uses the same-origin API, just like the public page.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

async function request(path, options = {}) {
  if (IS_DEMO) {
    console.warn(`[DEMO MODE] Skipped API call: ${path}`)
    throw new Error('Demo mode: API calls are disabled.')
  }

  const url = `${API_BASE}${path}`
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API error: ${res.status}`)
  }
  return res.json()
}

// ── Public endpoints ────────────────────────────────────────

export async function getConfig() {
  return request('/config')
}

export async function getDocuments() {
  const data = await request('/documents')
  return data?.documents || []
}

export async function getDocument(id) {
  return request(`/documents/${id}`)
}

export async function requestAccess(docId, form) {
  return request(`/documents/${docId}/request-access`, {
    method: 'POST',
    body: JSON.stringify(form),
  })
}

export async function downloadDocument(docId, token) {
  return request(`/documents/${docId}/download`, { token })
}

// ── Admin endpoints ─────────────────────────────────────────

export async function updateConfig(config, token) {
  return request('/admin/config', {
    method: 'PUT',
    body: JSON.stringify(config),
    token,
  })
}

export async function createDocument(doc, token) {
  return request('/admin/documents', {
    method: 'POST',
    body: JSON.stringify(doc),
    token,
  })
}

export async function deleteDocument(docId, token) {
  return request(`/admin/documents/${docId}`, {
    method: 'DELETE',
    token,
  })
}

export async function getRequests(token, status = '', cursor = '') {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (cursor) params.set('cursor', cursor)
  const query = params.toString() ? `?${params}` : ''
  return request(`/admin/requests${query}`, { token })
}

export async function updateRequest(requestId, documentId, status, expectedVersion, token) {
  return request(`/admin/requests/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, documentId, expectedVersion }),
    token,
  })
}

export async function getAuditLog(token, limit = 50) {
  return request(`/admin/audit-log?limit=${limit}`, { token })
}
