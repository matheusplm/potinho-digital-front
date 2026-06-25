const PACK_COOLDOWN_KEY = 'potinho-pack-cooldowns'
const PACK_STATUS_ENDPOINT_KEY = 'potinho-pack-status-missing'

function readPackCooldownStore(): Record<string, Record<string, string>> {
  try {
    return JSON.parse(localStorage.getItem(PACK_COOLDOWN_KEY) ?? '{}') as Record<string, Record<string, string>>
  } catch {
    return {}
  }
}

export function loadPackCooldowns(cid: string): Record<string, string> {
  if (!cid) return {}
  const stored = readPackCooldownStore()[cid] ?? {}
  const now = Date.now()
  return Object.fromEntries(
    Object.entries(stored).filter(([, availableAt]) => Date.parse(availableAt) > now),
  )
}

export function savePackCooldowns(cid: string, cooldowns: Record<string, string>) {
  if (!cid) return
  const store = readPackCooldownStore()
  const now = Date.now()
  const active = Object.fromEntries(
    Object.entries(cooldowns).filter(([, availableAt]) => Date.parse(availableAt) > now),
  )
  if (Object.keys(active).length > 0) store[cid] = active
  else delete store[cid]
  try {
    localStorage.setItem(PACK_COOLDOWN_KEY, JSON.stringify(store))
  } catch {
    void 0
  }
}

export function loadPackStatusEndpointMissing(cid: string): boolean {
  if (!cid) return false
  try {
    const store = JSON.parse(localStorage.getItem(PACK_STATUS_ENDPOINT_KEY) ?? '{}') as Record<string, boolean>
    return store[cid] === true
  } catch {
    return false
  }
}

export function savePackStatusEndpointMissing(cid: string) {
  if (!cid) return
  try {
    const store = JSON.parse(localStorage.getItem(PACK_STATUS_ENDPOINT_KEY) ?? '{}') as Record<string, boolean>
    store[cid] = true
    localStorage.setItem(PACK_STATUS_ENDPOINT_KEY, JSON.stringify(store))
  } catch {
    void 0
  }
}

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
