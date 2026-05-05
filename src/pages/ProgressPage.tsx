import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import { Box, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material'
import { useStatsQuery } from '../hooks/useNotes'
import type { Rarity } from '../types/note'

const rarityOrder: Rarity[] = ['comum', 'incomum', 'raro', 'lendario', 'mitico']

interface RarityDisplay {
  label: string
  emoji: string
  barColor: string
  trackColor: string
  cardBg: string
  borderColor: string
  textColor: string
  captionColor: string
  shadow: string
}

const rarityDisplay: Record<Rarity, RarityDisplay> = {
  comum: {
    label: 'Comum', emoji: '⚪',
    barColor: '#64748b', trackColor: '#e2e8f0',
    cardBg: 'rgba(255,255,255,0.9)', borderColor: 'rgba(100,116,139,0.14)',
    textColor: '#1f2a44', captionColor: '#64748b',
    shadow: '0 3px 14px rgba(0,0,0,0.05)',
  },
  incomum: {
    label: 'Incomum', emoji: '🔵',
    barColor: '#2563eb', trackColor: '#dbeafe',
    cardBg: 'linear-gradient(135deg, #f0f6ff 0%, #dbeafe 100%)',
    borderColor: 'rgba(59,130,246,0.18)', textColor: '#1e3a8a', captionColor: '#3b82f6',
    shadow: '0 3px 16px rgba(59,130,246,0.1)',
  },
  raro: {
    label: 'Raro', emoji: '🌊',
    barColor: '#60a5fa', trackColor: 'rgba(255,255,255,0.18)',
    cardBg: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    borderColor: 'rgba(147,197,253,0.2)', textColor: '#e0f2fe', captionColor: '#93c5fd',
    shadow: '0 4px 22px rgba(30,58,138,0.28)',
  },
  lendario: {
    label: 'Lendário', emoji: '✨',
    barColor: '#d97706', trackColor: '#fef3c7',
    cardBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderColor: 'rgba(245,158,11,0.28)', textColor: '#451a03', captionColor: '#92400e',
    shadow: '0 4px 20px rgba(245,158,11,0.18)',
  },
  mitico: {
    label: 'Mítico', emoji: '🌈',
    barColor: '#8b5cf6', trackColor: '#ede9fe',
    cardBg: 'linear-gradient(135deg, #fdf4ff 0%, #ede9fe 100%)',
    borderColor: 'rgba(139,92,246,0.22)', textColor: '#3b0764', captionColor: '#7c3aed',
    shadow: '0 4px 22px rgba(139,92,246,0.14)',
  },
}

const STARS = [
  { size: 14, left: '9%',  delay: '0s',   dur: '9s',  opacity: 0.15 },
  { size: 10, left: '24%', delay: '3s',   dur: '12s', opacity: 0.11 },
  { size: 17, left: '73%', delay: '1.5s', dur: '10s', opacity: 0.14 },
  { size: 11, left: '86%', delay: '5s',   dur: '13s', opacity: 0.10 },
]

export function ProgressPage() {
  const statsQuery = useStatsQuery()

  return (
    <Box sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #f4f8ff 0%, #eef4ff 45%, #f7efff 100%)',
    }}>

      {/* Background icon */}
      <QueryStatsIcon sx={{
        position: 'absolute', bottom: -60, right: -60,
        fontSize: 480, color: '#1d4ed8', opacity: 0.045,
        transform: 'rotate(10deg)', pointerEvents: 'none',
      }} />

      {/* Floating stars */}
      {STARS.map((s, i) => (
        <AutoAwesomeIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: s.left,
          fontSize: s.size, color: '#f43f5e', opacity: s.opacity, pointerEvents: 'none',
          animation: `prog-float-${i} ${s.dur} ${s.delay} ease-in infinite`,
          [`@keyframes prog-float-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(0deg)',   opacity: 0 },
            '8%':   { opacity: s.opacity },
            '92%':  { opacity: s.opacity * 0.5 },
            '100%': { transform: 'translateY(-105vh) rotate(180deg)', opacity: 0 },
          },
        }} />
      ))}

      {/* Content */}
      <Stack sx={{ height: '100%', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <Box sx={{
          px: 2.5, pt: 2.4, pb: 1.4, flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(244,248,255,0.98) 80%, rgba(244,248,255,0))',
        }}>
          <Stack spacing={0.25}>
            <Typography variant="h5" sx={{ color: '#1f2a44', lineHeight: 1.1 }}>
              Progresso
            </Typography>
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              Sua jornada de coleção
            </Typography>
          </Stack>
        </Box>

        {/* ── Scrollable content ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pb: 3 }}>
          {statsQuery.isPending ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <CircularProgress size={34} sx={{ color: '#f43f5e' }} />
            </Stack>

          ) : statsQuery.data ? (
            <Stack spacing={2}>
              {/* ── Overall ring ── */}
              <Box sx={{
                p: 2.8, borderRadius: 3.5,
                background: 'rgba(255,253,251,0.94)',
                border: '1.5px solid rgba(30,64,175,0.09)',
                boxShadow: '0 6px 28px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
              }}>
                <Typography variant="caption" sx={{
                  color: '#94a3b8', fontWeight: 700, letterSpacing: 0.8, fontSize: '0.68rem',
                }}>
                  COLEÇÃO TOTAL
                </Typography>

                <Box sx={{ position: 'relative', width: 130, height: 130 }}>
                  {/* Track */}
                  <CircularProgress variant="determinate" value={100} size={130} thickness={5}
                    sx={{ color: 'rgba(244,63,94,0.08)', position: 'absolute', top: 0, left: 0 }} />
                  {/* Fill */}
                  <CircularProgress variant="determinate" value={statsQuery.data.completion}
                    size={130} thickness={5}
                    sx={{ color: '#f43f5e', position: 'absolute', top: 0, left: 0 }} />
                  {/* Center */}
                  <Box sx={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography sx={{
                      fontSize: '2rem', fontWeight: 800, color: '#1f2a44', lineHeight: 1,
                      fontFamily: '"Playfair Display", Georgia, serif',
                    }}>
                      {statsQuery.data.completion}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.3 }}>
                      completo
                    </Typography>
                  </Box>
                </Box>

                {statsQuery.data.completion === 100 && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AutoAwesomeIcon sx={{ fontSize: 16, color: '#f43f5e' }} />
                    <Typography sx={{
                      fontSize: '0.88rem', fontWeight: 700, color: '#f43f5e',
                      fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic',
                    }}>
                      Coleção completa!
                    </Typography>
                    <AutoAwesomeIcon sx={{ fontSize: 16, color: '#f43f5e' }} />
                  </Stack>
                )}
              </Box>

              {/* ── Per-rarity cards ── */}
              {rarityOrder.map((rarity) => {
                const d = rarityDisplay[rarity]
                const s = statsQuery.data.byRarity[rarity]
                const pct = s.total === 0 ? 0 : Math.round((s.owned / s.total) * 100)
                const isComplete = pct === 100

                return (
                  <Box key={rarity} sx={{
                    p: 1.8, borderRadius: 3,
                    background: d.cardBg,
                    border: `1.5px solid ${d.borderColor}`,
                    boxShadow: d.shadow,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Completed glow */}
                    {isComplete && (
                      <Box sx={{
                        position: 'absolute', inset: 0, borderRadius: 'inherit',
                        background: 'rgba(255,255,255,0.12)',
                        animation: 'complete-pulse 2s ease-in-out infinite',
                        '@keyframes complete-pulse': {
                          '0%, 100%': { opacity: 0 },
                          '50%':      { opacity: 1 },
                        },
                        pointerEvents: 'none',
                      }} />
                    )}

                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>
                            {d.emoji}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: d.textColor }}>
                            {d.label}
                          </Typography>
                          {isComplete && (
                            <AutoAwesomeIcon sx={{ fontSize: 13, color: d.captionColor, opacity: 0.9 }} />
                          )}
                        </Stack>
                        <Typography sx={{
                          fontWeight: 700, fontSize: '0.88rem', color: d.textColor, opacity: 0.75,
                        }}>
                          {s.owned}/{s.total}
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 7, borderRadius: 4,
                          backgroundColor: d.trackColor,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: d.barColor,
                          },
                        }}
                      />

                      <Typography sx={{
                        fontSize: '0.72rem', color: d.captionColor, opacity: 0.85,
                      }}>
                        {isComplete ? 'Completo! 🎉' : `${pct}% coletado${pct !== 1 ? 's' : ''}`}
                      </Typography>
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Box>
  )
}
