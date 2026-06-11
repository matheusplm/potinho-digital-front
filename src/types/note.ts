export type Rarity = string
export type NoteType = string

export interface NoteRecord {
  id: string
  title: string
  message: string
  rarity: string
  typeId: string
  createdAt: string
}

export interface NoteFormData {
  title: string
  message: string
  rarity: string
  typeId: string
}

export interface PartnerReader {
  id: string
  name: string
  email: string
  createdAt: string
  collection: {
    total: number
    owned: number
    completion: number
  }
}

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

export type CollectionPackCategory = 'daily' | 'bonus' | 'guaranteed' | 'thematic'
export type CollectionPackDistribution = 'all_with_access' | 'manual_bonus' | 'selected_readers'
export type CollectionPackStatus = 'active' | 'draft' | 'disabled'

export interface CollectionPack {
  id: string
  collectionId: string
  name: string
  emoji: string
  description: string
  category: CollectionPackCategory
  status: CollectionPackStatus
  distribution: CollectionPackDistribution
  cardsPerOpen: number
  cooldownHours: number | null
  maxOpensPerUser: number | null
  allowedTypeIds: string[]
  allowedRarityIds: string[]
  guaranteedRarityId: string | null
  gradient: string
  accent: string
  createdAt?: string
  updatedAt?: string
}

export type CollectionPackFormData = Omit<CollectionPack, 'id' | 'collectionId' | 'createdAt' | 'updatedAt'> & {
  id?: string
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

export interface Collection {
  id: string
  ownerId: string
  name: string
  emoji: string
  description: string
  theme: string
  access: 'owner' | 'reader'
  createdAt: string
  updatedAt: string
}

export interface CollectionFormData {
  name: string
  emoji: string
  description: string
  theme: string
}

export interface CollectionAccess {
  collectionId: string
  email: string
  createdAt: string
}

export interface CollectionDailyStatus {
  canOpen: boolean
  availableAt: string
  serverTime: string
}

export interface CollectionNoteView extends Note {
  message: string
}

export interface CollectionPlayView {
  total: number
  owned: number
  items: CollectionNoteView[]
  daily: CollectionDailyStatus
}

export interface CollectionDailyReward {
  id: string
  title: string
  message: string
  rarity: string
  typeId: string
  isNew: boolean
}

export type AchievementConditionType =
  | 'collect_count'
  | 'complete'
  | 'rarity_count'
  | 'type_complete'
  | 'favorite_count'
  | 'rainbow'

/** Template de conquista (configurado pelo dono da coleção). */
export interface CollectionAchievement {
  id: string
  collectionId: string
  label: string
  emoji: string
  description: string
  conditionType: AchievementConditionType
  count: number | null
  rarityId: string | null
  typeId: string | null
  order: number
  createdAt?: string
  updatedAt?: string
}

export type CollectionAchievementFormData = Omit<CollectionAchievement, 'collectionId' | 'createdAt' | 'updatedAt'> & {
  id?: string
}

/** Conquista avaliada para o leitor (server-side). */
export interface ReaderAchievement {
  id: string
  emoji: string
  label: string
  description: string
  conditionType: AchievementConditionType
  current: number
  target: number
  unlocked: boolean
  unlockedAt: string | null
}

export interface ReaderAchievementsResponse {
  achievements: ReaderAchievement[]
  justUnlocked: string[]
}
