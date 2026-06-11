import { delay, http, HttpResponse } from 'msw'
import type {
  Collection,
  CollectionFormData,
  CollectionPackFormData,
  NoteFormData,
  NoteTypeConfig,
  RarityConfig,
} from '../types/note'
import { buildNoteView, drawReward } from './data'
import {
  createEmptyCollection,
  db,
  findCollection,
  nextId,
  resolveUser,
  type MockUser,
} from './db'

const COLLECTION_PACK_SIZE = 3

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

function publicUser(user: MockUser) {
  return { id: user.id, name: user.name, role: user.role, coupleCode: user.coupleCode }
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
    const { name, email, password, inviteCode } = (await request.json()) as {
      name: string; email: string; password: string; inviteCode?: string
    }
    if (db.users.some((candidate) => candidate.email === email)) {
      return HttpResponse.json({ message: 'E-mail já cadastrado.' }, { status: 409 })
    }

    if (inviteCode) {
      const owner = db.users.find((candidate) => candidate.coupleCode === inviteCode)
      if (!owner) {
        return HttpResponse.json({ error: 'INVALID_INVITE_CODE' }, { status: 400 })
      }
      const reader: MockUser = {
        id: nextId('user'), name, email, password, role: 'reader',
        coupleCode: owner.coupleCode, inviteEmail: null, token: `mock-token-${nextId('tok')}`,
      }
      db.users.push(reader)
      return HttpResponse.json({ id: reader.id, name: reader.name, role: reader.role })
    }

    const coupleCode = `AMOR-${Math.floor(1000 + Math.random() * 9000)}`
    const writer: MockUser = {
      id: nextId('user'), name, email, password, role: 'writer',
      coupleCode, inviteEmail: null, token: `mock-token-${nextId('tok')}`,
    }
    db.users.push(writer)
    return HttpResponse.json({ id: writer.id, name: writer.name, role: writer.role, coupleCode })
  }),

  http.get('/auth/me', async ({ request }) => {
    await delay(150)
    const user = resolveUser(tokenFrom(request))
    if (!user) return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    return HttpResponse.json({
      id: user.id, name: user.name, role: user.role,
      coupleCode: user.coupleCode, inviteEmail: user.inviteEmail ?? undefined,
    })
  }),

  http.put('/auth/invite-email', async ({ request }) => {
    await delay(200)
    const user = resolveUser(tokenFrom(request))
    if (!user) return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    const { email } = (await request.json()) as { email: string }
    user.inviteEmail = email
    return HttpResponse.json({ inviteEmail: email })
  }),
]

