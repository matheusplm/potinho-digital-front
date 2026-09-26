import { Box } from '@mui/material'
import { useId, useMemo } from 'react'
import { useBackground } from '../context/BackgroundContext'
import { Bubble, Heart, Leaf, ParticleDefs, Petal, Sparkle } from './particles/art'
import { gradientId, makeFireflies, makeParticles, seedFrom, themeParticles, type Behavior, type Particle } from './particles/config'
import { bob, fall, flutter, glow, gust, hover, rise, riseAndPop, shootingStar, sway, twinkle, wander, wobble } from './particles/motion'

const GUST = ['max(24px, 2.5vw)', 'max(52px, 5.5vw)', 'max(90px, 9vw)']
const GUST_DELAY = [0, 0.2, 0.4]
const GUST_PERIOD = 13

function mobileOnly(particle: { mobile: boolean }) {
  return particle.mobile ? 'block' : { xs: 'none', sm: 'block' }
}

function Art({ behavior, particle, prefix, colors }: { behavior: Behavior; particle: Particle; prefix: string; colors: string[] }) {
  const fill = `url(#${gradientId(prefix, particle.color)})`
  if (behavior === 'leaves') return <Leaf shape={particle.shape} fill={fill} />
  if (behavior === 'petals') return <Petal shape={particle.shape} fill={fill} />
  if (behavior === 'bubbles') return <Bubble fill={fill} rim={`url(#${gradientId(prefix, particle.color)}rim)`} />
  if (behavior === 'stars') return <Sparkle fill={colors[particle.color]} />
  return <Heart fill={fill} />
}

export function FloatingParticles({ fixed = false }: { fixed?: boolean }) {
  const { theme } = useBackground()
  const prefix = `pt${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const config = themeParticles(theme.key, theme.accent)
  const { behavior, colors } = config
  const particles = useMemo(() => makeParticles(behavior, colors.length, seedFrom(theme.key)), [behavior, colors.length, theme.key])
  const fireflies = useMemo(() => (config.fireflies ? makeFireflies(seedFrom(`${theme.key}ff`)) : []), [config.fireflies, theme.key])
  const strength = fixed ? 0.7 : 1
  const falling = behavior === 'leaves' || behavior === 'petals'
  const rising = behavior === 'bubbles' || behavior === 'hearts'

  const glowFor = (particle: Particle) => {
    if (!theme.isDark || particle.depth === 0) return particle.depth === 0 ? 'blur(0.6px)' : 'none'
    return `drop-shadow(0 0 ${particle.depth === 2 ? 7 : 4}px ${colors[particle.color]}66)`
  }

  return (
    <Box
      aria-hidden
      sx={{
        position: fixed ? 'fixed' : 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      <ParticleDefs prefix={prefix} behavior={behavior} colors={colors} />

      {falling && ([0, 1, 2] as const).map((depth) => (
        <Box key={depth} sx={{
          position: 'absolute', inset: 0, '--gust': GUST[depth],
          animation: `${gust} ${GUST_PERIOD}s ease-in-out ${GUST_DELAY[depth]}s infinite`,
        }}>
          {particles.filter((particle) => particle.depth === depth).map((particle) => (
            <Box key={particle.id} sx={{
              position: 'absolute', top: 0, left: `${particle.left}%`, width: particle.size, height: particle.size,
              display: mobileOnly(particle), opacity: 0, willChange: 'transform, opacity',
              '--alpha': particle.alpha * strength, '--drift': `${particle.drift}vw`,
              animation: `${fall} ${particle.duration}s linear ${particle.delay}s infinite`,
            }}>
              <Box sx={{
                width: '100%', height: '100%', perspective: '420px', '--sway': `${particle.sway}px`,
                animation: `${sway} ${particle.swayDuration}s ease-in-out ${particle.delay}s infinite alternate`,
              }}>
                <Box sx={{
                  width: '100%', height: '100%', transformStyle: 'preserve-3d', filter: glowFor(particle), '--tilt': `${particle.tilt}deg`,
                  animation: `${flutter} ${particle.spinDuration}s ease-in-out ${particle.delay}s infinite`,
                }}>
                  <Art behavior={behavior} particle={particle} prefix={prefix} colors={colors} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ))}

      {rising && particles.map((particle) => (
        <Box key={particle.id} sx={{
          position: 'absolute', bottom: '-6%', left: `${particle.left}%`, width: particle.size, height: particle.size,
          display: mobileOnly(particle), opacity: 0, willChange: 'transform, opacity',
          '--alpha': particle.alpha * strength, '--drift': `${particle.drift}px`,
          animation: `${behavior === 'bubbles' ? riseAndPop : rise} ${particle.duration}s ease-out ${particle.delay}s infinite`,
        }}>
          <Box sx={{
            width: '100%', height: '100%', '--sway': `${particle.sway}px`,
            animation: behavior === 'bubbles'
              ? `${wobble} ${particle.swayDuration}s ease-in-out ${particle.delay}s infinite`
              : `${sway} ${particle.swayDuration}s ease-in-out ${particle.delay}s infinite alternate`,
          }}>
            <Box sx={{
              width: '100%', height: '100%', filter: glowFor(particle), '--tilt': `${particle.tilt}deg`,
              animation: behavior === 'hearts' ? `${bob} ${particle.spinDuration}s ease-in-out ${particle.delay}s infinite` : 'none',
            }}>
              <Art behavior={behavior} particle={particle} prefix={prefix} colors={colors} />
            </Box>
          </Box>
        </Box>
      ))}

      {behavior === 'stars' && particles.map((particle) => (
        <Box key={particle.id} sx={{
          position: 'absolute', top: `${particle.top}%`, left: `${particle.left}%`, width: particle.size, height: particle.size,
          display: mobileOnly(particle), '--sway': `${particle.sway}px`,
          animation: `${hover} ${particle.swayDuration}s ease-in-out ${particle.delay}s infinite alternate`,
        }}>
          <Box sx={{
            width: '100%', height: '100%', '--alpha': particle.alpha * strength, filter: glowFor(particle), opacity: 0,
            animation: `${twinkle} ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}>
            <Art behavior={behavior} particle={particle} prefix={prefix} colors={colors} />
          </Box>
        </Box>
      ))}

      {config.shootingStar && (
        <Box sx={{
          position: 'absolute', top: '10%', left: '-12%', width: { xs: 90, md: 150 }, height: 2, borderRadius: 2, opacity: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95))',
          boxShadow: '0 0 8px rgba(191,219,254,0.9)',
          animation: `${shootingStar} 15s linear 4s infinite`,
        }} />
      )}

      {fireflies.map((firefly) => (
        <Box key={firefly.id} sx={{
          position: 'absolute', top: `${firefly.top}%`, left: `${firefly.left}%`, display: mobileOnly(firefly), '--sway': `${firefly.sway}px`,
          animation: `${wander} ${firefly.wander}s ease-in-out ${firefly.delay}s infinite`,
        }}>
          <Box sx={{
            width: firefly.size, height: firefly.size, borderRadius: '50%', '--alpha': 0.95 * strength, opacity: 0,
            background: 'radial-gradient(circle, #fefce8 0%, #d9f99d 45%, rgba(190,242,100,0) 72%)',
            boxShadow: '0 0 10px 3px rgba(190,242,100,0.55)',
            animation: `${glow} ${firefly.blink}s ease-in-out ${firefly.delay}s infinite`,
          }} />
        </Box>
      ))}
    </Box>
  )
}
