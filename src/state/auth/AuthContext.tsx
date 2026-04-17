import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../../lib/api'

type AuthUser = {
  email: string
  fullName?: string
}

type AuthState = {
  token: string | null
  user: AuthUser | null
}

type AuthContextValue = AuthState & {
  isAuthenticated: boolean
  login: (params: { email: string; password: string }) => Promise<void>
  signup: (params: { fullName: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'qm_auth_v1'

export const AuthContext = createContext<AuthContextValue | null>(null)

function readStored(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    const parsed = JSON.parse(raw) as AuthState
    return {
      token: typeof parsed.token === 'string' ? parsed.token : null,
      user:
        parsed.user && typeof parsed.user.email === 'string'
          ? parsed.user
          : null,
    }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readStored())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const logout = useCallback(() => {
    setState({ token: null, user: null })
  }, [])

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    // Backend expects { username, password } where username is the unique login id.
    const token = await authApi.login({ username: email, password })
    setState({ token, user: { email } })
  }, [])

  const signup = useCallback(
    async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
      // Backend supports only username/password today; we keep fullName client-side for UX.
      await authApi.signup({ username: email, password })
      // Do not auto-login after signup; user should explicitly login.
      // Keep fullName in memory only for potential future UX usage.
      void fullName
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      login,
      signup,
      logout,
    }),
    [state, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

