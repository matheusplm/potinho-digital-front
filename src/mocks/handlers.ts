import { delay, http, HttpResponse } from 'msw'
import type {
  Collection,
  CollectionAchievement,
  CollectionAchievementFormData,
  CollectionFormData,
  CollectionPackFormData,
  NoteFormData,
  NoteTypeConfig,
  RarityConfig,
} from '../types/note'
import { toConfigId } from '../utils/slug'
import { buildNoteView, drawReward } from './data'
import {
  createEmptyCollection,
  db,
  findCollection,
  nextId,
  resolveUser,
  type CollectionState,
  type MockUser,
} from './db'

function evaluateReaderAchievements(collection: CollectionState) {
  const { ownership, notes, achievements, achievementState } = collection
  const ownedCount = notes.filter((n) => ownership.owned.has(n.id)).length
  const favorites = notes.filter((n) => ownership.owned.has(n.id) && ownership.favorites.has(n.id)).length
  const presentRarities = new Set(notes.map((n) => n.rarity))
  const ownedRarities = new Set(notes.filter((n) => ownership.owned.has(n.id)).map((n) => n.rarity))
  const ownedByRarity = new Map<string, number>()
  const ownedByType = new Map<string, number>()
  const totalByType = new Map<string, number>()
  for (const n of notes) {
    totalByType.set(n.typeId, (totalByType.get(n.typeId) ?? 0) + 1)
    if (ownership.owned.has(n.id)) {
      ownedByRarity.set(n.rarity, (ownedByRarity.get(n.rarity) ?? 0) + 1)
      ownedByType.set(n.typeId, (ownedByType.get(n.typeId) ?? 0) + 1)
    }
  }
  const evalOne = (a: CollectionAchievement): { current: number; target: number } => {
    switch (a.conditionType) {
      case 'collect_count': return { current: ownedCount, target: a.count ?? 1 }
      case 'complete': return { current: ownedCount, target: notes.length }
      case 'rarity_count': return { current: a.rarityId ? ownedByRarity.get(a.rarityId) ?? 0 : 0, target: a.count ?? 1 }
      case 'type_complete': return { current: a.typeId ? ownedByType.get(a.typeId) ?? 0 : 0, target: a.typeId ? totalByType.get(a.typeId) ?? 0 : 0 }
      case 'favorite_count': return { current: favorites, target: a.count ?? 1 }
      case 'rainbow': return { current: ownedRarities.size, target: presentRarities.size }
      default: return { current: 0, target: 1 }
    }
  }
  const hasBaseline = achievementState.baseline
  const justUnlocked: string[] = []
  const now = new Date().toISOString()
  const result = achievements.map((a) => {
    const { current, target } = evalOne(a)
    const meetsNow = target > 0 && current >= target
    let unlockedAt = achievementState.unlocked[a.id] ?? null
    if (meetsNow && !unlockedAt) {
      unlockedAt = now
      achievementState.unlocked[a.id] = now
      if (hasBaseline) justUnlocked.push(a.id)
    }
    return {
      id: a.id, emoji: a.emoji, label: a.label, description: a.description, conditionType: a.conditionType,
      current: Math.min(current, target || current), target, unlocked: !!unlockedAt, unlockedAt,
    }
  })
  if (!hasBaseline) achievementState.baseline = true
  return { achievements: result, justUnlocked }
}

function todayKey(now: Date): string {
  return now.toISOString().slice(0, 10)
}

function tomorrowAtMidnight(now: Date): Date {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next
}

