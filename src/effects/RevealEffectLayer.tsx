import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Box } from '@mui/material'
import { keyframes } from '@emotion/react'
import { isImageMedia, randomBetween } from './media'
import type { RevealEffectPlayback } from './types'

const Z_INDEX = 2000
const DEFAULT_PALETTE = ['#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#ffffff']
const STAR = 'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)'

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

const riseUp = keyframes`
  0%   { transform: translate3d(0, 0, 0) rotate(var(--r0)) scale(0.7); opacity: 0; }
  10%  { opacity: 1; }
  33%  { transform: translate3d(var(--s1), -38vh, 0) rotate(var(--r1)) scale(1); }
  66%  { transform: translate3d(var(--s2), -78vh, 0) rotate(var(--r0)) scale(1); }
  88%  { opacity: 1; }
  100% { transform: translate3d(var(--s3), -124vh, 0) rotate(var(--r1)) scale(1); opacity: 0; }
`

const spiralOut = keyframes`
  0%   { transform: rotate(var(--a)) translateX(0px) rotate(calc(var(--a) * -1)) scale(0.45); opacity: 0; }
  10%  { opacity: 1; }
  30%  { transform: rotate(calc(var(--a) + var(--turn) * 0.35)) translateX(calc(var(--r) * 0.3)) rotate(calc((var(--a) + var(--turn) * 0.35) * -1)) scale(1.1); }
  80%  { opacity: 1; }
  100% { transform: rotate(calc(var(--a) + var(--turn))) translateX(var(--r)) rotate(calc((var(--a) + var(--turn)) * -1)) scale(1); opacity: 0; }
`

const confettiFly = keyframes`
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; animation-timing-function: cubic-bezier(0.12, 0.72, 0.32, 1); }
  38%  { transform: translate3d(var(--px), var(--py), 0) rotate(var(--r1)); animation-timing-function: cubic-bezier(0.45, 0, 0.8, 0.5); }
  88%  { opacity: 1; }
  100% { transform: translate3d(var(--ex), var(--ey), 0) rotate(var(--r2)); opacity: 0; }
`

const confettiFlutter = keyframes`
  0%, 100% { transform: rotateX(0deg) rotateY(0deg); }
  50%      { transform: rotateX(180deg) rotateY(70deg); }
`

const twinkle = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(0) rotate(0deg); opacity: 0; }
  45%      { transform: translate3d(0, var(--lift), 0) scale(1.15) rotate(70deg); opacity: 1; }
  60%      { transform: translate3d(0, var(--lift), 0) scale(0.9) rotate(95deg); opacity: 1; }
`

const waveRing = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0.95; }
  100% { transform: translate(-50%, -50%) scale(var(--end)); opacity: 0; }
`

const waveFlash = keyframes`
  0%   { opacity: 0; }
  25%  { opacity: 1; }
  100% { opacity: 0; }
`

function particleCount(base: number): number {
  if (typeof window === 'undefined') return base
  return window.innerWidth < 600 ? Math.round(base * 0.62) : base
}

