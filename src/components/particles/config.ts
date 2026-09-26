export type Behavior = 'leaves' | 'petals' | 'bubbles' | 'stars' | 'hearts'

interface ThemeParticles {
  behavior: Behavior
  colors: string[]
  fireflies?: boolean
  shootingStar?: boolean
}

const THEMES: Record<string, ThemeParticles> = {
  romance: { behavior: 'hearts', colors: ['#f472b6', '#fb7185', '#f9a8d4', '#e879f9'] },
  sunset: { behavior: 'hearts', colors: ['#fb923c', '#f97316', '#fdba74', '#fb7185'] },
  lavender: { behavior: 'hearts', colors: ['#a78bfa', '#c4b5fd', '#8b5cf6', '#f0abfc'] },
  ocean: { behavior: 'bubbles', colors: ['#0ea5e9', '#38bdf8', '#22d3ee'] },
  'deep-ocean': { behavior: 'bubbles', colors: ['#38bdf8', '#67e8f9', '#a5f3fc'] },
  mint: { behavior: 'leaves', colors: ['#34d399', '#10b981', '#6ee7b7', '#a3e635'] },
  'forest-night': { behavior: 'leaves', colors: ['#4ade80', '#22c55e', '#86efac', '#bef264', '#16a34a'], fireflies: true },
  peach: { behavior: 'petals', colors: ['#fda4af', '#fecdd3', '#fdba74', '#fbcfe8'] },
  'rose-night': { behavior: 'petals', colors: ['#fb7185', '#f43f5e', '#fda4af', '#e11d48'] },
  midnight: { behavior: 'stars', colors: ['#fde68a', '#ffffff', '#bfdbfe'], shootingStar: true },
  velvet: { behavior: 'stars', colors: ['#f0abfc', '#e879f9', '#fbcfe8', '#ffffff'] },
}

export function gradientId(prefix: string, index: number) {
  return `${prefix}g${index}`
}

export function seedFrom(text: string): number {
  let hash = 2166136261
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return hash >>> 0
}

export function themeParticles(key: string, accent: string): ThemeParticles {
  return THEMES[key] ?? { behavior: 'hearts', colors: [accent] }
}

export interface Particle {
  id: number
  depth: 0 | 1 | 2
  left: number
  top: number
  size: number
  duration: number
  delay: number
  drift: number
  sway: number
  swayDuration: number
  spinDuration: number
  tilt: number
  alpha: number
  color: number
  shape: number
  mobile: boolean
}

function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const COUNTS: Record<Behavior, number> = { leaves: 22, petals: 22, bubbles: 18, stars: 36, hearts: 15 }
const MOBILE_COUNTS: Record<Behavior, number> = { leaves: 11, petals: 11, bubbles: 10, stars: 20, hearts: 9 }

export function makeParticles(behavior: Behavior, colors: number, seed: number): Particle[] {
  const rand = random(seed)
  const between = (min: number, max: number) => min + rand() * (max - min)
  return Array.from({ length: COUNTS[behavior] }, (_, id) => {
    const depth = (id % 3) as 0 | 1 | 2
    const near = depth === 2
    const far = depth === 0
    const falling = behavior === 'leaves' || behavior === 'petals'
    const base = {
      id,
      depth,
      color: Math.floor(rand() * colors),
      shape: Math.floor(rand() * 3),
      tilt: between(-40, 40),
      mobile: id < MOBILE_COUNTS[behavior],
    }
    if (falling) {
      const duration = far ? between(19, 25) : near ? between(10, 14) : between(14, 19)
      return {
        ...base,
        left: between(-30, 80),
        top: 0,
        size: far ? between(18, 24) : near ? between(36, 48) : between(26, 34),
        duration,
        delay: -between(0, duration),
        drift: between(14, 38),
        sway: between(14, 38),
        swayDuration: between(2.6, 4.6),
        spinDuration: between(3.2, 6.8),
        alpha: far ? 0.5 : near ? 0.95 : 0.78,
      }
    }
    if (behavior === 'stars') {
      return {
        ...base,
        left: between(2, 98),
        top: between(3, 92),
        size: far ? between(6, 9) : near ? between(14, 20) : between(9, 13),
        duration: between(2.4, 5.2),
        delay: -between(0, 5),
        drift: 0,
        sway: between(-18, 18),
        swayDuration: between(9, 16),
        spinDuration: 0,
        alpha: far ? 0.55 : near ? 1 : 0.8,
      }
    }
    const duration = far ? between(20, 26) : near ? between(12, 16) : between(15, 20)
    return {
      ...base,
      left: between(0, 96),
      top: 0,
      size: behavior === 'bubbles'
        ? (far ? between(8, 13) : near ? between(24, 38) : between(14, 22))
        : (far ? between(14, 18) : near ? between(28, 36) : between(20, 26)),
      duration,
      delay: -between(0, duration),
      drift: between(-50, 50),
      sway: between(10, 26),
      swayDuration: between(2.2, 3.8),
      spinDuration: between(3.5, 6),
      tilt: between(6, 16),
      alpha: far ? 0.45 : near ? 0.9 : 0.7,
    }
  })
}

export function makeFireflies(seed: number) {
  const rand = random(seed)
  return Array.from({ length: 7 }, (_, id) => ({
    id,
    left: 6 + rand() * 88,
    top: 20 + rand() * 70,
    size: 5 + rand() * 4,
    wander: 10 + rand() * 8,
    blink: 2.6 + rand() * 2.4,
    delay: -rand() * 8,
    sway: -40 + rand() * 80,
    mobile: id % 2 === 0,
  }))
}
