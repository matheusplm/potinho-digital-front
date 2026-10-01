import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnnouncementModal } from './collection/AnnouncementModal'
import { useReader } from '../context/ReaderContext'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import { useMarkNotificationReadMutation, useMyNotificationsQuery } from '../hooks/useNotes'
import { useTour } from '../tour/TourContext'
import type { UserNotification } from '../types/note'

const QUIET_ROUTES = /^\/(notificacoes|convite)(\/|$)/

const keyOf = (notification: UserNotification) => `${notification.collectionId}:${notification.notificationId}`

export function NotificationPopup() {
  const { user, persona } = useUser()
  const { isActive: simulating } = useSimulation()
  const { setActiveCollectionId } = useReader()
  const tour = useTour()
  const location = useLocation()
  const navigate = useNavigate()
  const enabled = !!user && persona === 'reader' && !simulating
  const { data: notifications = [], isSuccess } = useMyNotificationsQuery({ enabled })
  const markRead = useMarkNotificationReadMutation()
  const [shown, setShown] = useState<UserNotification[]>([])
  const handled = useRef(new Set<string>())
  const checkedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !isSuccess || shown.length > 0) return
    if (checkedPath.current === location.pathname) return
    checkedPath.current = location.pathname
    if (QUIET_ROUTES.test(location.pathname) || tour.step) return
    const fresh = notifications.filter((n) => n.inApp && !n.readAt && !handled.current.has(keyOf(n)))
    if (fresh.length > 0) setShown(fresh)
  }, [enabled, isSuccess, location.pathname, notifications, shown.length, tour.step])

  useEffect(() => {
    if (!enabled) checkedPath.current = null
  }, [enabled])

  function dismiss() {
    for (const notification of shown) {
      handled.current.add(keyOf(notification))
      markRead.mutate({ cid: notification.collectionId, notificationId: notification.notificationId })
    }
    const collections = new Set(shown.map((n) => n.collectionId))
    if (collections.size === 1) setActiveCollectionId(shown[0].collectionId)
    setShown([])
  }

  function seeAll() {
    dismiss()
    navigate('/notificacoes')
  }

  return <AnnouncementModal notifications={shown} onClose={dismiss} onSeeAll={seeAll} />
}
