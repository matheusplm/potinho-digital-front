const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3_600], ['minute', 60],
]

export function timeAgo(iso: string | null): string {
  const time = iso ? Date.parse(iso) : NaN
  if (Number.isNaN(time)) return 'nunca'
  const seconds = Math.round((time - Date.now()) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'agora'
}
