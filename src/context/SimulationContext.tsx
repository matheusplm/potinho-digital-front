import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CollectionDailyReward, CollectionDailyStatus, CollectionPlayView, NoteRecord } from '../types/note'
import { buildSimulatedPlayView } from '../utils/simulationPlay'

export type SimulationPreset = 'new_reader' | 'new_reader_with_bonus'

export interface SimulationSession {
  collectionId: string
  collectionSlug: string
  collectionName: string
  collectionEmoji: string
  preset: SimulationPreset
}

interface SimulationContextValue {
  session: SimulationSession | null
  isActive: boolean
  isSimulatingCollection: (collectionId: string) => boolean
  getPlayView: (notes: NoteRecord[]) => CollectionPlayView
  unreadNoteIds: string[]
  hasUnreadNotes: boolean
  commitRewards: (rewards: CollectionDailyReward[]) => CollectionDailyReward[]
  commitDailyOpen: (rewards: CollectionDailyReward[], cooldownHours?: number | null) => CollectionDailyReward[]
  toggleFavorite: (noteId: string, favorite: boolean) => void
  markNoteViewed: (noteId: string) => void
  resetDailyCooldown: () => void
  startSimulation: (session: SimulationSession) => void
  endSimulation: () => void
}

const SimulationContext = createContext<SimulationContextValue | null>(null)

function defaultDailyStatus(): CollectionDailyStatus {
  const now = new Date()
  const availableAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  return { canOpen: true, availableAt, serverTime: now.toISOString() }
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SimulationSession | null>(null)
  const [ownedIds, setOwnedIds] = useState<string[]>([])
  const [unreadNoteIds, setUnreadNoteIds] = useState<string[]>([])
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [daily, setDaily] = useState<CollectionDailyStatus>(defaultDailyStatus)

  const startSimulation = useCallback((next: SimulationSession) => {
    setSession(next)
    setOwnedIds([])
    setUnreadNoteIds([])
    setFavorites({})
    setDaily(defaultDailyStatus())
  }, [])

  const endSimulation = useCallback(() => {
    setSession(null)
    setOwnedIds([])
    setUnreadNoteIds([])
    setFavorites({})
    setDaily(defaultDailyStatus())
  }, [])

  const isSimulatingCollection = useCallback(
    (collectionId: string) => session?.collectionId === collectionId,
    [session],
  )

  const getPlayView = useCallback((notes: NoteRecord[]): CollectionPlayView => {
    return buildSimulatedPlayView(notes, ownedIds, favorites, daily)
  }, [ownedIds, favorites, daily])

  const commitRewards = useCallback((rewards: CollectionDailyReward[]) => {
    const newIds = rewards.map((reward) => reward.id)
    setOwnedIds((current) => [...new Set([...current, ...newIds])])
    setUnreadNoteIds((current) => [...new Set([...current, ...newIds])])
    return rewards.map((reward) => ({ ...reward, isNew: true }))
  }, [])

  const commitDailyOpen = useCallback((rewards: CollectionDailyReward[], cooldownHours: number | null = 24) => {
    const revealed = commitRewards(rewards)
    const now = new Date()
    const cooldownMs = Math.max(1, cooldownHours ?? 24) * 60 * 60 * 1000
    setDaily({
      canOpen: false,
      availableAt: new Date(now.getTime() + cooldownMs).toISOString(),
      serverTime: now.toISOString(),
    })
    return revealed
  }, [commitRewards])

  const toggleFavorite = useCallback((noteId: string, favorite: boolean) => {
    setFavorites((current) => ({ ...current, [noteId]: favorite }))
  }, [])

  const markNoteViewed = useCallback((noteId: string) => {
    setUnreadNoteIds((current) => current.filter((id) => id !== noteId))
  }, [])

  const resetDailyCooldown = useCallback(() => {
    setDaily(defaultDailyStatus())
  }, [])

  const value = useMemo<SimulationContextValue>(() => ({
    session,
    isActive: !!session,
    isSimulatingCollection,
    getPlayView,
    unreadNoteIds,
    hasUnreadNotes: unreadNoteIds.length > 0,
    commitRewards,
    commitDailyOpen,
    toggleFavorite,
    markNoteViewed,
    resetDailyCooldown,
    startSimulation,
    endSimulation,
  }), [session, isSimulatingCollection, getPlayView, unreadNoteIds, commitRewards, commitDailyOpen, toggleFavorite, markNoteViewed, resetDailyCooldown, startSimulation, endSimulation])

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
