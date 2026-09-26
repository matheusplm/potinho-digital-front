import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Box } from '@mui/material'
import { keyframes } from '@emotion/react'
import { isImageMedia, randomBetween } from './media'
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
    </Box>,
    document.body,
  )
}
