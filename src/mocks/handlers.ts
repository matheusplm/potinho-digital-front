import { delay, http, HttpResponse } from 'msw'
import { computeStats, getPackOdds, openPack } from './data'
import { db } from './db'

const MAX_PACK_OPENS_PER_DAY = 3

function getTodayKey(now: Date): string {
  return now.toISOString().slice(0, 10)
}

function tomorrowAtMidnight(now: Date): Date {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next
}

function getRemainingOpens(now: Date): number {
  const opensToday = db.packOpensByDate[getTodayKey(now)] ?? 0
  return Math.max(MAX_PACK_OPENS_PER_DAY - opensToday, 0)
}

function buildPackStatus(now: Date) {
  const remaining = getRemainingOpens(now)
  const canOpen = remaining > 0
  return {
    canOpen,
    remainingOpensToday: remaining,
    nextAvailableAt: canOpen ? now.toISOString() : tomorrowAtMidnight(now).toISOString(),
    serverTime: now.toISOString(),
  }
}

function buildDailyStatus(now: Date) {
  const canOpen = db.lastDailyNoteOpenDate !== getTodayKey(now)
  return {
    canOpen,
    availableAt: canOpen ? now.toISOString() : tomorrowAtMidnight(now).toISOString(),
    serverTime: now.toISOString(),
  }
}

export const handlers = [
  http.get('/api/collection', async () => {
    await delay(300)
    const owned = db.collection.filter((n) => n.owned).length
    return HttpResponse.json({ total: db.collection.length, owned, items: db.collection })
  }),

  http.get('/api/stats', async () => {
    await delay(200)
    return HttpResponse.json(computeStats(db.collection))
  }),

  http.get('/api/packs/status', async () => {
    await delay(160)
    return HttpResponse.json(buildPackStatus(new Date()))
  }),

  http.get('/api/packs/odds', async () => {
    await delay(100)
    return HttpResponse.json(getPackOdds())
  }),

  http.post('/api/packs/open', async () => {
    await delay(600)
    const now = new Date()
    const status = buildPackStatus(now)

    if (!status.canOpen) {
      return HttpResponse.json(
        { message: 'Você já abriu todos os pacotinhos de hoje.' },
        { status: 429 },
      )
    }

    const todayKey = getTodayKey(now)
    db.packOpensByDate[todayKey] = (db.packOpensByDate[todayKey] ?? 0) + 1
    const rewards = openPack(db.collection)
    const updated = buildPackStatus(new Date())

    return HttpResponse.json({ rewards, remainingOpensToday: updated.remainingOpensToday })
  }),

  http.get('/api/daily-note/status', async () => {
    await delay(180)
    return HttpResponse.json(buildDailyStatus(new Date()))
  }),

  http.post('/api/daily-note/open', async () => {
    await delay(500)
    const now = new Date()
    const status = buildDailyStatus(now)

    if (!status.canOpen) {
      return HttpResponse.json(
        { message: 'Bilhete do dia já foi aberto. Volte amanhã.' },
        { status: 429 },
      )
    }

    const [reward] = openPack(db.collection)
    db.lastDailyNoteOpenDate = getTodayKey(now)

    return HttpResponse.json({ reward, status: buildDailyStatus(new Date()) })
  }),

  http.patch('/api/notes/:id/favorite', async ({ params, request }) => {
    await delay(150)
    const { id } = params
    const payload = (await request.json()) as { favorite: boolean }
    const note = db.collection.find((n) => n.id === id)

    if (!note) {
      return HttpResponse.json({ message: 'Bilhete não encontrado.' }, { status: 404 })
    }

    note.favorite = payload.favorite
    return HttpResponse.json({ ok: true, note })
  }),

  http.get('/api/notes/:id', async ({ params }) => {
    await delay(200)
    const { id } = params
    const note = db.collection.find((n) => n.id === id)

    if (!note) {
      return HttpResponse.json({ message: 'Bilhete não encontrado.' }, { status: 404 })
    }

    return HttpResponse.json(note)
  }),
]
