import { delay, http, HttpResponse } from 'msw'
import type { AdminCollectionRow, AdminDailyPoint, AdminOverview, AdminUserRow } from '../types/admin'
import { db, resolveUser } from './db'

export const MOCK_ADMIN_EMAIL = 'escritor@potinho.app'

const NAMES = ['Ana Clara', 'Bruno', 'Camila', 'Diego', 'Duda', 'Felipe', 'Gabi', 'Heitor', 'Isa', 'João Pedro', 'Ju', 'Larissa', 'Léo', 'Lívia', 'Malu', 'Marina', 'Nina', 'Otávio', 'Paula', 'Rafa', 'Sofia', 'Thiago', 'Vini', 'Yasmin']
const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com.br']
const COLLECTIONS = [
  ['Potinho da Amizade', '🌻', 'sunset'], ['Pra minha mãe', '🌷', 'romance'], ['Bilhetes da Ju', '💌', 'lavender'],
  ['Nosso cantinho', '🏡', 'mint'], ['Aniversário do Léo', '🎂', 'peach'], ['Saudade de casa', '🌙', 'midnight'],
  ['Motivação diária', '🔥', 'sunset'], ['Pra Malu', '🦋', 'velvet'], ['Diário a dois', '📖', 'ocean'],
]
const DAY_MS = 86_400_000
const SESSION_MS = 30 * 60_000
const sessions = new Map<string, number>()

function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@')
  const dot = domain.lastIndexOf('.')
  const host = dot > 0 ? domain.slice(0, dot) : domain
  const suffix = dot > 0 ? domain.slice(dot) : ''
  return `${local.slice(0, local.length > 3 ? 2 : 1)}•••@${host.slice(0, 1)}•••${suffix}`
}

