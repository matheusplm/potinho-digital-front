export type RevealEffectKind = 'none' | 'rain' | 'burst' | 'rise' | 'spiral' | 'confetti' | 'sparkle' | 'wave'

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
  palette?: string[]
  anchor?: DOMRect | null
}
