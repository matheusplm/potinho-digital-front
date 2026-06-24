import AddIcon from '@mui/icons-material/Add'
import { Box, Typography } from '@mui/material'
import { font, ghostPulse, radius } from '../../design-system'

type ViewMode = 'cards' | 'grid' | 'list'

function PlusCircle({ size = 44, accent }: { size?: number; accent: string }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 16px ${accent}55`,
      animation: `${ghostPulse} 2.4s ease-in-out infinite`,
    }}>
      <AddIcon sx={{ fontSize: size * 0.5, color: '#fff' }} />
    </Box>
  )
}

export function AddGhostCard({ view, onClick, accent }: { view: ViewMode; onClick: () => void; accent: string }) {
  const base = {
    cursor: 'pointer',
    border: `1.5px dashed ${accent}55`,
    transition: 'all 0.2s ease',
    '&:hover': { border: `1.5px dashed ${accent}cc`, transform: 'translateY(-2px)', boxShadow: `0 6px 24px ${accent}22` },
    '&:active': { transform: 'scale(0.985)' },
  }

  if (view === 'list') {
    return (
      <Box onClick={onClick} sx={{
        ...base, display: 'flex', alignItems: 'center', gap: 1.4,
        px: 1.4, py: 1.1, borderRadius: radius.lg,
        background: `linear-gradient(135deg, ${accent}08, ${accent}04)`,
        backdropFilter: 'blur(8px)',
      }}>
        <PlusCircle size={40} accent={accent} />
        <Box>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.92rem', color: accent, lineHeight: 1.2 }}>
            Nova coleção
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: accent, opacity: 0.55, mt: 0.15 }}>
            Toque para criar
          </Typography>
        </Box>
      </Box>
    )
  }

  if (view === 'grid') {
    return (
      <Box onClick={onClick} sx={{ ...base, borderRadius: radius.xl, overflow: 'hidden', background: `${accent}06` }}>
        <Box sx={{ aspectRatio: '4/3', background: `linear-gradient(135deg, ${accent}18, ${accent}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlusCircle size={42} accent={accent} />
        </Box>
        <Box sx={{ px: 1.2, py: 1 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.86rem', color: accent, lineHeight: 1.2 }}>
            Nova coleção
          </Typography>
          <Typography sx={{ fontSize: '0.70rem', color: accent, opacity: 0.5, mt: 0.2 }}>
            Toque para criar
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box onClick={onClick} sx={{ ...base, borderRadius: radius.xl, overflow: 'hidden', background: `${accent}06` }}>
      <Box sx={{
        height: 84, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${accent}18, ${accent}32)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <PlusCircle size={46} accent={accent} />
      </Box>
      <Box sx={{ p: 1.6 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: accent, lineHeight: 1.25 }}>
          Nova coleção
        </Typography>
        <Typography sx={{ fontSize: '0.74rem', color: accent, opacity: 0.55, mt: 0.2 }}>
          Toque para criar
        </Typography>
        <Box sx={{ height: '3px', borderRadius: 2, background: `linear-gradient(90deg, ${accent}66, ${accent}22)`, mt: 1.2 }} />
      </Box>
    </Box>
  )
}
