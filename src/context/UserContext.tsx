import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, setAuthToken } from '../services/api'

export type UserRole = 'writer' | 'reader'

export interface AuthUser {
  id: string
  name: string
  role: UserRole
  token: string
}

interface UserContextValue {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const UserContext = createContext<UserContextValue | null>(null)
const STORAGE_KEY = 'potinho-auth'

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as AuthUser) : null
      if (parsed?.token) setAuthToken(parsed.token)
      return parsed
    } catch {
      return null
    }
  })

  const setUser = (u: AuthUser | null) => {
    setAuthToken(u?.token ?? '')
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
    setUserState(u)
  }

  const logout = () => setUser(null)

  useEffect(() => {
    const token = user?.token
    if (!token) return
    let active = true
    api
      .me()
      .then((profile) => {
        if (!active) return
        setUserState((current) => {
          if (!current) return current
          const merged: AuthUser = {
            ...current,
            name: profile.name,
            role: profile.role as UserRole,
            token: current.token,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          return merged
        })
      })
      .catch(() => {})
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
