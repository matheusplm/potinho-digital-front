import { keyframes } from '@emotion/react'
import { Box, Dialog, Stack, Typography, Zoom } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { forwardRef } from 'react'
import type { ReactElement, Ref } from 'react'
import { Button } from '../ui'
import { useBackground } from '../../context/BackgroundContext'
import { colors, font, radius } from '../../design-system'
import type { UserNotification } from '../../types/note'
import { timeAgo } from '../../utils/timeAgo'
import { withAlpha } from '../../utils/colorUtils'

export const AUTO_CLOSE_MS = 8000
const VISIBLE = 2

const Pop = forwardRef(function Pop(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Zoom ref={ref} {...props} />
})

const heroPop = keyframes`
  0%   { transform: scale(0.2) rotate(-25deg); opacity: 0; }
  60%  { transform: scale(1.3) rotate(10deg); opacity: 1; }
  80%  { transform: scale(0.94) rotate(-4deg); }
  100% { transform: scale(1) rotate(0deg); }
`

const confettiBurst = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
  15%  { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1); opacity: 0; }
`

const drain = keyframes`
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
`

const CONFETTI = ['🎉', '✨', '💖', '⭐', '💫', '🎊', '💕', '✨']
const PIECES = CONFETTI.map((emoji, i) => {
  const angle = (i / CONFETTI.length) * Math.PI * 2
  const distance = 54 + (i % 3) * 14
  return { emoji, dx: Math.round(Math.cos(angle) * distance), dy: Math.round(Math.sin(angle) * distance * 0.75), rot: (i % 2 ? 1 : -1) * (90 + i * 20), delay: 0.15 + (i % 4) * 0.04 }
})

function kindHeadline(notification: UserNotification): string {
  if (notification.kind === 'bonus_pack') {
    const opens = Number(notification.payload.opens ?? 0)
    const packName = String(notification.payload.packName ?? 'pacotinho')
    const packEmoji = String(notification.payload.packEmoji ?? '🎁')
    return `${packEmoji} ${opens} abertura${opens === 1 ? '' : 's'} de "${packName}"`
  }
  const count = Number(notification.payload.noteCount ?? 0)
  return `💌 ${count} bilhete${count === 1 ? '' : 's'} novo${count === 1 ? '' : 's'}`
}

function heroEmoji(notifications: UserNotification[]): string {
  if (notifications.length > 1) return '🎉'
  return notifications[0]?.kind === 'bonus_pack' ? '🎁' : '💌'
}

export function AnnouncementModal({ notifications, onClose, onSeeAll }: {
  notifications: UserNotification[]
  onClose: () => void
  onSeeAll: () => void
}) {
  const { theme } = useBackground()
  const open = notifications.length > 0
  const visible = notifications.slice(0, VISIBLE)
  const hidden = notifications.length - visible.length

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slots={{ transition: Pop }}
      aria-label="Novidades pra você"
      slotProps={{
        backdrop: { sx: { background: 'rgba(15,23,42,0.28)', backdropFilter: 'blur(3px)' } },
        paper: {
          sx: {
            mx: 2, borderRadius: radius.xl, overflow: 'hidden', position: 'relative',
            background: 'var(--pd-surface-paper)', backdropFilter: 'blur(24px)',
            border: `1.5px solid ${withAlpha(theme.accent, 30)}`,
            boxShadow: `0 24px 60px ${withAlpha(theme.accent, 22)}`,
            '&:hover [data-drain], &:focus-within [data-drain]': { animationPlayState: 'paused' },
          },
        },
      }}
    >
      <Stack alignItems="center" spacing={0.6} sx={{ pt: 2.6, px: 2.4, textAlign: 'center' }}>
        <Box sx={{ position: 'relative', width: 64, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {PIECES.map((piece, i) => (
            <Box key={i} aria-hidden sx={{
              position: 'absolute', left: '50%', top: '50%', fontSize: '0.95rem', lineHeight: 1, pointerEvents: 'none', opacity: 0,
              '--dx': `${piece.dx}px`, '--dy': `${piece.dy}px`, '--rot': `${piece.rot}deg`,
              animation: `${confettiBurst} 1.1s cubic-bezier(.15,.75,.3,1) ${piece.delay}s both`,
              '@media (prefers-reduced-motion: reduce)': { display: 'none' },
            }}>
              {piece.emoji}
            </Box>
          ))}
          <Typography component="span" sx={{
            fontSize: '2.6rem', lineHeight: 1, display: 'inline-block',
            filter: `drop-shadow(0 6px 14px ${withAlpha(theme.accent, 35)})`,
            animation: `${heroPop} 0.6s cubic-bezier(.2,.9,.25,1.3) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}>
            {heroEmoji(notifications)}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.3rem', color: colors.text.primary, lineHeight: 1.15 }}>
          {notifications.length > 1 ? `${notifications.length} novidades pra você!` : 'Chegou novidade!'}
        </Typography>
      </Stack>

      <Stack spacing={1} sx={{ px: 2, pt: 1.6 }}>
        {visible.map((notification) => (
          <Box key={`${notification.collectionId}-${notification.notificationId}`} sx={{
            p: 1.4, borderRadius: radius.lg, background: withAlpha(theme.accent, 7), border: `1px solid ${withAlpha(theme.accent, 18)}`,
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }}>
              <Typography variant="xs" sx={{ flex: 1, minWidth: 0, fontWeight: 800, color: colors.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {notification.collectionEmoji} {notification.collectionName}
              </Typography>
              <Typography variant="xs" sx={{ color: colors.text.muted, flexShrink: 0 }}>{timeAgo(notification.createdAt)}</Typography>
            </Stack>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.98rem', color: colors.text.primary, lineHeight: 1.3 }}>
              {kindHeadline(notification)}
            </Typography>
            {notification.message && (
              <Typography variant="md" sx={{
                mt: 0.4, color: colors.text.secondary, lineHeight: 1.45, overflowWrap: 'anywhere',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {notification.message}
              </Typography>
            )}
          </Box>
        ))}
        {hidden > 0 && (
          <Typography variant="sm" sx={{ textAlign: 'center', color: colors.text.muted, fontWeight: 700 }}>
            + {hidden} {hidden === 1 ? 'outra' : 'outras'} em Novidades
          </Typography>
        )}
      </Stack>

      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} sx={{ px: 2, pt: 1.8, pb: 2.2, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1, py: 1, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
          Continuar navegando
        </Button>
        <Button variant="primary" onClick={onSeeAll} sx={{ flex: 1, py: 1, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
          Ver novidades
        </Button>
      </Stack>

      <Box
        key={notifications.map((n) => n.notificationId).join(',')}
        data-drain=""
        onAnimationEnd={onClose}
        sx={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, transformOrigin: 'left center',
          background: theme.accent, opacity: 0.75,
          animation: `${drain} ${AUTO_CLOSE_MS}ms linear forwards`,
        }}
      />
    </Dialog>
  )
}
