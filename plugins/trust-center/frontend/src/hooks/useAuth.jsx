import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js'

const AuthContext = createContext(null)
const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const poolId = import.meta.env.VITE_USER_POOL_ID
const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID
// Each authentication attempt owns a revocable store. SDK writes happen before
// callbacks, so stale attempts must never share storage with a newer session.
function createStorage() {
  const values = new Map()
  let active = true
  return {
    getItem: key => active ? (values.get(key) ?? null) : null,
    setItem: (key, value) => { if (active) values.set(key, String(value)) },
    removeItem: key => { if (active) values.delete(key) },
    clear: () => values.clear(),
    revoke: () => { active = false; values.clear() },
  }
}
// Remove only credentials persisted by older versions for this client.
try {
  const prefix = `CognitoIdentityServiceProvider.${clientId}.`
  if (clientId) for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) localStorage.removeItem(key)
  }
} catch { /* Storage may be unavailable. */ }
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const active = useRef(null)

  useEffect(() => () => {
    active.current?.storage.revoke()
    active.current = null
  }, [])

  const login = useCallback((email, password) => {
    if (IS_DEMO) return Promise.reject(new Error('Sign-in is disabled in demo mode.'))
    if (!poolId || !clientId) return Promise.reject(new Error('Sign-in is not configured.'))
    active.current?.storage.revoke()
    const storage = createStorage()
    const pool = new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId, Storage: storage })
    const attempt = { storage, pool, refresh: null }
    active.current = attempt
    setUser(null); setError(null); setLoading(false)
    const isCurrent = () => active.current === attempt
    const cancelled = () => new Error('Sign-in cancelled.')
    const success = (session, resolve, reject) => {
      if (!isCurrent()) { reject(cancelled()); return }
      const payload = session.getIdToken().decodePayload()
      const groups = payload['cognito:groups'] || []
      const userData = { email: payload.email, groups, token: session.getIdToken().getJwtToken(), isAdmin: groups.includes('admins') }
      setUser(userData); resolve(userData)
    }
    const failure = (err, reject) => {
      if (!isCurrent()) { reject(cancelled()); return }
      storage.revoke(); active.current = null; setUser(null); setError(err.message); reject(err)
    }
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: pool, Storage: storage })
      const authDetails = new AuthenticationDetails({ Username: email, Password: password })
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: session => success(session, resolve, reject),
        onFailure: err => failure(err, reject),
        newPasswordRequired: attributes => {
          if (!isCurrent()) { reject(cancelled()); return }
          resolve({ challengeName: 'NEW_PASSWORD_REQUIRED', completeChallenge: newPassword => new Promise((res, rej) => {
            if (!isCurrent()) { rej(cancelled()); return }
            const attrs = { ...attributes }; delete attrs.email_verified; delete attrs.email
            cognitoUser.completeNewPasswordChallenge(newPassword, attrs, {
              onSuccess: session => success(session, res, rej),
              onFailure: err => failure(err, rej),
            })
          }) })
        },
      })
    })
  }, [])

  const logout = useCallback(() => {
    const old = active.current
    active.current = null
    old?.storage.revoke()
    setUser(null); setError(null)
  }, [])

  // Coalesce refreshes: an older SDK callback must not overwrite a newer one.
  const getToken = useCallback(() => {
    const attempt = active.current
    const cognitoUser = attempt?.pool.getCurrentUser()
    if (!cognitoUser) return Promise.reject(new Error('Sign-in required.'))
    if (attempt.refresh) return attempt.refresh
    const pending = new Promise((resolve, reject) => cognitoUser.getSession((err, session) => {
      if (active.current !== attempt) { reject(new Error('Session ended.')); return }
      if (err || !session?.isValid()) {
        attempt.storage.revoke(); active.current = null; setUser(null)
        reject(new Error('Session expired. Please sign in again.')); return
      }
      resolve(session.getIdToken().getJwtToken())
    }))
    attempt.refresh = pending
    pending.then(() => { if (attempt.refresh === pending) attempt.refresh = null },
                 () => { if (attempt.refresh === pending) attempt.refresh = null })
    return pending
  }, [])

  return <AuthContext.Provider value={{ user, loading, error, login, logout, getToken }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
