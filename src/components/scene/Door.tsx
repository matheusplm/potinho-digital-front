import { Box, Typography, type SxProps, type Theme } from '@mui/material'
import { useBackground } from '../../context/BackgroundContext'
import { font, themeInk } from '../../design-system'

const BRASS = '#c9a14e'

export function Door({ height = 200, ajar = false, letter = false, mat = 'bem-vindo', sx }: {
  height?: number
  ajar?: boolean
  letter?: boolean
  mat?: string
  sx?: SxProps<Theme>
}) {
  const { theme } = useBackground()
  const night = theme.isDark
  const width = Math.round(height * 0.56)
  const frame = night ? '#2b241d' : '#fbf6ea'
  const line = night ? 'rgba(250,246,238,0.3)' : 'rgba(42,36,29,0.6)'
  const paint = `color-mix(in srgb, ${themeInk.ink} 82%, #2a1d12)`
  const panel = { position: 'absolute', left: '16%', right: '16%', border: '1.5px solid rgba(0,0,0,0.28)', borderRadius: '2px', boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.18)' } as const

  return (
    <Box aria-hidden sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', ...sx }}>
      <Box sx={{ position: 'relative', width: width + 16, height, p: '7px', pb: 0, background: frame, border: `2px solid ${line}`, borderBottom: 'none', borderRadius: '6px 6px 0 0' }}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%', background: 'radial-gradient(ellipse at 50% 70%, #ffe7a8, #f3b866 70%, #c98a3c)', overflow: 'visible', perspective: '600px' }}>
          <Box sx={{
            position: 'absolute', inset: 0, background: paint, border: `1.5px solid ${line}`,
            transformOrigin: 'left center', transform: ajar ? 'rotateY(-32deg)' : 'none',
            boxShadow: ajar ? '6px 0 12px rgba(0,0,0,0.25)' : 'none',
            backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 13px, rgba(0,0,0,0.05) 13px 14px)',
          }}>
            <Box sx={{ position: 'absolute', top: '7%', left: '50%', transform: 'translateX(-50%)', width: '38%', aspectRatio: '1 / 1', borderRadius: '50%', background: theme.sky, border: `3px solid ${frame}`, boxShadow: `0 0 0 1.5px ${line}` }}>
              <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: frame }} />
              <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: frame }} />
            </Box>
            <Box sx={{ ...panel, top: '36%', height: '18%' }} />
            <Box sx={{ ...panel, top: '64%', height: '28%' }} />
            <Box sx={{ position: 'absolute', top: '57%', left: '24%', right: '24%', height: 6, background: BRASS, border: '1px solid rgba(0,0,0,0.4)', borderRadius: 1 }}>
              {letter && (
                <Box sx={{ position: 'absolute', left: '18%', bottom: 2, width: '56%', height: 16, background: '#fffdf7', border: '1px solid rgba(42,36,29,0.55)', transform: 'rotate(-4deg)', transformOrigin: 'bottom left' }}>
                  <Box sx={{ position: 'absolute', left: 0, right: 0, top: 0, height: 8, background: 'linear-gradient(to bottom right, transparent 48%, rgba(42,36,29,0.4) 49% 51%, transparent 52%) left / 50% 100% no-repeat, linear-gradient(to bottom left, transparent 48%, rgba(42,36,29,0.4) 49% 51%, transparent 52%) right / 50% 100% no-repeat' }} />
                </Box>
              )}
            </Box>
            <Box sx={{ position: 'absolute', top: '50%', right: '10%', width: 9, height: 9, borderRadius: '50%', background: BRASS, border: '1px solid rgba(0,0,0,0.45)', boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.45)' }} />
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: width + 40, height: 8, background: night ? '#3a3027' : '#d8c4a0', border: `2px solid ${line}`, borderRadius: '2px' }} />
      {mat && (
        <Box sx={{ mt: '3px', px: 1.2, py: '1px', background: night ? '#5a4632' : '#b98b56', border: `1.5px solid ${line}`, borderRadius: '2px', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,0.08) 3px 4px)' }}>
          <Typography sx={{ fontFamily: font.hand, fontSize: '0.95rem', lineHeight: 1.1, color: '#fff4dc', whiteSpace: 'nowrap' }}>{mat}</Typography>
        </Box>
      )}
    </Box>
  )
}
