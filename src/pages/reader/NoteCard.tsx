import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { colors, radius } from '../../design-system'
import type { CollectionNoteView, RarityConfig } from '../../types/note'

const rarityShine = keyframes`
  0%   { left: -45%; opacity: 0 }
  20%  { opacity: 1 }
  100% { left: 105%; opacity: 0 }
`

export function rarityCardSx(r?: RarityConfig, compact = false) {
  const glow = r?.glowColor || r?.borderColor || 'rgba(244,63,94,0.2)'
  return {
    p: compact ? 1.4 : 2,
    borderRadius: compact ? radius.lg : radius.xl,
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    background: r?.cardBg ?? colors.surface.base,
    border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
    boxShadow: r
      ? `${r.shadow || '0 4px 20px rgba(0,0,0,0.08)'}, 0 0 28px ${glow}`
      : '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      background: compact
        ? `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.42), transparent 38%), radial-gradient(circle at 92% 100%, ${glow}, transparent 34%)`
        : `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.58), transparent 36%), radial-gradient(circle at 95% 105%, ${glow}, transparent 42%)`,
      opacity: compact ? 0.62 : 0.78,
      mixBlendMode: 'soft-light',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-35%',
      left: '-45%',
      zIndex: 0,
      width: '38%',
      height: '170%',
      pointerEvents: 'none',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)',
      animation: `${rarityShine} 4.4s ease-in-out infinite`,
    },
    '&:hover': {
      transform: compact ? 'translateY(-1px)' : 'translateY(-2px) scale(1.01)',
      boxShadow: r
        ? `${r.shadow || '0 6px 24px rgba(0,0,0,0.1)'}, 0 0 40px ${glow}`
        : '0 6px 20px rgba(0,0,0,0.1)',
    },
  }
}

export function NoteCard({ note, rarity, onClick }: { note: CollectionNoteView; rarity?: RarityConfig; onClick: () => void }) {
  return (
    <Box onClick={onClick} sx={rarityCardSx(rarity)}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={0.8}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={0.5}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: rarity?.textColor ?? colors.text.primary, lineHeight: 1.3, flex: 1 }}>
              {note.title}
            </Typography>
            {note.favorite && <FavoriteIcon sx={{ fontSize: 13, color: colors.rose.main, flexShrink: 0, mt: 0.1 }} />}
          </Stack>
          {rarity && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: radius.full, background: rarity.cardBg, flexShrink: 0, boxShadow: `0 0 5px ${rarity.glowColor ?? rarity.borderColor}` }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: rarity.captionColor ?? colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {rarity.emoji} {rarity.label}
              </Typography>
            </Box>
          )}
          {note.message && (
            <Typography sx={{
              fontSize: '0.68rem', color: rarity?.textColor ? `${rarity.textColor}99` : colors.text.secondary,
              lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {note.message}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

export function NoteRow({ note, rarity, onClick }: { note: CollectionNoteView; rarity?: RarityConfig; onClick: () => void }) {
  return (
    <Box onClick={onClick} sx={{ ...rarityCardSx(rarity, true), py: 1, px: 1.4 }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          {rarity && (
            <Box sx={{ width: 9, height: 9, borderRadius: radius.full, background: rarity.cardBg, flexShrink: 0, boxShadow: `0 0 7px ${rarity.glowColor ?? rarity.borderColor}88` }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: rarity?.textColor ?? colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {note.title}
            </Typography>
            {rarity && (
              <Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: rarity.captionColor ?? colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {rarity.emoji} {rarity.label}
              </Typography>
            )}
          </Box>
          {note.favorite && <FavoriteIcon sx={{ fontSize: 13, color: colors.rose.main, flexShrink: 0 }} />}
        </Stack>
      </Box>
    </Box>
  )
}
