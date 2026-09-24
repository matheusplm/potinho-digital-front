export function formatRemainingTime(ms: number) {
  if (ms <= 0) return 'disponível agora'
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours <= 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}

export function formatCooldownBadge(ms: number) {
  if (ms <= 0) return 'já'
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours >= 1) return `${hours}h`
  return `${minutes}m`
}
