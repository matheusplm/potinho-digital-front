import { useState } from 'react'
import { usePush } from './usePush'
import { isNotificationOptedOut, setNotificationOptOut, showLocalNotification } from '../utils/notifications'

export function useNotificationToggle() {
  const { enable, disable } = usePush()
  const supported = typeof Notification !== 'undefined'
  const status = supported ? Notification.permission : 'denied'
  const [enabled, setEnabled] = useState(() => supported && Notification.permission === 'granted' && !isNotificationOptedOut())

  async function toggle() {
    if (!supported || Notification.permission === 'denied') return
    if (enabled) {
      setNotificationOptOut(true)
      setEnabled(false)
      await disable()
      return
    }
    setNotificationOptOut(false)
    await enable()
    if (Notification.permission === 'granted') {
      setEnabled(true)
      void showLocalNotification('Potinho Digital 🎁', 'Notificações ativadas!')
    }
  }

  return { supported, status, enabled, toggle }
}
