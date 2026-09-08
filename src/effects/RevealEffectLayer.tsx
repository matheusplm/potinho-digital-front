import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Box } from '@mui/material'
import { keyframes } from '@emotion/react'
import { accentPalette, isImageMedia, randomBetween } from './media'
import type { RevealEffectPlayback } from './types'

const Z_INDEX = 2000

const rainFall = keyframes`
  0%   { transform: translate3d(0, -16vh, 0) rotate(var(--r0)); opacity: 0; }
  9%   { opacity: 1; }
  50%  { transform: translate3d(var(--dxm), 48vh, 0) rotate(var(--rm)); }
  86%  { opacity: 1; }
  100% { transform: translate3d(var(--dx), 116vh, 0) rotate(var(--r1)); opacity: 0; }
`

const burstOut = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(0.3) rotate(0deg); opacity: 0; }
  12%  { opacity: 1; }
  55%  { transform: translate3d(var(--px), var(--py), 0) scale(var(--s)) rotate(var(--rm)); opacity: 1; }
  100% { transform: translate3d(var(--ex), var(--ey), 0) scale(calc(var(--s) * 0.82)) rotate(var(--r1)); opacity: 0; }
`

const sparkFly = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(0.5); opacity: 0; }
  7%   { opacity: 1; }
  62%  { opacity: 1; }
  100% { transform: translate3d(var(--ex), var(--ey), 0) scale(0.3); opacity: 0; }
`

const shellFlash = keyframes`
  0%   { transform: scale(0.25); opacity: 0.95; }
  100% { transform: scale(2.6); opacity: 0; }
`

const raysSpin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const raysSpinBack = keyframes`
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
`

const glowFade = keyframes`
  0%   { opacity: 0; transform: scale(0.72); }
  18%  { opacity: 1; transform: scale(1.04); }
  72%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.16); }
`

const corePulse = keyframes`
  0%   { opacity: 0; transform: scale(0.5); }
  22%  { opacity: 0.95; transform: scale(1.06); }
  55%  { opacity: 0.7; transform: scale(0.94); }
  100% { opacity: 0; transform: scale(1.2); }
`

const ringOut = keyframes`
  0%   { opacity: 0.9; transform: scale(0.3); }
  100% { opacity: 0; transform: scale(1.9); }
`

const twinkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.3); }
  50%      { opacity: 1; transform: scale(1); }
