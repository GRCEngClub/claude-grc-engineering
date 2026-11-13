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
const values = new Map()
const memoryStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => { values.set(key, String(value)) },
  removeItem: key => { values.delete(key) },
  clear: () => values.clear(),
}
// Remove only credentials persisted by older versions for this client.
try {
  const prefix = `CognitoIdentityServiceProvider.${clientId}.`
  if (clientId) for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) localStorage.removeItem(key)
  }
} catch { /* Storage may be unavailable. */ }
const userPool = !IS_DEMO && poolId && clientId ? new CognitoUserPool({
  UserPoolId: poolId,
  ClientId: clientId,
  Storage: memoryStorage,
}) : null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const epoch = useRef(0)

  // Check for existing session on mount
  useEffect(() => {
    if (!userPool) { setLoading(false); return }
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err || !session?.isValid()) {
          setUser(null)
        } else {
          const payload = session.getIdToken().decodePayload()
          setUser({
            email: payload.email,
            groups: payload['cognito:groups'] || [],
            token: session.getIdToken().getJwtToken(),
            isAdmin: (payload['cognito:groups'] || []).includes('admins'),
          })
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback((email, password) => {
    if (IS_DEMO) return Promise.reject(new Error('Sign-in is disabled in demo mode.'))
    if (!userPool) return Promise.reject(new Error('Sign-in is not configured.'))
    const current = ++epoch.current
    memoryStorage.clear()
    setUser(null)
    return new Promise((resolve, reject) => {
      setError(null)
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool, Storage: memoryStorage })
      const authDetails = new AuthenticationDetails({ Username: email, Password: password })

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          if (current !== epoch.current) { memoryStorage.clear(); reject(new Error('Sign-in cancelled.')); return }
          const payload = session.getIdToken().decodePayload()
          const userData = {
            email: payload.email,
            groups: payload['cognito:groups'] || [],
            token: session.getIdToken().getJwtToken(),
            isAdmin: (payload['cognito:groups'] || []).includes('admins'),
          }
          setUser(userData)
          resolve(userData)
        },
        onFailure: (err) => {
          setError(err.message)
          reject(err)
        },
        newPasswordRequired: (userAttributes) => {
          // First login — Cognito requires a password change
          // Return a function the UI can call with the new password
          resolve({
            challengeName: 'NEW_PASSWORD_REQUIRED',
            completeChallenge: (newPassword) => {
              return new Promise((res, rej) => {
                delete userAttributes.email_verified
                delete userAttributes.email
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
                  onSuccess: (session) => {
                    if (current !== epoch.current) { memoryStorage.clear(); rej(new Error('Sign-in cancelled.')); return }
                    const payload = session.getIdToken().decodePayload()
                    const userData = {
                      email: payload.email,
                      groups: payload['cognito:groups'] || [],
                      token: session.getIdToken().getJwtToken(),
                      isAdmin: (payload['cognito:groups'] || []).includes('admins'),
                    }
                    setUser(userData)
                    res(userData)
                  },
                  onFailure: (err) => {
                    setError(err.message)
                    rej(err)
                  },
                })
              })
            },
          })
        },
      })
    })
  }, [])

  const logout = useCallback(() => {
    ++epoch.current
    if (!userPool) { setUser(null); return }
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) cognitoUser.signOut()
    memoryStorage.clear()
    setUser(null)
  }, [])

  // Cognito getSession refreshes expired tokens using the in-memory refresh token.
  const getToken = useCallback(() => {
    const current = epoch.current
    const cognitoUser = userPool?.getCurrentUser()
    if (!cognitoUser) return Promise.reject(new Error('Sign-in required.'))
    return new Promise((resolve, reject) => cognitoUser.getSession((err, session) => {
      if (current !== epoch.current) {
        memoryStorage.clear()
        reject(new Error('Session ended.'))
      } else if (err || !session?.isValid()) {
        cognitoUser.signOut()
        memoryStorage.clear()
        setUser(null)
        reject(new Error('Session expired. Please sign in again.'))
      } else resolve(session.getIdToken().getJwtToken())
    }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
