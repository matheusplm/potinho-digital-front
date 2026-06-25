import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'potinho-mail-cooldowns'

type Store = Record<string, number>

function loadStore(): Store {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

export function recordMailSent(key: string) {
  const store = loadStore()
  store[key] = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function cooldownRemainingMs(key: string, cooldownMs: number): number {
  const sentAt = loadStore()[key]
  if (!sentAt) return 0
  return Math.max(0, cooldownMs - (Date.now() - sentAt))
}

function fmtMs(ms: number): string {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0 && sec > 0) return `${m}min ${sec}s`
  if (m > 0) return `${m}min`
  return `${sec}s`
}

export function useCooldown(key: string, cooldownMs: number) {
  const [remaining, setRemaining] = useState(() => cooldownRemainingMs(key, cooldownMs))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const active = remaining > 0

  useEffect(() => {
    if (!active) return
    intervalRef.current = setInterval(() => {
      const r = cooldownRemainingMs(key, cooldownMs)
      setRemaining(r)
      if (r <= 0 && intervalRef.current) clearInterval(intervalRef.current)
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [active, key, cooldownMs])

  const record = () => {
    recordMailSent(key)
    setRemaining(cooldownMs)
  }

  return { inCooldown: active, label: active ? fmtMs(remaining) : '', record }
}