`

function particleCount(base: number): number {
  if (typeof window === 'undefined') return base
  return window.innerWidth < 600 ? Math.round(base * 0.62) : base
}

function MediaParticle({ media, size }: { media: string; size: number }) {
  if (isImageMedia(media)) {
    return (
      <Box
        component="img"
        src={media}
        alt=""
        loading="eager"
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          background: 'none',
          filter: 'drop-shadow(0 4px 10px rgba(15,23,42,0.28))',
        }}
      />
    )
  }
  return (
    <Box sx={{
      fontSize: size,
      lineHeight: 1,
      userSelect: 'none',
      filter: 'drop-shadow(0 4px 10px rgba(15,23,42,0.24))',
    }}>
      {media}
    </Box>
  )
}

function RainEffect({ media }: { media: string }) {
  const isImage = isImageMedia(media)
  const particles = useMemo(() => {
    const total = particleCount(28)
    return Array.from({ length: total }, (_, i) => {
      const lane = ((i + randomBetween(0.15, 0.85)) / total) * 100
      const size = isImage ? randomBetween(38, 66) : randomBetween(26, 46)
      return {
        id: i,
        left: lane,
        size,
        delay: randomBetween(0, 1.15),
        duration: randomBetween(2.4, 3.7),
        dxm: randomBetween(-34, 34),
        dx: randomBetween(-56, 56),
        r0: randomBetween(-24, 24),
        rm: randomBetween(-40, 40),
        r1: randomBetween(-90, 90),
      }
    })
  }, [isImage])

  return (
    <>
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            marginLeft: `${-p.size / 2}px`,
            willChange: 'transform, opacity',
            '--dxm': `${p.dxm}px`,
            '--dx': `${p.dx}px`,
            '--r0': `${p.r0}deg`,
            '--rm': `${p.rm}deg`,
            '--r1': `${p.r1}deg`,
            animation: `${rainFall} ${p.duration}s linear ${p.delay}s both`,
          }}
        >
          <MediaParticle media={media} size={p.size} />
        </Box>
      ))}
    </>
  )
}

function BurstEffect({ media }: { media: string }) {
  const isImage = isImageMedia(media)
  const particles = useMemo(() => {
    const total = particleCount(32)
    const reach = Math.min(window.innerWidth, window.innerHeight) * 0.42
    return Array.from({ length: total }, (_, i) => {
      const angle = ((i / total) * 360 + randomBetween(-5, 5)) * (Math.PI / 180)
      const peak = reach * randomBetween(0.55, 1)
      const size = isImage ? randomBetween(40, 72) : randomBetween(28, 50)
      const px = Math.cos(angle) * peak
      const py = Math.sin(angle) * peak
      return {
        id: i,
        size,
        px,
        py,
        ex: px * 1.16,
        ey: py * 1.16 + randomBetween(70, 190),
        s: randomBetween(0.85, 1.25),
        rm: randomBetween(-120, 120),
        r1: randomBetween(-260, 260),
        delay: randomBetween(0, 0.12),
        duration: randomBetween(1.5, 2),
      }
    })
  }, [isImage])

  return (
    <Box sx={{ position: 'absolute', left: '50%', top: '48%', width: 0, height: 0 }}>
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            marginLeft: `${-p.size / 2}px`,
            marginTop: `${-p.size / 2}px`,
            willChange: 'transform, opacity',
            '--px': `${p.px}px`,
            '--py': `${p.py}px`,
            '--ex': `${p.ex}px`,
            '--ey': `${p.ey}px`,
            '--s': p.s,
            '--rm': `${p.rm}deg`,
            '--r1': `${p.r1}deg`,
            animation: `${burstOut} ${p.duration}s cubic-bezier(0.14, 0.78, 0.3, 1) ${p.delay}s both`,
          }}
        >
          <MediaParticle media={media} size={p.size} />
        </Box>
      ))}
    </Box>
  )
}

function FireworksEffect({ accent }: { accent: string }) {
  const shells = useMemo(() => {
    const palette = accentPalette(accent)
    const total = particleCount(5)
    return Array.from({ length: total }, (_, i) => {
      const sparkTotal = particleCount(20)
      const reach = randomBetween(90, 200)
      return {
        id: i,
        x: randomBetween(16, 84),
        y: randomBetween(18, 58),
        delay: i * randomBetween(0.24, 0.34),
        color: palette[i % palette.length],
        sparks: Array.from({ length: sparkTotal }, (_, s) => {
          const angle = ((s / sparkTotal) * 360 + randomBetween(-6, 6)) * (Math.PI / 180)
          const dist = reach * randomBetween(0.72, 1)
          return {
            id: s,
            size: randomBetween(4, 8),
            ex: Math.cos(angle) * dist,
            ey: Math.sin(angle) * dist + randomBetween(24, 70),
            duration: randomBetween(1, 1.45),
            color: palette[(s + i) % palette.length],
          }
        }),
      }
    })
  }, [accent])

  return (
    <>
      {shells.map((shell) => (
        <Box key={shell.id} sx={{ position: 'absolute', left: `${shell.x}%`, top: `${shell.y}%`, width: 0, height: 0 }}>
          <Box sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 70,
            height: 70,
            marginLeft: '-35px',
            marginTop: '-35px',
            borderRadius: '50%',
            background: `radial-gradient(circle, #ffffff 0%, ${shell.color}cc 35%, transparent 70%)`,
            animation: `${shellFlash} 0.6s ease-out ${shell.delay}s both`,
          }} />
          {shell.sparks.map((spark) => (
            <Box
              key={spark.id}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: spark.size,
                height: spark.size,
                marginLeft: `${-spark.size / 2}px`,
                marginTop: `${-spark.size / 2}px`,
                borderRadius: '50%',
                background: spark.color,
                boxShadow: `0 0 ${spark.size * 2}px ${spark.color}, 0 0 ${spark.size * 4}px ${spark.color}88`,
                willChange: 'transform, opacity',
                '--ex': `${spark.ex}px`,
                '--ey': `${spark.ey}px`,
                animation: `${sparkFly} ${spark.duration}s cubic-bezier(0.12, 0.75, 0.3, 1) ${shell.delay}s both`,
              }}
            />
          ))}
        </Box>
      ))}
    </>
  )
}

