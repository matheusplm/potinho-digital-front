export type RevealEffectKind = 'none' | 'rain' | 'burst' | 'fireworks' | 'glow'

export interface RevealEffectDefinition {
  kind: RevealEffectKind
  label: string
  icon: string
  description: string
  usesMedia: boolean
  defaultMedia: string
  durationMs: number
}

export interface RevealEffectPlayback {
  kind: RevealEffectKind
  media: string
  accent: string
  anchor?: DOMRect | null
}
