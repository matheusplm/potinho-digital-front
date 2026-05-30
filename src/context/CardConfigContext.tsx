import { createContext, useContext, type ReactNode } from 'react'
import type { RarityConfig, NoteTypeConfig } from '../types/note'
import { useRaritiesQuery, useTypesQuery } from '../hooks/useNotes'

interface CardConfigContextValue {
  rarities: Record<string, RarityConfig>
  types: Record<string, NoteTypeConfig>
}

const CardConfigContext = createContext<CardConfigContextValue>({ rarities: {}, types: {} })

export function CardConfigProvider({ children }: { children: ReactNode }) {
  const { data: raritiesArr } = useRaritiesQuery()
  const { data: typesArr } = useTypesQuery()

  const rarities = Object.fromEntries((raritiesArr ?? []).map((r) => [r.id, r]))
  const types = Object.fromEntries((typesArr ?? []).map((t) => [t.id, t]))

  return (
    <CardConfigContext.Provider value={{ rarities, types }}>
      {children}
    </CardConfigContext.Provider>
  )
}

export function useCardConfig() {
  return useContext(CardConfigContext)
}
