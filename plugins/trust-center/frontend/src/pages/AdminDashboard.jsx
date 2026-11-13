import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import * as api from '../utils/api.js'

const p = {
  bg: '#0a0f1a', surface: '#111827', surfaceHover: '#1a2332',
  border: '#1e293b', borderLight: '#334155',
  text: '#f1f5f9', textMuted: '#94a3b8', textDim: '#64748b',
  accent: '#3b82f6', accentGlow: 'rgba(59,130,246,0.15)',
  green: '#10b981', greenGlow: 'rgba(16,185,129,0.15)',
  amber: '#f59e0b', amberGlow: 'rgba(245,158,11,0.12)',
  red: '#ef4444', redGlow: 'rgba(239,68,68,0.12)',
}
const baseFont = "'DM Sans', sans-serif"
const monoFont = "'JetBrains Mono', monospace"

// ── Demo data for preview ───────────────────────────────────
const DEMO_REQUESTS = [
  { requestId: 'demo-1', documentName: 'Example document (fictional)', requesterName: 'Demo requester', requesterEmail: 'requester@example.invalid', requesterCompany: 'Example only', reason: 'Synthetic demonstration', status: 'pending', createdAt: '2026-05-15T10:30:00Z' },
]

const DEMO_AUDIT = [
  { action: 'access_requested', details: { requesterEmail: 'requester@example.invalid', documentId: 'example-only' }, timestamp: '2026-05-15T10:30:00Z' },
]

function StatusBadge({ status }) {
  const colors = {
    pending: { bg: p.amberGlow, text: p.amber },
    approved: { bg: p.greenGlow, text: p.green },
    denied: { bg: p.redGlow, text: p.red },
  }
  const c = colors[status] || colors.pending
  return (
    <span style={{
      fontFamily: monoFont, fontSize: 10, fontWeight: 600,
      color: c.text, background: c.bg, padding: '3px 8px',
      borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {status}
    </span>
  )
}

function RequestRow({ req, onApprove, onDeny, isDemo }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr auto auto',
      gap: 16, alignItems: 'center', padding: '16px 20px',
      borderBottom: `1px solid ${p.border}`,
    }}>
      <div>
        <div style={{ fontFamily: baseFont, fontSize: 14, fontWeight: 600, color: p.text }}>
          {req.requesterName}
        </div>
        <div style={{ fontFamily: monoFont, fontSize: 11, color: p.textDim, marginTop: 2 }}>
          {req.requesterEmail}
        </div>
        <div style={{ fontFamily: baseFont, fontSize: 12, color: p.textMuted, marginTop: 2 }}>
          {req.requesterCompany}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: baseFont, fontSize: 13, color: p.textMuted }}>
          {req.documentName}
        </div>
        <div style={{ fontFamily: baseFont, fontSize: 12, color: p.textDim, marginTop: 4, lineHeight: 1.4 }}>
          {req.reason}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusBadge status={req.status} />
        <div style={{ fontFamily: monoFont, fontSize: 10, color: p.textDim, marginTop: 6 }}>
          {new Date(req.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {(req.version || isDemo) && ['pending', 'denied'].includes(req.status) && (
            <button onClick={() => onApprove(req)} style={{
              fontFamily: baseFont, fontSize: 12, fontWeight: 600, color: p.green,
              background: p.greenGlow, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            }}>Approve</button>
        )}
        {(req.version || isDemo) && ['pending', 'approved'].includes(req.status) && (
            <button onClick={() => onDeny(req)} style={{
              fontFamily: baseFont, fontSize: 12, fontWeight: 600, color: p.red,
              background: p.redGlow, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            }}>{req.status === 'approved' ? 'Revoke' : 'Deny'}</button>
        )}
        {!req.version && !isDemo && <span>Legacy request — cannot decide</span>}
      </div>
    </div>
  )
}

