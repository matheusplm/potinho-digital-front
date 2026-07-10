import { Box, Dialog, Slide, Stack, Typography } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Button } from '../ui'
import { useBackground } from '../../context/BackgroundContext'
import { colors, font, radius } from '../../design-system'
import type { UserNotification } from '../../types/note'

const SlideUp = forwardRef(function SlideUp(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

function kindHeadline(notification: UserNotification): string {
  if (notification.kind === 'bonus_pack') {
    const opens = Number(notification.payload.opens ?? 0)
    const packName = String(notification.payload.packName ?? 'pacotinho')
    const packEmoji = String(notification.payload.packEmoji ?? '🎁')
    return `${packEmoji} ${opens} abertura${opens === 1 ? '' : 's'} de "${packName}" pra você!`
  }
  const count = Number(notification.payload.noteCount ?? 0)
  return `💌 ${count} bilhete${count === 1 ? '' : 's'} novo${count === 1 ? '' : 's'} na coleção!`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function AnnouncementModal({ notifications, onClose }: {
  notifications: UserNotification[]
  onClose: () => void
}) {
  const { theme } = useBackground()
  const open = notifications.length > 0
  const first = notifications[0]
  const many = notifications.length > 1

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slots={{ transition: SlideUp }}
      slotProps={{ paper: { sx: { background: theme.gradient } } }}
    >
      <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2.5, py: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -70, right: -70, fontSize: 260, opacity: theme.isDark ? 0.05 : 0.08, pointerEvents: 'none', userSelect: 'none' }}>
          {first?.collectionEmoji ?? '💌'}
        </Box>

        <Stack spacing={1} alignItems="center" sx={{ mt: { xs: 3, md: 6 }, mb: 3, textAlign: 'center', zIndex: 1 }}>
          <Typography sx={{ fontSize: '3.2rem', lineHeight: 1 }}>🎉</Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, color: theme.textOnBg, letterSpacing: -0.5 }}>
            {many ? `${notifications.length} novidades desde sua última visita!` : 'Tem novidade pra você!'}
          </Typography>
          <Typography sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            fontSize: '0.82rem', fontWeight: 700, color: theme.textOnBgMuted,
            bgcolor: `${theme.accent}14`, border: `1px solid ${theme.accent}28`,
            borderRadius: radius.full, px: 1.2, py: 0.3,
          }}>
            {first?.collectionEmoji} {first?.collectionName}
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ width: '100%', maxWidth: 480, flex: 1, zIndex: 1 }}>
          {notifications.map((notification) => (
            <Box key={notification.notificationId} sx={{
              p: 2.2, borderRadius: radius.xl, background: 'var(--pd-surface-paper)',
              border: `1.5px solid ${theme.accent}30`,
              boxShadow: `0 14px 40px ${theme.accent}${theme.isDark ? '30' : '22'}`,
            }}>
              <Stack spacing={1.2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ flex: 1, fontFamily: font.serif, fontWeight: 800, fontSize: '1.02rem', color: colors.text.primary, lineHeight: 1.3 }}>
                    {kindHeadline(notification)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: colors.text.muted, flexShrink: 0 }}>
                    {formatDate(notification.createdAt)}
                  </Typography>
                </Stack>

                {notification.imageUrl && (
                  <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', maxHeight: 260 }}>
                    <Box component="img" src={notification.imageUrl} alt="" sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
                  </Box>
                )}

                {notification.message && (
                  <Typography sx={{ fontSize: '0.94rem', color: colors.text.secondary, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {notification.message}
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>

        <Box sx={{ width: '100%', maxWidth: 480, pt: 3, pb: 1, zIndex: 1 }}>
          <Button variant="primary" fullWidth onClick={onClose} sx={{ py: 1.2, fontSize: '0.95rem' }}>
            Bora ver! 💙
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
