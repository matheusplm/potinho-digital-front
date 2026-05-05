import { useEffect, useRef } from 'react'
import { usePackStatusQuery } from './useNotes'

export function usePackNotifications(enabled: boolean) {
  const packStatusQuery = usePackStatusQuery()
  const previousCanOpenRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const status = packStatusQuery.data

    if (!status) {
      return
    }

    const previousCanOpen = previousCanOpenRef.current

    if (
      previousCanOpen === false &&
      status.canOpen &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification('Pacotinho liberado!', {
        body: 'Seu novo pacotinho do dia ja esta disponivel.',
      })
    }

    previousCanOpenRef.current = status.canOpen
  }, [enabled, packStatusQuery.data])

  return packStatusQuery
}