function dayKey(time: number): string {
  return new Date(time).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function buildOverview(): AdminOverview {
  const rand = random(42)
  const now = Date.now()
  const ago = (days: number) => new Date(now - days * DAY_MS).toISOString()
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]

  const realUsers: AdminUserRow[] = db.users.map((user) => {
    const owned = db.collections.filter((collection) => collection.meta.ownerId === user.id && !collection.meta.deletedAt)
    const reading = db.collections.filter((collection) => collection.access.some((access) => access.email === user.email))
    const collected = reading.reduce((sum, collection) => sum + collection.ownership.owned.size, 0)
    return {
      id: user.id, name: user.name, username: user.username ?? null, emailMasked: maskEmail(user.email),
      createdAt: '2026-04-10T12:00:00.000Z', emailVerified: true, hasPassword: true, onboardingDone: true,
      lastLoginAt: ago(0.02), lastActiveAt: ago(0.01), lastPackAt: reading.length ? ago(0.3) : null, push: true,
      collectionsOwned: owned.length, collectionsReading: reading.length, collected,
      favorites: reading.reduce((sum, collection) => sum + collection.ownership.favorites.size, 0), achievements: reading.length ? 2 : 0,
    }
  })

  const fakeUsers: AdminUserRow[] = NAMES.map((name, i) => {
    const createdDays = Math.floor(rand() * 120)
    const idleDays = Math.min(createdDays, rand() < 0.35 ? rand() * 1.5 : rand() < 0.6 ? rand() * 8 : rand() * 60)
    const reader = rand() < 0.7
    const collected = reader ? Math.floor(rand() * 60) : 0
    const email = `${name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}${Math.floor(rand() * 99)}@${pick(DOMAINS)}`
    return {
      id: `fake_${i}`, name, username: rand() < 0.5 ? name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') : null,
      emailMasked: maskEmail(email), createdAt: ago(createdDays),
      emailVerified: rand() < 0.9, hasPassword: rand() < 0.6, onboardingDone: rand() < 0.85,
      lastLoginAt: rand() < 0.8 ? ago(idleDays + rand() * 3) : null, lastActiveAt: ago(idleDays), lastPackAt: collected ? ago(idleDays + rand() * 0.5) : null,
      push: rand() < 0.45, collectionsOwned: i < COLLECTIONS.length ? 1 : 0, collectionsReading: reader ? 1 + Math.floor(rand() * 1.4) : 0,
      collected, favorites: Math.floor(collected * rand() * 0.3), achievements: Math.floor(collected / 12),
    }
  })

  const users = [...realUsers, ...fakeUsers].sort((a, b) => (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? ''))

  const realCollections: AdminCollectionRow[] = db.collections.map((collection) => {
    const owner = db.users.find((user) => user.id === collection.meta.ownerId)
    return {
      id: collection.meta.id, name: collection.meta.name, emoji: collection.meta.emoji, theme: collection.meta.theme ?? null,
      ownerId: owner?.id ?? null, ownerName: owner?.name ?? null, createdAt: collection.meta.createdAt, deleted: !!collection.meta.deletedAt,
      readers: collection.access.length, pendingInvites: 0, notes: collection.notes.length,
      releasedNotes: collection.notes.filter((note) => note.status !== 'preview').length,
      collected: collection.ownership.owned.size, favorites: collection.ownership.favorites.size,
      lastActivityAt: collection.ownership.owned.size ? ago(0.3) : null,
    }
  })

  const fakeCollections: AdminCollectionRow[] = COLLECTIONS.map(([name, emoji, theme], i) => {
    const owner = fakeUsers[i]
    const notes = 8 + Math.floor(rand() * 80)
    const deleted = i === COLLECTIONS.length - 1
    return {
      id: `fake_col_${i}`, name, emoji, theme, ownerId: owner.id, ownerName: owner.name, createdAt: owner.createdAt, deleted,
      readers: deleted ? 0 : 1 + Math.floor(rand() * 3), pendingInvites: rand() < 0.3 ? 1 : 0,
      notes, releasedNotes: Math.floor(notes * (0.5 + rand() * 0.5)), collected: Math.floor(notes * rand() * 0.8),
      favorites: Math.floor(rand() * 12), lastActivityAt: deleted ? null : ago(rand() * 20),
    }
  })

  const collections = [...realCollections, ...fakeCollections]
    .sort((a, b) => Number(a.deleted) - Number(b.deleted) || (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''))

  const daily: AdminDailyPoint[] = Array.from({ length: 30 }, (_, i) => {
    const time = now - (29 - i) * DAY_MS
    const trend = 0.6 + (i / 29) * 0.8
    const openers = Math.round((3 + rand() * 6) * trend)
    return {
      date: dayKey(time),
      signups: rand() < 0.45 ? Math.ceil(rand() * 3 * trend) : 0,
      openers,
      collected: Math.round(openers * (1.2 + rand() * 1.6)),
    }
  })

  const since = (days: number) => (iso: string | null) => !!iso && Date.parse(iso) >= now - days * DAY_MS
  const live = collections.filter((collection) => !collection.deleted)
  return {
    generatedAt: new Date(now).toISOString(),
    totals: {
      users: users.length,
      newUsers7d: users.filter((user) => since(7)(user.createdAt)).length,
      verifiedUsers: users.filter((user) => user.emailVerified !== false).length,
      pushUsers: users.filter((user) => user.push).length,
      activeToday: users.filter((user) => user.lastActiveAt && dayKey(Date.parse(user.lastActiveAt)) === dayKey(now)).length,
      active7d: users.filter((user) => since(7)(user.lastActiveAt)).length,
      active30d: users.filter((user) => since(30)(user.lastActiveAt)).length,
      owners: users.filter((user) => user.collectionsOwned > 0).length,
      readers: users.filter((user) => user.collectionsReading > 0).length,
      collections: live.length,
      deletedCollections: collections.length - live.length,
      notes: live.reduce((sum, collection) => sum + collection.notes, 0),
      releasedNotes: live.reduce((sum, collection) => sum + collection.releasedNotes, 0),
      collected: users.reduce((sum, user) => sum + user.collected, 0),
      collected7d: daily.slice(-7).reduce((sum, point) => sum + point.collected, 0),
      favorites: users.reduce((sum, user) => sum + user.favorites, 0),
      achievementsUnlocked: users.reduce((sum, user) => sum + user.achievements, 0),
      invitesPending: collections.reduce((sum, collection) => sum + collection.pendingInvites, 0),
      invitesAccepted: 11,
    },
    daily,
    users,
    collections,
  }
}

function authUser(request: Request) {
  const header = request.headers.get('Authorization')
  return resolveUser(header?.startsWith('Bearer ') ? header.slice(7) : null)
}

export const adminHandlers = [
  http.post('/api/admin/session', async ({ request }) => {
    await delay(400)
    const user = authUser(request)
    if (!user) return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    if (user.email !== MOCK_ADMIN_EMAIL) return HttpResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    const body = (await request.json()) as { password?: string; googleIdToken?: string }
    if (body.password !== user.password) return HttpResponse.json({ error: 'ADMIN_REAUTH_FAILED' }, { status: 403 })
    const adminToken = `mock-admin-${crypto.randomUUID()}`
    const expiresAt = Date.now() + SESSION_MS
    sessions.set(adminToken, expiresAt)
    return HttpResponse.json({ adminToken, expiresAt: new Date(expiresAt).toISOString() }, { status: 201 })
  }),

  http.delete('/api/admin/session', async ({ request }) => {
    sessions.delete(request.headers.get('X-Admin-Token') ?? '')
    return HttpResponse.json({ ok: true })
  }),

  http.get('/api/admin/overview', async ({ request }) => {
    await delay(450)
    const user = authUser(request)
    if (!user) return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    if (user.email !== MOCK_ADMIN_EMAIL) return HttpResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    const expiresAt = sessions.get(request.headers.get('X-Admin-Token') ?? '')
    if (!expiresAt || expiresAt < Date.now()) return HttpResponse.json({ error: 'ADMIN_REAUTH_REQUIRED' }, { status: 403 })
    return HttpResponse.json(buildOverview())
  }),
]
