import { keyframes } from '@emotion/react'
import { Box, Dialog, Slide, Stack, Typography } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { forwardRef, useMemo } from 'react'
import type { ReactElement, Ref } from 'react'
import { Button } from '../ui'
import { useBackground } from '../../context/BackgroundContext'
import { colors, font, radius, clipOverflow } from '../../design-system'
import type { UserNotification } from '../../types/note'

const SlideUp = forwardRef(function SlideUp(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const heroPop = keyframes`
  0%   { transform: scale(0.2) rotate(-25deg); opacity: 0; }
  55%  { transform: scale(1.35) rotate(10deg); opacity: 1; }
  75%  { transform: scale(0.92) rotate(-4deg); }
  100% { transform: scale(1) rotate(0deg); }
`

const heroBob = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-8px) rotate(-6deg); }
`

const confettiBurst = keyframes`
  0%   { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.4); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1); opacity: 0; }
`

const cardRise = keyframes`
  from { transform: translateY(24px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
`

const CONFETTI = ['🎉', '💌', '✨', '💖', '🎁', '⭐', '💫', '🌸', '🎊', '💝', '✨', '💕', '🎉', '⭐', '💌', '🎁']

const PIECES = CONFETTI.map((emoji, i) => {
  const angle = (i / CONFETTI.length) * Math.PI * 2 + (i % 2) * 0.25
  const distance = 120 + (i % 4) * 34
  return {
    emoji,
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance * 0.8 - 30),
    rot: (i % 2 ? 1 : -1) * (120 + i * 17),
    size: 1 + (i % 3) * 0.3,
    delay: 0.25 + (i % 5) * 0.04,
  }
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

function heroEmoji(notifications: UserNotification[]): string {
  if (notifications.length > 1) return '🎉'
  return notifications[0]?.kind === 'bonus_pack' ? '🎁' : '💌'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function AnnouncementModal({ notifications, onClose, onSeeAll }: {
  notifications: UserNotification[]
  onClose: () => void
  onSeeAll?: () => void
}) {
  const { theme } = useBackground()
  const open = notifications.length > 0
  const first = notifications[0]
  const many = notifications.length > 1
  const collections = useMemo(() => new Set(notifications.map((n) => n.collectionId)).size, [notifications])
  const mixed = collections > 1

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slots={{ transition: SlideUp }}
      slotProps={{ paper: { sx: { background: theme.gradient } } }}
      aria-label="Novidades pra você"
    >
      <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2.5, py: 4, position: 'relative', ...clipOverflow }}>
        <Box sx={{ position: 'absolute', top: -70, right: -70, fontSize: 260, opacity: theme.isDark ? 0.05 : 0.08, pointerEvents: 'none', userSelect: 'none' }}>
          {mixed ? '🎉' : first?.collectionEmoji ?? '💌'}
        </Box>

        <Stack spacing={1} alignItems="center" sx={{ mt: { xs: 3, md: 6 }, mb: 3, textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', width: 120, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {PIECES.map((piece, i) => (
              <Box key={i} aria-hidden sx={{
                position: 'absolute', left: '50%', top: '50%', fontSize: `${piece.size}rem`, lineHeight: 1, pointerEvents: 'none',
                '--dx': `${piece.dx}px`, '--dy': `${piece.dy}px`, '--rot': `${piece.rot}deg`,
                opacity: 0,
                animation: `${confettiBurst} 1.5s cubic-bezier(.15,.75,.3,1) ${piece.delay}s both`,
                '@media (prefers-reduced-motion: reduce)': { display: 'none' },
              }}>
                {piece.emoji}
              </Box>
            ))}
            <Typography component="span" sx={{
              fontSize: '4.6rem', lineHeight: 1, display: 'inline-block',
              filter: `drop-shadow(0 10px 22px ${theme.accent}55)`,
              animation: `${heroPop} 0.75s cubic-bezier(.2,.9,.25,1.3) both, ${heroBob} 2.6s ease-in-out 0.9s infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}>
              {heroEmoji(notifications)}
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: { xs: '1.8rem', md: '2.3rem' }, color: theme.textOnBg, letterSpacing: -0.5, lineHeight: 1.1 }}>
            {many ? `${notifications.length} novidades pra você!` : 'Chegou novidade pra você!'}
          </Typography>
          <Typography variant="md" sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            fontWeight: 700, color: theme.textOnBgMuted,
            bgcolor: `${theme.accent}14`, border: `1px solid ${theme.accent}28`,
            borderRadius: radius.full, px: 1.2, py: 0.3,
          }}>
            {mixed ? `de ${collections} coleções` : `${first?.collectionEmoji ?? ''} ${first?.collectionName ?? ''}`}
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ width: '100%', maxWidth: 480, flex: 1, zIndex: 1 }}>
          {notifications.map((notification, index) => (
            <Box key={`${notification.collectionId}-${notification.notificationId}`} sx={{
              p: 2.2, borderRadius: radius.xl, background: 'var(--pd-surface-paper)',
              border: `1.5px solid ${theme.accent}30`,
              boxShadow: `0 14px 40px ${theme.accent}${theme.isDark ? '30' : '22'}`,
              animation: `${cardRise} 0.5s cubic-bezier(.2,.9,.3,1) ${0.45 + index * 0.12}s both`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}>
              <Stack spacing={1.2}>
                {mixed && (
                  <Typography variant="sm" sx={{ fontWeight: 800, color: colors.text.muted }}>
                    {notification.collectionEmoji} {notification.collectionName}
                  </Typography>
                )}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ flex: 1, fontFamily: font.serif, fontWeight: 800, fontSize: '1.05rem', color: colors.text.primary, lineHeight: 1.3 }}>
                    {kindHeadline(notification)}
                  </Typography>
                  <Typography variant="xs" sx={{ fontWeight: 700, color: colors.text.muted, flexShrink: 0 }}>
                    {formatDate(notification.createdAt)}
                  </Typography>
                </Stack>

                {notification.imageUrl && (
                  <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', maxHeight: 260 }}>
                    <Box component="img" src={notification.imageUrl} alt="" sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
                  </Box>
                )}

                {notification.message && (
                  <Typography variant="xl" sx={{ color: colors.text.secondary, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {notification.message}
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>

        <Stack spacing={1} sx={{ width: '100%', maxWidth: 480, pt: 3, pb: 1, zIndex: 1 }}>
          <Button variant="primary" fullWidth onClick={onClose} sx={{ py: 1.2, fontSize: '0.95rem' }}>
            Bora ver! 💙
          </Button>
          {onSeeAll && (
            <Button variant="ghost" fullWidth onClick={onSeeAll} sx={{ py: 1, fontSize: '0.88rem' }}>
              Ver todas as novidades
            </Button>
          )}
        </Stack>
      </Box>
    </Dialog>
  )
}
