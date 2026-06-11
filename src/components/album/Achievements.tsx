import { Box, Dialog, DialogContent, DialogTitle, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useMemo, useState } from 'react'
import { Card, toast } from '../ui'
import { colors, font, radius } from '../../design-system'
import { computeAchievements } from '../../utils/achievements'
import type { BackgroundTheme } from '../../design-system'
import type { CollectionPlayView, RarityConfig, NoteTypeConfig } from '../../types/note'

export function Achievements({ play, rarities, types, collectionId, live, theme }: {
  play: CollectionPlayView
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  collectionId: string
  live: boolean
  theme: BackgroundTheme
}) {
  const achievements = useMemo(() => computeAchievements(play, rarities, types), [play, rarities, types])
  const unlocked = achievements.filter((a) => a.unlocked)
  const unlockedKey = unlocked.map((a) => a.id).join(',')
  const [open, setOpen] = useState(false)

  // Toast comemorativo quando uma conquista nova destrava (client-only, sem floodar na 1ª visita).
  useEffect(() => {
    if (!live || !collectionId) return
    const key = `potinho-ach-${collectionId}`
    const unlockedIds = unlockedKey ? unlockedKey.split(',') : []
    let seen: unknown
    try { seen = JSON.parse(localStorage.getItem(key) ?? 'null') } catch { seen = null }
    if (!Array.isArray(seen)) {
      localStorage.setItem(key, JSON.stringify(unlockedIds))
      return
    }
    const newly = unlocked.filter((a) => !(seen as string[]).includes(a.id))
    if (newly.length > 0) {
      newly.forEach((a) => toast.love('Conquista desbloqueada! 🏆', { description: `${a.emoji} ${a.label}` }))
      localStorage.setItem(key, JSON.stringify([...new Set([...(seen as string[]), ...unlockedIds])]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedKey, live, collectionId])

  if (achievements.length === 0) return null

  return (
    <>
      <Card onClick={() => setOpen(true)} sx={{ p: 1.5, cursor: 'pointer', transition: 'transform 0.16s', '&:active': { transform: 'scale(0.99)' } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase' }}>
            🏅 Conquistas
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: theme.accent }}>
            {unlocked.length}/{achievements.length}
          </Typography>
        </Stack>
        <Box sx={{ display: 'flex', gap: 0.7, overflowX: 'auto', pb: 0.3, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {achievements.map((a) => (
            <Box
              key={a.id}
              title={a.label}
              sx={{
                flexShrink: 0, width: 42, height: 42, borderRadius: radius.full,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                background: a.unlocked ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}44)` : 'rgba(0,0,0,0.05)',
                border: `1.5px solid ${a.unlocked ? `${theme.accent}88` : 'rgba(0,0,0,0.08)'}`,
                filter: a.unlocked ? 'none' : 'grayscale(1)',
                opacity: a.unlocked ? 1 : 0.4,
              }}
            >
              {a.emoji}
            </Box>
          ))}
        </Box>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth slotProps={{
        paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' } },
      }}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pr: 6, pb: 0.5 }}>
          🏅 Conquistas
          <Typography sx={{ fontSize: '0.78rem', color: colors.text.muted, fontWeight: 600 }}>
            {unlocked.length} de {achievements.length} desbloqueadas
          </Typography>
          <IconButton aria-label="fechar" onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1}>
            {achievements.map((a) => {
              const pct = a.target > 0 ? Math.min(100, Math.round((a.current / a.target) * 100)) : 0
              return (
                <Box key={a.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, borderRadius: radius.lg,
                  background: a.unlocked ? `${theme.accent}0c` : 'rgba(0,0,0,0.025)',
                  border: `1px solid ${a.unlocked ? `${theme.accent}33` : colors.border.subtle}`,
                }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: radius.full, flexShrink: 0, fontSize: '1.4rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: a.unlocked ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}44)` : 'rgba(0,0,0,0.05)',
                    filter: a.unlocked ? 'none' : 'grayscale(1)', opacity: a.unlocked ? 1 : 0.45,
                  }}>
                    {a.emoji}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.9rem', color: colors.text.primary }}>
                        {a.label}
                      </Typography>
                      {a.unlocked && <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.success.main }}>✓</Typography>}
                    </Stack>
                    <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, mb: 0.4 }}>
                      {a.description}
                    </Typography>
                    {!a.unlocked && (
                      <Stack direction="row" alignItems="center" spacing={0.8}>
                        <LinearProgress variant="determinate" value={pct} sx={{
                          flex: 1, height: 4, borderRadius: radius.full, bgcolor: 'rgba(0,0,0,0.06)',
                          '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: theme.accent },
                        }} />
                        <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: colors.text.muted }}>
                          {a.current}/{a.target}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