function centerOf(anchor: DOMRect | null | undefined) {
  if (anchor) return { x: anchor.left + anchor.width / 2, y: anchor.top + anchor.height / 2, w: anchor.width, h: anchor.height }
  const size = Math.min(window.innerWidth * 0.8, 340)
  return { x: window.innerWidth / 2, y: window.innerHeight * 0.48, w: size, h: size * 0.8 }
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

function BurstEffect({ media, anchor }: { media: string; anchor?: DOMRect | null }) {
  const isImage = isImageMedia(media)
  const origin = useMemo(() => centerOf(anchor), [anchor])
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
    <Box sx={{ position: 'absolute', left: origin.x, top: origin.y, width: 0, height: 0 }}>
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

function RiseEffect({ media }: { media: string }) {
  const isImage = isImageMedia(media)
  const particles = useMemo(() => {
    const total = particleCount(20)
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      left: ((i + randomBetween(0.1, 0.9)) / total) * 100,
      size: isImage ? randomBetween(42, 70) : randomBetween(30, 50),
      delay: randomBetween(0, 1.5),
      duration: randomBetween(3, 3.8),
      s1: randomBetween(-34, 34),
      s2: randomBetween(-46, 46),
      s3: randomBetween(-30, 30),
      r0: randomBetween(-14, 14),
      r1: randomBetween(-14, 14),
    }))
  }, [isImage])

  return (
    <>
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            top: '100%',
            left: `${p.left}%`,
            marginLeft: `${-p.size / 2}px`,
            willChange: 'transform, opacity',
            '--s1': `${p.s1}px`,
            '--s2': `${p.s2}px`,
            '--s3': `${p.s3}px`,
            '--r0': `${p.r0}deg`,
            '--r1': `${p.r1}deg`,
            animation: `${riseUp} ${p.duration}s ease-in-out ${p.delay}s both`,
          }}
        >
          <MediaParticle media={media} size={p.size} />
        </Box>
      ))}
    </>
  )
}

function SpiralEffect({ media, anchor }: { media: string; anchor?: DOMRect | null }) {
  const isImage = isImageMedia(media)
  const origin = useMemo(() => centerOf(anchor), [anchor])
  const particles = useMemo(() => {
    const total = particleCount(30)
    const reach = Math.max(window.innerWidth, window.innerHeight) * 0.6
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      angle: (i % 2) * 180 + (i / total) * 360,
      turn: randomBetween(300, 420),
      radius: reach * randomBetween(0.6, 1.05),
      size: isImage ? randomBetween(40, 64) : randomBetween(28, 46),
      delay: i * 0.045,
      duration: randomBetween(2.4, 2.9),
    }))
  }, [isImage])

  return (
    <Box sx={{ position: 'absolute', left: origin.x, top: origin.y, width: 0, height: 0 }}>
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
            '--a': `${p.angle}deg`,
            '--turn': `${p.turn}deg`,
            '--r': `${p.radius}px`,
            animation: `${spiralOut} ${p.duration}s cubic-bezier(0.2, 0.6, 0.35, 1) ${p.delay}s both`,
          }}
        >
          <MediaParticle media={media} size={p.size} />
        </Box>
      ))}
    </Box>
  )
}

function ConfettiEffect({ palette }: { palette: string[] }) {
  const pieces = useMemo(() => {
    const total = particleCount(84)
    const width = window.innerWidth
    const height = window.innerHeight
    return Array.from({ length: total }, (_, i) => {
      const fromLeft = i % 2 === 0
      const direction = fromLeft ? 1 : -1
      const px = direction * width * randomBetween(0.12, 0.72)
      const py = -height * randomBetween(0.42, 0.88)
      const secondVolley = i % 3 === 0
      return {
        id: i,
        fromLeft,
        color: palette[i % palette.length],
        round: i % 5 === 0,
        w: randomBetween(6, 9),
        h: randomBetween(9, 14),
        px,
        py,
        ex: px + direction * randomBetween(10, 90),
        ey: py + height * randomBetween(0.55, 0.95),
        r1: randomBetween(-360, 360),
        r2: randomBetween(-900, 900),
        delay: (secondVolley ? 0.5 : 0) + randomBetween(0, 0.18),
        duration: randomBetween(2.8, 3.6),
        flutter: randomBetween(0.45, 0.9),
      }
    })
  }, [palette])

  return (
    <>
      {pieces.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            top: '100%',
            left: p.fromLeft ? 0 : '100%',
            marginTop: '-12px',
            willChange: 'transform, opacity',
            '--px': `${p.px}px`,
            '--py': `${p.py}px`,
            '--ex': `${p.ex}px`,
            '--ey': `${p.ey}px`,
            '--r1': `${p.r1}deg`,
            '--r2': `${p.r2}deg`,
            animation: `${confettiFly} ${p.duration}s linear ${p.delay}s both`,
          }}
        >
          <Box sx={{
            width: p.w,
            height: p.round ? p.w : p.h,
            borderRadius: p.round ? '50%' : '2px',
            background: p.color,
            boxShadow: '0 1px 2px rgba(15,23,42,0.15)',
            animation: `${confettiFlutter} ${p.flutter}s ease-in-out infinite`,
          }} />
        </Box>
      ))}
    </>
  )
}

