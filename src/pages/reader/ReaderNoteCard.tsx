import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { colors, font, ink, radius } from '../../design-system'
import { linkifyText } from '../../utils/linkify'
import type { CollectionNoteView, RarityConfig } from '../../types/note'
import { HAND_MESSAGE_SX, rarityCardSx as paperCardSx } from '../../components/collection/RewardCard'

function rarityCardSx(r?: RarityConfig, compact = false) {
  return { ...paperCardSx(r, compact), cursor: 'pointer' }
}

export function ReaderNoteCard({ note, rarity, onClick }: { note: CollectionNoteView; rarity?: RarityConfig; onClick: () => void }) {
  return (
    <Box onClick={onClick} sx={rarityCardSx(rarity, false)}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={0.8}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={0.5}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1.02rem', color: ink.primary, lineHeight: 1.25, flex: 1 }}>
              {note.title}
            </Typography>
            {note.favorite && <FavoriteIcon sx={{ fontSize: 13, color: colors.rose.main, flexShrink: 0, mt: 0.1 }} />}
          </Stack>
          {rarity && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: radius.full, background: rarity.borderColor, flexShrink: 0 }} />
              <Typography variant="label" sx={{ color: ink.muted }}>
                {rarity.emoji} {rarity.label}
              </Typography>
            </Box>
          )}
          {note.message && (
            <Typography sx={{
              ...HAND_MESSAGE_SX, fontSize: '1.08rem', color: ink.secondary,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-line',
            }}>
              {linkifyText(note.message)}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

export function ReaderNoteRow({ note, rarity, onClick }: { note: CollectionNoteView; rarity?: RarityConfig; onClick: () => void }) {
  return (
    <Box onClick={onClick} sx={{ ...rarityCardSx(rarity, true), py: 1, px: 1.4 }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          {rarity && (
            <Box sx={{ width: 9, height: 9, borderRadius: radius.full, background: rarity.borderColor, flexShrink: 0 }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '0.98rem', color: ink.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {note.title}
            </Typography>
            {rarity && (
              <Typography variant="label" sx={{ color: ink.muted }}>
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
