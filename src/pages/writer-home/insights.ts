import type { Collection, CollectionAccess, CollectionInvite, CollectionNoteView, CollectionPack, CollectionPlayView, NoteRecord } from '../../types/note'
import { timeAgo } from '../../utils/timeAgo'

export type StockLevel = 'done' | 'low' | 'ok' | 'manual'

export interface Stock {
  remaining: number
  perDay: number
  days: number
  level: StockLevel
}

export interface ReaderSummary {
  key: string
  email: string
  name: string
  collection: Collection
  slug: string
  owned: number
  total: number
  recent: number
  lastObtainedAt: string | null
  favorites: CollectionNoteView[]
  stock: Stock
  bonusPacks: CollectionPack[]
  packOpens: Record<string, number>
}

export interface CollectionSummary {
  collection: Collection
  slug: string
  readers: number
  drafts: NoteRecord[]
  released: number
  invites: CollectionInvite[]
  hasAutoPack: boolean
}

export type TodoAction =
  | { kind: 'link'; label: string; to: string }
  | { kind: 'resend'; label: string; cid: string; email: string }

export interface Todo {
  key: string
  emoji: string
  title: string
  detail: string
  action: TodoAction
}

const LOW_STOCK_DAYS = 3

export function managePath(slug: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : ''
  return `/colecoes/${slug}/gerenciar${query}`
}

export function readerPath(slug: string, email: string) {
  return `/colecoes/${slug}/gerenciar/leitores/${encodeURIComponent(email)}`
}

export function readerName(email: string) {
  const local = email.split('@')[0] ?? email
  const name = local.split(/[._\-+\d]+/).find((part) => part.length >= 2) ?? local
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function refillsFor(pack: CollectionPack, access: CollectionAccess) {
  if (pack.status !== 'active') return false
  if (pack.distribution === 'all_with_access') return true
  return pack.distribution === 'selected_readers' && (access.packIds ?? []).includes(pack.id)
}

function opensPerDay(pack: CollectionPack) {
  if (pack.scheduleMode === 'fixed_time' || !pack.cooldownHours) return 1
  return 24 / pack.cooldownHours
}

export function isBonusPack(pack: CollectionPack) {
  return pack.status === 'active' && pack.category !== 'daily' && pack.distribution !== 'all_with_access'
}

export function hasAutoPack(packs: CollectionPack[]) {
  return packs.some((pack) => pack.status === 'active' && pack.distribution !== 'manual_bonus')
}

export function readerStock(view: CollectionPlayView, packs: CollectionPack[], access: CollectionAccess): Stock {
  const remaining = Math.max(0, view.total - view.owned)
  const perDay = packs.filter((pack) => refillsFor(pack, access)).reduce((sum, pack) => sum + pack.cardsPerOpen * opensPerDay(pack), 0)
  const cardsPerOpen = new Map(packs.map((pack) => [pack.id, pack.cardsPerOpen]))
  const bonusCards = Object.entries(view.packOpens ?? access.packOpens ?? {})
    .reduce((sum, [packId, opens]) => sum + opens * (cardsPerOpen.get(packId) ?? 0), 0)
  if (remaining === 0) return { remaining, perDay, days: 0, level: 'done' }
  if (perDay === 0) return { remaining, perDay, days: 0, level: 'manual' }
  const days = Math.max(0, remaining - bonusCards) / perDay
  return { remaining, perDay, days, level: days <= LOW_STOCK_DAYS ? 'low' : 'ok' }
}

export function stockLabel(stock: Stock) {
  if (stock.level === 'done') return 'já descobriu todos os bilhetes'
  if (stock.level === 'manual') return `${stock.remaining} pra descobrir, só com mimos`
  if (stock.days < 1) return 'bilhetes novos acabam nos próximos pacotes'
  const days = Math.round(stock.days)
  return `bilhetes novos pra ~${days} ${days === 1 ? 'dia' : 'dias'}`
}

export function rhythmLabel(stock: Stock) {
  if (stock.level === 'done' || stock.level === 'manual') return null
  const perDay = Math.round(stock.perDay * 10) / 10
  return `${stock.remaining} pra descobrir, ${perDay} por dia`
}

export function startOfYesterday(now = new Date()) {
  const date = new Date(now)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - 1)
  return date.getTime()
}

export function ownedSince(items: CollectionNoteView[], since: number) {
  return items.filter((item) => item.owned && item.obtainedAt && Date.parse(item.obtainedAt) >= since).length
}

export function lastObtained(items: CollectionNoteView[]) {
  return items.reduce<string | null>((latest, item) => {
    if (!item.owned || !item.obtainedAt) return latest
    return !latest || Date.parse(item.obtainedAt) > Date.parse(latest) ? item.obtainedAt : latest
  }, null)
}

