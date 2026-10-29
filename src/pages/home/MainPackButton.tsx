import { Box, Stack, Typography } from '@mui/material'
import { Button } from '../../components/ui'
import { colors, font, packCtaFloat } from '../../design-system'
import type { CollectionPack } from '../../types/note'
import { PackIcon } from '../../components/PackIcon'

const INK = '#2a241d'
const SEAL = '#c0392b'

function Envelope({ sealed, children, size }: { sealed: boolean; children?: React.ReactNode; size: number }) {
  const h = size * 0.68
  return (
    <Box sx={{ position: 'relative', width: size, height: h }}>
      <Box component="svg" viewBox="0 0 220 150" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', filter: sealed ? 'drop-shadow(3px 4px 0 rgba(60,42,20,0.14)) drop-shadow(0 14px 18px rgba(60,42,20,0.18))' : 'none' }}>
        <rect x="2" y="2" width="216" height="146" rx="4" fill={sealed ? '#fffdf7' : 'transparent'} stroke={INK} strokeOpacity={sealed ? 0.85 : 0.35} strokeWidth="2" strokeDasharray={sealed ? undefined : '6 5'} />
        <path d="M2 148 L 92 82 M218 148 L 128 82" fill="none" stroke={INK} strokeOpacity={sealed ? 0.25 : 0.18} strokeWidth="1.5" />
        <path d="M3 4 L 110 88 L 217 4" fill={sealed ? '#f3ead8' : 'none'} stroke={INK} strokeOpacity={sealed ? 0.85 : 0.35} strokeWidth="2" strokeLinejoin="round" strokeDasharray={sealed ? undefined : '6 5'} />
      </Box>
      {children}
    </Box>
  )
}

export function MainPackButton({ pack, collectionEmoji, mainCanOpen, remainingLabel, cooldownProgress, isLoading, isOpeningPack, onOpen, onOpenAll, isRealReader, onResetCooldown, accent, accentMuted, accruedCount = 0, compact = false }: {
  pack: CollectionPack | undefined
  collectionEmoji: string
  mainCanOpen: boolean
  remainingLabel: string
  cooldownProgress: number
  isLoading: boolean
  isOpeningPack: boolean
  onOpen: () => void
  onOpenAll?: () => void
  isRealReader: boolean
  onResetCooldown: () => void
  accent: string
  accentMuted: string
  accruedCount?: number
  compact?: boolean
}) {
  const hasAccrued = mainCanOpen && accruedCount > 1
  const size = compact ? 200 : 236
  return (
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: compact ? 260 : 360, py: 1.5 }}>
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
          position: 'relative',
          cursor: mainCanOpen ? 'pointer' : 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          outline: 'none',
          transform: mainCanOpen ? 'rotate(-3deg)' : 'rotate(-1.5deg)',
          transition: 'transform 0.2s ease',
          '&:hover': mainCanOpen ? { transform: 'rotate(-1deg) translateY(-3px)' } : {},
          '&:active': mainCanOpen ? { transform: 'rotate(-2deg) scale(0.98)' } : {},
          '&:focus-visible': { outline: `2px dashed ${INK}`, outlineOffset: 8 },
        }}
      >
        <Box sx={{ animation: mainCanOpen ? `${packCtaFloat} 3.4s ease-in-out infinite` : undefined }}>
          <Envelope sealed={mainCanOpen} size={size}>
            {mainCanOpen ? (
              <Box sx={{
                position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%,-50%)',
                width: size * 0.3, height: size * 0.3, borderRadius: '47% 53% 50% 50% / 52% 48% 52% 48%',
                background: `radial-gradient(circle at 38% 34%, #d4574a, ${SEAL} 60%, #962b20)`,
                boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.08), 1px 2px 0 rgba(60,42,20,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Box sx={{ width: '70%', height: '70%', borderRadius: '50%', border: '1.5px solid rgba(255,240,230,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PackIcon emoji={pack?.emoji ?? collectionEmoji} imageUrl={pack?.imageUrl} size={size * 0.13} />
                </Box>
              </Box>
            ) : (
              <Box sx={{
                position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%) rotate(-12deg)',
                width: size * 0.5, height: size * 0.5, borderRadius: '50%',
                border: `2px solid ${accent}`, outline: `1px solid ${accent}`, outlineOffset: 4,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: accent, opacity: 0.55 + cooldownProgress * 0.4, background: 'rgba(255,253,247,0.6)',
              }}>
                <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', lineHeight: 1 }}>
                  volta em
                </Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.25, textAlign: 'center', px: 0.5 }}>
                  {remainingLabel}
                </Typography>
              </Box>
            )}
          </Envelope>
        </Box>
        {hasAccrued && (
          <Box sx={{
            position: 'absolute', top: -10, right: -12, transform: 'rotate(8deg)',
            px: 0.9, py: 0.2, background: '#fffdf7', border: `1.5px solid ${SEAL}`, color: SEAL,
            fontFamily: font.sans, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em',
          }}>
            {accruedCount}x
          </Box>
        )}
      </Box>

      {mainCanOpen ? (
        <Stack spacing={0.5} alignItems="center">
          <Typography sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: '1.35rem', color: colors.text.primary, lineHeight: 1.1, textAlign: 'center' }}>
            {hasAccrued ? `${accruedCount} pacotinhos te esperando` : 'Chegou um pacotinho'}
          </Typography>
          <Typography sx={{ fontFamily: font.hand, fontSize: '1.3rem', color: accentMuted, lineHeight: 1 }}>
            toca no envelope pra abrir
          </Typography>
          {hasAccrued && onOpenAll && (
            <Button variant="rose" onClick={onOpenAll} disabled={isOpeningPack} sx={{ mt: 1, py: 0.6, px: 1.6, fontSize: '0.82rem' }}>
              Abrir todos ({accruedCount})
            </Button>
          )}
        </Stack>
      ) : (
        <Stack spacing={0.5} alignItems="center">
          <Typography sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: '1.25rem', color: colors.text.primary, lineHeight: 1.15, textAlign: 'center' }}>
            O próximo ainda está no correio
          </Typography>
          <Typography sx={{ fontFamily: font.hand, fontSize: '1.25rem', color: accentMuted, lineHeight: 1 }}>
            chega em {remainingLabel}
          </Typography>
          {!isRealReader && (
            <Button variant="ghost" onClick={onResetCooldown} sx={{ mt: 0.8, py: 0.5, px: 1.25, fontSize: '0.74rem' }}>
              Resetar cooldown
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  )
}
