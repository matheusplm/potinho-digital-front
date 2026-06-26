import type {
  Collection,
  CollectionAccess,
  CollectionAchievement,
  CollectionPack,
  NoteRecord,
  NoteTypeConfig,
  RarityConfig,
} from '../types/note'
import {
  cloneBonusPacks,
  cloneNotes,
  cloneRarities,
  cloneStarterPacks,
  cloneStarterRarities,
  cloneStarterTypes,
  cloneTypes,
  defaultFavoriteIds,
  defaultOwnedIds,
} from './data'

export type Role = 'writer' | 'reader'

export interface MockUser {
  id: string
  name: string
  email: string
  pendingEmail?: string
  username?: string
  password: string
  role: Role
  token: string
}

export interface OwnershipState {
  owned: Set<string>
  favorites: Set<string>
  obtainedAt: Record<string, string>
}

export interface CollectionState {
  meta: Collection
  notes: NoteRecord[]
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  packs: CollectionPack[]
  access: CollectionAccess[]
  ownership: OwnershipState
  lastDailyOpenDate: string | null
  packOpens: Record<string, { lastOpenAt: string; totalOpens: number }>
  achievements: CollectionAchievement[]
  achievementState: { unlocked: Record<string, string>; baseline: boolean }
}

function cloneAchievements(collectionId: string): CollectionAchievement[] {
  const now = '2026-04-20T10:00:00.000Z'
  const base = { collectionId, rarityId: null, typeId: null, createdAt: now, updatedAt: now }
  return [
    { ...base, id: 'primeiro_bilhete', label: 'Primeiro bilhete', emoji: '🌱', description: 'Coletou o primeiro bilhetinho.', conditionType: 'collect_count', count: 1, order: 1 },
    { ...base, id: 'colecionador', label: 'Colecionador(a)', emoji: '🎴', description: 'Coletou 5 bilhetes.', conditionType: 'collect_count', count: 5, order: 2 },
    { ...base, id: 'colecao_completa', label: 'Coleção completa', emoji: '👑', description: 'Coletou todos os bilhetes.', conditionType: 'complete', count: null, order: 3 },
    { ...base, id: 'coracao_cheio', label: 'Coração cheio', emoji: '❤️', description: 'Favoritou 3 bilhetes.', conditionType: 'favorite_count', count: 3, order: 4 },
  ]
}

export interface MockDb {
  users: MockUser[]
  collections: CollectionState[]
  sequence: number
}

function buildOwnership(ownedIds: string[], favoriteIds: string[]): OwnershipState {
  const obtainedAt: Record<string, string> = {}
  for (const id of ownedIds) obtainedAt[id] = '2026-04-20T10:00:00.000Z'
  return { owned: new Set(ownedIds), favorites: new Set(favoriteIds), obtainedAt }
}

function buildCollection(meta: Collection, ownedIds: string[], favoriteIds: string[]): CollectionState {
  return {
    meta,
    notes: cloneNotes(),
    rarities: cloneRarities(),
    types: cloneTypes(),
    packs: [...cloneStarterPacks(meta.id), ...cloneBonusPacks(meta.id)],
    access: meta.access === 'owner'
      ? [{ collectionId: meta.id, email: 'leitor@potinho.app', packIds: [], createdAt: '2026-04-21T09:00:00.000Z' }]
      : [],
    ownership: buildOwnership(ownedIds, favoriteIds),
    lastDailyOpenDate: null,
    packOpens: {},
    achievements: cloneAchievements(meta.id),
    achievementState: { unlocked: {}, baseline: false },
  }
}

function buildEmptyCollection(meta: Collection): CollectionState {
  return {
    meta,
    notes: [],
    rarities: cloneStarterRarities(),
    types: cloneStarterTypes(),
    packs: cloneStarterPacks(meta.id),
    access: [],
    ownership: buildOwnership([], []),
    lastDailyOpenDate: null,
    packOpens: {},
    achievements: [],
    achievementState: { unlocked: {}, baseline: false },
  }
}

function createInitialDb(): MockDb {
  const writer: MockUser = {
    id: 'user_writer', name: 'Mathe', email: 'escritor@potinho.app', password: '123456',
    role: 'writer',
    token: 'mock-token-user_writer',
  }
  const reader: MockUser = {
    id: 'user_reader', name: 'Bê', email: 'leitor@potinho.app', password: '123456',
    role: 'reader',
    token: 'mock-token-user_reader',
  }

  const collections: CollectionState[] = [
    buildCollection(
      {
        id: 'col_main', ownerId: writer.id, name: 'Nosso Potinho', emoji: '🫙',
        description: 'Bilhetes do nosso dia a dia.', theme: 'sunset', access: 'owner',
        createdAt: '2026-04-10T12:00:00.000Z', updatedAt: '2026-04-20T12:00:00.000Z',
      },
      defaultOwnedIds,
      defaultFavoriteIds,
    ),
    buildCollection(
      {
        id: 'col_trips', ownerId: writer.id, name: 'Viagens', emoji: '✈️',
        description: 'Memórias dos nossos rolês.', theme: 'ocean', access: 'owner',
        createdAt: '2026-04-15T12:00:00.000Z', updatedAt: '2026-04-18T12:00:00.000Z',
      },
      ['note_001', 'note_011'],
      [],
    ),
  ]

  return {
    users: [writer, reader],
    collections,
    sequence: 100,
  }
}

export const db: MockDb = createInitialDb()

export function nextId(prefix: string): string {
  db.sequence += 1
  return `${prefix}_${db.sequence}`
}

export function findCollection(id: string): CollectionState | undefined {
  return db.collections.find((collection) => collection.meta.id === id)
}

export function createEmptyCollection(meta: Collection): CollectionState {
  return buildEmptyCollection(meta)
}

export function resolveUser(token: string | null): MockUser | undefined {
  if (!token) return undefined
  return db.users.find((user) => user.token === token)
}
