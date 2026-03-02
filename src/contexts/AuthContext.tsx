import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AUTH_TOKEN_KEY = 'gamelog-steam-token'

function decodeSteamId(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload.steamId ?? null
  } catch {
    return null
  }
}

export type AuthContextValue = {
  steamId: string | null
  token: string | null
  isLoggedIn: boolean
  login: () => void
  logout: () => void
  setTokenFromCallback: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!stored) return null
    if (decodeSteamId(stored) === null) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      return null
    }
    return stored
  })

  const steamId = useMemo(
    () => (token ? decodeSteamId(token) : null),
    [token]
  )

  const login = useCallback(() => {
    window.location.href = '/api/auth/steam'
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
  }, [])

  const setTokenFromCallback = useCallback((newToken: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken)
    setToken(newToken)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      steamId,
      token,
      isLoggedIn: !!steamId && !!token,
      login,
      logout,
      setTokenFromCallback,
    }),
    [steamId, token, login, logout, setTokenFromCallback]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

