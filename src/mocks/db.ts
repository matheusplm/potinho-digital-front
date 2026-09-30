import type {
  Collection,
  CollectionAccess,
  CollectionAchievement,
  CollectionInvite,
  CollectionPack,
  NoteRecord,
  NoteTypeConfig,
  RarityConfig,
  UserNotification,
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
  invites: CollectionInvite[]
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

interface MockDb {
  users: MockUser[]
  collections: CollectionState[]
  notifications: UserNotification[]
  sequence: number
}

const OBTAINED_HOURS_AGO = [170, 96, 54, 19, 3]

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

function buildOwnership(ownedIds: string[], favoriteIds: string[]): OwnershipState {
  const obtainedAt: Record<string, string> = {}
  ownedIds.forEach((id, index) => {
    obtainedAt[id] = hoursAgo(OBTAINED_HOURS_AGO[index % OBTAINED_HOURS_AGO.length] + Math.floor(index / OBTAINED_HOURS_AGO.length) * 200)
  })
  return { owned: new Set(ownedIds), favorites: new Set(favoriteIds), obtainedAt }
}

function draftNote(id: string, title: string, message: string, rarity: string, typeId: string): NoteRecord {
  return { id, title, message, rarity, typeId, createdAt: hoursAgo(28), status: 'preview', releasedAt: null }
}

function buildCollection(meta: Collection, ownedIds: string[], favoriteIds: string[], extra: Partial<Pick<CollectionState, 'invites' | 'notes' | 'access'>> = {}): CollectionState {
  return {
    meta,
    notes: [...cloneNotes(), ...(extra.notes ?? [])],
    rarities: cloneRarities(),
    types: cloneTypes(),
    packs: [...cloneStarterPacks(meta.id), ...cloneBonusPacks(meta.id)],
    access: extra.access ?? (meta.access === 'owner'
      ? [{ collectionId: meta.id, email: 'leitor@potinho.app', packIds: [], createdAt: '2026-04-21T09:00:00.000Z' }]
      : []),
    invites: extra.invites ?? [],
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
    invites: [],
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
      {
        notes: [
          draftNote('note_draft_1', 'Café da manhã', 'Acordar do seu lado é meu jeito favorito de começar o dia.', 'comum', 'amor'),
          draftNote('note_draft_2', 'Playlist nossa', 'Toda música boa agora tem um pedacinho seu.', 'raro', 'parceria'),
        ],
      },
    ),
    buildCollection(
      {
        id: 'col_trips', ownerId: writer.id, name: 'Viagens', emoji: '✈️',
        description: 'Memórias dos nossos rolês.', theme: 'ocean', access: 'owner',
        createdAt: '2026-04-15T12:00:00.000Z', updatedAt: '2026-04-18T12:00:00.000Z',
      },
      ['note_001', 'note_011'],
      ['note_011'],
      {
        invites: [{
          token: 'invite_trips_amanda', collectionId: 'col_trips', email: 'amanda.souza@gmail.com', status: 'pending',
          createdAt: hoursAgo(72), expiresAt: hoursAgo(-96),
        }],
      },
    ),
  ]

  const legacyAccess = collections[1].access[0]
  if (legacyAccess) delete legacyAccess.packIds

  const author: MockUser = {
    id: 'user_author', name: 'Ju', email: 'autora@potinho.app', password: '123456',
    role: 'writer',
    token: 'mock-token-user_author',
  }
  const tester: MockUser = {
    id: 'user_tester', name: 'Teste', email: 'teste@potinho.app', password: '123456',
    role: 'reader',
    token: 'mock-token-user_tester',
  }

  const testerCollection = buildCollection(
    {
      id: 'col_ju', ownerId: author.id, name: 'Cartinhas da Ju', emoji: '💌',
      description: 'Bilhetes que a Ju escreveu pra você.', theme: 'lavender', access: 'owner',
      createdAt: hoursAgo(24 * 20), updatedAt: hoursAgo(2),
    },
    ['note_001', 'note_002', 'note_006', 'note_011'],
    ['note_006'],
    {
      notes: [
        draftNote('note_ju_draft_1', 'Pôr do sol', 'Aquele pôr do sol só foi bonito porque você tava do lado.', 'raro', 'amor'),
        draftNote('note_ju_draft_2', 'Sorvete de pistache', 'Prometo dividir o próximo, mesmo sendo o meu favorito.', 'comum', 'alegria'),
      ],
      access: [{
        collectionId: 'col_ju', email: tester.email, packIds: ['bonus_carinho', 'bonus_lendario'],
        packOpens: { bonus_carinho: 2, bonus_lendario: 1 }, createdAt: hoursAgo(24 * 18),
      }],
    },
  )

  const invitedCollection = buildCollection(
    {
      id: 'col_ju_viagem', ownerId: author.id, name: 'Diário de Viagem', emoji: '🗺️',
      description: 'Tudo que a gente viveu na estrada.', theme: 'ocean', access: 'owner',
      createdAt: hoursAgo(24 * 3), updatedAt: hoursAgo(24 * 3),
    },
    [],
    [],
    {
      access: [],
      invites: [{
        token: 'convite-teste', collectionId: 'col_ju_viagem', email: tester.email, status: 'pending',
        createdAt: hoursAgo(5), expiresAt: hoursAgo(-24 * 6),
      }],
    },
  )

  const notificationBase = {
    userId: tester.id, collectionId: 'col_ju', collectionName: testerCollection.meta.name,
    collectionEmoji: testerCollection.meta.emoji, inApp: true,
  }
  const notifications: UserNotification[] = [
    {
      ...notificationBase, notificationId: 'notif_teste_mimo', kind: 'bonus_pack',
      message: 'Pra você abrir hoje à noite, com calma 💜', imageUrl: null,
      payload: { packId: 'bonus_carinho', packName: 'Mimo de Carinho', packEmoji: '🤗', opens: 2 },
      createdAt: hoursAgo(1), readAt: null,
    },
    {
      ...notificationBase, notificationId: 'notif_teste_lancamento', kind: 'release',
      message: 'Escrevi esses pensando naquele fim de semana na praia 🌊', imageUrl: null,
      payload: { noteCount: 3 }, createdAt: hoursAgo(6), readAt: null,
    },
    {
      ...notificationBase, notificationId: 'notif_teste_antiga', kind: 'release',
      message: null, imageUrl: null, payload: { noteCount: 2 },
      createdAt: hoursAgo(24 * 4), readAt: hoursAgo(24 * 3),
    },
  ]

  return {
    users: [writer, reader, author, tester],
    collections: [...collections, testerCollection, invitedCollection],
    notifications,
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
