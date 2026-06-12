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
  persona: UserRole
  personaReady: boolean
  setUser: (user: AuthUser | null) => void
  setPersona: (role: UserRole) => void
  markPersonaReady: () => void
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
  const [persona, setPersonaState] = useState<UserRole>('writer')
  const [personaReady, setPersonaReady] = useState(false)

  const setUser = (u: AuthUser | null) => {
    setAuthToken(u?.token ?? '')
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
    setUserState(u)
    if (!u) {
      setPersonaState('writer')
      setPersonaReady(false)
    } else {
      setPersonaReady(false)
    }
  }

  const setPersona = (role: UserRole) => {
    setPersonaState(role)
    if (user?.id) {
      try {
        localStorage.setItem(`potinho-persona-${user.id}`, role)
      } catch {
        void 0
      }
    }
  }

  const markPersonaReady = () => setPersonaReady(true)

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
  }, [])

  return (
    <UserContext.Provider value={{ user, persona, personaReady, setUser, setPersona, markPersonaReady, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
