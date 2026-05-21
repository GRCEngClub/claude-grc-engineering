import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js'

const AuthContext = createContext(null)

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_USER_POOL_ID || 'DEMO',
  ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'DEMO',
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
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
    return new Promise((resolve, reject) => {
      setError(null)
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool })
      const authDetails = new AuthenticationDetails({ Username: email, Password: password })

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
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
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) cognitoUser.signOut()
    setUser(null)
  }, [])

  const getToken = useCallback(() => {
    return user?.token || null
  }, [user])

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