function AuditRow({ entry }) {
  const labels = {
    access_requested: '📋 Access Requested',
    document_downloaded: '⬇️ Downloaded',
    request_approved: '✅ Approved',
    request_denied: '❌ Denied',
    document_deleted: '🗑️ Deleted',
  }
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 20px', borderBottom: `1px solid ${p.border}`,
    }}>
      <div>
        <div style={{ fontFamily: baseFont, fontSize: 13, color: p.text }}>
          {labels[entry.action] || entry.action}
        </div>
        <div style={{ fontFamily: monoFont, fontSize: 11, color: p.textDim, marginTop: 2 }}>
          {Object.entries(entry.details || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
        </div>
      </div>
      <div style={{ fontFamily: monoFont, fontSize: 11, color: p.textDim, flexShrink: 0 }}>
        {new Date(entry.timestamp).toLocaleString()}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, loading: authLoading, logout, getToken } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('requests')
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'
  const [requests, setRequests] = useState(() => isDemo ? DEMO_REQUESTS : [])
  const [auditLog, setAuditLog] = useState(() => isDemo ? DEMO_AUDIT : [])
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [nextCursor, setNextCursor] = useState(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const requestEpoch = useRef(0)


  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      navigate('/login')
    }
  }, [user, authLoading, navigate, isDemo])

  useEffect(() => {
    if (isDemo || !user) return
    const epoch = ++requestEpoch.current
    let active = true
    if (tab === 'requests') { setRequests([]); setNextCursor(null) }
    const load = async () => {
      try {
        const token = await getToken()
        if (!active) return
        const data = tab === 'requests' ? await api.getRequests(token, statusFilter) : await api.getAuditLog(token)
        if (!active || requestEpoch.current !== epoch) return
        if (tab === 'requests') { setRequests(data?.requests || []); setNextCursor(data?.nextCursor || null) }
        else setAuditLog(data?.entries || [])
      } catch { if (active) setError(tab === 'requests' ? 'Could not load requests.' : 'Could not load audit log.') }
    }
    load()
    return () => { active = false }
  }, [tab, statusFilter, getToken, isDemo, refresh, user])

  const handleApprove = async (req) => {
    if (isDemo) {
      setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: 'approved' } : r))
      return
    }
    const epoch = ++requestEpoch.current
    try {
      const token = await getToken()
      await api.updateRequest(req.requestId, req.documentId, 'approved', req.version, token)
      const data = await api.getRequests(token, statusFilter)
      if (requestEpoch.current !== epoch) return
      setRequests(data?.requests || [])
      setNextCursor(data?.nextCursor || null)
      setError('')
    } catch {
      setError('Decision failed or changed; refresh requests before retrying.')
    }
  }

  const handleDeny = async (req) => {
    if (isDemo) {
      setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: 'denied' } : r))
      return
    }
    const epoch = ++requestEpoch.current
    try {
      const token = await getToken()
      await api.updateRequest(req.requestId, req.documentId, 'denied', req.version, token)
      const data = await api.getRequests(token, statusFilter)
      if (requestEpoch.current !== epoch) return
      setRequests(data?.requests || [])
      setNextCursor(data?.nextCursor || null)
      setError('')
    } catch {
      setError('Decision failed or changed; refresh requests before retrying.')
    }
  }

  const loadMore = async () => {
    if (!nextCursor || pageLoading) return
    const epoch = requestEpoch.current
    setPageLoading(true)
    try {
      const data = await api.getRequests(await getToken(), statusFilter, nextCursor)
      if (requestEpoch.current !== epoch) return
      setRequests(prev => [...prev, ...(data?.requests || [])])
      setNextCursor(data?.nextCursor || null)
      setError('')
    } catch { setError('Could not load more requests.') }
    finally { setPageLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: p.bg, fontFamily: baseFont }}>
      {/* Nav bar */}
      <nav style={{
        background: p.surface, borderBottom: `1px solid ${p.border}`,
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${p.accent}, #6366f1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontFamily: baseFont, fontSize: 15, fontWeight: 700, color: p.text }}>
            Trust Center Admin
          </span>
          {isDemo && (
            <span style={{
              fontFamily: monoFont, fontSize: 9, fontWeight: 600, color: p.amber,
              background: p.amberGlow, padding: '2px 8px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Demo</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ fontFamily: baseFont, fontSize: 13, color: p.textDim, textDecoration: 'none' }}>
            ← Public Site
          </Link>
          {user && (
            <>
              <span style={{ fontFamily: monoFont, fontSize: 11, color: p.textDim }}>{user.email}</span>
              <button onClick={logout} style={{
                fontFamily: baseFont, fontSize: 12, fontWeight: 600, color: p.red,
                background: p.redGlow, border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
              }}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {isDemo && <p style={{ color: p.amber }}>Isolated demo — all records are fictional. Changes are simulated locally and are not submitted. NDA enforcement is not implemented.</p>}
        {error && <p role="alert" style={{ color: p.red }}>{error}</p>}
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {[
            { key: 'requests', label: 'Access Requests' },
            { key: 'audit', label: 'Audit Log' },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              fontFamily: monoFont, fontSize: 12, fontWeight: 600,
              color: tab === key ? p.text : p.textDim,
              background: tab === key ? p.surfaceHover : 'transparent',
              border: `1px solid ${tab === key ? p.borderLight : 'transparent'}`,
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {label}
              {count > 0 && (
                <span style={{
                  fontFamily: monoFont, fontSize: 10, color: '#fff', background: p.accent,
                  borderRadius: 10, padding: '1px 6px', fontWeight: 700, minWidth: 18, textAlign: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests Tab */}
        {tab === 'requests' && (
          <>
            {!isDemo && <button onClick={() => { requestEpoch.current++; setError(''); setRefresh(n => n + 1) }}>Refresh requests</button>}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {['', 'pending', 'approved', 'denied'].map(s => (
                <button key={s} onClick={() => { if (s !== statusFilter) requestEpoch.current++; setStatusFilter(s) }} style={{
                  fontFamily: monoFont, fontSize: 10, fontWeight: 600,
                  color: statusFilter === s ? p.text : p.textDim,
                  background: statusFilter === s ? p.surfaceHover : 'transparent',
                  border: `1px solid ${statusFilter === s ? p.borderLight : 'transparent'}`,
                  borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {s || 'all'}
                </button>
              ))}
            </div>
            <div style={{
              background: p.surface, border: `1px solid ${p.border}`, borderRadius: 16, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 16,
                padding: '12px 20px', borderBottom: `1px solid ${p.border}`,
              }}>
                {['Requester', 'Document', 'Status', 'Actions'].map(h => (
                  <div key={h} style={{
                    fontFamily: monoFont, fontSize: 10, fontWeight: 600, color: p.textDim,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</div>
                ))}
              </div>
              {requests
                .filter(r => !statusFilter || r.status === statusFilter)
                .map(req => (
                  <RequestRow key={req.requestId} req={req} onApprove={handleApprove} onDeny={handleDeny} isDemo={isDemo} />
                ))
              }
              {requests.filter(r => !statusFilter || r.status === statusFilter).length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: p.textDim, fontSize: 14 }}>
                  No requests found
                </div>
              )}
            </div>
            {nextCursor && <button disabled={pageLoading} onClick={loadMore}>Load more requests</button>}
          </>
        )}

        {/* Audit Tab */}
        {tab === 'audit' && (
          <><p style={{ color: p.amber }}>Best-effort activity log: entries may be missing and are not an authoritative audit trail.</p>
          <div style={{
            background: p.surface, border: `1px solid ${p.border}`, borderRadius: 16, overflow: 'hidden',
          }}>
            {auditLog.map((entry, i) => (
              <AuditRow key={i} entry={entry} />
            ))}
            {auditLog.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: p.textDim, fontSize: 14 }}>
                No audit entries yet
              </div>
            )}
          </div></>
        )}
      </div>
    </div>
  )
}
