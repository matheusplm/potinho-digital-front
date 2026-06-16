import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

type PushState = 'unsupported' | 'default' | 'granted' | 'denied'

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

async function getSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    return (await navigator.serviceWorker.getRegistration('/sw.js'))
      ?? await navigator.serviceWorker.register('/sw.js')
  } catch {
    return null
  }
}

export function usePush() {
  const [state, setState] = useState<PushState>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    const permission = Notification.permission as PushState
    setState(permission)

    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
      if (!vapidKey) return
      getSwRegistration().then(async (reg) => {
        if (!reg) return
        const existing = await reg.pushManager.getSubscription()
        if (existing) return
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
        })
        const json = sub.toJSON()
        if (json.endpoint && json.keys) {
          await api.subscribePush({ endpoint: json.endpoint, keys: json.keys as { p256dh: string; auth: string } })
        }
      }).catch(() => {})
    }
  }, [])

  const enable = useCallback(async () => {
    if (loading || state !== 'default') return
    setLoading(true)
    try {
      const reg = await getSwRegistration()
      if (!reg) return

      const permission = await Notification.requestPermission()
      setState(permission as PushState)
      if (permission !== 'granted') return

      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
      if (!vapidKey) return

      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
      })

      const json = sub.toJSON()
      if (json.endpoint && json.keys) {
        await api.subscribePush({
          endpoint: json.endpoint,
          keys: json.keys as { p256dh: string; auth: string },
        })
      }
    } finally {
      setLoading(false)
    }
  }, [loading, state])

  const disable = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await api.unsubscribePush(sub.endpoint).catch(() => {})
    await sub.unsubscribe()
    setState('default')
  }, [])

  return { state, loading, enable, disable }
}