export function byObtainedDesc(a: CollectionNoteView, b: CollectionNoteView) {
  return Date.parse(b.obtainedAt ?? '') - Date.parse(a.obtainedAt ?? '') || 0
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function joinNames(names: string[]) {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} e ${names[1]}`
  return `${names[0]} e mais ${names.length - 1} pessoas`
}

export function liveGreeting(readers: ReaderSummary[], collections: CollectionSummary[]) {
  if (collections.length === 0) return 'que tal criar sua primeira coleção?'
  if (readers.length === 0) return 'sua coleção está pronta pra alguém especial'

  const recentByName = new Map<string, number>()
  for (const reader of readers) {
    if (reader.recent > 0) recentByName.set(reader.name, (recentByName.get(reader.name) ?? 0) + reader.recent)
  }
  if (recentByName.size > 0) {
    const names = [...recentByName.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name)
    const total = [...recentByName.values()].reduce((sum, count) => sum + count, 0)
    const verb = names.length === 1 ? 'abriu' : 'abriram'
    return `${joinNames(names)} ${verb} ${plural(total, 'bilhete', 'bilhetes')} desde ontem 💌`
  }

  const latest = readers
    .filter((reader) => reader.lastObtainedAt)
    .sort((a, b) => Date.parse(b.lastObtainedAt!) - Date.parse(a.lastObtainedAt!))[0]
  if (latest) return `${latest.name} abriu um bilhete ${timeAgo(latest.lastObtainedAt)}`
  return 'seus bilhetes estão esperando o primeiro pacotinho 🫙'
}

function effectiveInviteStatus(invite: CollectionInvite) {
  if (invite.status === 'pending' && Date.parse(invite.expiresAt) < Date.now()) return 'expired'
  return invite.status
}

export function openInvites(invites: CollectionInvite[]) {
  return invites.filter((invite) => {
    const status = effectiveInviteStatus(invite)
    return status === 'pending' || status === 'expired'
  })
}

export function buildTodos(readers: ReaderSummary[], collections: CollectionSummary[]): Todo[] {
  const todos: Todo[] = []

  for (const reader of readers) {
    if (reader.stock.level === 'done') {
      todos.push({
        key: `done-${reader.key}`, emoji: '📭',
        title: `${reader.name} já descobriu todos os bilhetes`,
        detail: `${reader.collection.name} · escreva mais pra continuar a surpresa`,
        action: { kind: 'link', label: 'Escrever', to: managePath(reader.slug, { aba: 'bilhetes', novo: '1' }) },
      })
    } else if (reader.stock.level === 'low') {
      todos.push({
        key: `low-${reader.key}`, emoji: '⏳',
        title: `Os bilhetes novos de ${reader.name} estão acabando`,
        detail: `${reader.collection.name} · ${stockLabel(reader.stock)}`,
        action: { kind: 'link', label: 'Escrever', to: managePath(reader.slug, { aba: 'bilhetes', novo: '1' }) },
      })
    }
  }

  for (const summary of collections) {
    const { collection, slug } = summary
    if (summary.drafts.length > 0) {
      todos.push({
        key: `drafts-${collection.id}`, emoji: '✏️',
        title: `${plural(summary.drafts.length, 'rascunho esperando', 'rascunhos esperando')} lançamento`,
        detail: `${collection.name} · só aparecem pros leitores depois de lançados`,
        action: { kind: 'link', label: 'Lançar', to: managePath(slug, { aba: 'bilhetes', ver: 'rascunhos' }) },
      })
    } else if (summary.released === 0) {
      todos.push({
        key: `empty-${collection.id}`, emoji: '🫙',
        title: `${collection.name} ainda não tem bilhetes`,
        detail: 'escreva o primeiro pra encher o potinho',
        action: { kind: 'link', label: 'Escrever', to: managePath(slug, { aba: 'bilhetes', novo: '1' }) },
      })
    }

    for (const invite of openInvites(summary.invites)) {
      const expired = effectiveInviteStatus(invite) === 'expired'
      todos.push({
        key: `invite-${collection.id}-${invite.email}`, emoji: expired ? '⌛' : '✉️',
        title: expired ? `O convite pra ${readerName(invite.email)} expirou` : `${readerName(invite.email)} ainda não aceitou o convite`,
        detail: `${collection.name} · enviado ${timeAgo(invite.createdAt)}`,
        action: { kind: 'resend', label: 'Reenviar', cid: collection.id, email: invite.email },
      })
    }

    if (summary.readers === 0 && openInvites(summary.invites).length === 0) {
      todos.push({
        key: `noreaders-${collection.id}`, emoji: '💌',
        title: `Ninguém está lendo ${collection.name} ainda`,
        detail: 'convide alguém pra começar a abrir os pacotinhos',
        action: { kind: 'link', label: 'Convidar', to: managePath(slug, { aba: 'acesso' }) },
      })
    } else if (summary.readers > 0 && !summary.hasAutoPack) {
      todos.push({
        key: `nopack-${collection.id}`, emoji: '📦',
        title: `${collection.name} não tem pacotinho automático`,
        detail: 'seus leitores só recebem bilhetes quando você manda um mimo',
        action: { kind: 'link', label: 'Configurar', to: managePath(slug, { aba: 'pacotinhos' }) },
      })
    }
  }

  return todos
}