function tokenFrom(request: Request): string | null {
  const header = request.headers.get('Authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

function inferMockRole(user: MockUser) {
  const normalizedEmail = user.email.toLowerCase().trim()
  const owns = db.collections.some((collection) => collection.meta.ownerId === user.id)
  const hasGrant = db.collections.some((collection) =>
    collection.meta.ownerId !== user.id
    && collection.access.some((entry) => entry.email.toLowerCase().trim() === normalizedEmail),
  )
  if (hasGrant && !owns) return 'reader' as const
  if (owns) return 'writer' as const
  return user.role
}

function publicUser(user: MockUser) {
  return { id: user.id, name: user.name, role: inferMockRole(user) }
}

function dailyStatus(lastOpenDate: string | null, now: Date) {
  const canOpen = lastOpenDate !== todayKey(now)
  return {
    canOpen,
    availableAt: canOpen ? now.toISOString() : tomorrowAtMidnight(now).toISOString(),
    serverTime: now.toISOString(),
  }
}

function notFound(message: string) {
  return HttpResponse.json({ message }, { status: 404 })
}

function findDailyPack(collection: CollectionState) {
  return collection.packs.find((pack) => pack.category === 'daily') ?? collection.packs[0]
}

const authHandlers = [
  http.post('/auth/login', async ({ request }) => {
    await delay(300)
    const { email, password } = (await request.json()) as { email: string; password: string }
    const user = db.users.find((candidate) => candidate.email === email && candidate.password === password)
    if (!user) {
      return HttpResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 })
    }
    return HttpResponse.json({ token: user.token, user: publicUser(user) })
  }),

  http.post('/auth/register', async ({ request }) => {
    await delay(400)
    const { name, email, password } = (await request.json()) as {
      name: string; email: string; password: string
    }
    if (db.users.some((candidate) => candidate.email === email)) {
      return HttpResponse.json({ message: 'E-mail já cadastrado.' }, { status: 409 })
    }
    const normalizedEmail = email.toLowerCase().trim()
    const role = db.collections.some((collection) =>
      collection.access.some((entry) => entry.email.toLowerCase().trim() === normalizedEmail),
    ) ? 'reader' : 'writer'
    const user: MockUser = {
      id: nextId('user'), name, email, password, role,
      token: `mock-token-${nextId('tok')}`,
    }
    db.users.push(user)
    return HttpResponse.json({ id: user.id, name: user.name, role: user.role })
  }),

  http.get('/auth/me', async ({ request }) => {
    await delay(150)
    const user = resolveUser(tokenFrom(request))
    if (!user) return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    return HttpResponse.json({
      id: user.id, name: user.name, role: inferMockRole(user),
    })
  }),
]

type CollectionAuth =
  | { ok: true; user: MockUser; collection: CollectionState }
  | { ok: false; response: Response }

function authorizeCollection(request: Request, cid: string, mode: 'read' | 'owner'): CollectionAuth {
  const user = resolveUser(tokenFrom(request))
  if (!user) return { ok: false, response: HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 }) }
  const collection = findCollection(cid)
  if (!collection) return { ok: false, response: notFound('Coleção não encontrada.') }
  const isOwner = collection.meta.ownerId === user.id
  if (!isOwner) {
    if (mode === 'owner') {
      return { ok: false, response: HttpResponse.json({ message: 'Apenas o autor pode gerenciar esta coleção.' }, { status: 403 }) }
    }
    const email = user.email.toLowerCase().trim()
    const hasGrant = collection.access.some((entry) => entry.email.toLowerCase().trim() === email)
    if (!hasGrant) {
      return { ok: false, response: HttpResponse.json({ message: 'Você não tem acesso a esta coleção.' }, { status: 403 }) }
    }
  }
  return { ok: true, user, collection }
}