function SparkleEffect({ palette, anchor }: { palette: string[]; anchor?: DOMRect | null }) {
  const origin = useMemo(() => centerOf(anchor), [anchor])
  const stars = useMemo(() => {
    const total = particleCount(52)
    const rx = origin.w / 2 + 14
    const ry = origin.h / 2 + 14
    return Array.from({ length: total }, (_, i) => {
      const angle = randomBetween(0, Math.PI * 2)
      const spread = randomBetween(0.92, 1.4)
      return {
        id: i,
        x: Math.cos(angle) * rx * spread,
        y: Math.sin(angle) * ry * spread,
        size: randomBetween(14, 30),
        color: palette[i % palette.length],
        lift: `${randomBetween(-22, -6)}px`,
        delay: 0.45 + randomBetween(0, 1.5),
        duration: randomBetween(0.9, 1.3),
        repeat: Math.round(randomBetween(2, 3)),
      }
    })
  }, [origin, palette])

  return (
    <Box sx={{ position: 'absolute', left: origin.x, top: origin.y, width: 0, height: 0 }}>
      {stars.map((s) => (
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
            filter: `drop-shadow(0 0 5px ${s.color}) drop-shadow(0 0 10px ${s.color})`,
            '--lift': s.lift,
            animation: `${twinkle} ${s.duration}s ease-in-out ${s.delay}s ${s.repeat} both`,
          }}
        >
          <Box sx={{ width: '100%', height: '100%', clipPath: STAR, background: `radial-gradient(circle, #ffffff 0%, #ffffff 22%, ${s.color} 60%)` }} />
        </Box>
      ))}
    </Box>
  )
}

function WaveEffect({ palette, anchor }: { palette: string[]; anchor?: DOMRect | null }) {
  const origin = useMemo(() => centerOf(anchor), [anchor])
  const base = Math.max(origin.w, origin.h)
  const end = (Math.hypot(window.innerWidth, window.innerHeight) * 1.1) / base
  return (
    <>
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at ${origin.x}px ${origin.y}px, color-mix(in srgb, ${palette[0]} 38%, transparent), transparent 60%)`,
        animation: `${waveFlash} 0.9s ease-out both`,
      }} />
      {[0, 1, 2, 3].map((i) => {
        const color = palette[i % palette.length]
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: origin.x,
              top: origin.y,
              width: base,
              height: base,
              borderRadius: '50%',
              border: `3px solid ${color}`,
              boxShadow: `0 0 26px ${color}, inset 0 0 26px ${color}`,
              '--end': end,
              animation: `${waveRing} 1.5s cubic-bezier(0.2, 0.7, 0.35, 1) ${i * 0.2}s both`,
            }}
          />
        )
      })}
    </>
  )
}

export function RevealEffectLayer({ playback }: { playback: RevealEffectPlayback }) {
  if (typeof document === 'undefined' || playback.kind === 'none') return null
  const palette = playback.palette?.length ? playback.palette : DEFAULT_PALETTE

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
      {playback.kind === 'burst' && <BurstEffect media={playback.media} anchor={playback.anchor} />}
      {playback.kind === 'rise' && <RiseEffect media={playback.media} />}
      {playback.kind === 'spiral' && <SpiralEffect media={playback.media} anchor={playback.anchor} />}
      {playback.kind === 'confetti' && <ConfettiEffect palette={palette} />}
      {playback.kind === 'sparkle' && <SparkleEffect palette={palette} anchor={playback.anchor} />}
      {playback.kind === 'wave' && <WaveEffect palette={palette} anchor={playback.anchor} />}
    </Box>,
    document.body,
  )
}
