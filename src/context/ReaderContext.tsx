import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

const ACTIVE_KEY = 'potinho-active-collection'

interface ReaderContextValue {
  /** Coleção ativa do leitor (multi-tenant) — cada coleção é um mundo isolado. */
  activeCollectionId: string | null
  setActiveCollectionId: (id: string | null) => void
  /** Sinalização client-only de bilhetes novos (não-lidos), isolada por coleção. */
  unreadFor: (collectionId: string) => string[]
  addUnread: (collectionId: string, ids: string[]) => void
  markViewed: (collectionId: string, id: string) => void
  hasUnread: boolean
}

const ReaderContext = createContext<ReaderContextValue | null>(null)

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [activeCollectionId, setActiveState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_KEY) || null,
  )
  const [unreadByCollection, setUnreadByCollection] = useState<Record<string, string[]>>({})

  const setActiveCollectionId = useCallback((id: string | null) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
    setActiveState(id)
  }, [])

  const unreadFor = useCallback(
    (collectionId: string) => unreadByCollection[collectionId] ?? [],
    [unreadByCollection],
  )

  const addUnread = useCallback((collectionId: string, ids: string[]) => {
    if (ids.length === 0) return
    setUnreadByCollection((current) => ({
      ...current,
      [collectionId]: [...new Set([...(current[collectionId] ?? []), ...ids])],
    }))
  }, [])

  const markViewed = useCallback((collectionId: string, id: string) => {
    setUnreadByCollection((current) => {
      const list = current[collectionId]
      if (!list || !list.includes(id)) return current
      return { ...current, [collectionId]: list.filter((item) => item !== id) }
    })
  }, [])

  const hasUnread = useMemo(
    () => Object.values(unreadByCollection).some((list) => list.length > 0),
    [unreadByCollection],
  )

  const value = useMemo<ReaderContextValue>(() => ({
    activeCollectionId,
    setActiveCollectionId,
    unreadFor,
    addUnread,
    markViewed,
    hasUnread,
  }), [activeCollectionId, setActiveCollectionId, unreadFor, addUnread, markViewed, hasUnread])

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
}

export function useReader() {
  const ctx = useContext(ReaderContext)
  if (!ctx) throw new Error('useReader must be used within ReaderProvider')
  return ctx
}
