import type { AdminCollectionRow, AdminDailyPoint, AdminUserRow } from '../../types/admin'

export type Metric = 'collected' | 'openers' | 'signups'

const DAY_MS = 86_400_000
const TIME_ZONE = 'America/Sao_Paulo'

export interface Change {
  current: number
  previous: number | null
  ratio: number | null
}

function sum(points: AdminDailyPoint[], metric: Metric): number {
  return points.reduce((total, point) => total + point[metric], 0)
}

function change(current: number, previous: number | null): Change {
  if (previous === null) return { current, previous, ratio: null }
  if (previous === 0) return { current, previous, ratio: current === 0 ? 0 : null }
  return { current, previous, ratio: (current - previous) / previous }
}

export function periodChange(daily: AdminDailyPoint[], metric: Metric, days: number): Change {
  const current = sum(daily.slice(-days), metric)
  const previous = daily.length >= days * 2 ? sum(daily.slice(-days * 2, -days), metric) : null
  return change(current, previous)
}

export function todayChange(daily: AdminDailyPoint[], metric: Metric): Change {
  const today = daily[daily.length - 1]?.[metric] ?? 0
  const yesterday = daily.length >= 2 ? daily[daily.length - 2][metric] : null
  return change(today, yesterday)
}

function localDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
}

export function cumulativeUsers(users: AdminUserRow[], daily: AdminDailyPoint[]): number[] {
  const days = users.map((user) => (user.createdAt ? localDay(user.createdAt) : '')).sort()
  let index = 0
  return daily.map((point) => {
    while (index < days.length && days[index] <= point.date) index++
    return index
  })
}

export function within(iso: string | null, ms: number): boolean {
  if (!iso) return false
  const time = Date.parse(iso)
  return !Number.isNaN(time) && Date.now() - time <= ms
}

export const HOUR_MS = 3_600_000
export const WEEK_MS = 7 * DAY_MS
export const MONTH_MS = 30 * DAY_MS

interface FunnelStep {
  label: string
  hint: string
  count: number
}

export function funnel(users: AdminUserRow[]): FunnelStep[] {
  const stages: Array<{ label: string; hint: string; test: (user: AdminUserRow) => boolean }> = [
    { label: 'Criaram conta', hint: 'todos os cadastros', test: () => true },
    { label: 'Confirmaram o email', hint: 'email verificado ou Google', test: (user) => user.emailVerified !== false },
    { label: 'Entraram numa coleção', hint: 'escrevem ou leem alguma', test: (user) => user.collectionsOwned > 0 || user.collectionsReading > 0 },
    { label: 'Abriram um bilhete', hint: 'pelo menos um coletado', test: (user) => user.collected > 0 },
    { label: 'Seguem voltando', hint: 'e acessaram nos últimos 30 dias', test: (user) => within(user.lastActiveAt, MONTH_MS) },
  ]
  let remaining = users
  return stages.map(({ label, hint, test }) => {
    remaining = remaining.filter(test)
    return { label, hint, count: remaining.length }
  })
}

export function movingAverage(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1)
    return slice.reduce((sum, value) => sum + value, 0) / slice.length
  })
}

interface Segment {
  label: string
  count: number
  color: string
}

export function roleSegments(users: AdminUserRow[]): Segment[] {
  const writes = (user: AdminUserRow) => user.collectionsOwned > 0
  const reads = (user: AdminUserRow) => user.collectionsReading > 0
  return [
    { label: 'Só escrevem', count: users.filter((user) => writes(user) && !reads(user)).length, color: '#7c3aed' },
    { label: 'Só leem', count: users.filter((user) => reads(user) && !writes(user)).length, color: '#0ea5e9' },
    { label: 'Escrevem e leem', count: users.filter((user) => writes(user) && reads(user)).length, color: '#db2777' },
    { label: 'Ainda sem coleção', count: users.filter((user) => !writes(user) && !reads(user)).length, color: '#94a3b8' },
  ]
}

export function loginSegments(users: AdminUserRow[]): Segment[] {
  return [
    { label: 'Email e senha', count: users.filter((user) => user.hasPassword).length, color: '#6366f1' },
    { label: 'Google', count: users.filter((user) => !user.hasPassword).length, color: '#f59e0b' },
  ]
}

export function topCollections(collections: AdminCollectionRow[], limit: number): AdminCollectionRow[] {
  return collections
    .filter((collection) => !collection.deleted)
    .sort((a, b) => b.collected - a.collected || (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''))
    .slice(0, limit)
}

export function peakIndex(values: number[]): number {
  let best = -1
  let bestValue = 0
  values.forEach((value, i) => {
    if (value > bestValue) {
      best = i
      bestValue = value
    }
  })
  return best
}
