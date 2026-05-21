import { useState, useEffect } from 'react'
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
  { requestId: 'r001', documentName: 'SOC 2 Type II Report', requesterName: 'Sarah Chen', requesterEmail: 'sarah@bigcorp.com', requesterCompany: 'BigCorp', reason: 'Vendor due diligence for enterprise procurement', status: 'pending', ndaSigned: false, createdAt: '2026-05-15T10:30:00Z' },
  { requestId: 'r002', documentName: 'Information Security Policy', requesterName: 'James Mwangi', requesterEmail: 'james@techpartners.io', requesterCompany: 'TechPartners', reason: 'Security review for integration partnership', status: 'pending', ndaSigned: true, createdAt: '2026-05-16T14:20:00Z' },
  { requestId: 'r003', documentName: 'SOC 2 Type II Report', requesterName: 'Lisa Park', requesterEmail: 'lisa@acme.com', requesterCompany: 'Acme Corp', reason: 'Annual vendor reassessment', status: 'approved', ndaSigned: true, createdAt: '2026-05-10T09:00:00Z' },
]

const DEMO_AUDIT = [
  { action: 'access_requested', details: { requesterEmail: 'sarah@bigcorp.com', documentId: 'soc2-type2' }, timestamp: '2026-05-15T10:30:00Z' },
  { action: 'document_downloaded', details: { downloadedBy: 'lisa@acme.com', documentName: 'SOC 2 Type II Report' }, timestamp: '2026-05-14T16:45:00Z' },
  { action: 'request_approved', details: { reviewedBy: 'admin@yourcompany.com', requestId: 'r003' }, timestamp: '2026-05-12T11:20:00Z' },
]

function StatusBadge({ status }) {
  const colors = {
    nda_pending: { bg: 'rgba(168,85,247,0.12)', text: '#a855f7' },
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
      {status === 'nda_pending' ? 'NDA pending' : status}
    </span>
  )
}

function RequestRow({ req, onApprove, onDeny }) {
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
        {req.status === 'pending' && (
          <>
            <button onClick={() => onApprove(req)} style={{
              fontFamily: baseFont, fontSize: 12, fontWeight: 600, color: p.green,
              background: p.greenGlow, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            }}>Approve</button>
            <button onClick={() => onDeny(req)} style={{
              fontFamily: baseFont, fontSize: 12, fontWeight: 600, color: p.red,
              background: p.redGlow, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            }}>Deny</button>
          </>
        )}
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
  const [requests, setRequests] = useState(DEMO_REQUESTS)
  const [auditLog, setAuditLog] = useState(DEMO_AUDIT)
  const [statusFilter, setStatusFilter] = useState('')

  const isDemo = !import.meta.env.VITE_API_URL

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      navigate('/login')
    }
  }, [user, authLoading, navigate, isDemo])

  useEffect(() => {
    if (isDemo) return
    const token = getToken()
    if (!token) return

    if (tab === 'requests') {
      api.getRequests(token, statusFilter).then(data => setRequests(data?.requests || []))
    } else if (tab === 'audit') {
      api.getAuditLog(token).then(data => setAuditLog(data?.entries || []))
    }
  }, [tab, statusFilter, getToken, isDemo])

  const handleApprove = async (req) => {
    if (isDemo) {
      setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: 'approved' } : r))
      return
    }
    const token = getToken()
    await api.updateRequest(req.requestId, req.documentId, 'approved', token)
    setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: 'approved' } : r))
  }

  const handleDeny = async (req) => {
    if (isDemo) {
      setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: 'denied' } : r))
      return
    }
    const token = getToken()
    await api.updateRequest(req.requestId, req.documentId, 'denied', token)
    setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: 'denied' } : r))
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

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
          <a href="/" style={{ fontFamily: baseFont, fontSize: 13, color: p.textDim, textDecoration: 'none' }}>
            ← Public Site
          </a>
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
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {[
            { key: 'requests', label: 'Access Requests', count: pendingCount },
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
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {['', 'nda_pending', 'pending', 'approved', 'denied'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
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
                  <RequestRow key={req.requestId} req={req} onApprove={handleApprove} onDeny={handleDeny} />
                ))
              }
              {requests.filter(r => !statusFilter || r.status === statusFilter).length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: p.textDim, fontSize: 14 }}>
                  No requests found
                </div>
              )}
            </div>
          </>
        )}

        {/* Audit Tab */}
        {tab === 'audit' && (
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
          </div>
        )}
      </div>
    </div>
  )
}
