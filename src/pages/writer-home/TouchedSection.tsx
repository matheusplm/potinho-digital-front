import { Box, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { RarityChip } from '../../components/collection/RarityChip'
import { rarityCardSx } from '../../components/collection/RewardCard'
import { SectionLabel } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { font, ink } from '../../design-system'
import type { RarityConfig } from '../../types/note'
import { gradientTextSx } from '../../utils/colorUtils'
import { byObtainedDesc, readerPath, type ReaderSummary } from './insights'

const MAX_TOUCHED = 4

export function TouchedSection({ readers, raritiesByCollection }: { readers: ReaderSummary[]; raritiesByCollection: Map<string, RarityConfig[]> }) {
  const { theme } = useBackground()
  const navigate = useNavigate()
  const items = readers
    .flatMap((reader) => reader.favorites.map((note) => ({ reader, note })))
    .sort((a, b) => byObtainedDesc(a.note, b.note))
    .slice(0, MAX_TOUCHED)

  if (items.length === 0) return null

  return (
    <Stack spacing={1.2}>
      <SectionLabel color={theme.textOnBgMuted} hint="os bilhetes que seus leitores favoritaram">💛 O que tocou</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 1.4 }}>
        {items.map(({ reader, note }) => {
          const rarity = raritiesByCollection.get(reader.collection.id)?.find((item) => item.id === note.rarity)
          const shadow = `${rarity?.shadow || '0 4px 16px rgba(15,23,42,0.08)'}, 0 0 14px ${rarity?.glowColor || rarity?.borderColor || 'transparent'}`
          return (
            <Box
              key={`${reader.key}:${note.id}`}
              component="button"
              type="button"
              aria-label={`${note.title ?? 'Bilhete'}, favorito de ${reader.name}`}
              onClick={() => navigate(readerPath(reader.slug, reader.email))}
              sx={{
                ...rarityCardSx(rarity, true, theme.isDark),
                boxShadow: shadow,
                '&:hover': { transform: 'translateY(-2px)', boxShadow: shadow },
                width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit',
              }}
            >
              <Stack spacing={0.8} sx={{ position: 'relative', zIndex: 1 }}>
                {rarity && <RarityChip rarity={rarity} sx={{ alignSelf: 'flex-start' }} />}
                <Typography sx={{
                  fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', lineHeight: 1.25,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  ...gradientTextSx(rarity?.textColor ?? ink.primary),
                }}>
                  {note.title ?? 'Bilhete'}
                </Typography>
                <Typography variant="xs" sx={{ fontWeight: 800, color: rarity?.captionColor ?? ink.muted }}>
                  💛 favorito de {reader.name}
                </Typography>
              </Stack>
            </Box>
          )
        })}
      </Box>
    </Stack>
  )
}
