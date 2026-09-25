import { useSyncExternalStore } from 'react'
import { api } from './api'

interface AdminSession {
  token: string
  expiresAt: number
}

const EXPIRY_MARGIN_MS = 5_000

let current: AdminSession | null = null
let expiryTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setAdminSession(token: string, expiresAt: string) {
  clearTimeout(expiryTimer)
  const expires = Date.parse(expiresAt)
  current = { token, expiresAt: expires }
  expiryTimer = setTimeout(() => clearAdminSession(false), Math.max(0, expires - Date.now() - EXPIRY_MARGIN_MS))
  emit()
}

export function clearAdminSession(revoke: boolean) {
  const session = current
  clearTimeout(expiryTimer)
  if (!session) return
  current = null
  if (revoke) void api.revokeAdminSession(session.token)
  emit()
}

export function useAdminSession(): AdminSession | null {
  return useSyncExternalStore(subscribe, () => current, () => null)
}
