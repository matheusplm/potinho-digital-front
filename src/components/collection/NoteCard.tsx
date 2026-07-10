import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material'
import { Card } from '../ui'
import { colors, font, radius } from '../../design-system'
import { gradientTextSx } from '../../utils/colorUtils'
import { useBackground } from '../../context/BackgroundContext'
import { RewardCard, rarityCardSx } from './RewardCard'
import type { CollectionNoteView, NoteTypeConfig, RarityConfig } from '../../types/note'

export function NoteCard({ note, r, t, unread, variant, onSelect, onToggleFavorite }: {
  note: CollectionNoteView; r?: RarityConfig; t?: NoteTypeConfig
  unread: boolean; variant: 'list' | 'grid'
  onSelect: (note: CollectionNoteView) => void
  onToggleFavorite: (note: CollectionNoteView) => void
}) {
  const { theme } = useBackground()
  const grid = variant === 'grid'

  if (!note.owned) {
    return (
      <Card accent={r?.borderColor} sx={{ ...(rarityCardSx(r, true, theme.isDark) as object), height: grid ? '100%' : undefined, opacity: 0.72, cursor: 'default' }}>
        <Box sx={{ position: 'relative', minWidth: 0, height: '100%', p: 1, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 52 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.4, flexWrap: 'wrap', rowGap: 0.4 }}>
            {r && <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{ height: 19, fontSize: '0.70rem', fontWeight: 800, background: r.chipBg, border: `1px solid ${r.borderColor}`, '& .MuiChip-label': { px: 0.8, ...gradientTextSx(r.chipColor) } }} />}
          </Stack>
          <Typography sx={{ fontSize: grid ? '0.74rem' : '0.8rem', color: colors.text.muted, fontStyle: 'italic' }}>
            🔒 Ainda não coletado
          </Typography>
        </Box>
      </Card>
    )
  }

  if (note.imageUrl && note.imageLayout) {
    return (
      <Box sx={{ position: 'relative', cursor: 'pointer', height: grid ? '100%' : undefined }} onClick={() => onSelect(note)}>
        <RewardCard
          reward={{ id: note.id, title: note.title ?? '', message: note.message ?? '', rarity: note.rarity, typeId: note.typeId, imageUrl: note.imageUrl, imageLayout: note.imageLayout, isNew: false }}
          rarities={r ? [r] : []}
          types={t ? [t] : []}
        />
        {unread && (
          <Box sx={{ position: 'absolute', top: 2, left: 2, width: 11, height: 11, zIndex: 5, borderRadius: radius.full, background: colors.rose.main, boxShadow: `0 0 0 3px rgba(255,255,255,0.82), 0 0 14px ${colors.rose.glow}`, pointerEvents: 'none' }} />
        )}
        <IconButton size="small" aria-label="favoritar bilhete" onClick={(event) => { event.stopPropagation(); onToggleFavorite(note) }} sx={{ position: 'absolute', top: 8, right: 8, p: 0.5, borderRadius: radius.md, zIndex: 5, color: note.favorite ? colors.rose.main : (r?.captionColor ?? colors.text.muted), background: note.favorite ? 'rgba(254,243,199,0.92)' : 'rgba(255,255,255,0.74)', border: `1px solid ${note.favorite ? 'rgba(234,179,8,0.38)' : 'rgba(255,255,255,0.68)'}`, backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}>
          {note.favorite ? <StarIcon sx={{ fontSize: 16, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>
    )
  }

  return (
    <Card accent={r?.borderColor} onClick={() => onSelect(note)} sx={{ ...(rarityCardSx(r, true, theme.isDark) as object), cursor: 'pointer', height: grid ? '100%' : undefined }}>
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {unread && (
          <Box sx={{ position: 'absolute', top: -2, left: -2, width: 11, height: 11, zIndex: 3, borderRadius: radius.full, background: colors.rose.main, boxShadow: `0 0 0 3px rgba(255,255,255,0.82), 0 0 14px ${colors.rose.glow}` }} />
        )}
        <Box sx={{ position: 'relative', minWidth: 0, height: '100%', p: 1, pr: grid ? 3.4 : 4.4, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.55, flexWrap: 'wrap', rowGap: 0.4 }}>
            {r && (
              <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{ height: 19, fontSize: '0.70rem', fontWeight: 800, background: r.chipBg, border: `1px solid ${r.borderColor}`, '& .MuiChip-label': { px: 0.8, ...gradientTextSx(r.chipColor) } }} />
            )}
            {t && !grid && (
              <Chip size="small" label={`${t.emoji} ${t.label}`} sx={{ height: 19, fontSize: '0.70rem', fontWeight: 800, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}44`, '& .MuiChip-label': { px: 0.8 } }} />
            )}
          </Stack>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: grid ? '0.9rem' : '0.98rem', color: colors.text.primary, mb: 0.3, display: '-webkit-box', WebkitLineClamp: grid ? 2 : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {note.title ?? ''}
          </Typography>
          <Typography sx={{ fontSize: grid ? '0.74rem' : '0.8rem', color: colors.text.secondary, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: grid ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {note.message ?? ''}
          </Typography>
          <IconButton size="small" aria-label="favoritar bilhete" onClick={(event) => { event.stopPropagation(); onToggleFavorite(note) }} sx={{ position: 'absolute', top: 6, right: 6, p: 0.5, borderRadius: radius.md, color: note.favorite ? colors.rose.main : (r?.captionColor ?? colors.text.muted), background: note.favorite ? 'rgba(254,243,199,0.92)' : 'rgba(255,255,255,0.74)', border: `1px solid ${note.favorite ? 'rgba(234,179,8,0.38)' : 'rgba(255,255,255,0.68)'}`, backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}>
            {note.favorite ? <StarIcon sx={{ fontSize: 16, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      </Box>
    </Card>
  )
}
