import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, setAuthToken } from '../services/api'
import { clearAdminSession } from '../services/adminSession'

export type UserRole = 'writer' | 'reader'
export type Persona = UserRole | 'admin'

interface AuthUser {
  id: string
  name: string
  email?: string
  username?: string
  emailVerified?: boolean
  role: UserRole
  token: string
  refreshToken?: string
  onboardingDone?: boolean | null
  isAdmin?: boolean
}

interface UserContextValue {
  user: AuthUser | null
  persona: Persona
  personaReady: boolean
  setUser: (user: AuthUser | null) => void
  patchUser: (patch: Partial<AuthUser>) => void
  setPersona: (role: Persona) => void
  markPersonaReady: () => void
  logout: () => void
}

const UserContext = createContext<UserContextValue | null>(null)
const STORAGE_KEY = 'potinho-auth'

export function UserProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
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
  const [persona, setPersonaState] = useState<Persona>('writer')
  const [personaReady, setPersonaReady] = useState(false)
  const userIdRef = useRef<string | null>(user?.id ?? null)

  const setUser = (u: AuthUser | null) => {
    const nextId = u?.id ?? null
    if (userIdRef.current !== nextId) {
      queryClient.clear()
      userIdRef.current = nextId
    }
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

  const setPersona = (role: Persona) => {
    setPersonaState(role)
    if (user?.id) {
      try {
        localStorage.setItem(`potinho-persona-${user.id}`, role)
      } catch {
        void 0
      }
    }
  }

  const patchUser = (patch: Partial<AuthUser>) => {
    setUserState((current) => {
      if (!current) return current
      const updated = { ...current, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const markPersonaReady = () => setPersonaReady(true)

  const logout = () => {
    clearAdminSession(true)
    if (user?.refreshToken) api.logout(user.refreshToken)
    setUser(null)
  }

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
            email: profile.email,
            username: profile.username,
            emailVerified: profile.emailVerified,
            onboardingDone: profile.onboardingDone,
            isAdmin: profile.isAdmin === true,
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
  }, [user?.token])

  return (
    <UserContext.Provider value={{ user, persona, personaReady, setUser, patchUser, setPersona, markPersonaReady, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
