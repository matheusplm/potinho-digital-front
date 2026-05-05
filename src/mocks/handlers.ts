import { delay, http, HttpResponse } from 'msw'
import { computeStats, createInitialCollection, openPack } from './data'

const collection = createInitialCollection()
const MAX_PACK_OPENS_PER_DAY = 3
const packOpensByDate: Record<string, number> = {}
let lastDailyNoteOpenDate: string | null = null

function getTodayKey(now: Date): string {
  return now.toISOString().slice(0, 10)
}

function tomorrowAtMidnight(now: Date): Date {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next
}

function getRemainingOpens(now: Date): number {
  const todayKey = getTodayKey(now)
  const opensToday = packOpensByDate[todayKey] ?? 0
  return Math.max(MAX_PACK_OPENS_PER_DAY - opensToday, 0)
}

function getPackStatus(now: Date) {
  const remaining = getRemainingOpens(now)
  const canOpen = remaining > 0

  return {
    canOpen,
    remainingOpensToday: remaining,
    nextAvailableAt: canOpen ? now.toISOString() : tomorrowAtMidnight(now).toISOString(),
    serverTime: now.toISOString(),
  }
}

function getDailyStatus(now: Date) {
  const todayKey = getTodayKey(now)
  const canOpen = lastDailyNoteOpenDate !== todayKey

  return {
    canOpen,
    availableAt: canOpen ? now.toISOString() : tomorrowAtMidnight(now).toISOString(),
    serverTime: now.toISOString(),
  }
}

export const handlers = [
  http.get('/api/collection', async () => {
    await delay(300)
    const owned = collection.filter((note) => note.owned).length

    return HttpResponse.json({
      total: collection.length,
      owned,
      items: collection,
    })
  }),

  http.get('/api/stats', async () => {
    await delay(200)
    return HttpResponse.json(computeStats(collection))
  }),

  http.get('/api/packs/status', async () => {
    await delay(160)
    return HttpResponse.json(getPackStatus(new Date()))
  }),

  http.post('/api/packs/open', async () => {
    await delay(600)
    const now = new Date()
    const status = getPackStatus(now)

    if (!status.canOpen) {
      return HttpResponse.json(
        { message: 'Voce ja abriu todos os pacotinhos de hoje.' },
        { status: 429 },
      )
    }

    const todayKey = getTodayKey(now)
    packOpensByDate[todayKey] = (packOpensByDate[todayKey] ?? 0) + 1
    const rewards = openPack(collection)
    const updatedStatus = getPackStatus(new Date())

    return HttpResponse.json({
      rewards,
      remainingOpensToday: updatedStatus.remainingOpensToday,
    })
  }),

  http.get('/api/daily-note/status', async () => {
    await delay(180)
    return HttpResponse.json(getDailyStatus(new Date()))
  }),

  http.post('/api/daily-note/open', async () => {
    await delay(500)
    const now = new Date()
    const status = getDailyStatus(now)

    if (!status.canOpen) {
      return HttpResponse.json(
        { message: 'Bilhete do dia ja foi aberto. Volte amanha.' },
        { status: 429 },
      )
    }

    const [reward] = openPack(collection)
    lastDailyNoteOpenDate = getTodayKey(now)

    return HttpResponse.json({
      reward,
      status: getDailyStatus(new Date()),
    })
  }),

  http.patch('/api/notes/:id/favorite', async ({ params, request }) => {
    await delay(150)
    const { id } = params
    const payload = (await request.json()) as { favorite: boolean }
    const note = collection.find((item) => item.id === id)

    if (!note) {
      return HttpResponse.json({ message: 'Bilhete nao encontrado.' }, { status: 404 })
    }

    note.favorite = payload.favorite
    return HttpResponse.json({ ok: true, note })
  }),

  http.get('/api/notes/:id', async ({ params }) => {
    await delay(200)
    const { id } = params
    const note = collection.find((item) => item.id === id)

    if (!note) {
      return HttpResponse.json({ message: 'Bilhete nao encontrado.' }, { status: 404 })
    }

    return HttpResponse.json(note)
  }),
]
