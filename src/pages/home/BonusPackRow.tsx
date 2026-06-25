import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import { Box, Typography } from '@mui/material'
import { colors, radius } from '../../design-system'
import { formatCooldownBadge } from '../../utils/packCooldowns'
import type { CollectionPack } from '../../types/note'

export function BonusPackRow({ bonusPacks, isRealReader, packOpens, packAvailableCounts, getCooldownMs, onSelect }: {
  bonusPacks: CollectionPack[]
  isRealReader: boolean
  packOpens: Record<string, number> | undefined
  packAvailableCounts: Record<string, number>
  getCooldownMs: (packId: string) => number
  onSelect: (pack: CollectionPack) => void
}) {
  return (
    <Box sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 18,
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'flex-start',
      gap: 1,
      pl: 1.75,
      boxSizing: 'border-box',
      pointerEvents: 'none',
      willChange: 'transform',
    }}>
      {bonusPacks.slice(0, 5).map((pack) => {
        const cooldownMs = isRealReader ? getCooldownMs(pack.id) : 0
        const onCooldown = cooldownMs > 0
        return (
          <Box
            key={pack.id}
            role="button"
            aria-label={`Ver ${pack.name}`}
            tabIndex={0}
            onClick={() => onSelect(pack)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(pack)
              }
            }}
            onMouseDown={(event) => event.preventDefault()}
            sx={{
              width: 54,
              height: 54,
              borderRadius: radius.full,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: pack.gradient,
              border: '2px solid rgba(255,255,255,0.86)',
              boxShadow: `0 10px 28px ${pack.accent}42`,
              fontSize: '1.42rem',
              position: 'relative',
              opacity: onCooldown ? 0.72 : 1,
              transition: 'transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              pointerEvents: 'auto',
              '&:hover': { transform: 'translateY(-2px) scale(1.05)', boxShadow: `0 12px 32px ${pack.accent}52` },
              '&:active': { transform: 'scale(0.96)' },
              ...(!onCooldown ? {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 9,
                  height: 9,
                  borderRadius: radius.full,
                  background: colors.rose.main,
                  boxShadow: `0 0 0 3px rgba(255,255,255,0.86), 0 0 14px ${colors.rose.glow}`,
                },
              } : {}),
            }}
          >
            {pack.emoji}
            {onCooldown && (
              <Box sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: radius.full,
                background: 'rgba(15,23,42,0.46)',
                backdropFilter: 'blur(1px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.1,
                color: '#fff',
              }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 17, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, lineHeight: 1, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {formatCooldownBadge(cooldownMs)}
                </Typography>
              </Box>
            )}
            {isRealReader && pack.distribution !== 'all_with_access' && (
              <Box sx={{
                position: 'absolute', bottom: 0, right: 0, minWidth: 17, height: 17, borderRadius: radius.full,
                background: '#fff', border: `1.5px solid ${pack.accent}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', px: 0.4, boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
              }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: pack.accent, lineHeight: 1 }}>
                  {packOpens?.[pack.id] ?? 0}
                </Typography>
              </Box>
            )}
            {isRealReader && pack.cumulative && (packAvailableCounts[pack.id] ?? 0) > 1 && !onCooldown && (
              <Box sx={{
                position: 'absolute', bottom: 0, right: 0, minWidth: 17, height: 17, borderRadius: radius.full,
                background: pack.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                px: 0.4, boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {packAvailableCounts[pack.id]}x
                </Typography>
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
