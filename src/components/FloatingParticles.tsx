import { Box } from '@mui/material'
import { useBackground } from '../context/BackgroundContext'
import { floatParticle } from '../design-system'

const PARTICLES = [
  { size: 22, left: '7%',  delay: '0s',   dur: '13s' },
  { size: 15, left: '23%', delay: '3.5s', dur: '16s' },
  { size: 26, left: '57%', delay: '1.5s', dur: '12s' },
  { size: 17, left: '77%', delay: '5.5s', dur: '14s' },
  { size: 13, left: '42%', delay: '8s',   dur: '15s' },
  { size: 19, left: '89%', delay: '2.5s', dur: '13.5s' },
]

export function FloatingParticles() {
  const { theme } = useBackground()
  const particle = theme.particle

  return (
    <>
      {PARTICLES.map((p, i) => (
        <Box
          key={i}
          component="span"
          aria-hidden
          sx={{
            position: 'absolute',
            bottom: -12,
            left: p.left,
            fontSize: p.size,
            lineHeight: 1,
            zIndex: 0,
            userSelect: 'none',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
            animation: `${floatParticle(i)} ${p.dur} ${p.delay} ease-in infinite`,
          }}
        >
          {particle}
        </Box>
      ))}
    </>
  )
}