const collectionHandlers = [
  http.get('/api/collections', async ({ request }) => {
    await delay(220)
    const user = resolveUser(tokenFrom(request))
    if (!user) return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    const email = user.email.toLowerCase().trim()
    const views = db.collections.flatMap((collection): Collection[] => {
      const meta = collection.meta
      if (meta.ownerId === user.id) return [{ ...meta, access: 'owner' }]
      const owner = db.users.find((candidate) => candidate.id === meta.ownerId)
      const hasGrant = collection.access.some((entry) => entry.email.toLowerCase().trim() === email)
      const sharesCode = !!user.coupleCode && owner?.coupleCode === user.coupleCode
      if (hasGrant || sharesCode) return [{ ...meta, access: 'reader' }]
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
    const collection = findCollection(String(params.id))
    if (!collection) return notFound('Coleção não encontrada.')
    Object.assign(collection.meta, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(collection.meta)
  }),

  http.delete('/api/collections/:id', async ({ params }) => {
    await delay(220)
    const index = db.collections.findIndex((collection) => collection.meta.id === params.id)
    if (index === -1) return notFound('Coleção não encontrada.')
    db.collections.splice(index, 1)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/access', async ({ params }) => {
    await delay(180)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    return HttpResponse.json(collection.access)
  }),

  http.post('/api/collections/:cid/access', async ({ params, request }) => {
    await delay(220)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const { email } = (await request.json()) as { email: string }
    const entry = { collectionId: collection.meta.id, email, createdAt: new Date().toISOString() }
    if (!collection.access.some((item) => item.email === email)) collection.access.push(entry)
    return HttpResponse.json(entry)
  }),

  http.delete('/api/collections/:cid/access/:email', async ({ params }) => {
    await delay(180)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const email = decodeURIComponent(String(params.email))
    collection.access = collection.access.filter((item) => item.email !== email)
    return HttpResponse.json({ revoked: true })
  }),

  http.get('/api/collections/:cid/packs', async ({ params }) => {
    await delay(160)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    return HttpResponse.json(collection.packs)
  }),

  http.post('/api/collections/:cid/packs', async ({ params, request }) => {
    await delay(220)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
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

  http.get('/api/collections/:cid/packs/:id', async ({ params }) => {
    await delay(140)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const pack = collection.packs.find((item) => item.id === params.id)
    if (!pack) return notFound('Pacotinho não encontrado.')
    return HttpResponse.json(pack)
  }),

  http.put('/api/collections/:cid/packs/:id', async ({ params, request }) => {
    await delay(220)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const pack = collection.packs.find((item) => item.id === params.id)
    if (!pack) return notFound('Pacotinho não encontrado.')
    Object.assign(pack, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(pack)
  }),

  http.delete('/api/collections/:cid/packs/:id', async ({ params }) => {
    await delay(180)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const index = collection.packs.findIndex((item) => item.id === params.id)
    if (index === -1) return notFound('Pacotinho não encontrado.')
    collection.packs.splice(index, 1)
    return HttpResponse.json({ deleted: true })
  }),

  http.post('/api/collections/:cid/packs/:packId/open', async ({ params }) => {
    await delay(600)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const pack = collection.packs.find((p) => p.id === params.packId)
    if (!pack) return notFound('Pacotinho não encontrado.')
    if (pack.status !== 'active') {
      return HttpResponse.json({ message: 'Este pacotinho não está disponível.' }, { status: 409 })
    }
    const now = new Date()
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
    const cooldownMs = Math.max(1, pack.cooldownHours ?? 24) * 3_600_000
    return HttpResponse.json({
      rewards,
      status: { canOpen: false, availableAt: new Date(now.getTime() + cooldownMs).toISOString(), serverTime: now.toISOString() },
    })
  }),

  http.get('/api/collections/:cid/notes', async ({ params }) => {
    await delay(200)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    return HttpResponse.json(collection.notes)
  }),

  http.post('/api/collections/:cid/notes', async ({ params, request }) => {
    await delay(240)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const data = (await request.json()) as NoteFormData
    const record = { id: nextId('note'), ...data, createdAt: new Date().toISOString() }
    collection.notes.push(record)
    return HttpResponse.json(record)
  }),

  http.put('/api/collections/:cid/notes/:id', async ({ params, request }) => {
    await delay(220)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const record = collection.notes.find((note) => note.id === params.id)
    if (!record) return notFound('Bilhete não encontrado.')
    Object.assign(record, await request.json())
    return HttpResponse.json(record)
  }),

  http.delete('/api/collections/:cid/notes/:id', async ({ params }) => {
    await delay(200)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const index = collection.notes.findIndex((note) => note.id === params.id)
    if (index === -1) return notFound('Bilhete não encontrado.')
    collection.notes.splice(index, 1)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/rarities', async ({ params }) => {
    await delay(140)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    return HttpResponse.json(collection.rarities)
  }),

  http.post('/api/collections/:cid/rarities', async ({ params, request }) => {
    await delay(200)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const data = (await request.json()) as RarityConfig
    const rarity = { ...data, id: data.id || nextId('rarity'), createdAt: new Date().toISOString() }
    collection.rarities.push(rarity)
    return HttpResponse.json(rarity)
  }),

  http.put('/api/collections/:cid/rarities/:id', async ({ params, request }) => {
    await delay(200)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const rarity = collection.rarities.find((item) => item.id === params.id)
    if (!rarity) return notFound('Raridade não encontrada.')
    Object.assign(rarity, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(rarity)
  }),

  http.delete('/api/collections/:cid/rarities/:id', async ({ params }) => {
    await delay(180)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    collection.rarities = collection.rarities.filter((item) => item.id !== params.id)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/types', async ({ params }) => {
    await delay(140)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    return HttpResponse.json(collection.types)
  }),

  http.post('/api/collections/:cid/types', async ({ params, request }) => {
    await delay(200)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const data = (await request.json()) as NoteTypeConfig
    const type = { ...data, id: data.id || nextId('type'), createdAt: new Date().toISOString() }
    collection.types.push(type)
    return HttpResponse.json(type)
  }),

  http.put('/api/collections/:cid/types/:id', async ({ params, request }) => {
    await delay(200)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const type = collection.types.find((item) => item.id === params.id)
    if (!type) return notFound('Tipo não encontrado.')
    Object.assign(type, await request.json(), { updatedAt: new Date().toISOString() })
    return HttpResponse.json(type)
  }),

  http.delete('/api/collections/:cid/types/:id', async ({ params }) => {
    await delay(180)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    collection.types = collection.types.filter((item) => item.id !== params.id)
    return HttpResponse.json({ deleted: true })
  }),

  http.get('/api/collections/:cid/play', async ({ params }) => {
    await delay(280)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const { ownership } = collection
    const items = collection.notes.map((note) => ({
      ...buildNoteView(note, ownership.owned, ownership.favorites, ownership.obtainedAt),
      message: note.message,
    }))
    return HttpResponse.json({
      total: items.length,
      owned: ownership.owned.size,
      items,
      daily: dailyStatus(collection.lastDailyOpenDate, new Date()),
    })
  }),

  http.post('/api/collections/:cid/daily/open', async ({ params }) => {
    await delay(600)
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
    const now = new Date()
    if (!dailyStatus(collection.lastDailyOpenDate, now).canOpen) {
      return HttpResponse.json({ message: 'Pacotinho do dia já foi aberto. Volte amanhã.' }, { status: 429 })
    }
    if (collection.notes.length === 0) {
      return HttpResponse.json({ message: 'Esta coleção ainda não tem bilhetes.' }, { status: 409 })
    }
    const { ownership } = collection
    const rewards = Array.from({ length: COLLECTION_PACK_SIZE }, () => {
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
    const collection = findCollection(String(params.cid))
    if (!collection) return notFound('Coleção não encontrada.')
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
]

export const handlers = [...authHandlers, ...collectionHandlers]
