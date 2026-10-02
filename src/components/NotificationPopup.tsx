import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnnouncementModal } from './collection/AnnouncementModal'
import { useReader } from '../context/ReaderContext'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import { useMarkNotificationReadMutation, useMyNotificationsQuery, useNotificationsWatcher } from '../hooks/useNotes'
import { useTour } from '../tour/TourContext'
import type { UserNotification } from '../types/note'

const QUIET_ROUTES = /^\/(notificacoes|convite)(\/|$)/
const CHECK_EVERY_MS = 60_000
const CHECK_EVERY_MS_OUTSIDE_READER = 5 * 60_000
const RETRY_WHILE_BUSY_MS = 3_000

const keyOf = (notification: UserNotification) => `${notification.collectionId}:${notification.notificationId}`
const newestFirst = (a: UserNotification, b: UserNotification) => b.createdAt.localeCompare(a.createdAt)

function anotherDialogOpen() {
  return !!document.querySelector('.MuiDialog-root, .MuiDrawer-root')
}

export function NotificationPopup() {
  const { user, persona } = useUser()
  const { isActive: simulating } = useSimulation()
  const { setActiveCollectionId } = useReader()
  const tour = useTour()
  const location = useLocation()
  const navigate = useNavigate()
  const enabled = !!user && persona === 'reader' && !simulating
  useNotificationsWatcher(!!user && !simulating, persona === 'reader' ? CHECK_EVERY_MS : CHECK_EVERY_MS_OUTSIDE_READER)
  const { data: notifications = [] } = useMyNotificationsQuery({ enabled })
  const markRead = useMarkNotificationReadMutation()
  const [shown, setShown] = useState<UserNotification[]>([])
  const [retryTick, setRetryTick] = useState(0)
  const handled = useRef(new Set<string>())

  const quietRoute = QUIET_ROUTES.test(location.pathname)

  useEffect(() => {
    if (!enabled || shown.length > 0 || quietRoute || tour.step) return
    const fresh = notifications.filter((n) => n.inApp && !n.readAt && !handled.current.has(keyOf(n)))
    if (fresh.length === 0) return
    if (anotherDialogOpen()) {
      const timer = window.setTimeout(() => setRetryTick((tick) => tick + 1), RETRY_WHILE_BUSY_MS)
      return () => window.clearTimeout(timer)
    }
    setShown([...fresh].sort(newestFirst))
  }, [enabled, notifications, shown.length, quietRoute, tour.step, retryTick, location.pathname])

  function dismiss() {
    if (shown.length === 0) return
    for (const notification of shown) {
      handled.current.add(keyOf(notification))
      markRead.mutate({ cid: notification.collectionId, notificationId: notification.notificationId })
    }
    if (new Set(shown.map((n) => n.collectionId)).size === 1) setActiveCollectionId(shown[0].collectionId)
    setShown([])
  }

  function seeAll() {
    dismiss()
    navigate('/notificacoes')
  }

  return <AnnouncementModal notifications={shown} onClose={dismiss} onSeeAll={seeAll} />
}
