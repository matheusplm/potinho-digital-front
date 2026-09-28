import { api } from './api'
import { isNotificationOptedOut } from '../utils/notifications'

const ENDPOINT_KEY = 'pd-push-endpoint'

function rememberEndpoint(endpoint: string | null) {
  try {
    if (endpoint) localStorage.setItem(ENDPOINT_KEY, endpoint)
    else localStorage.removeItem(ENDPOINT_KEY)
  } catch {
    return
  }
}

function rememberedEndpoint(): string | null {
  try {
    return localStorage.getItem(ENDPOINT_KEY)
  } catch {
    return null
  }
}

export function pushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

export async function registerPushSubscription(subscription: PushSubscription): Promise<void> {
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys) return
  await api.subscribePush({ endpoint: json.endpoint, keys: json.keys as { p256dh: string; auth: string } })
  rememberEndpoint(json.endpoint)
}

export async function attachExistingPush(): Promise<void> {
  if (!pushSupported() || Notification.permission !== 'granted' || isNotificationOptedOut()) return
  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  const subscription = await registration?.pushManager.getSubscription()
  if (subscription) await registerPushSubscription(subscription)
}

export function detachPushFromSession(): void {
  const endpoint = rememberedEndpoint()
  if (endpoint) api.unsubscribePushQuietly(endpoint)
  rememberEndpoint(null)
}

export function forgetPushEndpoint(): void {
  rememberEndpoint(null)
}
