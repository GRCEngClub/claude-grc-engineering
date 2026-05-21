import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const p = {
  bg: '#0a0f1a', surface: '#111827', border: '#1e293b', borderLight: '#334155',
  text: '#f1f5f9', textMuted: '#94a3b8', textDim: '#64748b',
  accent: '#3b82f6', accentGlow: 'rgba(59,130,246,0.15)',
  red: '#ef4444', green: '#10b981',
}
const baseFont = "'DM Sans', sans-serif"
const monoFont = "'JetBrains Mono', monospace"

export default function LoginPage() {
  const { login, error: authError } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [challengeHandler, setChallengeHandler] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result?.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setChallengeHandler(() => result.completeChallenge)
        setLoading(false)
      } else {
        navigate('/admin')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  const handleNewPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }
    setError('')
    setLoading(true)
    try {
      await challengeHandler(newPassword)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Failed to set new password')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', fontFamily: baseFont, fontSize: 14, color: p.text,
    background: p.bg, border: `1px solid ${p.borderLight}`, borderRadius: 10,
    padding: '12px 16px', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle = {
    fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: p.textDim,
    textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6,
  }

  return (
    <div style={{
      minHeight: '100vh', background: p.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: p.surface, border: `1px solid ${p.border}`, borderRadius: 20,
        padding: 40, width: '100%', maxWidth: 420,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg, ${p.accent}, #6366f1)`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: baseFont, fontSize: 22, fontWeight: 800, color: p.text, margin: '0 0 4px' }}>
            {challengeHandler ? 'Set New Password' : 'Admin Login'}
          </h1>
          <p style={{ fontFamily: baseFont, fontSize: 13, color: p.textDim, margin: 0 }}>
            {challengeHandler ? 'Choose a new password to continue' : 'Trust Center Administration'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.3)`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            fontFamily: baseFont, fontSize: 13, color: p.red,
          }}>
            {error}
          </div>
        )}

        {challengeHandler ? (
          <form onSubmit={handleNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 12 characters" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle} />
            </div>
            <p style={{ fontFamily: monoFont, fontSize: 10, color: p.textDim, lineHeight: 1.5 }}>
              Requires: 12+ chars, uppercase, lowercase, number, symbol
            </p>
            <button type="submit" disabled={loading} style={{
              fontFamily: baseFont, fontSize: 15, fontWeight: 700, color: '#fff',
              background: p.accent, border: 'none', borderRadius: 12, padding: '14px 0',
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Setting password...' : 'Set Password & Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              fontFamily: baseFont, fontSize: 15, fontWeight: 700, color: '#fff',
              background: p.accent, border: 'none', borderRadius: 12, padding: '14px 0',
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: 4,
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/" style={{ fontFamily: baseFont, fontSize: 13, color: p.textDim, textDecoration: 'none' }}>
            ← Back to Trust Center
          </a>
        </div>
      </div>
    </div>
  )
}
