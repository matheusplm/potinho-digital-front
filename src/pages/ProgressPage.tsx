import { CircularProgress, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { useStatsQuery } from '../hooks/useNotes'
import type { Rarity } from '../types/note'

const rarityOrder: Rarity[] = ['comum', 'incomum', 'raro', 'lendario', 'mitico']

export function ProgressPage() {
  const statsQuery = useStatsQuery()

  if (statsQuery.isPending) {
    return (
      <Stack sx={{ py: 4, alignItems: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  const stats = statsQuery.data

  if (!stats) {
    return null
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Seu progresso</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2">Colecao total</Typography>
          <LinearProgress value={stats.completion} variant="determinate" />
          <Typography variant="caption" color="text.secondary">
            {stats.completion}% completo
          </Typography>
        </Stack>
      </Paper>

      {rarityOrder.map((rarity) => {
        const rarityStats = stats.byRarity[rarity]
        const percent =
          rarityStats.total === 0
            ? 0
            : Math.round((rarityStats.owned / rarityStats.total) * 100)

        return (
          <Paper key={rarity} sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{rarity.toUpperCase()}</Typography>
              <Typography variant="caption" color="text.secondary">
                {rarityStats.owned}/{rarityStats.total}
              </Typography>
              <LinearProgress value={percent} variant="determinate" />
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}
