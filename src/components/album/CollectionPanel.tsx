import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Card } from '../ui'
import { colors, font, radius } from '../../design-system'
import type { CollectionPlayView, RarityConfig } from '../../types/note'

export function CollectionPanel({ play, rarities }: {
  play: CollectionPlayView
  rarities: RarityConfig[]
}) {
  const completion = play.total > 0 ? Math.round((play.owned / play.total) * 100) : 0
  const missing = Math.max(0, play.total - play.owned)

  const rarityRows = useMemo(() => {
    return [...rarities]
      .sort((a, b) => a.order - b.order)
      .map((r) => {
        const inCollection = play.items.filter((i) => i.rarity === r.id)
        const owned = inCollection.filter((i) => i.owned).length
        return { r, owned, total: inCollection.length }
      })
      .filter((row) => row.total > 0)
  }, [play.items, rarities])

  const rarest = useMemo(() => {
    const ownedRarityIds = new Set(play.items.filter((i) => i.owned).map((i) => i.rarity))
    return [...rarities]
      .filter((r) => ownedRarityIds.has(r.id))
      .sort((a, b) => b.order - a.order)[0]
  }, [play.items, rarities])

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={1.3}>
        <Stack spacing={0.8}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase' }}>
              Sua coleção
            </Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: colors.primary.main }}>
              {completion}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={completion} sx={{
            height: 7, borderRadius: radius.full, bgcolor: 'rgba(0,0,0,0.06)',
            '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.purple.main})` },
          }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>
              {play.owned} de {play.total} coletados
            </Typography>
            {missing > 0 && (
              <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>
                faltam {missing}
              </Typography>
            )}
          </Stack>
        </Stack>

        {rarest && (
          <Box sx={{
            alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 0.6,
            px: 1, py: 0.4, borderRadius: radius.full,
            background: rarest.chipBg, color: rarest.chipColor, border: `1px solid ${rarest.borderColor}`,
            fontSize: '0.68rem', fontWeight: 800,
          }}>
            ⭐ mais rara: {rarest.emoji} {rarest.label}
          </Box>
        )}

        {rarityRows.length > 0 && (
          <Stack spacing={0.7}>
            {rarityRows.map(({ r, owned, total }) => {
              const pct = total > 0 ? Math.round((owned / total) * 100) : 0
              return (
                <Box key={r.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.secondary }}>
                      {r.emoji} {r.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: owned === total ? colors.success.main : colors.text.muted }}>
                      {owned}/{total}
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={pct} sx={{
                    height: 4, borderRadius: radius.full, bgcolor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: r.chipColor || colors.primary.main },
                  }} />
                </Box>
              )
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
