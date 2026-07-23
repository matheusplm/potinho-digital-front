import confetti from 'canvas-confetti'

// Efeitos de revelação de raridade.
//
// Para adicionar um efeito novo: basta acrescentar UM item ao array REVEAL_EFFECTS.
// O `id` é o que fica salvo na raridade; o `run` recebe o emoji e a cor de destaque
// e dispara a animação. Tudo o resto (galeria no editor, disparo na revelação,
// botão de testar) lê deste array automaticamente.

// canvas-confetti cria um <canvas> próprio no body. Os Dialogs do MUI ficam em
// z-index ~1300, então subimos o canvas acima disso pra o efeito aparecer na frente.
const Z_INDEX = 2000

export interface RevealEffectContext {
  /** Emoji que estoura nos efeitos baseados em emoji (padrão: emoji da raridade). */
  emoji: string
  /** Cor de destaque da raridade (hex), usada para tingir confete/brilhos. */
  accent: string
}

export interface RevealEffect {
  id: string
  label: string
  /** Emoji mostrado no seletor do editor. */
  icon: string
  /** Descrição curtinha pro escritor. */
  description: string
  /** true = usa o emoji configurável (mostra o seletor de emoji no editor). */
  usesEmoji?: boolean
  run: (ctx: RevealEffectContext) => void
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Paleta de confete a partir da cor de destaque + dourado + branco. */
function paletteFrom(accent: string): string[] {
  const base = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent) ? accent : '#f43f5e'
  return [base, '#ffffff', '#fde68a', '#fca5a5', '#c4b5fd']
}

function fireEmojiBurst(emoji: string) {
  const shape = confetti.shapeFromText({ text: emoji || '✨', scalar: 3 })
  confetti({
    shapes: [shape], scalar: 3, flat: true,
    particleCount: 26, spread: 110, startVelocity: 38, gravity: 1.1, decay: 0.92,
    origin: { y: 0.42 }, zIndex: Z_INDEX,
  })
}

export const REVEAL_EFFECTS: RevealEffect[] = [
  {
    id: 'none', label: 'Nenhum', icon: '🚫',
    description: 'Sem efeito especial na revelação.',
    run: () => {},
  },
  {
    id: 'confetti', label: 'Confete', icon: '🎉',
    description: 'Chuva de confete colorido caindo do topo.',
    run: ({ accent }) => {
      const colors = paletteFrom(accent)
      confetti({ particleCount: 90, spread: 75, startVelocity: 42, origin: { y: 0.35 }, colors, zIndex: Z_INDEX })
      window.setTimeout(() => confetti({ particleCount: 50, spread: 100, startVelocity: 30, origin: { y: 0.3 }, colors, zIndex: Z_INDEX }), 180)
    },
  },
  {
    id: 'emoji', label: 'Explosão de emoji', icon: '💥',
    description: 'Estoura o emoji escolhido pra todo lado.',
    usesEmoji: true,
    run: ({ emoji }) => {
      fireEmojiBurst(emoji)
      window.setTimeout(() => fireEmojiBurst(emoji), 220)
    },
  },
  {
    id: 'fireworks', label: 'Fogos', icon: '🎆',
    description: 'Fogos de artifício em sequência.',
    run: ({ accent }) => {
      const colors = paletteFrom(accent)
      const shots = [0, 250, 500]
      shots.forEach((delay) => window.setTimeout(() => {
        confetti({ particleCount: 60, spread: 360, startVelocity: 34, gravity: 0.85, decay: 0.9, ticks: 90, origin: { x: 0.2 + Math.random() * 0.6, y: 0.3 + Math.random() * 0.2 }, colors, zIndex: Z_INDEX })
      }, delay))
    },
  },
  {
    id: 'sparkles', label: 'Brilhos', icon: '✨',
    description: 'Estrelinhas douradas subindo suave.',
    run: ({ accent }) => {
      const colors = [accent, '#fde68a', '#fef9c3', '#ffffff']
      confetti({ particleCount: 60, spread: 130, startVelocity: 22, gravity: 0.45, decay: 0.93, scalar: 0.9, ticks: 140, shapes: ['star'], colors, origin: { y: 0.5 }, zIndex: Z_INDEX })
    },
  },
  {
    id: 'hearts', label: 'Chuva de coração', icon: '💖',
    description: 'Corações caindo suavemente pela tela.',
    run: () => {
      const shape = confetti.shapeFromText({ text: '💖', scalar: 2.4 })
      confetti({ shapes: [shape], scalar: 2.4, flat: true, particleCount: 34, spread: 120, startVelocity: 26, gravity: 0.7, decay: 0.94, ticks: 200, origin: { y: 0 }, zIndex: Z_INDEX })
    },
  },
]

export const REVEAL_EFFECT_MAP: Record<string, RevealEffect> =
  Object.fromEntries(REVEAL_EFFECTS.map((e) => [e.id, e]))

/** Dispara o efeito pelo id. Silencioso se id vazio/none ou se o usuário pediu menos movimento. */
export function runRevealEffect(id: string | undefined, ctx: RevealEffectContext): void {
  if (!id || id === 'none') return
  const effect = REVEAL_EFFECT_MAP[id]
  if (!effect || effect.id === 'none') return
  if (prefersReducedMotion()) return
  try {
    effect.run(ctx)
  } catch {
    // canvas-confetti nunca deve derrubar a revelação
  }
}
