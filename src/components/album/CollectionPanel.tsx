import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, ButtonBase, Collapse, LinearProgress, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { colors, radius } from '../../design-system'
import type { CollectionPlayView, RarityConfig } from '../../types/note'
import { gradientTextSx } from '../../utils/colorUtils'

export function CollectionPanel({ play, rarities }: {
  play: CollectionPlayView
  rarities: RarityConfig[]
}) {
  const { theme } = useBackground()
  const [open, setOpen] = useState(false)
  const completion = play.total > 0 ? Math.round((play.owned / play.total) * 100) : 0

  const rarityRows = useMemo(() => {
    return [...rarities]
      .sort((a, b) => b.odds - a.odds)
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
      .sort((a, b) => a.odds - b.odds)[0]
  }, [play.items, rarities])

  const expandable = rarityRows.length > 0

  return (
    <Box>
      <ButtonBase
        disabled={!expandable}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={expandable ? open : undefined}
        aria-label={expandable ? 'ver progresso por raridade' : undefined}
        sx={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: radius.md, '&.Mui-disabled': { opacity: 1 } }}
      >
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Typography variant="sm" sx={{ color: theme.textOnBgMuted, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {play.owned} de {play.total} coletados
          </Typography>
          <LinearProgress variant="determinate" value={completion} sx={{
            flex: 1, height: 4, borderRadius: radius.full, bgcolor: colors.fill.medium,
            '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: theme.accent },
          }} />
          <Typography variant="sm" sx={{ color: theme.textOnBg, fontWeight: 800 }}>{completion}%</Typography>
          {expandable && (
            <ExpandMoreIcon sx={{ fontSize: 18, color: theme.textOnBgMuted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          )}
        </Stack>
      </ButtonBase>

      <Collapse in={open} unmountOnExit>
        <Stack spacing={0.9} sx={{ pt: 1.2 }}>
          {rarest && (
            <Box sx={{
              alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center',
              px: 1, py: 0.4, borderRadius: radius.full,
              background: rarest.chipBg, border: `1px solid ${rarest.borderColor}`,
              fontSize: '0.68rem', fontWeight: 800,
            }}>
              <Box component="span" sx={gradientTextSx(rarest.chipColor)}>⭐ mais rara: {rarest.emoji} {rarest.label}</Box>
            </Box>
          )}
          {rarityRows.map(({ r, owned, total }) => {
            const pct = total > 0 ? Math.round((owned / total) * 100) : 0
            return (
              <Box key={r.id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                  <Typography variant="sm" sx={{ fontWeight: 700, color: theme.textOnBg }}>
                    {r.emoji} {r.label}
                  </Typography>
                  <Typography variant="xs" sx={{ fontWeight: 800, color: theme.textOnBgMuted }}>
                    {owned}/{total}
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={pct} sx={{
                  height: 4, borderRadius: radius.full, bgcolor: colors.fill.medium,
                  '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: r.chipColor || colors.primary.main },
                }} />
              </Box>
            )
          })}
        </Stack>
      </Collapse>
    </Box>
  )
}
