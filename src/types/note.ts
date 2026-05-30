export type Rarity = string
export type NoteType = string

export interface Note {
  id: string
  title: string
  message: string
  rarity: string
  typeId: string
  owned: boolean
  favorite: boolean
  obtainedAt: string | null
}

export interface RarityConfig {
  id: string
  label: string
  emoji: string
  odds: number
  order: number
  cardBg: string
  textColor: string
  captionColor: string
  borderColor: string
  shadow: string
  glowColor: string
  chipBg: string
  chipColor: string
  createdAt?: string
  updatedAt?: string
}

export interface NoteTypeConfig {
  id: string
  label: string
  emoji: string
  order: number
  accentColor: string
  tagBg: string
  tagColor: string
  createdAt?: string
  updatedAt?: string
}

export interface CollectionResponse {
  total: number
  owned: number
  items: Note[]
}

export interface PackReward {
  id: string
  rarity: string
  typeId: string
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
  byRarity: Record<string, { owned: number; total: number }>
}

export interface PackOddsItem {
  rarity: string
  label: string
  percent: number
}

export type PackOddsResponse = PackOddsItem[]
