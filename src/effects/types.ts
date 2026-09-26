export type RevealEffectKind = 'none' | 'rain' | 'burst'

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
}
