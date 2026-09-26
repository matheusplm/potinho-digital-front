import { gradientId, type Behavior } from './config'

const LEAF_SHAPES = [
  'M20 2 C31 9 34 23 20 38 C6 23 9 9 20 2 Z',
  'M20 4 C33 6 37 22 22 35 C19 37.5 17 37.5 15 35 C4 24 7 7 20 4 Z',
  'M20 1 C28 12 28 26 20 39 C12 26 12 12 20 1 Z',
]

const PETAL_SHAPES = [
  'M20 38 C8 30 5 16 12 6 C15 2 18 4 20 8 C22 4 25 2 28 6 C35 16 32 30 20 38 Z',
  'M20 38 C7 29 7 10 20 3 C33 10 33 29 20 38 Z',
  'M20 37 C9 31 6 18 13 8 C16 4 19 5 20 9 C21 5 24 4 27 8 C34 18 31 31 20 37 Z',
]

export function ParticleDefs({ prefix, behavior, colors }: { prefix: string; behavior: Behavior; colors: string[] }) {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
      <defs>
        {colors.map((color, i) => {
          const next = colors[(i + 1) % colors.length]
          if (behavior === 'bubbles') {
            return (
              <g key={color}>
                <radialGradient id={gradientId(prefix, i)} cx="42%" cy="38%" r="62%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.02" />
                  <stop offset="72%" stopColor={color} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.42" />
                </radialGradient>
                <linearGradient id={`${gradientId(prefix, i)}rim`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="45%" stopColor="#f0abfc" />
                  <stop offset="100%" stopColor="#a5f3fc" />
                </linearGradient>
              </g>
            )
          }
          return (
            <linearGradient key={color} id={gradientId(prefix, i)} x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor={next} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          )
        })}
      </defs>
    </svg>
  )
}

export function Leaf({ shape, fill }: { shape: number; fill: string }) {
  return (
    <svg viewBox="0 0 40 42" width="100%" height="100%" aria-hidden>
      <path d={LEAF_SHAPES[shape % LEAF_SHAPES.length]} fill={fill} />
      <path d="M20 5 Q21.5 20 20 36" stroke="rgba(255,255,255,0.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M20.6 13 Q24.5 11 27 8.5 M20.9 20 Q25.5 18 29 15 M20.7 27 Q24.5 25.5 27 23 M20.4 13 Q16 11 13.5 8.5 M20.6 20 Q16 18 12 15 M20.5 27 Q16.5 25.5 14 23"
        stroke="rgba(255,255,255,0.32)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <ellipse cx="14.5" cy="14" rx="2.6" ry="6" fill="rgba(255,255,255,0.3)" transform="rotate(-22 14.5 14)" />
      <path d="M20 36 Q19.5 39.5 17 41" stroke="rgba(0,0,0,0.18)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function Petal({ shape, fill }: { shape: number; fill: string }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden>
      <path d={PETAL_SHAPES[shape % PETAL_SHAPES.length]} fill={fill} />
      <path d="M20 34 Q19 24 20 13" stroke="rgba(255,255,255,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="14" cy="17" rx="2.4" ry="5.5" fill="rgba(255,255,255,0.35)" transform="rotate(-18 14 17)" />
    </svg>
  )
}

export function Bubble({ fill, rim }: { fill: string; rim: string }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden>
      <circle cx="20" cy="20" r="18" fill={fill} stroke={rim} strokeWidth="1.3" strokeOpacity="0.85" />
      <ellipse cx="13.5" cy="12.5" rx="5.5" ry="3.2" fill="rgba(255,255,255,0.85)" transform="rotate(-38 13.5 12.5)" />
      <circle cx="26.5" cy="27.5" r="1.8" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

export function Sparkle({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden>
      <circle cx="20" cy="20" r="7" fill={fill} opacity="0.25" />
      <path d="M20 0 C21.4 13 27 18.6 40 20 C27 21.4 21.4 27 20 40 C18.6 27 13 21.4 0 20 C13 18.6 18.6 13 20 0 Z" fill={fill} />
    </svg>
  )
}

export function Heart({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 40 38" width="100%" height="100%" aria-hidden>
      <path d="M20 35 C8 26 3 19.5 3 12.5 C3 7 7 3 12 3 C15.5 3 18.5 5 20 8 C21.5 5 24.5 3 28 3 C33 3 37 7 37 12.5 C37 19.5 32 26 20 35 Z" fill={fill} />
      <ellipse cx="11.5" cy="11" rx="3.4" ry="2.2" fill="rgba(255,255,255,0.6)" transform="rotate(-35 11.5 11)" />
      <circle cx="16.5" cy="8.2" r="1.1" fill="rgba(255,255,255,0.65)" />
    </svg>
  )
}
