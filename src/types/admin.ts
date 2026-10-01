export interface AdminUserRow {
  id: string
  name: string
  username: string | null
  emailMasked: string
  createdAt: string | null
  emailVerified: boolean | null
  hasPassword: boolean
  onboardingDone: boolean
  lastLoginAt: string | null
  lastActiveAt: string | null
  lastPackAt: string | null
  push: boolean
  collectionsOwned: number
  collectionsReading: number
  collected: number
  favorites: number
  achievements: number
}

export interface AdminCollectionRow {
  id: string
  name: string
  emoji: string
  theme: string | null
  ownerId: string | null
  ownerName: string | null
  createdAt: string | null
  deleted: boolean
  readers: number
  pendingInvites: number
  notes: number
  releasedNotes: number
  collected: number
  favorites: number
  lastActivityAt: string | null
}

export interface AdminDailyPoint {
  date: string
  signups: number
  collected: number
  openers: number
}

export interface AdminTotals {
  users: number
  newUsers7d: number
  verifiedUsers: number
  pushUsers: number
  activeToday: number
  active7d: number
  active30d: number
  owners: number
  readers: number
  collections: number
  deletedCollections: number
  notes: number
  releasedNotes: number
  collected: number
  collected7d: number
  favorites: number
  achievementsUnlocked: number
  invitesPending: number
  invitesAccepted: number
}

export interface AdminRhythm {
  hours: number[]
  weekdays: number[]
}

export interface AdminOverview {
  generatedAt: string
  totals: AdminTotals
  daily: AdminDailyPoint[]
  rhythm?: AdminRhythm
  users: AdminUserRow[]
  collections: AdminCollectionRow[]
}
