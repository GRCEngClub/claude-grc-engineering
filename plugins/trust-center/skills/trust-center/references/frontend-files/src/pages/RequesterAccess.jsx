import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { getAccessibleDocuments, requestAccess } from '../utils/api.js'

const shell = { maxWidth: 700, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif', lineHeight: 1.5 }

export default function RequesterAccess() {
  const { user, loading, logout, getToken } = useAuth()
  return <main style={shell}>
    <Link to="/">← Trust Center</Link>
    <h1>Requester access</h1>
    <p>Prototype only. Deployment is blocked. Downloads are unavailable and NDA signing is not enforced.</p>
    {loading ? <p>Checking session…</p> : !user ?
      <p><Link to="/requester-login">Sign in</Link> with a provisioned account. Demo mode cannot sign in.</p> :
      <><button onClick={logout}>Sign out</button><AccessForm key={user.email} getToken={getToken} /></>}
  </main>
}

function AccessForm({ getToken }) {
  const [documents, setDocuments] = useState(null)
  const [docId, setDocId] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setBusy(true); setMessage(''); setDocuments(null)
    try { setDocuments(await getAccessibleDocuments(await getToken())) }
    catch { setMessage('Could not load documents. Check your session and try again.') }
    finally { setBusy(false) }
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      await requestAccess(docId, { name, company, reason }, await getToken())
      setMessage('Request submitted. Contact an administrator for its status; approval does not enable downloads.')
    } catch { setMessage('Request not submitted. Check the document ID and session, or contact an administrator. A request may already exist.') }
    finally { setBusy(false) }
  }
  return <section>
    <h2>Available metadata</h2>
    <p>Refresh to see public documents and documents approved for this account. Restricted documents are not discoverable before approval.</p>
    <button disabled={busy} onClick={refresh}>Refresh documents</button>
    {documents !== null && (documents.length ? <ul>{documents.map((doc, i) =>
      <li key={`${doc.id}-${i}`}><strong>{doc.name}</strong>{doc.description && <p>{doc.description}</p>}<span>Downloads unavailable</span></li>
    )}</ul> : <p>No accessible documents returned.</p>)}
    <h2>Request access</h2>
    <p>Obtain the document ID from an administrator. Existing decisions cannot be reset by submitting again. Contact an administrator to change a decision.</p>
    <form onSubmit={submit}>
      <p><label>Document ID <input required value={docId} onChange={e => setDocId(e.target.value)} /></label></p>
      <p><label>Name <input maxLength={200} value={name} onChange={e => setName(e.target.value)} /></label></p>
      <p><label>Company <input maxLength={200} value={company} onChange={e => setCompany(e.target.value)} /></label></p>
      <p><label>Reason <textarea maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} /></label></p>
      <button disabled={busy} type="submit">Submit request</button>
    </form>
    {message && <p role="status">{message}</p>}
  </section>
}