const collectionHandlers = [
  http.get('/api/collections', async ({ request }) => {
    await delay(220)
    const user = resolveUser(tokenFrom(request))
    if (!user) return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    const email = user.email.toLowerCase().trim()
    const views = db.collections.flatMap((collection): Collection[] => {
      const meta = collection.meta
      if (meta.ownerId === user.id) return [{ ...meta, access: 'owner' }]
      const hasGrant = collection.access.some((entry) => entry.email.toLowerCase().trim() === email)
      if (hasGrant) return [{ ...meta, access: 'reader' }]
      return []
    })
    return HttpResponse.json(views)
  }),

  http.post('/api/collections', async ({ request }) => {
    await delay(280)
    const data = (await request.json()) as CollectionFormData
    const now = new Date().toISOString()
    const meta: Collection = {
      id: nextId('col'), ownerId: db.users[0]?.id ?? 'user_writer', ...data,
      access: 'owner', createdAt: now, updatedAt: now,
    }
    db.collections.push(createEmptyCollection(meta))
    return HttpResponse.json(meta)
  }),

  http.put('/api/collections/:id', async ({ params, request }) => {
    await delay(240)
    const auth = authorizeCollection(request, String(params.id), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    Object.assign(collection.meta, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(collection.meta)
  }),

  http.delete('/api/collections/:id', async ({ params, request }) => {
    await delay(220)
    const auth = authorizeCollection(request, String(params.id), 'owner')
    if (!auth.ok) return auth.response
    const index = db.collections.findIndex((collection) => collection.meta.id === params.id)
    db.collections.splice(index, 1)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/access', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    return HttpResponse.json(collection.access)
  }),

  http.post('/api/collections/:cid/access', async ({ params, request }) => {
    await delay(220)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const { email } = (await request.json()) as { email: string }
    const entry = { collectionId: collection.meta.id, email, packIds: [], createdAt: new Date().toISOString() }
    if (!collection.access.some((item) => item.email === email)) collection.access.push(entry)
    return HttpResponse.json(entry)
  }),

  http.put('/api/collections/:cid/access/:email/packs', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const email = decodeURIComponent(String(params.email))
    const access = collection.access.find((item) => item.email === email)
    if (!access) return notFound('Acesso não encontrado.')
    const { packIds } = (await request.json()) as { packIds: string[] }
    const availableIds = new Set(collection.packs.map((pack) => pack.id))
    access.packIds = [...new Set(packIds)].filter((packId) => availableIds.has(packId))
    return HttpResponse.json(access)
  }),

  http.delete('/api/collections/:cid/access/:email', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const email = decodeURIComponent(String(params.email))
    collection.access = collection.access.filter((item) => item.email !== email)
    return HttpResponse.json({ revoked: true })
  }),

  http.get('/api/collections/:cid/packs', async ({ params, request }) => {
    await delay(160)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { user, collection } = auth
    if (collection.meta.ownerId === user.id) return HttpResponse.json(collection.packs)
    const access = collection.access.find((entry) => entry.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    const grantedPackIds = new Set(access?.packIds ?? [])
    return HttpResponse.json(collection.packs.filter((pack) =>
      pack.distribution === 'all_with_access' || grantedPackIds.has(pack.id),
    ))
  }),

  http.post('/api/collections/:cid/packs', async ({ params, request }) => {
    await delay(220)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const data = (await request.json()) as CollectionPackFormData
    const now = new Date().toISOString()
    const pack = {
      ...data,
      id: data.id || nextId('pack'),
      collectionId: collection.meta.id,
      createdAt: now,
      updatedAt: now,
    }
    collection.packs.push(pack)
    return HttpResponse.json(pack)
  }),

  http.get('/api/collections/:cid/packs/:id', async ({ params, request }) => {
    await delay(140)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const pack = collection.packs.find((item) => item.id === params.id)
    if (!pack) return notFound('Pacotinho não encontrado.')
    return HttpResponse.json(pack)
  }),

  http.put('/api/collections/:cid/packs/:id', async ({ params, request }) => {
    await delay(220)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const pack = collection.packs.find((item) => item.id === params.id)
    if (!pack) return notFound('Pacotinho não encontrado.')
    Object.assign(pack, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(pack)
  }),

  http.delete('/api/collections/:cid/packs/:id', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const index = collection.packs.findIndex((item) => item.id === params.id)
    if (index === -1) return notFound('Pacotinho não encontrado.')
    collection.packs.splice(index, 1)
    return HttpResponse.json({ deleted: true })
  }),

  http.post('/api/collections/:cid/packs/:packId/open', async ({ params, request }) => {
    await delay(600)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { user, collection } = auth
    const pack = collection.packs.find((p) => p.id === params.packId)
    if (!pack) return notFound('Pacotinho não encontrado.')
    const isOwner = collection.meta.ownerId === user.id
    if (!isOwner && pack.distribution !== 'all_with_access') {
      const access = collection.access.find((entry) => entry.email.toLowerCase().trim() === user.email.toLowerCase().trim())
      if (!access?.packIds.includes(pack.id)) {
        return HttpResponse.json({ message: 'Este pacotinho não está liberado para você.' }, { status: 403 })
      }
    }
    if (pack.status !== 'active') {
      return HttpResponse.json({ message: 'Este pacotinho não está disponível.' }, { status: 409 })
    }
    const now = new Date()
    if (pack.category === 'daily' && !dailyStatus(collection.lastDailyOpenDate, now).canOpen) {
      return HttpResponse.json({ message: 'Pacotinho do dia já foi aberto. Volte amanhã.' }, { status: 429 })
    }
    const packOpen = collection.packOpens[pack.id]
    if (pack.cooldownHours && packOpen?.lastOpenAt) {
      const elapsed = now.getTime() - new Date(packOpen.lastOpenAt).getTime()
      if (elapsed < pack.cooldownHours * 3_600_000) {
        const availableAt = new Date(new Date(packOpen.lastOpenAt).getTime() + pack.cooldownHours * 3_600_000).toISOString()
        return HttpResponse.json({ message: 'Pacotinho ainda em cooldown.', availableAt }, { status: 429 })
      }
    }
    if (pack.maxOpensPerUser !== null && packOpen && packOpen.totalOpens >= pack.maxOpensPerUser) {
      return HttpResponse.json({ message: 'Você já abriu o máximo permitido deste pacotinho.' }, { status: 409 })
    }
    const eligible = collection.notes.filter((note) =>
      (pack.allowedTypeIds.length === 0 || pack.allowedTypeIds.includes(note.typeId)) &&
      (pack.allowedRarityIds.length === 0 || pack.allowedRarityIds.includes(note.rarity)),
    )
    if (eligible.length === 0) {
      return HttpResponse.json({ message: 'Nenhum bilhete elegível neste pacotinho.' }, { status: 409 })
    }
    const { ownership } = collection
    const rewards: Array<{ id: string; title: string; message: string; rarity: string; typeId: string; isNew: boolean }> = []
    const used = new Set<string>()
    if (pack.guaranteedRarityId) {
      const pool = eligible.filter((n) => n.rarity === pack.guaranteedRarityId && !used.has(n.id))
      if (pool.length > 0) {
        const note = pool[Math.floor(Math.random() * pool.length)]
        const isNew = !ownership.owned.has(note.id)
        if (isNew) { ownership.owned.add(note.id); ownership.obtainedAt[note.id] = now.toISOString() }
        used.add(note.id)
        rewards.push({ id: note.id, title: note.title, message: note.message, rarity: note.rarity, typeId: note.typeId, isNew })
      }
    }
    const count = Math.max(1, pack.cardsPerOpen)
    while (rewards.length < count) {
      const pool = eligible.filter((n) => !used.has(n.id))
      if (pool.length === 0) break
      const reward = drawReward(pool, collection.rarities, ownership.owned, ownership.obtainedAt)
      const note = collection.notes.find((n) => n.id === reward.id)
      if (!note) break
      used.add(reward.id)
      rewards.push({ id: reward.id, title: reward.title, message: note.message, rarity: reward.rarity, typeId: reward.typeId, isNew: reward.isNew })
    }
    collection.packOpens[pack.id] = { lastOpenAt: now.toISOString(), totalOpens: (packOpen?.totalOpens ?? 0) + 1 }
    if (pack.category === 'daily') {
      collection.lastDailyOpenDate = todayKey(now)
    }
    const cooldownMs = Math.max(1, pack.cooldownHours ?? 24) * 3_600_000
    const status = pack.category === 'daily'
      ? dailyStatus(collection.lastDailyOpenDate, now)
      : { canOpen: false, availableAt: new Date(now.getTime() + cooldownMs).toISOString(), serverTime: now.toISOString() }
    return HttpResponse.json({ rewards, status })
  }),

  http.get('/api/collections/:cid/notes', async ({ params, request }) => {
    await delay(200)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    return HttpResponse.json(collection.notes)
  }),

  http.post('/api/collections/:cid/notes', async ({ params, request }) => {
    await delay(240)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const data = (await request.json()) as NoteFormData
    const record = { id: nextId('note'), ...data, createdAt: new Date().toISOString() }
    collection.notes.push(record)
    return HttpResponse.json(record)
  }),

  http.put('/api/collections/:cid/notes/:id', async ({ params, request }) => {
    await delay(220)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const record = collection.notes.find((note) => note.id === params.id)
    if (!record) return notFound('Bilhete não encontrado.')
    Object.assign(record, await request.json())
    return HttpResponse.json(record)
  }),

  http.delete('/api/collections/:cid/notes/:id', async ({ params, request }) => {
    await delay(200)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const index = collection.notes.findIndex((note) => note.id === params.id)
    if (index === -1) return notFound('Bilhete não encontrado.')
    collection.notes.splice(index, 1)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/rarities', async ({ params, request }) => {
    await delay(140)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { collection } = auth
    return HttpResponse.json(collection.rarities)
  }),

  http.post('/api/collections/:cid/rarities', async ({ params, request }) => {
    await delay(200)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const data = (await request.json()) as RarityConfig
    const rarity = { ...data, id: data.id || nextId('rarity'), createdAt: new Date().toISOString() }
    collection.rarities.push(rarity)
    return HttpResponse.json(rarity)
  }),

  http.put('/api/collections/:cid/rarities/:id', async ({ params, request }) => {
    await delay(200)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const rarity = collection.rarities.find((item) => item.id === params.id)
    if (!rarity) return notFound('Raridade não encontrada.')
    Object.assign(rarity, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(rarity)
  }),

  http.delete('/api/collections/:cid/rarities/:id', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    collection.rarities = collection.rarities.filter((item) => item.id !== params.id)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/types', async ({ params, request }) => {
    await delay(140)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { collection } = auth
    return HttpResponse.json(collection.types)
  }),

  http.post('/api/collections/:cid/types', async ({ params, request }) => {
    await delay(200)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const data = (await request.json()) as NoteTypeConfig
    const type = { ...data, id: data.id || nextId('type'), createdAt: new Date().toISOString() }
    collection.types.push(type)
    return HttpResponse.json(type)
  }),

  http.put('/api/collections/:cid/types/:id', async ({ params, request }) => {
    await delay(200)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const type = collection.types.find((item) => item.id === params.id)
    if (!type) return notFound('Tipo não encontrado.')
    Object.assign(type, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(type)
  }),

  http.delete('/api/collections/:cid/types/:id', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    collection.types = collection.types.filter((item) => item.id !== params.id)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/play', async ({ params, request }) => {
    await delay(280)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { user, collection } = auth
    const isOwner = collection.meta.ownerId === user.id
    const { ownership } = collection
    const items = collection.notes.map((note) => {
      const view = buildNoteView(note, ownership.owned, ownership.favorites, ownership.obtainedAt)
      const canSeeMessage = isOwner || ownership.owned.has(note.id)
      return { ...view, message: canSeeMessage ? note.message : '' }
    })
    return HttpResponse.json({
      total: items.length,
      owned: ownership.owned.size,
      items,
      daily: dailyStatus(collection.lastDailyOpenDate, new Date()),
    })
  }),

  http.post('/api/collections/:cid/daily/open', async ({ params, request }) => {
    await delay(600)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const now = new Date()
    if (!dailyStatus(collection.lastDailyOpenDate, now).canOpen) {
      return HttpResponse.json({ message: 'Pacotinho do dia já foi aberto. Volte amanhã.' }, { status: 429 })
    }
    if (collection.notes.length === 0) {
      return HttpResponse.json({ message: 'Esta coleção ainda não tem bilhetes.' }, { status: 409 })
    }
    const dailyPack = findDailyPack(collection)
    const count = Math.max(1, dailyPack?.cardsPerOpen ?? 1)
    const { ownership } = collection
    const rewards = Array.from({ length: count }, () => {
      const reward = drawReward(collection.notes, collection.rarities, ownership.owned, ownership.obtainedAt)
      const record = collection.notes.find((note) => note.id === reward.id)
      return {
        id: reward.id, title: reward.title, message: record?.message ?? '',
        rarity: reward.rarity, typeId: reward.typeId, isNew: reward.isNew,
      }
    })
    collection.lastDailyOpenDate = todayKey(now)
    return HttpResponse.json({
      rewards,
      status: dailyStatus(collection.lastDailyOpenDate, new Date()),
    })
  }),

  http.patch('/api/collections/:cid/notes/:id/favorite', async ({ params, request }) => {
    await delay(150)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const record = collection.notes.find((note) => note.id === params.id)
    if (!record) return notFound('Bilhete não encontrado.')
    const { favorite } = (await request.json()) as { favorite: boolean }
    const { ownership } = collection
    if (favorite) ownership.favorites.add(record.id)
    else ownership.favorites.delete(record.id)
    return HttpResponse.json({
      ...buildNoteView(record, ownership.owned, ownership.favorites, ownership.obtainedAt),
      message: record.message,
    })
  }),

  http.get('/api/collections/:cid/achievements', async ({ params, request }) => {
    await delay(140)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { collection } = auth
    return HttpResponse.json(collection.achievements)
  }),

  http.get('/api/collections/:cid/achievements/me', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'read')
    if (!auth.ok) return auth.response
    const { collection } = auth
    return HttpResponse.json(evaluateReaderAchievements(collection))
  }),

  http.post('/api/collections/:cid/achievements', async ({ params, request }) => {
    await delay(200)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const data = (await request.json()) as CollectionAchievementFormData
    const id = data.id || toConfigId(data.label)
    if (collection.achievements.some((a) => a.id === id)) {
      return HttpResponse.json({ error: 'ACHIEVEMENT_ALREADY_EXISTS' }, { status: 400 })
    }
    const now = new Date().toISOString()
    const achievement: CollectionAchievement = { ...data, id, collectionId: collection.meta.id, createdAt: now, updatedAt: now }
    collection.achievements.push(achievement)
    return HttpResponse.json(achievement)
  }),

  http.put('/api/collections/:cid/achievements/:id', async ({ params, request }) => {
    await delay(180)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    const achievement = collection.achievements.find((a) => a.id === params.id)
    if (!achievement) return notFound('Conquista não encontrada.')
    Object.assign(achievement, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(achievement)
  }),

  http.delete('/api/collections/:cid/achievements/:id', async ({ params, request }) => {
    await delay(160)
    const auth = authorizeCollection(request, String(params.cid), 'owner')
    if (!auth.ok) return auth.response
    const { collection } = auth
    collection.achievements = collection.achievements.filter((a) => a.id !== params.id)
    return HttpResponse.json({ deleted: true })
  }),
]

export const handlers = [...authHandlers, ...collectionHandlers]
