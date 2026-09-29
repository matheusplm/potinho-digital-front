export { timeAgo } from '../../utils/timeAgo'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export type ActivityTone = 'hot' | 'warm' | 'cold' | 'none'

export const TONE_COLOR: Record<ActivityTone, string> = {
  hot: '#22c55e',
  warm: '#f59e0b',
  cold: '#94a3b8',
  none: 'transparent',
}

function validTime(iso: string | null): number | null {
  if (!iso) return null
  const time = Date.parse(iso)
  return Number.isNaN(time) ? null : time
}

export function shortDate(iso: string | null): string {
  const time = validTime(iso)
  if (time === null) return '—'
  const date = new Date(time)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return `${date.getDate()} ${MONTHS[date.getMonth()]}${sameYear ? '' : ` ${date.getFullYear()}`}`
}

export function dateTime(iso: string | null): string {
  const time = validTime(iso)
  if (time === null) return '—'
  return `${shortDate(iso)}, ${new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function dayLabel(day: string): string {
  const [, month, date] = day.split('-').map(Number)
  return `${date} ${MONTHS[month - 1]}`
}

export function activityTone(iso: string | null): ActivityTone {
  const time = validTime(iso)
  if (time === null) return 'none'
  const age = Date.now() - time
  if (age < 86_400_000) return 'hot'
  if (age < 7 * 86_400_000) return 'warm'
  return 'cold'
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : pluralForm}`
}

export function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const WEEKDAYS_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export function dayLabelLong(day: string): string {
  const [year, month, date] = day.split('-').map(Number)
  return `${WEEKDAYS_SHORT[new Date(year, month - 1, date).getDay()]}, ${date} ${MONTHS[month - 1]}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

export function share(part: number, total: number): number {
  return total > 0 ? part / total : 0
}

export function percentLabel(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

export function niceCeil(value: number): number {
  if (value <= 5) return Math.max(1, Math.ceil(value))
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((candidate) => candidate * magnitude >= value) ?? 10
  return step * magnitude
}