function GlowEffect({ accent, anchor }: { accent: string; anchor?: DOMRect | null }) {
  const geometry = useMemo(() => {
    const cx = anchor ? anchor.left + anchor.width / 2 : window.innerWidth / 2
    const cy = anchor ? anchor.top + anchor.height / 2 : window.innerHeight / 2
    const base = anchor
      ? Math.max(anchor.width, anchor.height)
      : Math.min(window.innerWidth, window.innerHeight) * 0.5
    const size = Math.min(Math.max(base * 2.4, 320), Math.max(window.innerWidth, window.innerHeight) * 1.15)
    const sparkles = Array.from({ length: particleCount(14) }, (_, i) => {
      const angle = ((i / 14) * 360 + randomBetween(-12, 12)) * (Math.PI / 180)
      const dist = (base / 2) * randomBetween(0.85, 1.5)
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: randomBetween(5, 11),
        delay: randomBetween(0, 1.4),
        duration: randomBetween(0.9, 1.5),
      }
    })
    return { cx, cy, size, sparkles }
  }, [anchor])

  const gold = '#ffe9a8'

  return (
    <Box sx={{
      position: 'absolute',
      left: geometry.cx,
      top: geometry.cy,
      width: 0,
      height: 0,
      animation: `${glowFade} 3s ease-out both`,
    }}>
      <Box sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: geometry.size,
        height: geometry.size,
        marginLeft: `${-geometry.size / 2}px`,
        marginTop: `${-geometry.size / 2}px`,
        borderRadius: '50%',
        background: `repeating-conic-gradient(from 0deg, ${gold}dd 0deg 2.6deg, transparent 2.6deg 15deg)`,
        WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.55) 34%, transparent 70%)',
        maskImage: 'radial-gradient(circle, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.55) 34%, transparent 70%)',
        opacity: 0.75,
        willChange: 'transform',
        animation: `${raysSpin} 9s linear infinite`,
      }} />
      <Box sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: geometry.size * 0.82,
        height: geometry.size * 0.82,
        marginLeft: `${-(geometry.size * 0.82) / 2}px`,
        marginTop: `${-(geometry.size * 0.82) / 2}px`,
        borderRadius: '50%',
        background: `repeating-conic-gradient(from 8deg, ${accent}bb 0deg 1.6deg, transparent 1.6deg 22deg)`,
        WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.4) 40%, transparent 68%)',
        maskImage: 'radial-gradient(circle, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.4) 40%, transparent 68%)',
        opacity: 0.6,
        willChange: 'transform',
        animation: `${raysSpinBack} 13s linear infinite`,
      }} />
      <Box sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: geometry.size * 0.7,
        height: geometry.size * 0.7,
        marginLeft: `${-(geometry.size * 0.7) / 2}px`,
        marginTop: `${-(geometry.size * 0.7) / 2}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${gold}88 0%, ${accent}44 38%, transparent 68%)`,
        animation: `${corePulse} 3s ease-out both`,
      }} />
      {[0, 1].map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: geometry.size * 0.6,
            height: geometry.size * 0.6,
            marginLeft: `${-(geometry.size * 0.6) / 2}px`,
            marginTop: `${-(geometry.size * 0.6) / 2}px`,
            borderRadius: '50%',
            border: `2px solid ${gold}aa`,
            boxShadow: `0 0 28px ${gold}66, inset 0 0 28px ${gold}44`,
            animation: `${ringOut} 1.5s ease-out ${i * 0.45}s both`,
          }}
        />
      ))}
      {geometry.sparkles.map((s) => (
        <Box
          key={s.id}
          sx={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            marginLeft: `${-s.size / 2}px`,
            marginTop: `${-s.size / 2}px`,
            borderRadius: '50%',
            background: gold,
            boxShadow: `0 0 ${s.size * 2.5}px ${gold}`,
            animation: `${twinkle} ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </Box>
  )
}

export function RevealEffectLayer({ playback }: { playback: RevealEffectPlayback }) {
  if (typeof document === 'undefined' || playback.kind === 'none') return null

  return createPortal(
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: Z_INDEX,
      }}
    >
      {playback.kind === 'rain' && <RainEffect media={playback.media} />}
      {playback.kind === 'burst' && <BurstEffect media={playback.media} />}
      {playback.kind === 'fireworks' && <FireworksEffect accent={playback.accent} />}
      {playback.kind === 'glow' && <GlowEffect accent={playback.accent} anchor={playback.anchor} />}
    </Box>,
    document.body,
  )
}
