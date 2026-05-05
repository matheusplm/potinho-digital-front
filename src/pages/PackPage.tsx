import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import LocalMallIcon from '@mui/icons-material/LocalMall'
import { Alert, Box, Button, Chip, Snackbar, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { PackOpenDialog } from '../components/PackOpenDialog'
import { useOpenPackMutation, usePackStatusQuery } from '../hooks/useNotes'
import type { OpenPackResponse } from '../types/note'

const RARITY_ODDS = [
  { label: 'Comum',    chipBg: '#f1f5f9',                                 chipColor: '#475569', odds: '60%' },
  { label: 'Incomum',  chipBg: '#dbeafe',                                 chipColor: '#1e40af', odds: '25%' },
  { label: 'Raro',     chipBg: '#1e3a8a',                                 chipColor: '#bfdbfe', odds: '10%' },
  { label: 'Mítico',   chipBg: 'linear-gradient(135deg,#ec4899,#8b5cf6)', chipColor: '#fff',    odds: '4%'  },
  { label: 'Lendário', chipBg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', chipColor: '#451a03', odds: '1%'  },
]

const STARS = [
  { size: 18, left: '7%',  delay: '0s',   dur: '8s',  opacity: 0.22 },
  { size: 12, left: '18%', delay: '2.2s', dur: '11s', opacity: 0.16 },
  { size: 22, left: '76%', delay: '0.8s', dur: '9s',  opacity: 0.20 },
  { size: 13, left: '88%', delay: '4s',   dur: '12s', opacity: 0.14 },
  { size: 16, left: '45%', delay: '3s',   dur: '10s', opacity: 0.18 },
  { size: 10, left: '62%', delay: '5.5s', dur: '13s', opacity: 0.13 },
]

export function PackPage() {
  const openPackMutation = useOpenPackMutation()
  const packStatusQuery = usePackStatusQuery()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [packResult, setPackResult] = useState<OpenPackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canOpen = packStatusQuery.data?.canOpen ?? true
  const remaining = packStatusQuery.data?.remainingOpensToday ?? 3

  function handleOpenPack() {
    openPackMutation.mutate(undefined, {
      onSuccess: (response) => { setPackResult(response); setDialogOpen(true) },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <Box sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #f4f8ff 0%, #eef4ff 40%, #f0eeff 100%)',
    }}>

      {/* Background icon */}
      <LocalMallIcon sx={{
        position: 'absolute', top: -100, right: -100,
        fontSize: 560, color: '#4f46e5', opacity: 0.05,
        transform: 'rotate(12deg)', pointerEvents: 'none',
        animation: 'pack-bg-spin 30s linear infinite',
        '@keyframes pack-bg-spin': {
          from: { transform: 'rotate(12deg)' },
          to:   { transform: 'rotate(372deg)' },
        },
      }} />

      {/* Floating stars */}
      {STARS.map((s, i) => (
        <AutoAwesomeIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: s.left,
          fontSize: s.size, color: canOpen ? '#6366f1' : '#94a3b8',
          opacity: s.opacity, pointerEvents: 'none',
          transition: 'color 1s ease',
          animation: `star-float-${i} ${s.dur} ${s.delay} ease-in infinite`,
          [`@keyframes star-float-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(0deg)',   opacity: 0 },
            '8%':   { opacity: s.opacity },
            '92%':  { opacity: s.opacity * 0.5 },
            '100%': { transform: 'translateY(-105vh) rotate(180deg)', opacity: 0 },
          },
        }} />
      ))}

      {/* Main content */}
      <Stack sx={{
        height: '100%', alignItems: 'center', justifyContent: 'space-evenly',
        px: 2.5, py: 2.5, position: 'relative', zIndex: 1,
      }}>

        {/* ── Header ── */}
        <Stack spacing={0.5} alignItems="center">
          <Typography variant="h5" sx={{ color: '#1f2a44', textAlign: 'center' }}>
            Pacotinho
          </Typography>
          <Typography variant="body2" sx={{ color: '#4a5568', textAlign: 'center', maxWidth: 270, lineHeight: 1.55 }}>
            Cada abertura traz 3 bilhetinhos com chance de raridade especial.
          </Typography>
        </Stack>

        {/* ── Pack card ── */}
        <Box
          onClick={canOpen && !openPackMutation.isPending ? handleOpenPack : undefined}
          sx={{
            position: 'relative',
            width: 140, height: 196,
            borderRadius: '16px',
            background: canOpen
              ? 'linear-gradient(145deg, #e0e7ff 0%, #ddd6fe 50%, #c7d2fe 100%)'
              : 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)',
            border: `2px solid ${canOpen ? 'rgba(99,102,241,0.35)' : 'rgba(148,163,184,0.22)'}`,
            boxShadow: canOpen
              ? '0 20px 60px rgba(99,102,241,0.25), 0 4px 16px rgba(0,0,0,0.07)'
              : '0 8px 28px rgba(0,0,0,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 1.4,
            transition: 'all 0.5s ease',
            cursor: canOpen && !openPackMutation.isPending ? 'pointer' : 'default',
            animation: canOpen ? 'pack-float 3.2s ease-in-out infinite' : 'none',
            '@keyframes pack-float': {
              '0%, 100%': { transform: 'translateY(0) rotate(-0.5deg)' },
              '50%':      { transform: 'translateY(-10px) rotate(0.5deg)' },
            },
            /* Shimmer overlay */
            '&::before': canOpen ? {
              content: '""',
              position: 'absolute', inset: 0, borderRadius: 'inherit',
              background: 'linear-gradient(120deg, transparent 25%, rgba(255,255,255,0.45) 50%, transparent 75%)',
              backgroundSize: '250% 100%',
              animation: 'pack-shimmer 2.4s linear infinite',
              '@keyframes pack-shimmer': {
                '0%':   { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' },
              },
            } : {},
            /* Hover glow */
            '&:hover': canOpen ? {
              boxShadow: '0 24px 72px rgba(99,102,241,0.35), 0 4px 16px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)',
            } : {},
          }}
        >
          {/* Corner accents */}
          {canOpen && <>
            <Box sx={{ position: 'absolute', top: 10, left: 10, width: 18, height: 18,
              borderTop: '2px solid rgba(99,102,241,0.4)', borderLeft: '2px solid rgba(99,102,241,0.4)',
              borderRadius: '3px 0 0 0' }} />
            <Box sx={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18,
              borderTop: '2px solid rgba(99,102,241,0.4)', borderRight: '2px solid rgba(99,102,241,0.4)',
              borderRadius: '0 3px 0 0' }} />
            <Box sx={{ position: 'absolute', bottom: 10, left: 10, width: 18, height: 18,
              borderBottom: '2px solid rgba(99,102,241,0.4)', borderLeft: '2px solid rgba(99,102,241,0.4)',
              borderRadius: '0 0 0 3px' }} />
            <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 18, height: 18,
              borderBottom: '2px solid rgba(99,102,241,0.4)', borderRight: '2px solid rgba(99,102,241,0.4)',
              borderRadius: '0 0 3px 0' }} />
          </>}

          <LocalMallIcon sx={{
            fontSize: 52, color: canOpen ? '#4f46e5' : '#94a3b8',
            opacity: 0.88, transition: 'color 0.5s ease',
          }} />

          <Typography sx={{
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: 1.5,
            textTransform: 'uppercase', color: canOpen ? '#4f46e5' : '#94a3b8',
            transition: 'color 0.5s ease',
          }}>
            3 bilhetes
          </Typography>

          {/* Remaining dots */}
          <Stack direction="row" spacing={0.6}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: i < remaining ? '#6366f1' : 'rgba(99,102,241,0.18)',
                transition: 'background-color 0.4s ease',
                boxShadow: i < remaining && canOpen ? '0 0 6px rgba(99,102,241,0.5)' : 'none',
              }} />
            ))}
          </Stack>
        </Box>

        {/* ── CTA ── */}
        <Stack spacing={0.8} alignItems="center" sx={{ width: '100%', maxWidth: 280 }}>
          <Button
            variant="contained"
            onClick={handleOpenPack}
            disabled={(!packStatusQuery.isPending && !canOpen) || openPackMutation.isPending}
            startIcon={<AutoAwesomeIcon />}
            fullWidth
            sx={{
              py: 1.4, fontSize: '1.02rem', fontWeight: 700,
              borderRadius: 3.5, textTransform: 'none',
              background: canOpen
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                : undefined,
              boxShadow: canOpen ? '0 6px 24px rgba(79,70,229,0.35)' : undefined,
              transition: 'all 0.4s ease',
            }}
          >
            {openPackMutation.isPending ? 'Abrindo...' : canOpen ? 'Abrir pacotinho' : 'Sem aberturas hoje'}
          </Button>
          <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.78rem' }}>
            {remaining > 0
              ? `${remaining} abertura${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''} hoje`
              : 'Volte amanhã para mais pacotinhos!'}
          </Typography>
        </Stack>

        {/* ── Odds ── */}
        <Box sx={{
          width: '100%', maxWidth: 300, p: 1.6, borderRadius: 3,
          background: 'rgba(255,253,251,0.92)',
          border: '1.5px solid rgba(99,102,241,0.1)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
        }}>
          <Typography variant="caption" sx={{
            color: '#94a3b8', fontWeight: 700, letterSpacing: 0.7,
            display: 'block', mb: 1, fontSize: '0.68rem',
          }}>
            CHANCES DE RARIDADE
          </Typography>
          <Stack spacing={0.65}>
            {RARITY_ODDS.map((r) => (
              <Stack key={r.label} direction="row" justifyContent="space-between" alignItems="center">
                <Chip label={r.label} size="small" sx={{
                  height: 18, fontSize: '0.64rem', fontWeight: 700,
                  background: r.chipBg, color: r.chipColor,
                  '& .MuiChip-label': { px: 0.8 },
                }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#4a5568', fontWeight: 700 }}>
                  {r.odds}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>

      <PackOpenDialog open={dialogOpen} result={packResult} onClose={() => setDialogOpen(false)} />

      <Snackbar open={Boolean(error)} autoHideDuration={3000} onClose={() => setError(null)}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </Box>
  )
}
