import { Box } from '@mui/material'
import { useBackground } from '../context/BackgroundContext'
import { floatParticle } from '../design-system'

const PARTICLES = [
  { size: 30, left: '6%',  delay: '0s',    dur: '12s' },
  { size: 20, left: '19%', delay: '3.5s',  dur: '15s' },
  { size: 34, left: '38%', delay: '1.2s',  dur: '11s' },
  { size: 22, left: '54%', delay: '6s',    dur: '13.5s' },
  { size: 28, left: '70%', delay: '2.4s',  dur: '12.5s' },
  { size: 18, left: '84%', delay: '8s',    dur: '14.5s' },
  { size: 25, left: '93%', delay: '4.6s',  dur: '13s' },
]

export function FloatingParticles() {
  const { theme } = useBackground()
  const particle = theme.particle

  return (
    <Box
      aria-hidden
      sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      {PARTICLES.map((p, i) => (
        <Box
          key={i}
          component="span"
          sx={{
            position: 'absolute',
            bottom: -12,
            left: p.left,
            fontSize: p.size,
            lineHeight: 1,
            userSelect: 'none',
            willChange: 'transform, opacity',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
            animation: `${floatParticle(i)} ${p.dur} ${p.delay} linear infinite both`,
          }}
        >
          {particle}
        </Box>
      ))}
    </Box>
  )
}
