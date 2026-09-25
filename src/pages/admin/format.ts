const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3_600], ['minute', 60],
]

export type ActivityTone = 'hot' | 'warm' | 'cold' | 'none'

export const TONE_COLOR: Record<ActivityTone, string> = {
  hot: '#22c55e',
  warm: '#f59e0b',
  cold: '#94a3b8',
  none: 'transparent',
}

export function timeAgo(iso: string | null): string {
  if (!iso) return 'nunca'
  const seconds = Math.round((Date.parse(iso) - Date.now()) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'agora'
}

export function shortDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return `${date.getDate()} ${MONTHS[date.getMonth()]}${sameYear ? '' : ` ${date.getFullYear()}`}`
}

export function dateTime(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return `${shortDate(iso)}, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function dayLabel(day: string): string {
  const [, month, date] = day.split('-').map(Number)
  return `${date} ${MONTHS[month - 1]}`
}

export function activityTone(iso: string | null): ActivityTone {
  if (!iso) return 'none'
  const age = Date.now() - Date.parse(iso)
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
