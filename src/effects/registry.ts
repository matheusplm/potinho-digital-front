import type { RevealEffectDefinition, RevealEffectKind } from './types'

export const REVEAL_EFFECTS: RevealEffectDefinition[] = [
  {
    kind: 'none',
    label: 'Nada',
    icon: '🚫',
    description: 'O bilhete vira e pronto, sem show extra.',
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
    description: 'O emoji, GIF ou imagem explode do bilhete para todos os lados.',
    usesMedia: true,
    defaultMedia: '✨',
    durationMs: 2400,
  },
  {
    kind: 'rise',
    label: 'Subindo',
    icon: '🎈',
    description: 'O emoji, GIF ou imagem sobe do pé da tela flutuando, tipo balão.',
    usesMedia: true,
    defaultMedia: '🎈',
    durationMs: 5200,
  },
  {
    kind: 'spiral',
    label: 'Espiral',
    icon: '🌀',
    description: 'O emoji, GIF ou imagem sai do bilhete girando em espiral.',
    usesMedia: true,
    defaultMedia: '⭐',
    durationMs: 4400,
  },
  {
    kind: 'confetti',
    label: 'Confete',
    icon: '🎊',
    description: 'Dois canhões de confete disparam dos cantos, nas cores da luz.',
    usesMedia: false,
    defaultMedia: '',
    durationMs: 4400,
  },
  {
    kind: 'sparkle',
    label: 'Cintilar',
    icon: '✨',
    description: 'Estrelinhas piscam em volta do bilhete, nas cores da luz.',
    usesMedia: false,
    defaultMedia: '',
    durationMs: 4400,
  },
  {
    kind: 'wave',
    label: 'Onda de luz',
    icon: '💫',
    description: 'Ondas de luz saem do bilhete e varrem a tela, nas cores da luz.',
    usesMedia: false,
    defaultMedia: '',
    durationMs: 2200,
  },
]

export const REVEAL_EFFECT_MAP: Record<RevealEffectKind, RevealEffectDefinition> =
  Object.fromEntries(REVEAL_EFFECTS.map((e) => [e.kind, e])) as Record<RevealEffectKind, RevealEffectDefinition>

const LEGACY_KINDS: Record<string, { kind: RevealEffectKind; media?: string }> = {
  sparkles: { kind: 'sparkle' },
  emoji: { kind: 'burst' },
  hearts: { kind: 'rain', media: '💖' },
  coins: { kind: 'rain', media: '🪙' },
  petals: { kind: 'rain', media: '🌸' },
  crystals: { kind: 'burst', media: '💎' },
  galaxy: { kind: 'burst', media: '🌌' },
  fireflies: { kind: 'rain', media: '✨' },
}

function isEffectKind(value: string): value is RevealEffectKind {
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
