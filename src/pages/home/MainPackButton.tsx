import { Box, Stack, Typography } from '@mui/material'
import { Button } from '../../components/ui'
import { font, heartPulseAura, ink, packCtaFloat, radius } from '../../design-system'
import type { CollectionPack } from '../../types/note'

export function MainPackButton({ pack, collectionEmoji, mainCanOpen, remainingLabel, cooldownProgress, isLoading, isOpeningPack, onOpen, isRealReader, onResetCooldown, accent, accentMuted, accruedCount = 0 }: {
  pack: CollectionPack | undefined
  collectionEmoji: string
  mainCanOpen: boolean
  remainingLabel: string
  cooldownProgress: number
  isLoading: boolean
  isOpeningPack: boolean
  onOpen: () => void
  isRealReader: boolean
  onResetCooldown: () => void
  accent: string
  accentMuted: string
  accruedCount?: number
}) {
  const hasAccrued = mainCanOpen && accruedCount > 1
  return (
    <Stack spacing={1.2} alignItems="center" justifyContent="center" sx={{
      flex: 1,
      minHeight: 390,
      py: 1.2,
      borderRadius: radius.xl,
      background: 'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.18), transparent 44%)',
    }}>
      <Box
        role="button"
        aria-label={`Abrir ${pack?.name ?? 'pacote principal'}`}
        tabIndex={mainCanOpen ? 0 : -1}
        onClick={!isLoading && mainCanOpen && !isOpeningPack ? onOpen : undefined}
        onKeyDown={(event) => {
          if (!isLoading && mainCanOpen && !isOpeningPack && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            onOpen()
          }
        }}
        onMouseDown={(event) => event.preventDefault()}
        sx={{
          width: mainCanOpen ? 214 : 196,
          height: mainCanOpen ? 194 : 184,
          borderRadius: radius.full,
          cursor: mainCanOpen ? 'pointer' : 'default',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'visible',
          boxShadow: 'none',
          transition: 'transform 0.22s ease, box-shadow 0.22s ease',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          animation: mainCanOpen ? `${packCtaFloat} 3.2s ease-in-out infinite` : undefined,
          '&:hover': mainCanOpen ? { transform: 'translateY(-3px) scale(1.025)' } : {},
          '&:active': mainCanOpen ? { transform: 'scale(0.98)' } : {},
        }}
      >
        {mainCanOpen ? (
          <Box sx={{ width: 184, height: 184, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
            <Box
              component="svg"
              viewBox="0 0 24 24"
              sx={{
                position: 'absolute',
                inset: -12,
                width: 'calc(100% + 24px)',
                height: 'calc(100% + 24px)',
                color: 'rgba(244,63,94,0.34)',
                transformOrigin: '50% 50%',
                animation: `${heartPulseAura} 1.85s ease-out infinite`,
                pointerEvents: 'none',
              }}
            >
              <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
            </Box>
            <Box
              component="svg"
              viewBox="0 0 24 24"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                color: '#dc2626',
                filter: 'drop-shadow(0 24px 34px rgba(225,29,72,0.42))',
              }}
            >
              <defs>
                <linearGradient id="main-pack-heart" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="42%" stopColor="#ef4444" />
                  <stop offset="74%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
              </defs>
              <path fill="url(#main-pack-heart)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
              <path fill="rgba(255,255,255,0.42)" d="M7.4 5.25c-1.9 0-3.2 1.42-3.2 3.28 0 .68.14 1.34.43 1.98.16.36.67.32.78-.06.55-1.91 1.72-3.35 3.46-4.23.42-.21.27-.97-.2-.97H7.4z" />
            </Box>
            <Typography sx={{ position: 'relative', zIndex: 1, fontSize: '4.1rem', lineHeight: 1, transform: 'translateY(-3px)', filter: 'drop-shadow(0 5px 12px rgba(0,0,0,0.18))' }}>
              {pack?.emoji ?? collectionEmoji}
            </Typography>
            {hasAccrued && (
              <Box sx={{
                position: 'absolute', top: 4, right: 4, zIndex: 2, minWidth: 28, height: 28, borderRadius: radius.full,
                background: '#dc2626', border: '2px solid #fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', px: 0.6, boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
              }}>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {accruedCount}x
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ width: 176, height: 176, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', pointerEvents: 'none' }}>
            <Box
              component="svg"
              viewBox="0 0 24 24"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                color: 'rgba(255,255,255,0.54)',
                filter: `drop-shadow(0 16px 28px ${accent}24)`,
              }}
            >
              <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
              <path
                fill={accent}
                opacity="0.22"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                style={{ transformOrigin: 'center', transform: `scale(${0.72 + cooldownProgress * 0.28})` }}
              />
            </Box>
            <Stack spacing={0.1} alignItems="center" sx={{ position: 'relative', zIndex: 1, transform: 'translateY(-4px)' }}>
              <Typography sx={{ fontSize: '1.9rem', lineHeight: 1 }}>⏳</Typography>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 900, fontSize: '1.02rem', color: accent, lineHeight: 1.1 }}>
                {remainingLabel}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: accentMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                restante
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
      {mainCanOpen && (
        <Stack spacing={0.2} alignItems="center" sx={{
          mt: -0.35, px: 1.6, py: 0.7, borderRadius: radius.xl,
          background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.5)',
          backdropFilter: 'blur(12px)', boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
        }}>
          <Typography sx={{ color: ink.primary, fontFamily: font.serif, fontSize: '1rem', fontWeight: 850, lineHeight: 1.1 }}>
            {hasAccrued ? `${accruedCount} pacotinhos disponíveis` : 'Pacotinho disponível'}
          </Typography>
          <Typography sx={{ color: ink.secondary, fontSize: '0.72rem', fontWeight: 750, lineHeight: 1.2 }}>
            toque no coração
          </Typography>
        </Stack>
      )}
      {!mainCanOpen && (
        <Stack spacing={0.45} alignItems="center" sx={{
          px: 1.6, py: 0.9, borderRadius: radius.xl,
          background: 'rgba(255,255,255,0.34)', border: '1px solid rgba(255,255,255,0.44)',
          backdropFilter: 'blur(12px)',
        }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1rem', color: ink.primary, textAlign: 'center', maxWidth: 280, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            Novo pacotinho em
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: ink.secondary, textAlign: 'center', maxWidth: 280, lineHeight: 1.45 }}>
            {remainingLabel}
          </Typography>
          {!isRealReader && (
            <Button
              variant="ghost"
              onClick={onResetCooldown}
              sx={{ mt: 0.45, py: 0.58, px: 1.25, fontSize: '0.72rem', background: 'rgba(255,255,255,0.42)', color: ink.primary, border: '1px solid rgba(255,255,255,0.48)', '&:hover': { background: 'rgba(255,255,255,0.56)' } }}
            >
              Resetar cooldown
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  )
}
