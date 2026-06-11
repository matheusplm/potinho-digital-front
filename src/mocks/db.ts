import type {
  Collection,
  CollectionAccess,
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
  password: string
  role: Role
  coupleCode: string
  inviteEmail: string | null
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
      ? [{ collectionId: meta.id, email: 'leitor@potinho.app', createdAt: '2026-04-21T09:00:00.000Z' }]
      : [],
    ownership: buildOwnership(ownedIds, favoriteIds),
    lastDailyOpenDate: null,
    packOpens: {},
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
  }
}

function createInitialDb(): MockDb {
  const writer: MockUser = {
    id: 'user_writer', name: 'Mathe', email: 'escritor@potinho.app', password: '123456',
    role: 'writer', coupleCode: 'AMOR-2026', inviteEmail: 'leitor@potinho.app',
    token: 'mock-token-user_writer',
  }
  const reader: MockUser = {
    id: 'user_reader', name: 'Bê', email: 'leitor@potinho.app', password: '123456',
    role: 'reader', coupleCode: 'AMOR-2026', inviteEmail: null,
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
