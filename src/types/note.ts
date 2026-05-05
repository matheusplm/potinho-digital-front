export type Rarity = 'comum' | 'incomum' | 'raro' | 'lendario' | 'mitico'

export interface Note {
  id: string
  title: string
  message: string
  rarity: Rarity
  owned: boolean
  favorite: boolean
  obtainedAt: string | null
}

export interface CollectionResponse {
  total: number
  owned: number
  items: Note[]
}

export interface PackReward {
  id: string
  rarity: Rarity
  isNew: boolean
  title: string
}

export interface OpenPackResponse {
  rewards: PackReward[]
  remainingOpensToday: number
}

export interface DailyNoteStatusResponse {
  canOpen: boolean
  availableAt: string
  serverTime: string
}

export interface DailyNoteOpenResponse {
  reward: PackReward
  status: DailyNoteStatusResponse
}

export interface PackStatusResponse {
  canOpen: boolean
  remainingOpensToday: number
  nextAvailableAt: string
  serverTime: string
}

export interface StatsResponse {
  completion: number
  byRarity: Record<Rarity, { owned: number; total: number }>
}
