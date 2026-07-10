import NotificationsIcon from '@mui/icons-material/Notifications'
import { Box, Stack, Typography } from '@mui/material'
import { Card, LoadingState, ScrollablePage } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { useMarkNotificationReadMutation, useMyNotificationsQuery } from '../hooks/useNotes'
import { colors, fadeIn, font, radius } from '../design-system'
import type { UserNotification } from '../types/note'

function kindLabel(notification: UserNotification): string {
  if (notification.kind === 'bonus_pack') {
    const opens = Number(notification.payload.opens ?? 0)
    const packName = String(notification.payload.packName ?? 'pacotinho')
    const packEmoji = String(notification.payload.packEmoji ?? '🎁')
    return `${packEmoji} ${opens} abertura${opens === 1 ? '' : 's'} de "${packName}"`
  }
  const count = Number(notification.payload.noteCount ?? 0)
  return `💌 ${count} bilhete${count === 1 ? '' : 's'} novo${count === 1 ? '' : 's'} lançado${count === 1 ? '' : 's'}`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function NotificationsPage() {
  const { theme } = useBackground()
  const { data: notifications = [], isLoading } = useMyNotificationsQuery()
  const markRead = useMarkNotificationReadMutation()

  const unreadCount = notifications.filter((n) => !n.readAt).length

  function handleOpen(notification: UserNotification) {
    if (!notification.readAt) {
      markRead.mutate({ cid: notification.collectionId, notificationId: notification.notificationId })
    }
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <NotificationsIcon sx={{ position: 'absolute', bottom: -80, right: -70, fontSize: 460, color: 'rgba(29,78,216,0.05)', pointerEvents: 'none' }} />
      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack spacing={0.3} sx={{ mb: 2.2 }}>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
            🔔 Notificações
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: theme.textOnBg, lineHeight: 1.1 }}>
            Suas novidades
          </Typography>
          {unreadCount > 0 && (
            <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.3 }}>
              {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
            </Typography>
          )}
        </Stack>

        {isLoading && <LoadingState compact label="Carregando notificações" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

        {!isLoading && notifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontSize: '2.4rem', mb: 1 }}>📭</Typography>
            <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: theme.textOnBg, mb: 0.5 }}>
              Nada por aqui ainda
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>
              Quando algo novo chegar nas suas coleções, aparece aqui
            </Typography>
          </Box>
        )}

        <Stack spacing={1.2}>
          {notifications.map((notification) => {
            const unread = !notification.readAt
            return (
              <Card
                key={`${notification.collectionId}-${notification.notificationId}`}
                accent={unread ? theme.accent : undefined}
                onClick={() => handleOpen(notification)}
                sx={{
                  p: 1.8, borderRadius: radius.xl, cursor: unread ? 'pointer' : 'default',
                  ...(unread
                    ? { border: `1.5px solid ${theme.accent}55`, boxShadow: `0 10px 30px ${theme.accent}22` }
                    : { opacity: 0.78 }),
                  transition: 'all 0.16s ease',
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {unread && <Box sx={{ width: 9, height: 9, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />}
                    <Typography sx={{ flex: 1, fontSize: '0.74rem', fontWeight: 800, color: colors.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {notification.collectionEmoji} {notification.collectionName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: colors.text.muted, flexShrink: 0 }}>
                      {formatDateTime(notification.createdAt)}
                    </Typography>
                  </Stack>

                  <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.95rem', color: colors.text.primary, lineHeight: 1.3 }}>
                    {kindLabel(notification)}
                  </Typography>

                  {notification.imageUrl && (
                    <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', maxHeight: 180 }}>
                      <Box component="img" src={notification.imageUrl} alt="" sx={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                    </Box>
                  )}

                  {notification.message && (
                    <Typography sx={{ fontSize: '0.86rem', color: colors.text.secondary, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {notification.message}
                    </Typography>
                  )}
                </Stack>
              </Card>
            )
          })}
        </Stack>
      </ScrollablePage>
    </Box>
  )
}
