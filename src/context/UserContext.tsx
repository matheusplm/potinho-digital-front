import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { setAuthToken } from '../services/api'

export type UserRole = 'writer' | 'reader'

export interface AuthUser {
  id: string
  name: string
  role: UserRole
  token: string
  coupleCode?: string
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
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    setAuthToken(user?.token ?? '')
  }, [user])

  const setUser = (u: AuthUser | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
    setUserState(u)
  }

  const logout = () => setUser(null)

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
