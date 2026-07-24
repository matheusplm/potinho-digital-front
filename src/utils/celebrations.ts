import confetti from 'canvas-confetti'

type Options = confetti.Options

const Z_INDEX = 2000

export interface RevealEffectContext {
  emoji: string
  accent: string
}

export interface RevealEffect {
  id: string
  label: string
  icon: string
  description: string
  usesEmoji?: boolean
  isPartycles?: boolean
  run: (ctx: RevealEffectContext) => void
}

export const PARTYCLES_EFFECT_IDS = ['coins', 'crystals', 'galaxy', 'petals', 'aurora', 'fireflies'] as const
export type PartyclesEffectId = typeof PARTYCLES_EFFECT_IDS[number]

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function fire(options: Options) {
  confetti({ zIndex: Z_INDEX, disableForReducedMotion: true, ...options })
}

function paletteFrom(accent: string): string[] {
  const base = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent) ? accent : '#f43f5e'
  return [base, '#ffffff', '#fde68a', '#fca5a5', '#c4b5fd']
}

function realisticConfetti(colors: string[], y = 0.55) {
  const defaults: Options = { origin: { y }, colors }
  const burst = (ratio: number, opts: Options) =>
    fire({ ...defaults, ...opts, particleCount: Math.floor(200 * ratio) })
  burst(0.25, { spread: 26, startVelocity: 55 })
  burst(0.2, { spread: 60 })
  burst(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  burst(0.1, { spread: 120, startVelocity: 45 })
}

export const REVEAL_EFFECTS: RevealEffect[] = [
  {
    id: 'none', label: 'Nenhum', icon: '🚫',
    description: 'Sem efeito especial na revelação.',
    run: () => {},
  },
  {
    id: 'confetti', label: 'Confete', icon: '🎉',
    description: 'Chuva de confete colorido, rajadas encorpadas.',
    run: ({ accent }) => realisticConfetti(paletteFrom(accent)),
  },
  {
    id: 'emoji', label: 'Explosão de emoji', icon: '💥',
    description: 'Estoura o emoji escolhido em ondas, pra todo lado.',
    usesEmoji: true,
    run: ({ emoji }) => {
      const shape = confetti.shapeFromText({ text: emoji || '✨', scalar: 3 })
      const wave = (particleCount: number, spread: number, startVelocity: number) =>
        fire({ shapes: [shape], scalar: 3, flat: true, particleCount, spread, startVelocity, gravity: 1.1, decay: 0.92, ticks: 130, origin: { y: 0.42 } })
      wave(20, 100, 42)
      window.setTimeout(() => wave(14, 130, 32), 160)
      window.setTimeout(() => wave(10, 80, 50), 320)
    },
  },
  {
    id: 'fireworks', label: 'Fogos', icon: '🎆',
    description: 'Fogos de artifício estourando em sequência.',
    run: ({ accent }) => {
      const colors = paletteFrom(accent)
      fire({ particleCount: 30, angle: 60, spread: 60, startVelocity: 52, origin: { x: 0, y: 0.8 }, colors })
      fire({ particleCount: 30, angle: 120, spread: 60, startVelocity: 52, origin: { x: 1, y: 0.8 }, colors })
      ;[0, 260, 520, 760].forEach((delay) => window.setTimeout(() => {
        fire({ particleCount: 55, spread: 360, startVelocity: 34, gravity: 0.9, decay: 0.9, ticks: 110, scalar: 1, shapes: ['circle', 'star'], colors, origin: { x: 0.2 + Math.random() * 0.6, y: 0.25 + Math.random() * 0.25 } })
      }, delay))
    },
  },
  {
    id: 'sparkles', label: 'Brilhos', icon: '✨',
    description: 'Estrelinhas douradas subindo suave.',
    run: ({ accent }) => {
      const colors = [accent, '#fde68a', '#fef9c3', '#ffffff']
      fire({ particleCount: 50, spread: 120, startVelocity: 24, gravity: 0.5, decay: 0.92, scalar: 0.9, ticks: 150, shapes: ['star'], colors, origin: { y: 0.5 } })
      window.setTimeout(() => fire({ particleCount: 25, spread: 90, startVelocity: 18, gravity: 0.45, decay: 0.93, scalar: 0.7, ticks: 160, shapes: ['star'], colors, origin: { y: 0.55 } }), 200)
    },
  },
  {
    id: 'hearts', label: 'Chuva de coração', icon: '💖',
    description: 'Corações caindo rápido pela tela.',
    run: () => {
      const shape = confetti.shapeFromText({ text: '💖', scalar: 2.4 })
      const rain = (particleCount: number, spread: number) =>
        fire({ shapes: [shape], scalar: 2.4, flat: true, particleCount, spread, angle: 270, startVelocity: 22, gravity: 1.6, decay: 0.95, ticks: 150, origin: { y: 0 } })
      rain(26, 90)
      window.setTimeout(() => rain(18, 70), 180)
    },
  },
  {
    id: 'coins', label: 'Chuva de moedas', icon: '🪙',
    description: 'Moedas caindo como um tesouro sendo revelado.',
    isPartycles: true,
    run: () => {},
  },
  {
    id: 'crystals', label: 'Cristais', icon: '💎',
    description: 'Cristais brilhantes se espalhando, clima de item raro.',
    isPartycles: true,
    run: () => {},
  },
  {
    id: 'galaxy', label: 'Galáxia', icon: '🌌',
    description: 'Explosão cósmica, estrelas e poeira estelar.',
    isPartycles: true,
    run: () => {},
  },
  {
    id: 'petals', label: 'Pétalas', icon: '🌸',
    description: 'Pétalas flutuando suavemente pela tela.',
    isPartycles: true,
    run: () => {},
  },
  {
    id: 'aurora', label: 'Aurora', icon: '🌈',
    description: 'Um brilho colorido e etéreo, tipo aurora boreal.',
    isPartycles: true,
    run: () => {},
  },
  {
    id: 'fireflies', label: 'Vagalumes', icon: '🪲',
    description: 'Pontinhos de luz suaves flutuando, clima noturno romântico.',
    isPartycles: true,
    run: () => {},
  },
]

export const REVEAL_EFFECT_MAP: Record<string, RevealEffect> =
  Object.fromEntries(REVEAL_EFFECTS.map((e) => [e.id, e]))

export function runRevealEffect(id: string | undefined, ctx: RevealEffectContext): void {
  if (!id || id === 'none') return
  const effect = REVEAL_EFFECT_MAP[id]
  if (!effect || effect.id === 'none') return
  if (prefersReducedMotion()) return
  try {
    effect.run(ctx)
  } catch {
    return
  }
}
