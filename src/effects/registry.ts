import type { RevealEffectDefinition, RevealEffectKind } from './types'

export const REVEAL_EFFECTS: RevealEffectDefinition[] = [
  {
    kind: 'none',
    label: 'Nenhum',
    icon: '🚫',
    description: 'Sem efeito especial na revelação.',
    usesMedia: false,
    defaultMedia: '',
    durationMs: 0,
  },
  {
    kind: 'rain',
    label: 'Chuva',
    icon: '🌧️',
    description: 'Chove o emoji, GIF ou imagem que você escolher pela tela inteira.',
    usesMedia: true,
    defaultMedia: '💖',
    durationMs: 4200,
  },
  {
    kind: 'burst',
    label: 'Explosão',
    icon: '💥',
    description: 'Explode o emoji, GIF ou imagem do centro da tela para todos os lados.',
    usesMedia: true,
    defaultMedia: '✨',
    durationMs: 2400,
  },
  {
    kind: 'fireworks',
    label: 'Fogos de artifício',
    icon: '🎆',
    description: 'Fogos coloridos estourando em sequência pela tela.',
    usesMedia: false,
    defaultMedia: '',
    durationMs: 3400,
  },
  {
    kind: 'glow',
    label: 'Brilho lendário',
    icon: '🌟',
    description: 'Raios de luz girando em volta do bilhete, estilo carta lendária.',
    usesMedia: false,
    defaultMedia: '',
    durationMs: 3000,
  },
]

export const REVEAL_EFFECT_MAP: Record<RevealEffectKind, RevealEffectDefinition> =
  Object.fromEntries(REVEAL_EFFECTS.map((e) => [e.kind, e])) as Record<RevealEffectKind, RevealEffectDefinition>

const LEGACY_KINDS: Record<string, { kind: RevealEffectKind; media?: string }> = {
  confetti: { kind: 'burst', media: '🎉' },
  sparkles: { kind: 'burst', media: '✨' },
  emoji: { kind: 'burst' },
  hearts: { kind: 'rain', media: '💖' },
  coins: { kind: 'rain', media: '🪙' },
  petals: { kind: 'rain', media: '🌸' },
  crystals: { kind: 'burst', media: '💎' },
  galaxy: { kind: 'burst', media: '🌌' },
  fireflies: { kind: 'rain', media: '✨' },
  aurora: { kind: 'glow' },
}

export function isEffectKind(value: string): value is RevealEffectKind {
  return value in REVEAL_EFFECT_MAP
}

export function normalizeRevealEffect(
  rawEffect: string | undefined,
  rawMedia: string | undefined,
  legacyEmoji: string | undefined,
  fallbackEmoji: string,
): { kind: RevealEffectKind; media: string } {
  const effect = (rawEffect ?? 'none').trim()
  const media = (rawMedia ?? '').trim()

  if (!effect || effect === 'none') return { kind: 'none', media: '' }

  if (isEffectKind(effect)) {
    const definition = REVEAL_EFFECT_MAP[effect]
    if (!definition.usesMedia) return { kind: effect, media: '' }
    return { kind: effect, media: media || legacyEmoji?.trim() || fallbackEmoji || definition.defaultMedia }
  }

  const legacy = LEGACY_KINDS[effect]
  if (!legacy) return { kind: 'none', media: '' }

  const definition = REVEAL_EFFECT_MAP[legacy.kind]
  if (!definition.usesMedia) return { kind: legacy.kind, media: '' }
  return { kind: legacy.kind, media: media || legacyEmoji?.trim() || legacy.media || fallbackEmoji || definition.defaultMedia }
}
