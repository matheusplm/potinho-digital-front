export type Rarity = string
export type NoteType = string

export type NoteImageLayout = 'banner' | 'thumb-left' | 'thumb-right' | 'circle-left' | 'circle-right' | 'split' | 'stripe-left' | 'hero-overlay' | 'bg-blur'

export type NoteStatus = 'preview' | 'released'

export interface NoteRecord {
  id: string
  title: string
  message: string
  rarity: string
  typeId: string
  typeIds?: string[]
  imageUrl?: string | null
  imageLayout?: NoteImageLayout | null
  createdAt: string
  timesCollected?: number
  disabledAt?: string | null
  status?: NoteStatus
  releasedAt?: string | null
}

export interface NoteFormData {
  title: string
  message: string
  rarity: string
  typeId: string
  typeIds?: string[]
  imageUrl: string | null
  imageLayout: NoteImageLayout | null
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
  title: string | null
  message: string | null
  rarity: string
  typeId: string
  typeIds?: string[]
  imageUrl?: string | null
  imageLayout?: NoteImageLayout | null
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
  revealEffect?: string
  revealEmoji?: string
  revealMedia?: string
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
export type CollectionPackScheduleMode = 'cooldown' | 'fixed_time'

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
  allowedTypeIds: string[]
  allowedRarityIds: string[]
  guaranteedRarityId: string | null
  gradient: string
  accent: string
  scheduleMode: CollectionPackScheduleMode
  scheduleTime: string | null
  scheduleTimezone: string
  cumulative: boolean
  maxAccumulated: number
  createdAt?: string
  updatedAt?: string
  readerStatus?: CollectionPackReaderStatus
}

export type CollectionPackFormData = Omit<CollectionPack, 'id' | 'collectionId' | 'createdAt' | 'updatedAt'> & {
  id?: string
}

export interface PendingOpensWarning {
  readersAffected: number
  totalOpens: number
}

export interface UpdateCollectionPackResponse extends CollectionPack {
  pendingOpensWarning?: PendingOpensWarning
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
  availableCount: number
  remainingOpensToday?: number
  nextAvailableAt: string
  serverTime: string
}

export interface CollectionPackReaderStatus {
  canOpen: boolean
  availableAt?: string
  nextAvailableAt?: string
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
  deletedAt?: string
  pendingBonusOpens?: number
  dailyCanOpen?: boolean
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
  packIds: string[]
  packOpens?: Record<string, number>
  createdAt: string
}

export interface CollectionDailyStatus {
  canOpen: boolean
  availableAt: string
  availableCount?: number
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
  packOpens?: Record<string, number>
}

export interface CollectionDailyReward {
  id: string
  title: string
  message: string
  rarity: string
  typeId: string
  typeIds?: string[]
  imageUrl?: string | null
  imageLayout?: NoteImageLayout | null
  isNew: boolean
}

export type AchievementConditionType =
  | 'collect_count'
  | 'complete'
  | 'rarity_count'
  | 'type_complete'
  | 'favorite_count'
  | 'rainbow'

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

export type CollectionAchievementFormData = Omit<CollectionAchievement, 'id' | 'collectionId' | 'createdAt' | 'updatedAt'> & {
  id?: string
}

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

export type NotificationKind = 'release' | 'bonus_pack'

export interface NotificationChannels {
  inApp: boolean
  push: boolean
  email: boolean
}

export interface NotifyConfig {
  channels: NotificationChannels
  message?: string
  imageUrl?: string | null
}

export interface ReleaseRecord {
  id: string
  collectionId: string
  noteIds: string[]
  noteCount: number
  releasedAt: string
}

export interface ReleaseNotesResponse {
  release: ReleaseRecord
  notified: boolean
}

export interface UserNotification {
  userId: string
  collectionId: string
  collectionName: string
  collectionEmoji: string
  notificationId: string
  kind: NotificationKind
  message: string | null
  imageUrl: string | null
  inApp: boolean
  payload: Record<string, unknown>
  createdAt: string
  readAt: string | null
}

export interface CollectionNotification {
  id: string
  collectionId: string
  kind: NotificationKind
  message: string | null
  imageUrl: string | null
  channels: NotificationChannels
  payload: Record<string, unknown>
  readersNotified: number
  createdAt: string
}

export type CollectionInviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export interface CollectionInvite {
  token: string
  collectionId: string
  email: string
  status: CollectionInviteStatus
  createdAt: string
  expiresAt: string
}

export interface InviteDetails {
  token: string
  collectionId: string
  collectionName: string
  inviterName: string
  email: string
  status: CollectionInviteStatus
  expiresAt: string
  isForMe: boolean | null
}
