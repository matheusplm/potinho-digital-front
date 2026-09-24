const OPT_OUT_KEY = 'potinho-notif'

export function isNotificationOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === 'off'
  } catch {
    return false
  }
}

export function setNotificationOptOut(optedOut: boolean) {
  try {
    if (optedOut) localStorage.setItem(OPT_OUT_KEY, 'off')
    else localStorage.removeItem(OPT_OUT_KEY)
  } catch {
    void 0
  }
}

export async function showLocalNotification(title: string, body: string) {
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined
    if (reg) await reg.showNotification(title, { body, icon: '/potinho-icon.svg' })
    else new Notification(title, { body })
  } catch {
    void 0
  }
}
