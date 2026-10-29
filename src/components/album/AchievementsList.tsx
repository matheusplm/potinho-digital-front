import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { Card } from '../ui'
import { useBackground } from '../../context/BackgroundContext'
import { colors, font, radius } from '../../design-system'
import type { ReaderAchievement } from '../../types/note'

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(iso))
}

export function AchievementsList({ achievements }: { achievements: ReaderAchievement[] }) {
  const { theme } = useBackground()
  return (
    <Stack spacing={1}>
      {achievements.map((a) => {
        const pct = a.target > 0 ? Math.min(100, Math.round((a.current / a.target) * 100)) : 0
        return (
          <Card key={a.id} sx={{
            p: 1.4, display: 'flex', alignItems: 'center', gap: 1.3,
            border: `1px solid ${a.unlocked ? `${theme.accent}33` : colors.border.subtle}`,
            background: a.unlocked ? `${theme.accent}0c` : undefined,
          }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: radius.full, flexShrink: 0, fontSize: '1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: a.unlocked ? `color-mix(in srgb, ${theme.accent} 18%, transparent)` : colors.fill.medium,
              border: `1.5px solid ${a.unlocked ? `${theme.accent}88` : colors.border.subtle}`,
              filter: a.unlocked ? 'none' : 'grayscale(1)', opacity: a.unlocked ? 1 : 0.45,
            }}>
              {a.emoji}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="xl" sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary }}>
                  {a.label}
                </Typography>
                {a.unlocked && <Typography variant="md" sx={{ fontWeight: 900, color: colors.success.main }}>✓</Typography>}
              </Stack>
              <Typography variant="sm" sx={{ color: colors.text.secondary, mb: a.unlocked ? 0 : 0.5 }}>
                {a.description}
              </Typography>
              {a.unlocked && a.unlockedAt && (
                <Typography variant="sm" sx={{ fontWeight: 700, color: theme.accent }}>
                  🏆 desbloqueada em {formatDate(a.unlockedAt)}
                </Typography>
              )}
              {!a.unlocked && (
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <LinearProgress variant="determinate" value={pct} sx={{
                    flex: 1, height: 5, borderRadius: radius.full, bgcolor: colors.fill.medium,
                    '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: theme.accent },
                  }} />
                  <Typography variant="xs" sx={{ fontWeight: 800, color: colors.text.muted }}>
                    {a.current}/{a.target}
                  </Typography>
                </Stack>
              )}
            </Box>
          </Card>
        )
      })}
    </Stack>
  )
}
